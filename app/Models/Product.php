<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Product extends Model implements Auditable
{
    use SoftDeletes, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'category_id', 'barcode', 'name', 'price', 'cost', 
        'stock_quantity', 'reorder_level', 'status'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}