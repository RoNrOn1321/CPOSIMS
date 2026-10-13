<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements AuditableContract
{
    use Auditable, HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = [
        'username',
        'password',
        'full_name',
        'email',
        'phone',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'name',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::saved(function (User $user) {
            if (! empty($user->role)) {
                $role = Role::firstOrCreate([
                    'name' => $user->role,
                    'guard_name' => 'web',
                ]);

                if (! $user->hasRole($role)) {
                    $user->syncRoles([$role]);
                }
            }
        });
    }

    /**
     * Compatibility accessor for code referencing $user->name.
     */
    public function getNameAttribute(): string
    {
        return $this->full_name ?? '';
    }

    /**
     * Compatibility mutator for code setting $user->name.
     */
    public function setNameAttribute(?string $value): void
    {
        $this->attributes['full_name'] = $value;
    }

    /**
     * Check if user account is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Connects a parent user to their children's accounts.
     */
    public function studentAccounts(): HasMany
    {
        return $this->hasMany(StudentAccount::class, 'parent_id');
    }

    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }
}
