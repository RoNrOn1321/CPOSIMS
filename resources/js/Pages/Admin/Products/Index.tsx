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
import { Link } from '@inertiajs/react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';

export interface ProductItem {
  id: number;
  name: string;
  category: string;
  sku: string;
  costPrice: number;
  price: number;
  stock: number;
  minThreshold: number;
  calories: number;
  image: string;
  isActive: boolean;
}

const initialProducts: ProductItem[] = [
  {
    id: 1,
    name: 'Chicken Adobo Rice Bowl',
    category: 'Rice Meals',
    sku: 'STCT-MEAL-001',
    costPrice: 45.0,
    price: 70.0,
    stock: 24,
    minThreshold: 15,
    calories: 450,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    isActive: true,
  },
  {
    id: 2,
    name: 'Pork Sinigang with Steamed Rice',
    category: 'Rice Meals',
    sku: 'STCT-MEAL-002',
    costPrice: 50.0,
    price: 75.0,
    stock: 18,
    minThreshold: 15,
    calories: 480,
    image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400&q=80',
    isActive: true,
  },
  {
    id: 3,
    name: 'Beef Tapa with Egg & Garlic Rice',
    category: 'Rice Meals',
    sku: 'STCT-MEAL-003',
    costPrice: 55.0,
    price: 85.0,
    stock: 8,
    minThreshold: 15,
    calories: 520,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80',
    isActive: true,
  },
  {
    id: 4,
    name: 'Sweet Style Spaghetti with Cheese',
    category: 'Rice Meals',
    sku: 'STCT-MEAL-004',
    costPrice: 30.0,
    price: 50.0,
    stock: 30,
    minThreshold: 20,
    calories: 380,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80',
    isActive: true,
  },
  {
    id: 5,
    name: 'Canteen Beef Burger with Cheese',
    category: 'Snacks & Sandwiches',
    sku: 'STCT-SNCK-001',
    costPrice: 28.0,
    price: 45.0,
    stock: 40,
    minThreshold: 20,
    calories: 390,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
    isActive: true,
  },
  {
    id: 6,
    name: 'Ham & Egg Toasted Sandwich',
    category: 'Snacks & Sandwiches',
    sku: 'STCT-SNCK-002',
    costPrice: 22.0,
    price: 35.0,
    stock: 35,
    minThreshold: 15,
    calories: 290,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80',
    isActive: true,
  },
  {
    id: 7,
    name: 'Crispy Lumpiang Shanghai (3 pcs)',
    category: 'Snacks & Sandwiches',
    sku: 'STCT-SNCK-003',
    costPrice: 18.0,
    price: 30.0,
    stock: 5,
    minThreshold: 20,
    calories: 220,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80',
    isActive: true,
  },
  {
    id: 8,
    name: 'Fresh Ice-Cold Calamansi Juice',
    category: 'Beverages',
    sku: 'STCT-DRNK-001',
    costPrice: 10.0,
    price: 20.0,
    stock: 60,
    minThreshold: 30,
    calories: 90,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
    isActive: true,
  },
  {
    id: 9,
    name: 'Chilled Fresh Buko Juice in Bottle',
    category: 'Beverages',
    sku: 'STCT-DRNK-002',
    costPrice: 18.0,
    price: 30.0,
    stock: 25,
    minThreshold: 20,
    calories: 110,
    image: 'https://images.unsplash.com/photo-1544253109-88373249007c?w=400&q=80',
    isActive: true,
  },
  {
    id: 10,
    name: 'Dutch Chocolate Milk (250ml)',
    category: 'Beverages',
    sku: 'STCT-DRNK-003',
    costPrice: 19.0,
    price: 28.0,
    stock: 45,
    minThreshold: 25,
    calories: 160,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    isActive: true,
  },
  {
    id: 11,
    name: 'Fresh Fruit Cup (Melon & Watermelon)',
    category: 'Healthy',
    sku: 'STCT-HLTH-001',
    costPrice: 20.0,
    price: 35.0,
    stock: 20,
    minThreshold: 10,
    calories: 95,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    isActive: true,
  },
  {
    id: 12,
    name: 'Theresian Cheese Ensaymada',
    category: 'Bakery',
    sku: 'STCT-BKRY-001',
    costPrice: 14.0,
    price: 25.0,
    stock: 30,
    minThreshold: 15,
    calories: 210,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    isActive: true,
  },
  {
    id: 13,
    name: 'Warm Banana Bread Slice',
    category: 'Bakery',
    sku: 'STCT-BKRY-002',
    costPrice: 14.0,
    price: 25.0,
    stock: 3,
    minThreshold: 15,
    calories: 190,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80',
    isActive: true,
  },
  {
    id: 14,
    name: 'Purified Water (500ml)',
    category: 'Beverages',
    sku: 'STCT-DRNK-004',
    costPrice: 8.0,
    price: 15.0,
    stock: 120,
    minThreshold: 40,
    calories: 0,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80',
    isActive: true,
  },
];

export default function ProductsIndex() {
  const [data, setData] = useState<ProductItem[]>(initialProducts);
  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sorting, setSorting] = useState<SortingState>([]);

  // Restock Quick Modal state
  const [restockProduct, setRestockProduct] = useState<ProductItem | null>(null);
  const [addQty, setAddQty] = useState<number>(20);

  // Filtered data based on category dropdown
  const filteredData = useMemo(() => {
    if (categoryFilter === 'All') return data;
    if (categoryFilter === 'LowStock') return data.filter(p => p.stock <= p.minThreshold);
    return data.filter(p => p.category === categoryFilter);
  }, [data, categoryFilter]);

  // Total metrics
  const totalValuation = useMemo(() => {
    return data.reduce((sum, item) => sum + (item.price * item.stock), 0);
  }, [data]);

  const lowStockCount = useMemo(() => {
    return data.filter(p => p.stock <= p.minThreshold).length;
  }, [data]);

  // Quick Restock Handler
  const handleConfirmRestock = () => {
    if (!restockProduct) return;
    setData(prev => prev.map(p => {
      if (p.id === restockProduct.id) {
        return { ...p, stock: p.stock + addQty };
      }
      return p;
    }));
    setRestockProduct(null);
  };

  // Quick Delete Handler
  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to remove this item from the cafeteria inventory?')) {
      setData(prev => prev.filter(p => p.id !== id));
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
          Food Item
          <ArrowUpDown size={12} className="text-slate-400" />
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-800 leading-snug">
                {item.name}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {item.sku} &bull; {item.calories} kcal
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
          {row.getValue('category')}
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
        const price = row.original.price;
        const cost = row.original.costPrice;
        const margin = Math.round(((price - cost) / price) * 100);
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
      accessorKey: 'stock',
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
        const isLow = item.stock <= item.minThreshold;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`font-black text-xs ${isLow ? 'text-amber-700' : 'text-slate-800'}`}>
                {item.stock} pcs
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
                style={{ width: `${Math.min(100, (item.stock / 60) * 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active</span>
        </div>
      ),
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

            <Link href="/admin/products/edit">
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
              onClick={() => handleDeleteProduct(item.id)}
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
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

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
              {data.length} Total Items
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock monitoring, selling prices, and POS catalog distribution for STCT Canteen.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/pos">
            <Button variant="outline" size="sm" className="h-10 text-xs font-bold border-slate-200">
              <ExternalLink size={14} className="mr-1.5 text-slate-500" /> Open POS Register
            </Button>
          </Link>
          <Link href="/admin/products/create">
            <Button className="h-10 bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs px-4 rounded-xl shadow-sm flex items-center gap-1.5">
              <Plus size={16} /> Add Food Item
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
              Based on active selling prices across {data.length} menu items.
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
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#008dd5] flex items-center justify-center">
                <Package size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              5 Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Rice Meals, Snacks, Drinks, Bakery, and Fruits.
            </span>
          </CardContent>
        </Card>
      </div>

      {/* TanStack Table Card */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white overflow-hidden">
        {/* Table Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search food item name, SKU..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 h-9 text-xs bg-white rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['All', 'Rice Meals', 'Snacks & Sandwiches', 'Beverages', 'Bakery', 'Healthy', 'LowStock'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#5c1516] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'LowStock' ? '⚠️ Low Stock' : cat}
              </button>
            ))}
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
            Showing {table.getRowModel().rows.length} of {filteredData.length} products
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-3 text-xs rounded-lg border-slate-200 disabled:opacity-40"
            >
              Previous
            </Button>
            <span className="font-bold text-slate-700">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-3 text-xs rounded-lg border-slate-200 disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Restock Modal Dialog */}
      <Dialog open={!!restockProduct} onOpenChange={() => setRestockProduct(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
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
                    <p className="text-[11px] text-slate-400">Current Stock: {restockProduct.stock} pcs</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-slate-600">
                    {restockProduct.sku}
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
                  Updated stock after restock will be: <strong className="text-emerald-700 font-extrabold">{restockProduct.stock + addQty} pcs</strong>.
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={() => setRestockProduct(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRestock}
                  className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-9 px-5 rounded-xl"
                >
                  Confirm Restock
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
