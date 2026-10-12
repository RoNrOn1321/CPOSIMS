<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use OwenIt\Auditing\Contracts\Auditable;
use Spatie\Permission\Traits\HasRoles;

 // Spatie Role Management

class User extends Authenticatable implements Auditable
{
    use HasFactory, HasRoles, Notifiable, \OwenIt\Auditing\Auditable, SoftDeletes;

    protected $fillable = [
        'username', 'password', 'full_name', 'email', 'phone', 'role', 'status',
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

    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }
}
