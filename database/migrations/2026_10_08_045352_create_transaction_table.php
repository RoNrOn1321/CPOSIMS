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
        // 5. create_transactions_table.php
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->string('receipt_number', 50)->unique();
    $table->foreignId('cashier_id')->constrained('users');
    $table->foreignId('student_account_id')->nullable()->constrained('student_accounts');
    $table->decimal('total_amount', 10, 2);
    $table->enum('payment_method', ['cash', 'cashless']);
    $table->decimal('amount_tendered', 10, 2);
    $table->decimal('change_amount', 10, 2)->default(0.00);
    $table->enum('status', ['completed', 'voided'])->default('completed');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction');
    }
};
