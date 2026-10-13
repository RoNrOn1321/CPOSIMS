<?php

namespace Database\Factories;

use App\Models\StudentAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentAccount>
 */
class StudentAccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id_number' => fake()->unique()->numerify('2026-####'),
            'rfid_uid' => fake()->unique()->regexify('[A-F0-9]{14}'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'grade_level' => 'Grade 6',
            'section' => 'St. Therese',
            'parent_id' => User::factory()->parent(),
            'current_balance' => 500.00,
            'daily_spending_limit' => 200.00,
            'is_spending_limited' => true,
            'status' => 'active',
        ];
    }

    /**
     * Indicate that the student account card is lost.
     */
    public function lostCard(): static
    {
        return $this->state(fn () => [
            'status' => 'lost_card',
        ]);
    }

    /**
     * Indicate that the student account is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn () => [
            'status' => 'suspended',
        ]);
    }

    /**
     * Indicate that the student account is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn () => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Indicate that the student account has no spending limit.
     */
    public function unlimited(): static
    {
        return $this->state(fn () => [
            'is_spending_limited' => false,
        ]);
    }
}
