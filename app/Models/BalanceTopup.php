<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class BalanceTopup extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'student_account_id', 'cashier_id', 'amount',
        'previous_balance', 'new_balance', 'reference_number',
    ];

    public function studentAccount()
    {
        return $this->belongsTo(StudentAccount::class);
    }
}
