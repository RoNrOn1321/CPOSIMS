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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
            $imagePath = $this->handleProductImage($request);

            $validated['image_path'] = $imagePath;
            unset($validated['image_file'], $validated['image_url'], $validated['image_source']);

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
            ->with('success', 'Product registered successfully!');
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

            $imagePath = $this->handleProductImage($request, $product);
            $validated['image_path'] = $imagePath;
            unset($validated['image_file'], $validated['image_url'], $validated['image_source'], $validated['remove_image']);

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

            if ($product->image_path) {
                $this->deleteStoredImage($product->image_path);
            }

            $product->delete();
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product removed from inventory.');
    }

    /**
     * Process product image from uploaded file or internet URL.
     */
    protected function handleProductImage(Request $request, ?Product $existingProduct = null): ?string
    {
        // 1. Explicit removal requested
        if ($request->boolean('remove_image')) {
            if ($existingProduct?->image_path) {
                $this->deleteStoredImage($existingProduct->image_path);
            }

            return null;
        }

        // 2. Direct local file upload
        if ($request->hasFile('image_file')) {
            if ($existingProduct?->image_path) {
                $this->deleteStoredImage($existingProduct->image_path);
            }

            return $request->file('image_file')->store('products', 'public');
        }

        // 3. Web link importation from the internet
        if ($request->filled('image_url')) {
            $imageUrl = trim((string) $request->input('image_url'));

            if ($existingProduct && $existingProduct->image_path === $imageUrl) {
                return $existingProduct->image_path;
            }

            if ($existingProduct?->image_path) {
                $this->deleteStoredImage($existingProduct->image_path);
            }

            $localPath = $this->downloadRemoteImage($imageUrl);

            return $localPath ?? $imageUrl;
        }

        // 4. Retain existing product image
        return $existingProduct?->image_path;
    }

    /**
     * Attempt downloading an image from a remote URL and caching it on public disk.
     */
    protected function downloadRemoteImage(string $url): ?string
    {
        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CPOSIMS/1.0',
                ])
                ->get($url);

            if (! $response->successful()) {
                return null;
            }

            $contentType = (string) $response->header('Content-Type');
            $extension = match (true) {
                str_contains($contentType, 'image/jpeg') => 'jpg',
                str_contains($contentType, 'image/png') => 'png',
                str_contains($contentType, 'image/webp') => 'webp',
                str_contains($contentType, 'image/gif') => 'gif',
                str_contains($contentType, 'image/svg') => 'svg',
                default => null,
            };

            if (! $extension) {
                $path = parse_url($url, PHP_URL_PATH);
                $ext = pathinfo((string) $path, PATHINFO_EXTENSION);
                if (in_array(strtolower($ext), ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'])) {
                    $extension = strtolower($ext);
                }
            }

            if (! $extension) {
                return null;
            }

            $filename = 'products/'.Str::uuid().'.'.$extension;
            Storage::disk('public')->put($filename, $response->body());

            return $filename;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Safely delete a local product image file from the public disk.
     */
    protected function deleteStoredImage(string $path): void
    {
        if (! str_starts_with($path, 'http://') && ! str_starts_with($path, 'https://')) {
            Storage::disk('public')->delete($path);
        }
    }
}
