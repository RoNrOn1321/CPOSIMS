<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Transaction extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable; // Tracks if a transaction is changed to "voided"

    protected $fillable = [
        'receipt_number', 'cashier_id', 'student_account_id', 
        'total_amount', 'payment_method', 'amount_tendered', 
        'change_amount', 'status'
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function studentAccount()
    {
        return $this->belongsTo(StudentAccount::class);
    }

    // Fetches the itemized rows for the receipt printer
    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }
}