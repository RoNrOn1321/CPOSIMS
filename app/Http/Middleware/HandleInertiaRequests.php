<?php

namespace App\Http\Middleware;

use App\Models\BalanceTopup;
use App\Models\Product;
use App\Models\StudentAccount;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'username' => $user->username,
                    'full_name' => $user->full_name,
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'status' => fn () => $request->session()->get('status'),
                'reference_number' => fn () => $request->session()->get('reference_number'),
                'topup' => fn () => $request->session()->get('topup'),
            ],
            'system_notifications' => fn () => $user ? $this->getSystemNotifications($user) : [],
            'enrolled_students_count' => fn () => ($user && ($user->role === 'parent' || (method_exists($user, 'hasRole') && $user->hasRole('parent'))))
                ? StudentAccount::where('parent_id', $user->id)->count()
                : 0,
        ];
    }

    /**
     * Build contextual system notifications for the authenticated user.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function getSystemNotifications(User $user): array
    {
        $notifications = [];

        // Admin & staff notifications
        if ($user->role === 'admin' || (method_exists($user, 'hasRole') && $user->hasRole('admin'))) {
            // 1. Low stock products (at or below reorder level)
            $lowStockProducts = Product::whereColumn('stock_quantity', '<=', 'reorder_level')
                ->orderBy('stock_quantity')
                ->limit(6)
                ->get();

            foreach ($lowStockProducts as $product) {
                $isOut = (int) $product->stock_quantity <= 0;
                $notifications[] = [
                    'id' => "stock-{$product->id}",
                    'type' => 'stock',
                    'title' => $isOut ? "Out of Stock: {$product->name}" : "Low Stock: {$product->name}",
                    'message' => $isOut
                        ? '0 units remaining in cafeteria inventory. Urgent replenishment needed.'
                        : "Only {$product->stock_quantity} remaining (reorder threshold: {$product->reorder_level}).",
                    'severity' => $isOut ? 'danger' : 'warning',
                    'time' => $product->updated_at?->diffForHumans() ?? 'Active',
                    'timestamp' => $product->updated_at?->timestamp ?? now()->timestamp,
                    'actionUrl' => route('admin.products.index'),
                    'actionLabel' => 'Manage Inventory',
                ];
            }

            // 2. Recent voids
            $recentVoids = Transaction::where('status', 'voided')
                ->with('cashier:id,full_name,username')
                ->latest('updated_at')
                ->limit(5)
                ->get();

            foreach ($recentVoids as $tx) {
                $cashierName = $tx->cashier?->full_name ?? $tx->cashier?->username ?? 'Cashier';
                $amountFormatted = number_format((float) $tx->total_amount, 2);
                $notifications[] = [
                    'id' => "void-{$tx->id}",
                    'type' => 'void',
                    'title' => "Transaction Voided: #{$tx->receipt_number}",
                    'message' => "Receipt for PHP {$amountFormatted} voided by {$cashierName}. Stock restored.",
                    'severity' => 'danger',
                    'time' => $tx->updated_at?->diffForHumans() ?? $tx->created_at->diffForHumans(),
                    'timestamp' => $tx->updated_at?->timestamp ?? $tx->created_at->timestamp,
                    'actionUrl' => route('admin.audit-logs.index'),
                    'actionLabel' => 'View Audit Log',
                ];
            }

            // 3. Recent top-ups
            $recentTopups = BalanceTopup::with('studentAccount:id,first_name,last_name,student_id_number')
                ->latest()
                ->limit(5)
                ->get();

            foreach ($recentTopups as $topup) {
                $studentName = $topup->studentAccount
                    ? "{$topup->studentAccount->first_name} {$topup->studentAccount->last_name}"
                    : 'Student';
                $studentId = $topup->studentAccount?->student_id_number ?? '';
                $amountFormatted = number_format((float) $topup->amount, 2);
                $newBalFormatted = number_format((float) $topup->new_balance, 2);
                $notifications[] = [
                    'id' => "topup-{$topup->id}",
                    'type' => 'topup',
                    'title' => "RFID Reload: PHP {$amountFormatted}",
                    'message' => "Reloaded for {$studentName}".($studentId ? " ({$studentId})" : '').". Balance: PHP {$newBalFormatted}.",
                    'severity' => 'success',
                    'time' => $topup->created_at->diffForHumans(),
                    'timestamp' => $topup->created_at->timestamp,
                    'actionUrl' => route('admin.reports.index'),
                    'actionLabel' => 'View Reports',
                ];
            }
        }

        // Parent notifications
        if ($user->role === 'parent' || (method_exists($user, 'hasRole') && $user->hasRole('parent'))) {
            $students = StudentAccount::where('parent_id', $user->id)->get();

            foreach ($students as $student) {
                if ((float) $student->current_balance <= 100.0) {
                    $isCritical = (float) $student->current_balance <= 30.0;
                    $balFormatted = number_format((float) $student->current_balance, 2);
                    $notifications[] = [
                        'id' => "balance-{$student->id}",
                        'type' => 'balance',
                        'title' => "Low RFID Balance: {$student->first_name}",
                        'message' => "Current balance is PHP {$balFormatted}. Reload soon to ensure meal access.",
                        'severity' => $isCritical ? 'danger' : 'warning',
                        'time' => 'Balance Alert',
                        'timestamp' => now()->timestamp,
                        'actionUrl' => '#topup',
                        'actionLabel' => 'Top-Up RFID',
                    ];
                }
            }

            if ($students->isNotEmpty()) {
                $recentPurchases = Transaction::whereIn('student_account_id', $students->pluck('id'))
                    ->where('status', 'completed')
                    ->latest()
                    ->with('studentAccount:id,first_name,last_name')
                    ->limit(5)
                    ->get();

                foreach ($recentPurchases as $purchase) {
                    $amountFormatted = number_format((float) $purchase->total_amount, 2);
                    $childName = $purchase->studentAccount ? $purchase->studentAccount->first_name : 'Student';
                    $methodLabel = $purchase->payment_method === 'cashless' ? 'RFID Card' : 'Cash';
                    $notifications[] = [
                        'id' => "purchase-{$purchase->id}",
                        'type' => 'purchase',
                        'title' => "Meal Purchase: {$childName}",
                        'message' => "PHP {$amountFormatted} paid via {$methodLabel}.",
                        'severity' => 'info',
                        'time' => $purchase->created_at->diffForHumans(),
                        'timestamp' => $purchase->created_at->timestamp,
                        'actionUrl' => route('parent.dashboard'),
                        'actionLabel' => 'View Meal History',
                    ];
                }

                // Recent RFID reloads for parent's students
                $recentStudentTopups = BalanceTopup::whereIn('student_account_id', $students->pluck('id'))
                    ->latest()
                    ->with('studentAccount:id,first_name,last_name')
                    ->limit(5)
                    ->get();

                foreach ($recentStudentTopups as $topup) {
                    $childName = $topup->studentAccount ? $topup->studentAccount->first_name : 'Student';
                    $amountFormatted = number_format((float) $topup->amount, 2);
                    $newBalFormatted = number_format((float) $topup->new_balance, 2);
                    $notifications[] = [
                        'id' => "topup-{$topup->id}",
                        'type' => 'topup',
                        'title' => "RFID Reloaded: {$childName}",
                        'message' => "PHP {$amountFormatted} added. New balance: PHP {$newBalFormatted}.",
                        'severity' => 'success',
                        'time' => $topup->created_at->diffForHumans(),
                        'timestamp' => $topup->created_at->timestamp,
                        'actionUrl' => route('parent.dashboard'),
                        'actionLabel' => 'View Balance',
                    ];
                }
            }
        }

        usort($notifications, fn ($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        return array_slice($notifications, 0, 15);
    }
}
