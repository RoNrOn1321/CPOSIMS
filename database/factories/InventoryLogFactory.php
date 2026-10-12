<?php

namespace Database\Factories;

use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryLog>
 */
class InventoryLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $previous = fake()->numberBetween(10, 100);
        $change = fake()->numberBetween(1, 20);
        $new = $previous + $change;

        return [
            'product_id' => Product::factory(),
            'user_id' => User::factory(),
            'action' => 'restock',
            'quantity_changed' => $change,
            'previous_stock' => $previous,
            'new_stock' => $new,
            'remarks' => fake()->sentence(),
        ];
    }
}
