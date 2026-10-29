import React from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  UserCheck, 
  Percent, 
  ArrowRight, 
  Clock, 
  AlertTriangle,
  Receipt,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { formatMoney } from '@/lib/formatters';

export interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
    image?: string | null;
    category?: string;
  };
  quantity: number;
}

export interface StudentCustomer {
  id: number;
  name: string;
  gradeLevel: string;
  balance: number;
  dailyLimit: number;
  spentToday: number;
  rfidUid?: string;
  studentId?: string;
  status?: string;
}

interface ActiveCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onHoldOrder: () => void;
  selectedCustomer: StudentCustomer | null;
  onSelectCustomerClick: () => void;
  discountPercentage?: number;
  onApplyDiscount?: () => void;
}

export default function ActiveCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onHoldOrder,
  selectedCustomer,
  onSelectCustomerClick,
  discountPercentage = 0,
  onApplyDiscount,
}: ActiveCartProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = (subtotal * discountPercentage) / 100;
  const total = Math.max(0, subtotal - discountAmount);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Check pupil daily limit
  const remainingDailyLimit = selectedCustomer 
    ? Math.max(0, selectedCustomer.dailyLimit - selectedCustomer.spentToday) 
    : Infinity;
  const isLimitExceeded = selectedCustomer ? total > remainingDailyLimit : false;

  return (
    <aside className="w-96 lg:w-[420px] bg-white flex flex-col h-full shadow-xl border-l border-slate-200 z-10">
      {/* Cart Top Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5c1516]/10 text-[#5c1516] flex items-center justify-center">
            <Receipt size={17} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 leading-tight">Current Order</h3>
            <span className="text-[11px] text-slate-500 font-medium">Ticket #ORD-{new Date().getHours()}48</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="bg-white text-slate-700 font-bold border-slate-200 text-xs px-2 py-0.5">
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </Badge>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              title="Clear all cart items"
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Customer / Pupil Selector Card */}
      <div className="p-3 bg-slate-50/50 border-b border-slate-100">
        <div 
          onClick={onSelectCustomerClick}
          className="p-3 bg-white border border-slate-200 hover:border-amber-400/80 rounded-xl transition-all cursor-pointer shadow-xs group"
        >
          {selectedCustomer ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  <UserCheck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#5c1516]">
                      {selectedCustomer.name}
                    </span>
                    <Badge className="bg-slate-100 text-slate-700 text-[9px] px-1.5 py-0 border-0">
                      {selectedCustomer.gradeLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>Card Balance: <strong className="text-emerald-700">{formatMoney(selectedCustomer.balance)}</strong></span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#5c1516] group-hover:underline">
                Change
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700 group-hover:text-[#5c1516]">
                    Walk-in Customer / Tap RFID
                  </div>
                  <div className="text-[11px] text-slate-400">Click to link student or teacher account</div>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-[10px] font-bold border-0">
                Tap ID
              </Badge>
            </div>
          )}
        </div>

        {/* Limit Warning for Elementary Pupils */}
        {selectedCustomer && isLimitExceeded && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-xs">
            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
            <span className="text-[11px] leading-tight">
              <strong>Limit Alert:</strong> Pupil exceeds daily spending allowance (Cap: {formatMoney(selectedCustomer.dailyLimit)}).
            </span>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 text-slate-400 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-2.5 text-slate-300">
                <Receipt size={28} />
              </div>
              <p className="font-bold text-slate-600 text-sm">Cart is currently empty</p>
              <p className="text-xs text-slate-400 mt-0.5 max-w-[200px]">
                Tap products from the menu or scan a barcode to add.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {items.map(({ product, quantity }) => (
                <div 
                  key={product.id}
                  className="flex items-center gap-3 p-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 rounded-xl transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center relative">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          const fallback = parent?.querySelector('.cart-no-img');
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`cart-no-img text-slate-400 flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                      <Receipt size={16} />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 truncate leading-snug">
                      {product.name}
                    </h5>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {formatMoney(product.price)} each
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-1.5 py-1 rounded-lg shadow-2xs">
                    <button
                      onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Total & Remove */}
                  <div className="text-right flex flex-col items-end gap-1 min-w-[58px]">
                    <span className="text-xs font-extrabold text-[#5c1516]">
                      {formatMoney(product.price * quantity)}
                    </span>
                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Cart Summary & Action Station */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-3.5 shadow-lg">
        {/* Subtotal, Discount & Total */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Sub-total</span>
            <span>{formatMoney(subtotal)}</span>
          </div>

          {discountPercentage > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Student / Canteen Discount ({discountPercentage}%)</span>
              <span>-{formatMoney(discountAmount)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-800">Grand Total</span>
            <span className="text-2xl font-black text-[#5c1516] tracking-tight">
              {formatMoney(total)}
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onApplyDiscount}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs h-9"
          >
            <Percent size={13} className="mr-1.5 text-amber-600" />
            {discountPercentage > 0 ? `Promo: ${discountPercentage}%` : 'Discount'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onHoldOrder}
            disabled={items.length === 0}
            className="border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-900 font-semibold text-xs h-9 disabled:opacity-40"
          >
            <Clock size={13} className="mr-1.5 text-amber-700" />
            Hold Order
          </Button>
        </div>

        {/* Primary Checkout Button */}
        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full h-13 bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-base rounded-xl shadow-lg shadow-red-950/20 transition-all flex items-center justify-between px-5 disabled:opacity-40 disabled:cursor-not-allowed group"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-lg group-hover:scale-105 transition-transform">
              <Sparkles size={16} className="text-amber-300" />
            </span>
            <span>Charge Order</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-black">{formatMoney(total)}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Button>
      </div>
    </aside>
  );
}
