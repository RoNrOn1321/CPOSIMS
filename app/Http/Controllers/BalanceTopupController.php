<?php

namespace App\Http\Controllers;

use App\Models\BalanceTopup;
use App\Models\StudentAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BalanceTopupController extends Controller
{
    /**
     * Process online balance top-up by a parent via simulated payment gateway.
     */
    public function parentStore(Request $request, StudentAccount $student): JsonResponse|RedirectResponse
    {
        $user = Auth::user();
        $isAdmin = $user && ($user->role === 'admin' || $user->hasRole('admin'));

        if (! $isAdmin && (int) $student->parent_id !== (int) Auth::id()) {
            abort(403, 'Unauthorized access to student account.');
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:50', 'max:10000'],
            'payment_method' => ['required', 'string', 'in:gcash,maya,bank'],
            'account_number' => ['nullable', 'string', 'max:50'],
        ]);

        return DB::transaction(function () use ($student, $validated, $request) {
            /** @var StudentAccount $lockedStudent */
            $lockedStudent = StudentAccount::where('id', $student->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedStudent->status === 'inactive') {
                abort(422, 'Cannot reload an inactive student account.');
            }

            $previousBalance = (float) $lockedStudent->current_balance;
            $amount = (float) $validated['amount'];
            $newBalance = round($previousBalance + $amount, 2);

            $lockedStudent->update([
                'current_balance' => $newBalance,
            ]);

            $prefix = match ($validated['payment_method']) {
                'gcash' => 'GCASH',
                'maya' => 'MAYA',
                'bank' => 'BANK',
                default => 'TOPUP',
            };

            $datePart = now()->format('Ymd');
            do {
                $referenceNumber = "{$prefix}-{$datePart}-".strtoupper(Str::random(4));
            } while (BalanceTopup::where('reference_number', $referenceNumber)->exists());

            $topup = BalanceTopup::create([
                'student_account_id' => $lockedStudent->id,
                'cashier_id' => Auth::id(),
                'amount' => $amount,
                'previous_balance' => $previousBalance,
                'new_balance' => $newBalance,
                'reference_number' => $referenceNumber,
            ]);

            if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'RFID balance reloaded successfully.',
                    'reference_number' => $referenceNumber,
                    'student_name' => trim("{$lockedStudent->first_name} {$lockedStudent->last_name}"),
                    'amount' => $amount,
                    'previous_balance' => $previousBalance,
                    'new_balance' => $newBalance,
                    'topup' => $topup,
                ], 200);
            }

            return redirect()->back()->with([
                'success' => 'RFID balance reloaded successfully.',
                'reference_number' => $referenceNumber,
            ]);
        });
    }

    /**
     * Process walk-in physical cash balance top-up at POS terminal.
     */
    public function posStore(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'rfid_uid' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:10', 'max:10000'],
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $identifier = trim((string) $validated['rfid_uid']);

            /** @var StudentAccount|null $student */
            $student = StudentAccount::where(function ($query) use ($identifier) {
                $query->where('rfid_uid', $identifier)
                    ->orWhere('student_id_number', $identifier);
            })->lockForUpdate()->first();

            if (! $student) {
                abort(404, 'Student account not found for the scanned RFID / ID.');
            }

            if (in_array($student->status, ['lost_card', 'suspended', 'inactive'], true)) {
                abort(403, "Cannot reload a {$student->status} card.");
            }

            $previousBalance = (float) $student->current_balance;
            $amount = (float) $validated['amount'];
            $newBalance = round($previousBalance + $amount, 2);

            $student->update([
                'current_balance' => $newBalance,
            ]);

            $datePart = now()->format('Ymd');
            do {
                $referenceNumber = "CASH-{$datePart}-".strtoupper(Str::random(4));
            } while (BalanceTopup::where('reference_number', $referenceNumber)->exists());

            BalanceTopup::create([
                'student_account_id' => $student->id,
                'cashier_id' => Auth::id(),
                'amount' => $amount,
                'previous_balance' => $previousBalance,
                'new_balance' => $newBalance,
                'reference_number' => $referenceNumber,
            ]);

            $studentName = trim("{$student->first_name} {$student->last_name}");

            $cashierName = Auth::user()?->full_name ?? Auth::user()?->username ?? 'Cashier';
            $topupPayload = [
                'reference_number' => $referenceNumber,
                'student_name' => $studentName,
                'student_id_number' => $student->student_id_number,
                'amount' => $amount,
                'previous_balance' => $previousBalance,
                'new_balance' => $newBalance,
                'created_at' => now()->format('Y-m-d H:i:s'),
                'cashier' => $cashierName,
            ];

            if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'RFID balance reloaded successfully.',
                    'reference_number' => $referenceNumber,
                    'student_name' => $studentName,
                    'amount' => $amount,
                    'previous_balance' => $previousBalance,
                    'new_balance' => $newBalance,
                    'topup' => $topupPayload,
                ], 201);
            }

            return redirect()->back()->with([
                'success' => 'RFID balance reloaded successfully.',
                'reference_number' => $referenceNumber,
                'topup' => $topupPayload,
            ]);
        });
    }
}
