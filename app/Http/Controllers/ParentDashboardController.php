<?php

namespace App\Http\Controllers;

use App\Models\StudentAccount;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ParentDashboardController extends Controller
{
    /**
     * Display the parent portal dashboard with linked student accounts.
     */
    public function index(): Response
    {
        $userId = Auth::id();

        $students = StudentAccount::where('parent_id', $userId)
            ->with([
                'transactions' => function ($query) {
                    $query->where('status', 'completed')
                        ->latest('created_at')
                        ->with(['details.product.category', 'cashier']);
                },
            ])
            ->get();

        $studentsData = $students->map(function (StudentAccount $student) {
            $completedTransactions = $student->transactions;

            $today = Carbon::today();
            $startOfWeek = Carbon::now()->startOfWeek();
            $endOfWeek = Carbon::now()->endOfWeek();

            $spentToday = (float) $completedTransactions
                ->filter(fn ($t) => Carbon::parse($t->created_at)->isSameDay($today))
                ->sum('total_amount');

            $weeklySpent = (float) $completedTransactions
                ->filter(fn ($t) => Carbon::parse($t->created_at)->between($startOfWeek, $endOfWeek))
                ->sum('total_amount');

            // Compute running balance after each cashless deduction (newest to oldest)
            $runningBalance = (float) $student->current_balance;
            $formattedTransactions = [];

            foreach ($completedTransactions as $index => $transaction) {
                $createdAt = Carbon::parse($transaction->created_at);

                $dateTimeStr = $createdAt->isToday()
                    ? 'Today, '.$createdAt->format('g:i A')
                    : ($createdAt->isYesterday()
                        ? 'Yesterday, '.$createdAt->format('g:i A')
                        : $createdAt->format('M d, Y g:i A'));

                $hour = (int) $createdAt->format('H');
                $minute = (int) $createdAt->format('i');
                $timeDecimal = $hour + ($minute / 60);

                $mealType = match (true) {
                    $timeDecimal < 10.5 => 'Morning Recess',
                    $timeDecimal <= 13.5 => 'Lunch Meal',
                    default => 'Afternoon Snack',
                };

                $items = $transaction->details->map(function ($detail) {
                    return [
                        'name' => $detail->product?->name ?? 'Cafeteria Item',
                        'qty' => (int) $detail->quantity,
                        'price' => (float) $detail->unit_price,
                        'category' => $detail->product?->category?->name ?? 'Cafeteria Items',
                    ];
                })->values()->all();

                $total = (float) $transaction->total_amount;
                $balanceAfter = $runningBalance;

                // For the previous older transaction, reconstruct prior balance if cashless
                if ($transaction->payment_method === 'cashless') {
                    $runningBalance = round($runningBalance + $total, 2);
                }

                $formattedTransactions[] = [
                    'id' => $transaction->receipt_number,
                    'studentId' => (int) $student->id,
                    'dateTime' => $dateTimeStr,
                    'mealType' => $mealType,
                    'items' => $items,
                    'total' => $total,
                    'terminal' => 'Canteen Terminal #01 (Main Building)',
                    'paymentMethod' => $transaction->payment_method === 'cashless'
                        ? 'Student RFID Card Tap'
                        : 'Cash',
                    'balanceAfter' => $balanceAfter,
                    'rawCreatedAt' => $transaction->created_at->toISOString(),
                ];
            }

            return [
                'id' => (int) $student->id,
                'name' => trim("{$student->first_name} {$student->last_name}"),
                'gradeLevel' => "{$student->grade_level} - {$student->section}",
                'studentId' => $student->student_id_number,
                'rfidUid' => $student->rfid_uid ?? 'N/A',
                'balance' => (float) $student->current_balance,
                'dailyLimit' => (float) $student->daily_spending_limit,
                'spentToday' => round($spentToday, 2),
                'weeklySpent' => round($weeklySpent, 2),
                'prohibitedItems' => [],
                'allergies' => [],
                'transactions' => $formattedTransactions,
            ];
        })->values()->all();

        return Inertia::render('ParentDashboard/Index', [
            'students' => $studentsData,
        ]);
    }
}
