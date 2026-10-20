<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Product extends Model implements Auditable
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, \OwenIt\Auditing\Auditable, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'barcode',
        'name',
        'price',
        'cost',
        'stock_quantity',
        'reorder_level',
        'status',
        'image_path',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'image_url',
    ];

    /**
     * Get the resolved image URL (local storage or remote web URL).
     */
    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image_path)) {
            return null;
        }

        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        return asset('storage/'.ltrim($this->image_path, '/'));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'cost' => 'decimal:2',
            'stock_quantity' => 'integer',
            'reorder_level' => 'integer',
        ];
    }

    /**
     * Get the category that the product belongs to.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the transaction details for the product.
     *
     * @return HasMany<TransactionDetail, $this>
     */
    public function transactionDetails(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    /**
     * Get the inventory logs for the product.
     *
     * @return HasMany<InventoryLog, $this>
     */
    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }
}
