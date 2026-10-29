import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/Components/ui/dialog';
import { formatMoney } from '@/lib/formatters';
import { Link, router } from '@inertiajs/react';
import { 
  Plus, 
  Search, 
  ArrowUpDown, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  ExternalLink,
  Tags
} from 'lucide-react';
import ManageCategoriesModal, { CategoryItem } from './Partials/ManageCategoriesModal';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { 
  index as productsIndex, 
  create as createProductAction, 
  edit as editProductAction, 
  update as updateProductAction, 
  destroy as destroyProductAction 
} from '@/actions/App/Http/Controllers/Admin/ProductController';
import { index as posIndex } from '@/actions/App/Http/Controllers/PosController';
import { useConfirm } from '@/Hooks/use-confirm';
import { toast } from '@/Hooks/use-toast';

export interface ProductItem {
  id: number;
  name: string;
  category_id: number | null;
  barcode: string | null;
  price: number | string;
  cost: number | string;
  stock_quantity: number;
  reorder_level: number;
  status: 'active' | 'inactive';
  image_path?: string | null;
  image_url?: string | null;
  category?: {
    id: number;
    name: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
  prev_page_url: string | null;
  next_page_url: string | null;
}

interface ProductsIndexProps {
  products: PaginatedData<ProductItem>;
  categories?: CategoryItem[];
  metrics?: {
    totalValuation: number;
    lowStockCount: number;
    totalItems: number;
  };
  filters?: {
    search?: string;
    category?: string;
  };
}

export default function ProductsIndex({ 
  products, 
  categories = [], 
  metrics,
  filters = {} 
}: ProductsIndexProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
  const [activeCategory, setActiveCategory] = useState(filters.category ?? 'All');
  const [sorting, setSorting] = useState<SortingState>([]);
  const { confirm } = useConfirm();

  // Restock Quick Modal state
  const [restockProduct, setRestockProduct] = useState<ProductItem | null>(null);
  const [addQty, setAddQty] = useState<number>(20);
  const [isRestocking, setIsRestocking] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Trigger search filter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(productsIndex.url(), {
      search: searchTerm || undefined,
      category: activeCategory !== 'All' ? activeCategory : undefined,
    }, { preserveState: true });
  };

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    router.get(productsIndex.url(), {
      search: searchTerm || undefined,
      category: cat !== 'All' ? cat : undefined,
    }, { preserveState: true });
  };

  // Quick Restock Handler
  const handleConfirmRestock = () => {
    if (!restockProduct) return;
    setIsRestocking(true);

    router.patch(updateProductAction.url(restockProduct.id), {
      name: restockProduct.name,
      category_id: restockProduct.category_id,
      barcode: restockProduct.barcode,
      price: restockProduct.price,
      cost: restockProduct.cost,
      stock_quantity: Number(restockProduct.stock_quantity) + addQty,
      reorder_level: restockProduct.reorder_level,
      status: restockProduct.status,
      remarks: `Quick restock (+${addQty} pcs)`,
    }, {
      onSuccess: () => {
        setIsRestocking(false);
        setRestockProduct(null);
        toast.success(`Restocked +${addQty} portions for ${restockProduct.name}.`);
      },
      onError: () => {
        setIsRestocking(false);
        toast.error('Failed to update stock quantity.');
      },
    });
  };

  // Quick Delete Handler
  const handleDeleteProduct = async (item: ProductItem) => {
    const isConfirmed = await confirm({
      title: 'Remove Product from Inventory',
      description: (
        <span>
          Are you sure you want to remove <strong className="font-extrabold text-slate-800">{item.name}</strong> from the cafeteria inventory?
        </span>
      ),
      warningNote: item.stock_quantity > 0 
        ? `This item currently has ${item.stock_quantity} units remaining in stock. Removing it will record an automatic inventory stock adjustment.`
        : undefined,
      confirmText: 'Remove Item',
      cancelText: 'Keep Item',
      variant: 'danger',
    });

    if (isConfirmed) {
      router.delete(destroyProductAction.url(item.id));
    }
  };

  // TanStack Column Definitions
  const columns = useMemo<ColumnDef<ProductItem>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-bold text-xs text-slate-700 hover:text-slate-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Product
          <ArrowUpDown size={12} className="text-slate-400" />
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const displayImg = item.image_url;

        return (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center relative">
              {displayImg ? (
                <img 
                  src={displayImg} 
                  alt={item.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    const fallbackEl = parent?.querySelector('.item-no-image');
                    if (fallbackEl) {
                      fallbackEl.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              <div className={`item-no-image text-slate-400 flex items-center justify-center ${displayImg ? 'hidden' : ''}`}>
                <Package size={18} />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-800 leading-snug">
                {item.name}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {item.barcode || 'NO-BARCODE'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-slate-50 text-slate-700 px-2 py-0.5">
          {row.original.category?.name || 'Uncategorized'}
        </Badge>
      ),
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-bold text-xs text-slate-700 hover:text-slate-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Selling Price
          <ArrowUpDown size={12} className="text-slate-400" />
        </button>
      ),
      cell: ({ row }) => {
        const price = Number(row.original.price);
        const cost = Number(row.original.cost);
        const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
        return (
          <div>
            <div className="font-extrabold text-xs text-[#5c1516]">
              {formatMoney(price)}
            </div>
            <div className="text-[10px] text-slate-400">
              Cost: {formatMoney(cost)} ({margin}% margin)
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'stock_quantity',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-bold text-xs text-slate-700 hover:text-slate-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Stock Level
          <ArrowUpDown size={12} className="text-slate-400" />
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isLow = Number(item.stock_quantity) <= Number(item.reorder_level);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`font-black text-xs ${isLow ? 'text-amber-700' : 'text-slate-800'}`}>
                {item.stock_quantity} pcs
              </span>
              {isLow && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[9px] px-1.5 py-0 font-bold">
                  Low Stock
                </Badge>
              )}
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (Number(item.stock_quantity) / 60) * 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.status === 'active';
        return (
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span>{isActive ? 'Active' : 'Inactive'}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRestockProduct(item);
                setAddQty(20);
              }}
              className="h-8 px-2.5 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={12} className="mr-1 text-amber-600" /> Restock
            </Button>

            <Link href={editProductAction.url(item.id)}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <Edit size={14} />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteProduct(item)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        );
      },
    },
  ], []);

  // TanStack Table Instance
  const table = useReactTable({
    data: products.data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalValuation = metrics?.totalValuation ?? products.data.reduce((sum, item) => sum + (Number(item.price) * Number(item.stock_quantity)), 0);
  const lowStockCount = metrics?.lowStockCount ?? products.data.filter(p => Number(p.stock_quantity) <= Number(p.reorder_level)).length;
  const totalItems = metrics?.totalItems ?? products.total;

  return (
    <AdminLayout portal="admin" activeNav="products">
      {/* Top Header & Overview Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Cafeteria Products & Inventory
            </h1>
            <Badge className="bg-[#5c1516] text-white font-extrabold text-[10px]">
              {totalItems} Total Items
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock monitoring, selling prices, and POS catalog distribution for STCT Canteen.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={() => setIsCategoryModalOpen(true)}
            className="h-10 text-xs font-bold border-slate-200 text-slate-700 hover:text-[#5c1516] hover:bg-red-50/50 rounded-xl cursor-pointer"
          >
            <Tags size={14} className="mr-1.5 text-[#5c1516]" /> Categories
          </Button>
          <Link href={posIndex.url()}>
            <Button variant="outline" size="sm" className="h-10 text-xs font-bold border-slate-200">
              <ExternalLink size={14} className="mr-1.5 text-slate-500" /> Open POS Register
            </Button>
          </Link>
          <Link href={createProductAction.url()}>
            <Button className="h-10 bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs px-4 rounded-xl shadow-sm flex items-center gap-1.5">
              <Plus size={16} /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Inventory Value
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {formatMoney(totalValuation)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Based on active selling prices across {totalItems} items.
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Low Stock Warnings
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <CardTitle className="text-2xl font-black text-amber-700 tracking-tight">
                {lowStockCount} Items
              </CardTitle>
              <span className="text-xs text-slate-400 font-semibold">under threshold</span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-amber-700 font-semibold">
              Action recommended before the 12:00 PM lunch rush.
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Categories
              </CardDescription>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="h-6 text-[10px] font-bold text-[#5c1516] hover:bg-red-50 hover:text-[#7a1420] px-2 rounded-lg cursor-pointer"
                >
                  Manage
                </Button>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#008dd5] flex items-center justify-center">
                  <Package size={16} />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {categories.length || 5} Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              {categories.map(c => c.name).join(', ') || 'Rice Meals, Snacks, Drinks, Bakery, Healthy'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* TanStack Table Card */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white overflow-hidden">
        {/* Table Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search product name, barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs bg-white rounded-xl border-slate-200"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['All', ...categories.map(c => c.name), 'LowStock'].map(cat => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#5c1516] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'LowStock' ? '⚠️ Low Stock' : cat}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border border-dashed border-slate-300 text-slate-500 hover:text-[#5c1516] hover:border-[#5c1516] hover:bg-red-50/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Add or Manage Categories"
            >
              <Plus size={12} /> Category
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-xs font-bold text-slate-700 py-3.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-28 text-center text-slate-400 text-xs">
                    No cafeteria products found matching query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500 font-medium">
          <div>
            Showing {products.from || 0} - {products.to || 0} of {products.total} products
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => products.prev_page_url && router.visit(products.prev_page_url)}
              disabled={!products.prev_page_url}
              className="h-8 px-3 text-xs rounded-lg border-slate-200 disabled:opacity-40"
            >
              Previous
            </Button>
            <span className="font-bold text-slate-700">
              Page {products.current_page} of {products.last_page || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => products.next_page_url && router.visit(products.next_page_url)}
              disabled={!products.next_page_url}
              className="h-8 px-3 text-xs rounded-lg border-slate-200 disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Restock Modal Dialog */}
      <Dialog open={!!restockProduct} onOpenChange={() => setRestockProduct(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl" showCloseButton={false}>
          {restockProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-slate-800 text-base font-extrabold flex items-center gap-2">
                  <RefreshCw size={18} className="text-[#5c1516]" />
                  Quick Inventory Restock
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Add newly prepared or delivered portions to {restockProduct.name}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{restockProduct.name}</span>
                    <p className="text-[11px] text-slate-400">Current Stock: {restockProduct.stock_quantity} pcs</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-slate-600">
                    {restockProduct.barcode || 'NO-BARCODE'}
                  </Badge>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">
                    Quantity to Add
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={addQty}
                      onChange={(e) => setAddQty(Math.max(1, Number(e.target.value)))}
                      className="font-black text-base h-10 text-center w-28"
                    />
                    {[10, 20, 50].map(amt => (
                      <Button
                        key={amt}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAddQty(amt)}
                        className="h-10 text-xs font-bold flex-1"
                      >
                        +{amt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Updated stock after restock will be: <strong className="text-emerald-700 font-extrabold">{Number(restockProduct.stock_quantity) + addQty} pcs</strong>.
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={() => setRestockProduct(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRestock}
                  disabled={isRestocking}
                  className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-9 px-5 rounded-xl"
                >
                  {isRestocking ? 'Restocking...' : 'Confirm Restock'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Category Management Modal */}
      <ManageCategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
      />
    </AdminLayout>
  );
}
