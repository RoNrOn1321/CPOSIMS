import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { formatMoney } from '@/lib/formatters';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2, Check, RefreshCw } from 'lucide-react';

export default function ProductEdit() {
  const [name, setName] = useState('Chicken Adobo Rice Bowl');
  const [category, setCategory] = useState('Rice Meals');
  const [sku, setSku] = useState('STCT-MEAL-001');
  const [costPrice, setCostPrice] = useState<number>(45.0);
  const [price, setPrice] = useState<number>(70.0);
  const [stock, setStock] = useState<number>(24);
  const [minThreshold, setMinThreshold] = useState<number>(15);
  const [calories, setCalories] = useState<number>(450);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const profitMargin = price > 0 ? Math.round(((price - costPrice) / price) * 100) : 0;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      router.visit('/admin/products');
    }, 1000);
  };

  const handleDelete = () => {
    if (confirm('Permanently delete this product from the cafeteria database?')) {
      router.visit('/admin/products');
    }
  };

  return (
    <AdminLayout portal="admin" activeNav="products">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-slate-200">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Edit Food Item: {name}
              </h1>
              <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px] font-bold">
                Active in POS
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              SKU: <strong className="font-mono text-slate-700">{sku}</strong> &bull; Modify price, portions, and alert settings.
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
            onClick={handleUpdate}
            className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center gap-2"
          >
            <Save size={15} /> Save Changes
          </Button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check size={16} /> Product updated successfully! Redirecting...
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
                  Food Item Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 text-xs rounded-xl bg-slate-50/50 border border-slate-200 px-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5c1516]"
                  >
                    <option value="Rice Meals">Rice Meals</option>
                    <option value="Snacks & Sandwiches">Snacks & Sandwiches</option>
                    <option value="Beverages">Beverages & Drinks</option>
                    <option value="Bakery">Bakery & Pastries</option>
                    <option value="Healthy">Fruit & Healthy Bowls</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Calories (kcal)
                  </label>
                  <Input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="h-10 text-xs rounded-xl bg-slate-50/50"
                  />
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
                    Cost Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₱</span>
                    <Input
                      type="number"
                      step="0.5"
                      value={costPrice}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="pl-8 h-10 font-bold text-sm bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Selling Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5c1516]">₱</span>
                    <Input
                      type="number"
                      step="0.5"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="pl-8 h-10 font-bold text-sm text-[#5c1516] bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Margin</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-black text-emerald-700">{profitMargin}%</span>
                    <span className="text-xs text-slate-500 font-semibold">({formatMoney(price - costPrice)})</span>
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
                Food Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="w-full aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-8 text-xs bg-slate-50"
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-extrabold text-slate-800">
                Inventory Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Current Stock Available
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="h-10 text-xs font-bold bg-slate-50/50"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setStock(prev => prev + 20)}
                    className="h-10 text-xs font-bold whitespace-nowrap"
                  >
                    +20 Portions
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Threshold
                </label>
                <Input
                  type="number"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(Number(e.target.value))}
                  className="h-10 text-xs font-bold bg-slate-50/50"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </AdminLayout>
  );
}
