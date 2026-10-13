<?php

namespace App\Http\Controllers;

use App\Http\Requests\PosCheckoutRequest;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\StudentAccount;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosCheckoutController extends Controller
{
    /**
     * Handle the POS checkout transaction request.
     */
    public function __invoke(PosCheckoutRequest $request): JsonResponse|RedirectResponse
    {
        return DB::transaction(function () use ($request) {
            $paymentMethod = $request->validated('payment_method');
            $cartItems = $request->validated('items');
            $amountTendered = (float) $request->validated('amount_tendered');
            $cashierId = Auth::id();

            // Step A: Product & Inventory Validation with Pessimistic Row Locking
            $totalAmount = 0.00;
            $processedItems = [];

            // Aggregate quantities by product_id to validate against concurrent inventory
            $requestedQuantities = [];
            foreach ($cartItems as $item) {
                $productId = $item['product_id'];
                $requestedQuantities[$productId] = ($requestedQuantities[$productId] ?? 0) + (int) $item['quantity'];
            }

            foreach ($cartItems as $item) {
                /** @var Product|null $product */
                $product = Product::where('id', $item['product_id'])
                    ->lockForUpdate()
                    ->first();

                if (! $product) {
                    abort(422, "Product ID {$item['product_id']} does not exist.");
                }

                if ($product->stock_quantity < $requestedQuantities[$product->id]) {
                    abort(422, "Insufficient stock for product: {$product->name}. Current stock: {$product->stock_quantity}.");
                }

                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $product->price;
                $subtotal = round($unitPrice * $quantity, 2);
                $totalAmount = round($totalAmount + $subtotal, 2);

                $processedItems[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            // Step B: Student Account & RFID Validation (If Cashless)
            $student = null;
            $studentAccountId = null;
            $changeAmount = 0.00;

            if ($paymentMethod === 'cashless') {
                $rfidUid = $request->validated('rfid_uid');

                /** @var StudentAccount|null $student */
                $student = StudentAccount::where('rfid_uid', $rfidUid)
                    ->lockForUpdate()
                    ->first();

                if (! $student) {
                    abort(404, 'Student account not found for provided RFID.');
                }

                if (in_array($student->status, ['lost_card', 'suspended', 'inactive'], true)) {
                    abort(403, "Student account is {$student->status}. Transaction blocked.");
                }

                // Enforce Daily Spending Limits
                if ($student->is_spending_limited) {
                    $spentToday = (float) Transaction::where('student_account_id', $student->id)
                        ->where('status', 'completed')
                        ->whereDate('created_at', today())
                        ->sum('total_amount');

                    if (round($spentToday + $totalAmount, 2) > (float) $student->daily_spending_limit) {
                        abort(403, 'Daily transaction limit exceeded.');
                    }
                }

                // Enforce Stored-Value Balance
                if ((float) $student->current_balance < $totalAmount) {
                    abort(403, 'Insufficient balance.');
                }

                // Deduct Balance
                $student->decrement('current_balance', $totalAmount);

                $studentAccountId = $student->id;
                $amountTendered = $totalAmount;
                $changeAmount = 0.00;
            } else {
                // Cash Payment Validation
                if ($amountTendered < $totalAmount) {
                    abort(422, 'Amount tendered is less than total payable amount.');
                }

                $changeAmount = round($amountTendered - $totalAmount, 2);
            }

            // Step C: Record the Master Transaction
            $datePart = now()->format('Ymd');
            $receiptNumber = 'RCPT-'.$datePart.'-'.strtoupper(Str::random(4));
            while (Transaction::where('receipt_number', $receiptNumber)->exists()) {
                $receiptNumber = 'RCPT-'.$datePart.'-'.strtoupper(Str::random(4));
            }

            $transaction = Transaction::create([
                'receipt_number' => $receiptNumber,
                'cashier_id' => $cashierId,
                'student_account_id' => $studentAccountId,
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'amount_tendered' => $amountTendered,
                'change_amount' => $changeAmount,
                'status' => 'completed',
            ]);

            // Step D: Itemize Receipt & Update Inventory
            $receiptItems = [];
            foreach ($processedItems as $itemData) {
                /** @var Product $product */
                $product = $itemData['product'];
                $quantity = $itemData['quantity'];
                $unitPrice = $itemData['unit_price'];
                $subtotal = $itemData['subtotal'];

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

                $previousStock = $product->stock_quantity;
                $product->decrement('stock_quantity', $quantity);
                $newStock = $previousStock - $quantity;
                $product->stock_quantity = $newStock;

                InventoryLog::create([
                    'product_id' => $product->id,
                    'user_id' => $cashierId,
                    'action' => 'sale',
                    'quantity_changed' => $quantity,
                    'previous_stock' => $previousStock,
                    'new_stock' => $newStock,
                    'remarks' => "POS Receipt #{$receiptNumber}",
                ]);

                $receiptItems[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            // Step E: Response Data for Thermal Printer & Cash Drawer
            $receiptData = [
                'transaction_id' => $transaction->id,
                'receipt_number' => $transaction->receipt_number,
                'created_at' => $transaction->created_at->toDateTimeString(),
                'cashier' => Auth::user()?->full_name ?? Auth::user()?->username,
                'payment_method' => $paymentMethod,
                'total_amount' => $totalAmount,
                'amount_tendered' => $amountTendered,
                'change_amount' => $changeAmount,
                'student' => $student ? [
                    'id' => $student->id,
                    'name' => "{$student->first_name} {$student->last_name}",
                    'student_id_number' => $student->student_id_number,
                    'remaining_balance' => (float) $student->current_balance,
                ] : null,
                'items' => $receiptItems,
            ];

            if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Checkout completed successfully.',
                    'transaction_id' => $transaction->id,
                    'receipt' => $receiptData,
                ], 201);
            }

            return redirect()->route('pos.index')->with([
                'success' => 'Checkout completed successfully.',
                'transaction_id' => $transaction->id,
                'receipt' => $receiptData,
            ]);
        });
    }
}
