<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class StudentAccount extends Model implements Auditable
{
    use SoftDeletes, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'student_id_number', 'rfid_uid', 'first_name', 'last_name', 
        'grade_level', 'section', 'parent_id', 'current_balance', 
        'daily_spending_limit', 'is_spending_limited', 'status'
    ];

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