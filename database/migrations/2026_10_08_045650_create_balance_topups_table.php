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
        // 8. create_balance_topups_table.php
Schema::create('balance_topups', function (Blueprint $table) {
    $table->id();
    $table->foreignId('student_account_id')->constrained('student_accounts');
    $table->foreignId('cashier_id')->constrained('users');
    $table->decimal('amount', 10, 2);
    $table->decimal('previous_balance', 10, 2);
    $table->decimal('new_balance', 10, 2);
    $table->string('reference_number', 50)->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('balance_topups');
    }
};
