import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { formatMoney } from '@/lib/formatters';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';

const presetImages = [
  { label: 'Chicken Meal', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' },
  { label: 'Soup / Sinigang', url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400&q=80' },
  { label: 'Burger', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80' },
  { label: 'Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80' },
  { label: 'Fresh Juice', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80' },
  { label: 'Bakery', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
];

export default function ProductCreate() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Rice Meals');
  const [sku, setSku] = useState(`STCT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [costPrice, setCostPrice] = useState<number>(40.0);
  const [price, setPrice] = useState<number>(65.0);
  const [stock, setStock] = useState<number>(30);
  const [minThreshold, setMinThreshold] = useState<number>(15);
  const [calories, setCalories] = useState<number>(400);
  const [imageUrl, setImageUrl] = useState(presetImages[0].url);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const profitMargin = price > 0 ? Math.round(((price - costPrice) / price) * 100) : 0;

  const toggleAllergen = (item: string) => {
    setAllergens(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name.');
      return;
    }

    setIsSaved(true);
    setTimeout(() => {
      // In this Inertia setup, navigate back to product list
      router.visit('/admin/products');
    }, 1000);
  };

  return (
    <AdminLayout portal="admin" activeNav="products">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-slate-200">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Add New Food Item
            </h1>
            <p className="text-xs text-slate-500">
              Create a cafeteria menu item for cashier POS terminal sales and student allowance limits.
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center gap-2"
        >
          <Save size={15} /> Save Food Item
        </Button>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check size={16} /> Food item registered successfully! Redirecting to inventory...
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Menu Category
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
                    SKU / Barcode ID
                  </label>
                  <Input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="h-10 text-xs font-mono rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Nutrition & Allergens */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Estimated Calories (kcal)
                    </label>
                    <Input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      className="h-10 text-xs rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Allergen Flags
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['Peanuts', 'Seafood', 'Dairy', 'Gluten', 'Eggs'].map(all => {
                        const has = allergens.includes(all);
                        return (
                          <button
                            key={all}
                            type="button"
                            onClick={() => toggleAllergen(all)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              has 
                                ? 'bg-red-600 text-white shadow-xs' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {all}
                          </button>
                        );
                      })}
                    </div>
                  </div>
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
                    Cost Price (Capital)
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
                    Selling Price (Student)
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">Profit Margin</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-black text-emerald-700">{profitMargin}%</span>
                    <span className="text-xs text-slate-500 font-semibold">({formatMoney(price - costPrice)} / portion)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Image, Inventory, Status) */}
        <div className="space-y-6">
          {/* Image Selector & Preview */}
          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-extrabold text-slate-800">
                Menu Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="w-full aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200 relative group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                  Live POS Preview
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Preset Cafeteria Imagery
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {presetImages.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`text-[10px] font-bold py-1.5 px-2 rounded-lg border text-center truncate ${
                        imageUrl === preset.url 
                          ? 'border-[#5c1516] bg-red-50 text-[#5c1516]' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Custom Image URL:
                </label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-8 text-xs bg-slate-50"
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Initial Stock & Threshold */}
          <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-extrabold text-slate-800">
                Inventory Stock Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Initial Stock Quantity
                </label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="h-10 text-xs font-bold bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Low Stock Alert Threshold
                </label>
                <Input
                  type="number"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(Number(e.target.value))}
                  className="h-10 text-xs font-bold bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Displays amber warning when stock drops to or below this level.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </AdminLayout>
  );
}
