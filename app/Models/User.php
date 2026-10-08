<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use OwenIt\Auditing\Contracts\Auditable;
use Spatie\Permission\Traits\HasRoles; // Spatie Role Management

class User extends Authenticatable implements Auditable
{
    use HasFactory, Notifiable, SoftDeletes, HasRoles, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'username', 'password', 'full_name', 'email', 'phone', 'role', 'status'
    ];

    protected $hidden = [
        'password',
    ];

        protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // Connects a parent user to their children's accounts
    public function studentAccounts()
    {
        return $this->hasMany(StudentAccount::class, 'parent_id');
    }
}