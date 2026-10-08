import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { formatMoney } from '@/lib/formatters';
import { CreditCard, Banknote, QrCode, CheckCircle2, User, Printer } from 'lucide-react';
import { StudentCustomer } from './ActiveCart';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  selectedCustomer: StudentCustomer | null;
  onSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  totalAmount,
  selectedCustomer,
  onSuccess,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'rfid' | 'cash' | 'qr'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(totalAmount);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Quick cash denominations in Philippine Peso
  const denominations = [50, 100, 200, 500, 1000];
  const change = Math.max(0, cashTendered - totalAmount);

  const handleProcess = () => {
    setIsCompleted(true);
    setTimeout(() => {
      setIsCompleted(false);
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white">
        {/* Header */}
        <div className="bg-[#5c1516] text-white p-6 relative">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-400 text-amber-950 font-bold border-0 text-[10px] px-2 py-0.5">
                PAYMENT CHECKOUT
              </Badge>
              {selectedCustomer && (
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <User size={13} />
                  <span>{selectedCustomer.name}</span>
                </div>
              )}
            </div>
            <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
              Settle Order Payment
            </DialogTitle>
            <DialogDescription className="text-amber-100/80 text-xs">
              Select student account, cash tender, or digital payment.
            </DialogDescription>
          </DialogHeader>

          {/* Amount Due Big Display */}
          <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-baseline justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-200">Total Payable</span>
            <span className="text-3xl font-black text-amber-300 tracking-tight">
              {formatMoney(totalAmount)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {isCompleted ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-lg">Transaction Complete!</h4>
              <p className="text-xs text-slate-500">Printing official canteen receipt...</p>
            </div>
          ) : (
            <>
              {/* Payment Methods Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border font-bold text-xs transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[#5c1516] bg-red-50/50 text-[#5c1516] ring-1 ring-[#5c1516]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Banknote size={18} />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('rfid')}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border font-bold text-xs transition-all ${
                      paymentMethod === 'rfid'
                        ? 'border-[#5c1516] bg-red-50/50 text-[#5c1516] ring-1 ring-[#5c1516]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CreditCard size={18} />
                    <span>Student RFID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border font-bold text-xs transition-all ${
                      paymentMethod === 'qr'
                        ? 'border-[#5c1516] bg-red-50/50 text-[#5c1516] ring-1 ring-[#5c1516]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <QrCode size={18} />
                    <span>GCash / Maya</span>
                  </button>
                </div>
              </div>

              {/* Conditional Method Body */}
              {paymentMethod === 'cash' && (
                <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Cash Received:</span>
                    <Input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(Number(e.target.value))}
                      className="w-32 h-9 text-right font-bold text-base bg-white"
                    />
                  </div>

                  {/* Fast Denomination Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCashTendered(totalAmount)}
                      className="h-7 text-[11px] font-semibold bg-white border-slate-200"
                    >
                      Exact (₱{totalAmount})
                    </Button>
                    {denominations.filter(d => d >= totalAmount).map((d) => (
                      <Button
                        key={d}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCashTendered(d)}
                        className="h-7 text-[11px] font-semibold bg-white border-slate-200"
                      >
                        ₱{d}
                      </Button>
                    ))}
                  </div>

                  {/* Change Computation */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">Change Due:</span>
                    <span className="text-base font-extrabold text-emerald-600">
                      {formatMoney(change)}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'rfid' && (
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center animate-pulse">
                    <CreditCard size={22} />
                  </div>
                  <h5 className="font-bold text-xs text-slate-800">
                    {selectedCustomer ? `Charge to ${selectedCustomer.name}` : 'Tap Student ID Card to Scanner'}
                  </h5>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    {selectedCustomer 
                      ? `Available balance: ${formatMoney(selectedCustomer.balance)}. Remaining after checkout: ${formatMoney(selectedCustomer.balance - totalAmount)}.`
                      : 'Place RFID card on terminal reader to authenticate student account.'}
                  </p>
                </div>
              )}

              {paymentMethod === 'qr' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <QrCode size={22} />
                  </div>
                  <h5 className="font-bold text-xs text-slate-800">Display QR on Customer Pole Display</h5>
                  <p className="text-[11px] text-slate-500">
                    Dynamic QR code generated for GCash / Maya payment.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isCompleted && (
          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-500 text-xs">
              Back to Cart
            </Button>
            <Button
              onClick={handleProcess}
              disabled={paymentMethod === 'cash' && cashTendered < totalAmount}
              className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-md flex items-center gap-2"
            >
              <Printer size={15} />
              Confirm & Print Receipt
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
