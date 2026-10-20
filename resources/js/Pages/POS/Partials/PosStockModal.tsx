import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { formatMoney } from '@/lib/formatters';
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Barcode,
  X,
  Filter,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Product } from './ProductGrid';

interface PosStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: string[];
  onAddToCart?: (product: Product) => void;
}

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
type SortOption = 'name' | 'stock_asc' | 'stock_desc' | 'price';

export default function PosStockModal({
  isOpen,
  onClose,
  products = [],
  categories = [],
  onAddToCart,
}: PosStockModalProps) {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    } else {
      setSearch('');
      setSelectedCategory('all');
      setStockFilter('all');
      setSortBy('name');
    }
  }, [isOpen]);

  // Inventory count stats
  const stats = useMemo(() => {
    const total = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      if (p.stock <= 0) {
        outOfStock++;
      } else if (p.stock <= 15) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesBarcode = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
          const matchesCategory = p.category.toLowerCase().includes(q);
          if (!matchesName && !matchesBarcode && !matchesCategory) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Stock status filter
        if (stockFilter === 'in_stock' && p.stock <= 15) {
          return false;
        }
        if (stockFilter === 'low_stock' && (p.stock <= 0 || p.stock > 15)) {
          return false;
        }
        if (stockFilter === 'out_of_stock' && p.stock > 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'stock_asc') {
          return a.stock - b.stock;
        }
        if (sortBy === 'stock_desc') {
          return b.stock - a.stock;
        }
        if (sortBy === 'price') {
          return b.price - a.price;
        }
        return 0;
      });
  }, [products, search, selectedCategory, stockFilter, sortBy]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[760px] max-h-[88vh] flex flex-col p-6 rounded-2xl gap-4">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-slate-100 pr-10">
          <div className="flex items-center gap-2.5">
            <DialogTitle className="flex items-center gap-2 text-slate-800 text-lg font-bold">
              <Package size={22} className="text-[#5c1516]" />
              Stock & Inventory Levels
            </DialogTitle>
            <Badge className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5">
              {products.length} Products Tracked
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Real-time cafeteria product stock, barcodes, and quick cart addition.
          </DialogDescription>
        </DialogHeader>

        {/* Quick Filter Metric Chips */}
        <div className="grid grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setStockFilter('all')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              stockFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="text-[11px] font-medium opacity-80">All Items</div>
            <div className="text-lg font-extrabold">{stats.total}</div>
          </button>

          <button
            type="button"
            onClick={() => setStockFilter('in_stock')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              stockFilter === 'in_stock'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/70 text-emerald-900'
            }`}
          >
            <div className="text-[11px] font-medium opacity-80 flex items-center gap-1">
              <CheckCircle2 size={12} />
              In Stock
            </div>
            <div className="text-lg font-extrabold">{stats.inStock}</div>
          </button>

          <button
            type="button"
            onClick={() => setStockFilter('low_stock')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              stockFilter === 'low_stock'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/70 text-amber-900'
            }`}
          >
            <div className="text-[11px] font-medium opacity-80 flex items-center gap-1">
              <AlertTriangle size={12} />
              Low Stock (&le;15)
            </div>
            <div className="text-lg font-extrabold">{stats.lowStock}</div>
          </button>

          <button
            type="button"
            onClick={() => setStockFilter('out_of_stock')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              stockFilter === 'out_of_stock'
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-red-50/60 border-red-200 hover:bg-red-100/70 text-red-900'
            }`}
          >
            <div className="text-[11px] font-medium opacity-80 flex items-center gap-1">
              <XCircle size={12} />
              Out of Stock
            </div>
            <div className="text-lg font-extrabold">{stats.outOfStock}</div>
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search product name, barcode (e.g. UPC), or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs rounded-xl bg-slate-50/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {/* Category selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 text-xs rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#5c1516]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 text-xs rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#5c1516]"
            >
              <option value="name">Sort by Name</option>
              <option value="stock_asc">Lowest Stock First</option>
              <option value="stock_desc">Highest Stock First</option>
              <option value="price">Highest Price First</option>
            </select>
          </div>
        </div>

        {/* Product Inventory List */}
        <div className="flex-1 overflow-y-auto min-h-60 max-h-[44vh] space-y-2 pr-1 divide-y divide-slate-100">
          {filteredProducts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Package size={36} className="text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No matching items found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Try adjusting your search query, stock status, or category filter.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 15;

              return (
                <div
                  key={product.id}
                  className="pt-2 pb-2 first:pt-0 flex items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                >
                  {/* Left: Product Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package size={18} className="text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {product.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 h-4 font-medium text-slate-500 border-slate-200"
                        >
                          {product.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-extrabold text-xs text-[#5c1516]">
                          {formatMoney(product.price)}
                        </span>
                        {product.barcode && (
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Barcode size={10} />
                            {product.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Stock Status Badge & Add to Cart button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div>
                      {isOutOfStock ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200 text-[11px] font-bold px-2 py-0.5">
                          Out of Stock (0)
                        </Badge>
                      ) : isLowStock ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[11px] font-bold px-2 py-0.5">
                          Low Stock ({product.stock} left)
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] font-bold px-2 py-0.5">
                          {product.stock} in stock
                        </Badge>
                      )}
                    </div>

                    {onAddToCart && (
                      <Button
                        size="sm"
                        disabled={isOutOfStock}
                        onClick={() => onAddToCart(product)}
                        className={`h-8 text-xs font-bold rounded-lg px-2.5 flex items-center gap-1 cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-[#5c1516] hover:bg-[#7a1420] text-white shadow-2xs'
                        }`}
                      >
                        <Plus size={13} />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info note */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Stock levels automatically refresh after each sale checkout or receipt void.
          </span>
          {/* <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="h-8 text-xs font-semibold px-4 rounded-xl cursor-pointer"
          >
            Close
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
