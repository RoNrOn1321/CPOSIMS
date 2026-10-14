<?php

namespace Database\Factories;

use App\Models\BalanceTopup;
use App\Models\StudentAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BalanceTopup>
 */
class BalanceTopupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->randomElement([100, 200, 500, 1000]);
        $prev = fake()->randomFloat(2, 50, 1000);
        $new = round($prev + $amount, 2);

        return [
            'student_account_id' => StudentAccount::factory(),
            'cashier_id' => User::factory()->cashier(),
            'amount' => $amount,
            'previous_balance' => $prev,
            'new_balance' => $new,
            'reference_number' => 'CASH-'.now()->format('Ymd').'-'.strtoupper(Str::random(4)),
        ];
    }
}
