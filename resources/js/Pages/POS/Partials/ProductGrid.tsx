import React, { useState, useMemo } from 'react';
import { Plus, Utensils, Coffee, Sandwich, Cookie, Apple, Flame, Check, BookOpen, Tag } from 'lucide-react';
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
  barcode?: string | null;
}

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  searchQuery?: string;
  cartItemIds?: Set<number>;
  products?: Product[];
  categories?: string[];
}

const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('beverage') || lower.includes('drink') || lower.includes('juice') || lower.includes('water')) {
    return <Coffee size={14} />;
  }
  if (lower.includes('snack') || lower.includes('sandwich') || lower.includes('burger')) {
    return <Sandwich size={14} />;
  }
  if (lower.includes('bakery') || lower.includes('bread') || lower.includes('sweet') || lower.includes('cookie')) {
    return <Cookie size={14} />;
  }
  if (lower.includes('fruit') || lower.includes('healthy') || lower.includes('salad')) {
    return <Apple size={14} />;
  }
  if (lower.includes('supply') || lower.includes('supplies') || lower.includes('school') || lower.includes('stationery')) {
    return <BookOpen size={14} />;
  }
  if (lower.includes('rice') || lower.includes('meal') || lower.includes('hot') || lower.includes('dish')) {
    return <Flame size={14} />;
  }
  return <Tag size={14} />;
};

export default function ProductGrid({ 
  onAddToCart, 
  searchQuery = '',
  cartItemIds = new Set(),
  products = [],
  categories: categoriesProp = [],
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const activeProducts = useMemo(() => {
    return products ?? [];
  }, [products]);

  const activeCategories = useMemo(() => {
    const list = categoriesProp && categoriesProp.length > 0
      ? categoriesProp
      : Array.from(new Set(activeProducts.map(p => p.category).filter(Boolean)));

    return [
      { id: 'All', label: 'All Items', icon: <Utensils size={14} /> },
      ...list.map(cat => ({
        id: cat,
        label: cat,
        icon: getCategoryIcon(cat),
      })),
    ];
  }, [categoriesProp, activeProducts]);

  const filteredProducts = useMemo(() => {
    return activeProducts.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeProducts, selectedCategory, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-slate-50/70 border-r border-slate-200 overflow-hidden">
      {/* Category Pills Header */}
      <div className="p-4 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {activeCategories.map((cat) => {
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
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-5">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Utensils size={28} />
              </div>
              <h3 className="font-bold text-slate-700 text-base">
                {activeProducts.length === 0 ? 'No products in database' : 'No items match your search'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {activeProducts.length === 0
                  ? 'There are currently no active products in the database. Please add or activate products in the Admin catalog.'
                  : 'Try adjusting your search query or selecting a different category.'}
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
        </div>
      </ScrollArea>
    </div>
  );
}
