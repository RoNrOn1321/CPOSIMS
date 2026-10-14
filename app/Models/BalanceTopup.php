<?php

namespace App\Models;

use Database\Factories\BalanceTopupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable;

class BalanceTopup extends Model implements Auditable
{
    /** @use HasFactory<BalanceTopupFactory> */
    use HasFactory, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'student_account_id',
        'cashier_id',
        'amount',
        'previous_balance',
        'new_balance',
        'reference_number',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'previous_balance' => 'decimal:2',
            'new_balance' => 'decimal:2',
        ];
    }

    public function studentAccount(): BelongsTo
    {
        return $this->belongsTo(StudentAccount::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}
