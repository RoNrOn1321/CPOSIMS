import React, { useState, useMemo, useEffect } from 'react';
import { router } from '@inertiajs/react';
import POSLayout from '@/Layouts/POSLayout';
import ProductGrid, { Product } from './Partials/ProductGrid';
import ActiveCart, { CartItem, StudentCustomer } from './Partials/ActiveCart';
import CheckoutModal from './Partials/CheckoutModal';
import PosTopUpModal from './Partials/PosTopUpModal';
import PosHardwareDiagnosticsModal from './Partials/PosHardwareDiagnosticsModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { formatMoney } from '@/lib/formatters';
import { 
  Users, 
  Clock, 
  History, 
  AlertTriangle, 
  RotateCcw, 
  Search, 
  Loader2, 
  CheckCircle2, 
  ShieldAlert,
  CreditCard,
  Banknote,
  Printer
} from 'lucide-react';
import { lookupStudent, voidTransaction } from '@/actions/App/Http/Controllers/PosController';
import axios from 'axios';
import ThermalReceipt from '@/Components/POS/ThermalReceipt';
import ConfirmDialog from '@/Components/ui/confirm-dialog';

export interface RecentTransactionItem {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface RecentTransaction {
  id: number;
  receipt_number: string;
  total_amount: number;
  payment_method: string;
  amount_tendered?: number;
  change_amount?: number;
  status: string;
  created_at: string;
  raw_created_at?: string;
  cashier_name: string;
  student_name: string;
  items: RecentTransactionItem[];
}

interface POSIndexProps {
  products?: Product[];
  categories?: string[];
  recentTransactions?: RecentTransaction[];
}

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

export default function POSIndex({
  products = [],
  categories = [],
  recentTransactions: initialTransactions = [],
}: POSIndexProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [isHeldOrdersModalOpen, setIsHeldOrdersModalOpen] = useState<boolean>(false);
  const [isReloadModalOpen, setIsReloadModalOpen] = useState<boolean>(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState<boolean>(false);
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState<boolean>(false);

  // Recent transactions list state
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>(initialTransactions);
  const [transactionToVoid, setTransactionToVoid] = useState<RecentTransaction | null>(null);
  const [transactionToPrint, setTransactionToPrint] = useState<RecentTransaction | null>(null);
  const [isVoiding, setIsVoiding] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Customer selector state
  const [selectedCustomer, setSelectedCustomer] = useState<StudentCustomer | null>(mockStudents[0]);
  const [studentSearchInput, setStudentSearchInput] = useState<string>('');
  const [isSearchingStudent, setIsSearchingStudent] = useState<boolean>(false);
  const [searchedStudent, setSearchedStudent] = useState<StudentCustomer | null>(null);
  const [searchStudentError, setSearchStudentError] = useState<string | null>(null);

  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [heldOrders, setHeldOrders] = useState<{ id: string; items: CartItem[]; customer: StudentCustomer | null; time: string }[]>([]);

  // Synchronize recent transactions when incoming props update
  useEffect(() => {
    if (initialTransactions) {
      setRecentTransactions(initialTransactions);
    }
  }, [initialTransactions]);

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

  // Student Search in Selector Dialog
  const handleSearchStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = studentSearchInput.trim();
    if (!trimmed) return;

    setIsSearchingStudent(true);
    setSearchStudentError(null);
    setSearchedStudent(null);

    try {
      const endpoint = lookupStudent.url({ query: { identifier: trimmed } });
      const res = await axios.get(endpoint, {
        headers: { Accept: 'application/json' },
      });

      if (res.status === 200) {
        const student = res.data;
        setSearchedStudent({
          id: student.id,
          name: student.name,
          gradeLevel: `${student.grade_level} - ${student.section}`,
          balance: student.current_balance,
          dailyLimit: student.daily_spending_limit,
          spentToday: student.spent_today,
          rfidUid: student.rfid_uid,
          studentId: student.student_id_number,
          status: student.status,
        });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSearchStudentError('No student account found for this RFID / ID.');
      } else {
        setSearchStudentError(err.response?.data?.message || 'Error looking up student account.');
      }
    } finally {
      setIsSearchingStudent(false);
    }
  };

  // Voiding a Transaction
  const handleExecuteVoid = async () => {
    if (!transactionToVoid || isVoiding) return;

    setIsVoiding(true);
    try {
      const endpoint = voidTransaction.url(transactionToVoid.id);
      const res = await axios.post(endpoint, {}, {
        headers: { Accept: 'application/json' },
      });

      if (res.status === 200) {
        setRecentTransactions(prev => 
          prev.map(t => t.id === transactionToVoid.id ? { ...t, status: 'voided' } : t)
        );
        setActionSuccessMessage(`Receipt #${transactionToVoid.receipt_number} has been voided. Stock restored.`);
        setTransactionToVoid(null);

        // Reload fresh products and transactions from server
        router.reload({ only: ['products', 'recentTransactions'] });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to void transaction.');
    } finally {
      setIsVoiding(false);
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
      onReloadClick={() => setIsReloadModalOpen(true)}
      onOrdersClick={() => setIsOrdersModalOpen(true)}
      onRefundsClick={() => setIsOrdersModalOpen(true)}
      onConfigClick={() => setIsDiagnosticsModalOpen(true)}
      cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
    >
      <div className="flex h-full w-full overflow-hidden">
        {/* Product Menu Grid */}
        <div className="flex-1 min-w-0 h-full">
          <ProductGrid 
            onAddToCart={handleAddToCart}
            searchQuery={searchQuery}
            cartItemIds={cartItemIds}
            products={products}
            categories={categories}
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
        cartItems={cartItems}
        onSuccess={() => {
          setCartItems([]);
          router.reload({ only: ['products', 'recentTransactions'] });
        }}
      />

      {/* Student / Customer Selector Dialog with Live RFID / ID Lookup */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Users size={18} className="text-[#5c1516]" />
              Select Student or Staff Account
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Link an RFID pupil card to enforce daily cafeteria limits & credit debits.
            </DialogDescription>
          </DialogHeader>

          {/* Real-Time Student Lookup Input */}
          <form onSubmit={handleSearchStudent} className="flex items-center gap-2 pt-1 pb-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Lookup by Student ID or scan RFID..."
                value={studentSearchInput}
                onChange={(e) => {
                  setStudentSearchInput(e.target.value);
                  if (searchStudentError) setSearchStudentError(null);
                }}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isSearchingStudent || !studentSearchInput.trim()}
              className="bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs h-9 px-3 rounded-xl font-bold"
            >
              {isSearchingStudent ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
            </Button>
          </form>

          {searchStudentError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{searchStudentError}</span>
            </div>
          )}

          {/* Searched Live Student Result */}
          {searchedStudent && (
            <div
              onClick={() => {
                setSelectedCustomer(searchedStudent);
                setIsCustomerModalOpen(false);
              }}
              className="p-3 rounded-xl border border-emerald-500 bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-all flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{searchedStudent.name}</span>
                  <Badge className="bg-emerald-600 text-white text-[9px] px-1 py-0">Found</Badge>
                  {searchedStudent.status === 'lost_card' && (
                    <Badge className="bg-red-600 text-white text-[9px] px-1 py-0">Lost Card</Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Balance: <strong className="text-emerald-700">{formatMoney(searchedStudent.balance)}</strong> &bull; Limit: {formatMoney(searchedStudent.dailyLimit)}
                </p>
              </div>
              <Button size="sm" className="h-7 text-xs bg-emerald-700 text-white rounded-lg">Select</Button>
            </div>
          )}

          <div className="space-y-2.5 my-1 max-h-64 overflow-y-auto">
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

            {/* Quick Students */}
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

      {/* Recent Orders & Voids Dialog */}
      <Dialog open={isOrdersModalOpen} onOpenChange={setIsOrdersModalOpen}>
        <DialogContent className="sm:max-w-[620px] rounded-2xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-slate-800 text-base">
                <History size={20} className="text-[#5c1516]" />
                Recent Orders & Refund Voids
              </DialogTitle>
              <Badge className="bg-slate-100 text-slate-700 text-xs font-semibold">
                {recentTransactions.length} Logged
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Review recent register transactions and void receipts with automatic inventory restocking.
            </DialogDescription>
          </DialogHeader>

          {actionSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No recent transactions recorded on this register.
              </div>
            ) : (
              recentTransactions.map(tx => {
                const isVoided = tx.status === 'voided';
                return (
                  <div 
                    key={tx.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isVoided 
                        ? 'bg-slate-50/70 border-slate-200 opacity-75' 
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {tx.receipt_number}
                        </span>
                        <span className="text-[11px] text-slate-400">{tx.created_at}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] font-bold ${
                          isVoided 
                            ? 'bg-red-100 text-red-800 border-red-200' 
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {isVoided ? 'Voided' : 'Completed'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold text-slate-600">
                          {tx.payment_method === 'cashless' ? (
                            <span className="flex items-center gap-1"><CreditCard size={10} /> RFID</span>
                          ) : (
                            <span className="flex items-center gap-1"><Banknote size={10} /> Cash</span>
                          )}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div>
                        <span className="font-bold text-slate-800">{tx.student_name}</span>
                        <p className="text-[11px] text-slate-500">
                          {tx.items.length} item{tx.items.length !== 1 ? 's' : ''} &bull; Cashier: {tx.cashier_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-base font-extrabold mr-1 ${isVoided ? 'line-through text-slate-400' : 'text-[#5c1516]'}`}>
                          {formatMoney(tx.total_amount)}
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTransactionToPrint(tx)}
                          className="h-8 text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Printer size={12} />
                          Print Receipt
                        </Button>

                        {!isVoided && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setTransactionToVoid(tx)}
                            className="h-8 text-xs font-bold border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw size={12} />
                            Void Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reprint Thermal Receipt Dialog */}
      <Dialog open={!!transactionToPrint} onOpenChange={(open) => !open && setTransactionToPrint(null)}>
        <DialogContent className="sm:max-w-[420px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 text-base">
              <Printer size={18} className="text-[#5c1516]" />
              Print 58mm Thermal Receipt
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Receipt #{transactionToPrint?.receipt_number} &bull; {transactionToPrint?.created_at}
            </DialogDescription>
          </DialogHeader>

          {transactionToPrint && (
            <div className="py-1">
              <ThermalReceipt
                type="sale"
                receiptNumber={transactionToPrint.receipt_number}
                createdAt={transactionToPrint.created_at}
                cashierName={transactionToPrint.cashier_name}
                customerName={transactionToPrint.student_name}
                paymentMethod={transactionToPrint.payment_method}
                items={transactionToPrint.items}
                totalAmount={transactionToPrint.total_amount}
                amountTendered={transactionToPrint.amount_tendered}
                changeAmount={transactionToPrint.change_amount}
                showPrintButton={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Void Confirmation Dialog */}
      <ConfirmDialog
        open={!!transactionToVoid}
        onOpenChange={(open) => !open && setTransactionToVoid(null)}
        title="Confirm Transaction Void"
        description={
          <span>
            Are you sure you want to void receipt <strong className="font-mono font-bold text-slate-800">{transactionToVoid?.receipt_number}</strong> for <strong className="text-[#5c1516] font-extrabold">{transactionToVoid ? formatMoney(transactionToVoid.total_amount) : ''}</strong>?
          </span>
        }
        warningNote={
          <div className="space-y-1">
            <span className="font-bold block text-amber-950">Voiding Operations:</span>
            <ul className="list-disc pl-3.5 space-y-0.5 text-[11px] text-amber-900">
              <li>Product quantities will be restored back into active inventory stock.</li>
              <li>An inventory log record with action 'void' will be generated.</li>
              {transactionToVoid?.payment_method === 'cashless' && (
                <li>Student RFID card balance will be automatically refunded <strong>{formatMoney(transactionToVoid.total_amount)}</strong>.</li>
              )}
            </ul>
          </div>
        }
        confirmText="Confirm & Void"
        cancelText="Keep Transaction"
        variant="danger"
        isLoading={isVoiding}
        onConfirm={handleExecuteVoid}
        onCancel={() => setTransactionToVoid(null)}
      />

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

      {/* POS Walk-In RFID Reload Dialog */}
      <PosTopUpModal
        isOpen={isReloadModalOpen}
        onClose={() => setIsReloadModalOpen(false)}
      />

      {/* Terminal & Hardware Diagnostics Dialog */}
      <PosHardwareDiagnosticsModal
        isOpen={isDiagnosticsModalOpen}
        onClose={() => setIsDiagnosticsModalOpen(false)}
        products={products}
      />
    </POSLayout>
  );
}
