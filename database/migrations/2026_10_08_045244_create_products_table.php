<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 4. create_products_table.php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
    $table->string('barcode', 64)->unique()->nullable(); // Used by the USB Barcode Scanner
    $table->string('name', 100);
    $table->decimal('price', 10, 2);
    $table->decimal('cost', 10, 2)->default(0.00);
    $table->integer('stock_quantity')->default(0);
    $table->integer('reorder_level')->default(10);
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->timestamps();
    $table->softDeletes();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
