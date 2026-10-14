<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Category;
use App\Models\InventoryLog;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): Response
    {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $category = $request->input('category');
            if ($category === 'LowStock') {
                $query->whereColumn('stock_quantity', '<=', 'reorder_level');
            } else {
                $query->whereHas('category', function ($q) use ($category) {
                    $q->where('name', $category);
                });
            }
        }

        $products = $query->latest()->paginate(10)->withQueryString();

        $totalValuation = (float) Product::selectRaw('SUM(price * stock_quantity) as total')->value('total') ?? 0;
        $lowStockCount = Product::whereColumn('stock_quantity', '<=', 'reorder_level')->count();
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'metrics' => [
                'totalValuation' => $totalValuation,
                'lowStockCount' => $lowStockCount,
                'totalItems' => Product::count(),
            ],
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created product in storage and record initial inventory log.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $validated = $request->validated();
            $product = Product::create($validated);

            if ($product->stock_quantity > 0) {
                InventoryLog::create([
                    'product_id' => $product->id,
                    'user_id' => $request->user()->id,
                    'action' => 'restock',
                    'quantity_changed' => $product->stock_quantity,
                    'previous_stock' => 0,
                    'new_stock' => $product->stock_quantity,
                    'remarks' => 'Initial stock on product creation',
                ]);
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Food item registered successfully!');
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        return Inertia::render('Admin/Products/Edit', [
            'product' => $product->load('category'),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified product in storage and record inventory adjustments if stock changed.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product) {
            $validated = $request->validated();
            $previousStock = (int) $product->stock_quantity;
            $newStock = (int) $validated['stock_quantity'];

            if ($previousStock !== $newStock) {
                $diff = $newStock - $previousStock;
                $action = $diff > 0 ? 'restock' : 'adjustment';

                InventoryLog::create([
                    'product_id' => $product->id,
                    'user_id' => $request->user()->id,
                    'action' => $action,
                    'quantity_changed' => $diff,
                    'previous_stock' => $previousStock,
                    'new_stock' => $newStock,
                    'remarks' => $validated['remarks'] ?? ($diff > 0 ? 'Manual inventory restock' : 'Manual stock adjustment'),
                ]);
            }

            $product->update($validated);
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully!');
    }

    /**
     * Remove the specified product from storage and record inventory adjustment.
     */
    public function destroy(Product $product): RedirectResponse
    {
        DB::transaction(function () use ($product) {
            if ($product->stock_quantity > 0) {
                InventoryLog::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(),
                    'action' => 'adjustment',
                    'quantity_changed' => -$product->stock_quantity,
                    'previous_stock' => $product->stock_quantity,
                    'new_stock' => 0,
                    'remarks' => 'Item removed from cafeteria inventory',
                ]);
            }

            $product->delete();
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Food item removed from inventory.');
    }
}
