import React, { useState, useMemo } from 'react';
import POSLayout from '@/Layouts/POSLayout';
import ProductGrid, { Product } from './Partials/ProductGrid';
import ActiveCart, { CartItem, StudentCustomer } from './Partials/ActiveCart';
import CheckoutModal from './Partials/CheckoutModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { formatMoney } from '@/lib/formatters';
import { UserCheck, Users, Clock, AlertCircle } from 'lucide-react';

const mockStudents: StudentCustomer[] = [
  {
    id: 101,
    name: 'Juan Dela Cruz',
    gradeLevel: 'Grade 6 - St. Therese',
    balance: 450.0,
    dailyLimit: 120.0,
    spentToday: 40.0,
  },
  {
    id: 102,
    name: 'Maria Clara Santos',
    gradeLevel: 'Grade 10 - St. Francis',
    balance: 620.0,
    dailyLimit: 200.0,
    spentToday: 0.0,
  },
  {
    id: 103,
    name: 'Brother Mark Loyola',
    gradeLevel: 'Faculty / Staff',
    balance: 1200.0,
    dailyLimit: 500.0,
    spentToday: 85.0,
  },
];

export default function POSIndex() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [isHeldOrdersModalOpen, setIsHeldOrdersModalOpen] = useState<boolean>(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<StudentCustomer | null>(mockStudents[0]);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [heldOrders, setHeldOrders] = useState<{ id: string; items: CartItem[]; customer: StudentCustomer | null; time: string }[]>([]);

  // Item additions & quantities
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Hold / Recall Order
  const handleHoldOrder = () => {
    if (cartItems.length === 0) return;
    const newHold = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      items: [...cartItems],
      customer: selectedCustomer,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHeldOrders(prev => [newHold, ...prev]);
    setCartItems([]);
  };

  const handleRecallOrder = (holdId: string) => {
    const held = heldOrders.find(h => h.id === holdId);
    if (held) {
      setCartItems(held.items);
      setSelectedCustomer(held.customer);
      setHeldOrders(prev => prev.filter(h => h.id !== holdId));
      setIsHeldOrdersModalOpen(false);
    }
  };

  // Discount Toggle
  const handleApplyDiscount = () => {
    setDiscountPercentage(prev => (prev === 0 ? 10 : 0));
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const totalPayable = useMemo(() => {
    const discount = (subtotal * discountPercentage) / 100;
    return Math.max(0, subtotal - discount);
  }, [subtotal, discountPercentage]);

  const cartItemIds = useMemo(() => {
    return new Set(cartItems.map(item => item.product.id));
  }, [cartItems]);

  return (
    <POSLayout
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      heldOrdersCount={heldOrders.length}
      onHoldOrdersClick={() => setIsHeldOrdersModalOpen(true)}
      cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
    >
      <div className="flex h-full w-full overflow-hidden">
        {/* Product Menu Grid */}
        <div className="flex-1 min-w-0 h-full">
          <ProductGrid 
            onAddToCart={handleAddToCart}
            searchQuery={searchQuery}
            cartItemIds={cartItemIds}
          />
        </div>

        {/* Active Cart Drawer */}
        <div className="flex-shrink-0 h-full">
          <ActiveCart 
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={() => setIsCheckoutModalOpen(true)}
            onHoldOrder={handleHoldOrder}
            selectedCustomer={selectedCustomer}
            onSelectCustomerClick={() => setIsCustomerModalOpen(true)}
            discountPercentage={discountPercentage}
            onApplyDiscount={handleApplyDiscount}
          />
        </div>
      </div>

      {/* Checkout Payment Dialog */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        totalAmount={totalPayable}
        selectedCustomer={selectedCustomer}
        onSuccess={() => setCartItems([])}
      />

      {/* Student / Customer Selector Dialog */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Users size={18} className="text-[#5c1516]" />
              Select Student or Staff Account
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Link an RFID pupil card to enforce daily cafeteria limits & credit debits.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-2">
            {/* Walk-in Option */}
            <div
              onClick={() => {
                setSelectedCustomer(null);
                setIsCustomerModalOpen(false);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedCustomer === null 
                  ? 'border-[#5c1516] bg-red-50/50' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-slate-800">Walk-in Customer</span>
                <p className="text-[11px] text-slate-400">Regular cash payment &bull; No limit checking</p>
              </div>
              {selectedCustomer === null && (
                <Badge className="bg-[#5c1516] text-white text-[10px]">Active</Badge>
              )}
            </div>

            {/* Mock Students */}
            {mockStudents.map(student => (
              <div
                key={student.id}
                onClick={() => {
                  setSelectedCustomer(student);
                  setIsCustomerModalOpen(false);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedCustomer?.id === student.id 
                    ? 'border-[#5c1516] bg-red-50/50' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{student.name}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-slate-300">
                      {student.gradeLevel}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Balance: <strong className="text-emerald-700">{formatMoney(student.balance)}</strong> &bull; Daily Limit: {formatMoney(student.dailyLimit)}
                  </p>
                </div>
                {selectedCustomer?.id === student.id && (
                  <Badge className="bg-[#5c1516] text-white text-[10px]">Active</Badge>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Held Orders Recall Dialog */}
      <Dialog open={isHeldOrdersModalOpen} onOpenChange={setIsHeldOrdersModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Clock size={18} className="text-amber-600" />
              Held Orders Recall
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Resume an order parked for student balance checking or waiting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-2 max-h-72 overflow-y-auto">
            {heldOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active orders on hold.
              </div>
            ) : (
              heldOrders.map(hold => {
                const holdTotal = hold.items.reduce((s, i) => s + (i.product.price * i.quantity), 0);
                return (
                  <div 
                    key={hold.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{hold.id}</span>
                        <span className="text-[10px] text-slate-400">{hold.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {hold.customer ? hold.customer.name : 'Walk-in'} &bull; {hold.items.length} items &bull; <strong className="text-[#5c1516]">{formatMoney(holdTotal)}</strong>
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleRecallOrder(hold.id)}
                      className="bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs h-8 px-3 rounded-lg"
                    >
                      Resume
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </POSLayout>
  );
}
