import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { formatMoney } from '@/lib/formatters';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2, AlertCircle } from 'lucide-react';
import { update as updateProductRoute, destroy as destroyProductRoute, index as indexProductRoute } from '@/routes/admin/products';

interface CategoryItem {
  id: number;
  name: string;
}

interface ProductItem {
  id: number;
  name: string;
  category_id: number | null;
  barcode: string | null;
  price: number | string;
  cost: number | string;
  stock_quantity: number;
  reorder_level: number;
  status: 'active' | 'inactive';
  category?: CategoryItem | null;
}

interface ProductEditProps {
  product: ProductItem;
  categories?: CategoryItem[];
}

export default function ProductEdit({ product, categories = [] }: ProductEditProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: product.name ?? '',
    category_id: product.category_id ? String(product.category_id) : '',
    barcode: product.barcode ?? '',
    cost: String(product.cost ?? '0.00'),
    price: String(product.price ?? '0.00'),
    stock_quantity: Number(product.stock_quantity ?? 0),
    reorder_level: Number(product.reorder_level ?? 10),
    status: (product.status ?? 'active') as 'active' | 'inactive',
    remarks: '',
  });

  const numPrice = Number(data.price) || 0;
  const numCost = Number(data.cost) || 0;
  const profitMargin = numPrice > 0 ? Math.round(((numPrice - numCost) / numPrice) * 100) : 0;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    put(updateProductRoute(product.id).url);
  };

  const handleDelete = () => {
    if (confirm(`Permanently remove "${product.name}" from the cafeteria database?`)) {
      router.delete(destroyProductRoute(product.id).url);
    }
  };

  return (
    <AdminLayout portal="admin" activeNav="products">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Link href={indexProductRoute().url}>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-slate-200">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Edit Food Item: {product.name}
              </h1>
              <Badge className={data.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-0 text-[10px] font-bold' : 'bg-slate-100 text-slate-600 border-0 text-[10px] font-bold'}>
                {data.status === 'active' ? 'Active in POS' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Barcode: <strong className="font-mono text-slate-700">{data.barcode || 'N/A'}</strong> &bull; Modify price, portions, and alert settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleDelete}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 h-10 px-4 text-xs font-bold rounded-xl"
          >
            <Trash2 size={14} className="mr-1.5" /> Delete Item
          </Button>
          <Button 
            type="button"
            onClick={handleUpdate}
            disabled={processing}
            className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={15} /> {processing ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> Please resolve the errors highlighted below.
        </div>
      )}

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                Menu Item Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Food Item Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={`h-10 text-xs rounded-xl bg-slate-50/50 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={data.category_id}
                    onChange={(e) => setData('category_id', e.target.value)}
                    className={`w-full h-10 text-xs rounded-xl bg-slate-50/50 border px-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5c1516] ${
                      errors.category_id ? 'border-red-500' : 'border-slate-200'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.category_id}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Barcode / Scanner SKU <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={data.barcode}
                    onChange={(e) => setData('barcode', e.target.value)}
                    className={`h-10 text-xs font-mono rounded-xl bg-slate-50/50 ${errors.barcode ? 'border-red-500' : ''}`}
                  />
                  {errors.barcode && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.barcode}</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Item Status
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={data.status === 'active'}
                      onChange={() => setData('status', 'active')}
                      className="text-[#5c1516] focus:ring-[#5c1516]"
                    />
                    <span>Active (POS Terminal Available)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={data.status === 'inactive'}
                      onChange={() => setData('status', 'inactive')}
                      className="text-[#5c1516] focus:ring-[#5c1516]"
                    />
                    <span>Inactive (Hidden)</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                Selling Price & Capital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Cost Price (Capital) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₱</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.cost}
                      onChange={(e) => setData('cost', e.target.value)}
                      className={`pl-8 h-10 font-bold text-sm bg-slate-50/50 ${errors.cost ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.cost && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.cost}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Selling Price (Student) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5c1516]">₱</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.price}
                      onChange={(e) => setData('price', e.target.value)}
                      className={`pl-8 h-10 font-bold text-sm text-[#5c1516] bg-slate-50/50 ${errors.price ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.price}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Margin</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-black text-emerald-700">{profitMargin}%</span>
                    <span className="text-xs text-slate-500 font-semibold">({formatMoney(Math.max(0, numPrice - numCost))})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-extrabold text-slate-800">
                Inventory Stock & Adjustments
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Updating stock quantity creates an immutable inventory audit record.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Current Stock Available <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={data.stock_quantity}
                    onChange={(e) => setData('stock_quantity', Number(e.target.value))}
                    className={`h-10 text-xs font-bold bg-slate-50/50 ${errors.stock_quantity ? 'border-red-500' : ''}`}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setData('stock_quantity', data.stock_quantity + 20)}
                    className="h-10 text-xs font-bold whitespace-nowrap"
                  >
                    +20 Portions
                  </Button>
                </div>
                {errors.stock_quantity && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.stock_quantity}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Threshold Alert Level <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={data.reorder_level}
                  onChange={(e) => setData('reorder_level', Number(e.target.value))}
                  className={`h-10 text-xs font-bold bg-slate-50/50 ${errors.reorder_level ? 'border-red-500' : ''}`}
                />
                {errors.reorder_level && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.reorder_level}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Adjustment Reason / Remarks
                </label>
                <Input
                  placeholder="e.g. Daily delivery batch #12 or stock check"
                  value={data.remarks}
                  onChange={(e) => setData('remarks', e.target.value)}
                  className="h-10 text-xs bg-slate-50/50"
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit"
                  disabled={processing}
                  className="w-full bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 rounded-xl shadow-sm"
                >
                  {processing ? 'Saving...' : 'Apply Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </AdminLayout>
  );
}
