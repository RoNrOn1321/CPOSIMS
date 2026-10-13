<?php

namespace App\Models;

use Database\Factories\StudentAccountFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class StudentAccount extends Model implements Auditable
{
    /** @use HasFactory<StudentAccountFactory> */
    use HasFactory, \OwenIt\Auditing\Auditable, SoftDeletes;

    protected $fillable = [
        'student_id_number', 'rfid_uid', 'first_name', 'last_name',
        'grade_level', 'section', 'parent_id', 'current_balance',
        'daily_spending_limit', 'is_spending_limited', 'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_balance' => 'decimal:2',
            'daily_spending_limit' => 'decimal:2',
            'is_spending_limited' => 'boolean',
        ];
    }

    // Connects back to the User model (Parent Dashboard)
    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
