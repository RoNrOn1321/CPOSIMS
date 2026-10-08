import React, { useState, useMemo } from 'react';
import { Plus, Utensils, Coffee, Sandwich, Cookie, Apple, Flame, Check } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { formatMoney } from '@/lib/formatters';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  calories?: number;
  stock: number;
  image: string;
  isPopular?: boolean;
}

const cafeteriaProducts: Product[] = [
  {
    id: 1,
    name: 'Chicken Adobo Rice Bowl',
    category: 'Rice Meals',
    price: 70.0,
    calories: 450,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    isPopular: true,
  },
  {
    id: 2,
    name: 'Pork Sinigang with Steamed Rice',
    category: 'Rice Meals',
    price: 75.0,
    calories: 480,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400&q=80',
    isPopular: true,
  },
  {
    id: 3,
    name: 'Beef Tapa with Egg & Garlic Rice',
    category: 'Rice Meals',
    price: 85.0,
    calories: 520,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80',
    isPopular: true,
  },
  {
    id: 4,
    name: 'Sweet Style Spaghetti with Cheese',
    category: 'Rice Meals',
    price: 50.0,
    calories: 380,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80',
    isPopular: true,
  },
  {
    id: 5,
    name: 'Canteen Beef Burger with Cheese',
    category: 'Snacks & Sandwiches',
    price: 45.0,
    calories: 390,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
    isPopular: true,
  },
  {
    id: 6,
    name: 'Ham & Egg Toasted Sandwich',
    category: 'Snacks & Sandwiches',
    price: 35.0,
    calories: 290,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80',
  },
  {
    id: 7,
    name: 'Crispy Lumpiang Shanghai (3 pcs)',
    category: 'Snacks & Sandwiches',
    price: 30.0,
    calories: 220,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80',
  },
  {
    id: 8,
    name: 'Fresh Ice-Cold Calamansi Juice',
    category: 'Beverages',
    price: 20.0,
    calories: 90,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
    isPopular: true,
  },
  {
    id: 9,
    name: 'Chilled Fresh Buko Juice in Bottle',
    category: 'Beverages',
    price: 30.0,
    calories: 110,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1544253109-88373249007c?w=400&q=80',
  },
  {
    id: 10,
    name: 'Dutch Chocolate Milk (250ml)',
    category: 'Beverages',
    price: 28.0,
    calories: 160,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
  },
  {
    id: 11,
    name: 'Fresh Fruit Cup (Melon & Watermelon)',
    category: 'Healthy',
    price: 35.0,
    calories: 95,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    isPopular: true,
  },
  {
    id: 12,
    name: 'Theresian Cheese Ensaymada',
    category: 'Bakery',
    price: 25.0,
    calories: 210,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  },
  {
    id: 13,
    name: 'Warm Banana Bread Slice',
    category: 'Bakery',
    price: 25.0,
    calories: 190,
    stock: 28,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80',
  },
  {
    id: 14,
    name: 'Purified Water (500ml)',
    category: 'Beverages',
    price: 15.0,
    calories: 0,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80',
  },
];

const categories = [
  { id: 'All', label: 'All Items', icon: <Utensils size={14} /> },
  { id: 'Rice Meals', label: 'Rice Meals', icon: <Flame size={14} /> },
  { id: 'Snacks & Sandwiches', label: 'Snacks & Bites', icon: <Sandwich size={14} /> },
  { id: 'Beverages', label: 'Drinks & Juices', icon: <Coffee size={14} /> },
  { id: 'Bakery', label: 'Bakery & Sweets', icon: <Cookie size={14} /> },
  { id: 'Healthy', label: 'Fruit & Healthy', icon: <Apple size={14} /> },
];

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  searchQuery?: string;
  cartItemIds?: Set<number>;
}

export default function ProductGrid({ 
  onAddToCart, 
  searchQuery = '',
  cartItemIds = new Set()
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProducts = useMemo(() => {
    return cafeteriaProducts.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-slate-50/70 border-r border-slate-200 overflow-hidden">
      {/* Category Pills Header */}
      <div className="p-4 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#5c1516] text-white shadow-md shadow-red-950/20'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                <span className={isActive ? 'text-amber-300' : 'text-slate-400'}>
                  {cat.icon}
                </span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <ScrollArea className="flex-1 p-5">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Utensils size={28} />
            </div>
            <h3 className="font-bold text-slate-700 text-base">No items match your search</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Try adjusting your search query or selecting a different menu category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-12">
            {filteredProducts.map((product) => {
              const inCart = cartItemIds.has(product.id);
              return (
                <Card 
                  key={product.id}
                  onClick={() => onAddToCart(product)}
                  className="group relative flex flex-col overflow-hidden bg-white border border-slate-200/80 hover:border-[#5c1516]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer"
                >
                  {/* Food Image with modern overlays */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Badges on top */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <Badge className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold border-0 shadow-xs px-2 py-0.5 rounded-lg">
                        {product.category}
                      </Badge>

                      {product.isPopular && (
                        <Badge className="bg-amber-500 text-white text-[10px] font-bold border-0 shadow-xs px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Flame size={10} /> Popular
                        </Badge>
                      )}
                    </div>

                    {/* Bottom Info inside image */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                      {product.calories && (
                        <span className="text-[11px] font-medium text-white/90 drop-shadow-sm">
                          {product.calories} kcal
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-emerald-300 drop-shadow-sm">
                        {product.stock} available
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-[#5c1516] transition-colors line-clamp-2">
                        {product.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Price</span>
                        <span className="text-base font-extrabold text-[#5c1516]">
                          {formatMoney(product.price)}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className={`h-9 w-9 p-0 rounded-xl shadow-xs transition-all ${
                          inCart 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold'
                        }`}
                      >
                        {inCart ? <Check size={16} /> : <Plus size={16} />}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
