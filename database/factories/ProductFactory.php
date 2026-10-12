<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'barcode' => fake()->unique()->ean13(),
            'name' => fake()->words(3, true),
            'price' => fake()->randomFloat(2, 5, 200),
            'cost' => fake()->randomFloat(2, 2, 100),
            'stock_quantity' => fake()->numberBetween(0, 100),
            'reorder_level' => 10,
            'status' => 'active',
        ];
    }
}
