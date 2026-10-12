<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $total = fake()->randomFloat(2, 10, 500);

        return [
            'receipt_number' => fake()->unique()->numerify('RCP-########'),
            'cashier_id' => User::factory(),
            'student_account_id' => null,
            'total_amount' => $total,
            'payment_method' => 'cash',
            'amount_tendered' => $total,
            'change_amount' => 0.00,
            'status' => 'completed',
        ];
    }
}
