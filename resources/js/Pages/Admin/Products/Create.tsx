import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { formatMoney } from '@/lib/formatters';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Sparkles, AlertCircle } from 'lucide-react';
import { store as storeProductAction, index as indexProductAction } from '@/actions/App/Http/Controllers/Admin/ProductController';
import ProductImageInput from './Partials/ProductImageInput';

interface CategoryItem {
  id: number;
  name: string;
}

interface ProductCreateProps {
  categories?: CategoryItem[];
}

export default function ProductCreate({ categories = [] }: ProductCreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    category_id: categories[0]?.id ? String(categories[0].id) : '',
    barcode: `STCT-${Math.floor(1000 + Math.random() * 9000)}`,
    cost: '40.00',
    price: '65.00',
    stock_quantity: 30,
    reorder_level: 15,
    status: 'active' as 'active' | 'inactive',
    image_file: null as File | null,
    image_url: '',
    image_source: 'upload' as 'upload' | 'url' | 'none',
  });

  const numPrice = Number(data.price) || 0;
  const numCost = Number(data.cost) || 0;
  const profitMargin = numPrice > 0 ? Math.round(((numPrice - numCost) / numPrice) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(storeProductAction.url());
  };

  return (
    <AdminLayout portal="admin" activeNav="products">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Link href={indexProductAction.url()}>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-slate-200">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Add New Product
            </h1>
            <p className="text-xs text-slate-500">
              Create a product or cafeteria inventory item for cashier POS terminal sales and student allowance limits.
            </p>
          </div>
        </div>

        <Button 
          type="button"
          onClick={handleSubmit}
          disabled={processing}
          className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={15} /> {processing ? 'Saving...' : 'Save Product'}
        </Button>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> Please resolve the errors highlighted below.
        </div>
      )}

      {/* 2-Column Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                General Product Information
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Identify the item as it will appear on cashier screens and student receipts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Chicken Adobo Rice Bowl"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={`h-10 text-xs rounded-xl bg-slate-50/50 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Product Category <span className="text-red-500">*</span>
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
                    className={`h-10 text-xs font-mono rounded-xl bg-slate-50/50 ${errors.barcode ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                    <span>Active (Visible on POS Register)</span>
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

          {/* Pricing & Profit Margin */}
          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                Pricing & Profit Margin
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Set cost and cafeteria selling price in Philippine Peso (₱).
              </CardDescription>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">Profit Margin</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-black text-emerald-700">{profitMargin}%</span>
                    <span className="text-xs text-slate-500 font-semibold">({formatMoney(Math.max(0, numPrice - numCost))} / portion)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Image & Inventory Setup) */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-extrabold text-slate-800">
                Product Image
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Upload from device or import image link from the internet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductImageInput
                initialSource="upload"
                onImageFileChange={(file) => setData('image_file', file)}
                onImageUrlChange={(url) => setData('image_url', url)}
                onImageSourceChange={(source) => setData('image_source', source)}
                fileError={errors.image_file}
                urlError={errors.image_url}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-extrabold text-slate-800">
                Inventory Stock Setup
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Initial portions on-hand and automated replenishment triggers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Initial Stock Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={data.stock_quantity}
                  onChange={(e) => setData('stock_quantity', Number(e.target.value))}
                  className={`h-10 text-xs font-bold bg-slate-50/50 ${errors.stock_quantity ? 'border-red-500' : ''}`}
                />
                {errors.stock_quantity && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.stock_quantity}</p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Will automatically create an audit record in the system inventory log.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Low Stock Alert Threshold <span className="text-red-500">*</span>
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
                <p className="text-[10px] text-slate-400 mt-1">
                  Displays amber warning when stock drops to or below this level.
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit"
                  disabled={processing}
                  className="w-full bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 rounded-xl shadow-sm"
                >
                  {processing ? 'Registering...' : 'Confirm & Register Product'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </AdminLayout>
  );
}
