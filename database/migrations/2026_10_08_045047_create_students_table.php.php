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
        // 2. create_student_accounts_table.php
        Schema::create('student_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('student_id_number', 30)->unique();
            // Barcode removed; system strictly uses RFID for cashless payments
            $table->string('rfid_uid', 64)->unique()->nullable();
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('grade_level', 30);
            $table->string('section', 50);
            // Links to the parent dashboard
            $table->foreignId('parent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('current_balance', 10, 2)->default(0.00);
            $table->decimal('daily_spending_limit', 10, 2)->default(200.00);
            $table->boolean('is_spending_limited')->default(true);
            // 'lost_card' status instantly freezes compromised RFID tags
            $table->enum('status', ['active', 'suspended', 'lost_card', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
