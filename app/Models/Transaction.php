<?php

namespace App\Models;

use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;

class Transaction extends Model implements Auditable
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory, \OwenIt\Auditing\Auditable; // Tracks if a transaction is changed to "voided"

    protected $fillable = [
        'receipt_number',
        'cashier_id',
        'student_account_id',
        'total_amount',
        'payment_method',
        'amount_tendered',
        'change_amount',
        'status',
    ];

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function studentAccount(): BelongsTo
    {
        return $this->belongsTo(StudentAccount::class);
    }

    // Fetches the itemized rows for the receipt printer
    public function details(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    /**
     * Relationship alias for transaction details.
     */
    public function transactionDetails(): HasMany
    {
        return $this->details();
    }
}
