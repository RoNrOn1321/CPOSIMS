import React, { useState, useEffect } from 'react';
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
import {
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  User,
  Printer,
  AlertTriangle,
  Radio,
  Loader2,
  Check,
} from 'lucide-react';
import { StudentCustomer, CartItem } from './ActiveCart';
import { formatCartForCheckout } from '@/Hooks/usePOSCart';
import { checkout } from '@/routes/pos';
import axios from 'axios';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  selectedCustomer: StudentCustomer | null;
  cartItems?: CartItem[];
  onSuccess: (receipt?: any) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  totalAmount,
  selectedCustomer,
  cartItems = [],
  onSuccess,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'rfid' | 'cash' | 'qr'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(totalAmount);
  const [rfidUid, setRfidUid] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
  const [scanPulse, setScanPulse] = useState<boolean>(false);

  // Quick cash denominations in Philippine Peso
  const denominations = [50, 100, 200, 500, 1000];
  const change = Math.max(0, cashTendered - totalAmount);

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCashTendered(totalAmount);
      setErrorMessage(null);
      setSuccessReceipt(null);
      setIsSubmitting(false);
    } else {
      setRfidUid('');
      setErrorMessage(null);
      setSuccessReceipt(null);
      setIsSubmitting(false);
    }
  }, [isOpen, totalAmount]);

  // RFID Scanner Event Listener (USB Hardware Keyboard Emulator)
  useEffect(() => {
    if (!isOpen || paymentMethod !== 'rfid' || successReceipt) return;

    let buffer = '';
    let lastTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isManualRfid = target?.getAttribute('data-manual-rfid') === 'true';

      // If cashier is typing manually in the designated RFID field, skip global key capture
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) && isManualRfid) {
        return;
      }

      const now = Date.now();
      // Hardware scanner sends keys rapidly (< 120ms intervals)
      if (now - lastTime > 150) {
        buffer = '';
      }
      lastTime = now;

      if (e.key === 'Enter') {
        if (buffer.trim().length >= 3) {
          e.preventDefault();
          const scanned = buffer.trim();
          setRfidUid(scanned);
          setErrorMessage(null);
          setScanPulse(true);
          setTimeout(() => setScanPulse(false), 1500);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, paymentMethod, successReceipt]);

  // Handle Checkout Submission
  const handleProcess = async () => {
    if (isSubmitting) return;
    setErrorMessage(null);

    // Cash Tender Validation
    if (paymentMethod === 'cash' && cashTendered < totalAmount) {
      setErrorMessage('Amount tendered is less than the total payable amount.');
      return;
    }

    // Cashless RFID Validation
    if (paymentMethod === 'rfid' && !rfidUid.trim()) {
      setErrorMessage('Please tap or enter a student RFID card before confirming checkout.');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setErrorMessage('Cart is empty. Add products before proceeding.');
      return;
    }

    const formattedItems = formatCartForCheckout(cartItems);
    if (formattedItems.length === 0) {
      setErrorMessage('No valid cart items to checkout.');
      return;
    }

    const payload = {
      payment_method: paymentMethod === 'rfid' ? 'cashless' : 'cash',
      rfid_uid: paymentMethod === 'rfid' ? rfidUid.trim() : null,
      amount_tendered: paymentMethod === 'rfid' ? totalAmount : cashTendered,
      items: formattedItems,
    };

    setIsSubmitting(true);

    try {
      const endpoint = checkout.url();
      const response = await axios.post(endpoint, payload, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.status === 201 || response.status === 200) {
        const receipt = response.data?.receipt;
        setSuccessReceipt(receipt);
        onSuccess(receipt);
      }
    } catch (err: any) {
      let message = 'Transaction could not be processed. Please try again.';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        message = err.response.data.errors[firstKey][0];
      } else if (err.message) {
        message = err.message;
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
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
              Select cash payment or tap student RFID card to debit balance.
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
        <div className="p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-red-900 animate-in fade-in duration-200">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold block">Payment Blocked</span>
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {successReceipt ? (
            /* Success Receipt Display */
            <div className="py-4 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-slate-800 text-lg">Transaction Complete!</h4>
                <p className="text-xs text-slate-500">Official canteen receipt registered.</p>
              </div>

              {/* Receipt Summary Card */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Receipt Number:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {successReceipt.receipt_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Payment Mode:</span>
                  <span className="uppercase font-bold text-[#5c1516]">{successReceipt.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Total Paid:</span>
                  <span className="font-bold text-slate-900">{formatMoney(successReceipt.total_amount)}</span>
                </div>
                {successReceipt.student && (
                  <div className="flex justify-between pt-1.5 border-t border-slate-200">
                    <span className="text-slate-500 font-semibold">Remaining Balance:</span>
                    <span className="font-bold text-emerald-700">
                      {formatMoney(successReceipt.student.remaining_balance)}
                    </span>
                  </div>
                )}
                {successReceipt.change_amount > 0 && (
                  <div className="flex justify-between pt-1.5 border-t border-slate-200">
                    <span className="text-slate-500 font-semibold">Change Returned:</span>
                    <span className="font-bold text-emerald-700">
                      {formatMoney(successReceipt.change_amount)}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 rounded-xl shadow-md"
              >
                Close & Return to POS
              </Button>
            </div>
          ) : (
            <>
              {/* Payment Methods Selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setPaymentMethod('cash');
                      setErrorMessage(null);
                    }}
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
                    disabled={isSubmitting}
                    onClick={() => {
                      setPaymentMethod('rfid');
                      setErrorMessage(null);
                    }}
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
                    disabled={isSubmitting}
                    onClick={() => {
                      setPaymentMethod('qr');
                      setErrorMessage(null);
                    }}
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
                      disabled={isSubmitting}
                      value={cashTendered}
                      onChange={(e) => {
                        setCashTendered(Number(e.target.value));
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-32 h-9 text-right font-bold text-base bg-white"
                    />
                  </div>

                  {/* Fast Denomination Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => setCashTendered(totalAmount)}
                      className="h-7 text-[11px] font-semibold bg-white border-slate-200"
                    >
                      Exact (₱{totalAmount})
                    </Button>
                    {denominations
                      .filter((d) => d >= totalAmount)
                      .map((d) => (
                        <Button
                          key={d}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
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
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
                  <div className="flex flex-col items-center text-center space-y-1.5">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        rfidUid
                          ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                          : scanPulse
                          ? 'bg-amber-200 text-amber-900 ring-4 ring-amber-300'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {rfidUid ? <Check size={22} /> : <CreditCard size={22} />}
                    </div>

                    <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      {rfidUid ? (
                        <>
                          <span className="text-emerald-700">Card Captured</span>
                        </>
                      ) : (
                        <>
                          <Radio size={14} className="animate-spin text-amber-600" />
                          <span>Tap RFID Card to Terminal Reader</span>
                        </>
                      )}
                    </h5>

                    <p className="text-[11px] text-slate-500 max-w-xs">
                      {selectedCustomer
                        ? `Account: ${selectedCustomer.name} (Balance: ${formatMoney(selectedCustomer.balance)})`
                        : 'Scanner acts automatically as keyboard input.'}
                    </p>
                  </div>

                  {/* RFID Input Field (Keyboard Scanner or Manual Entry) */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-2">
                      <Input
                        data-manual-rfid="true"
                        type="text"
                        placeholder="Waiting for RFID tap or enter UID..."
                        value={rfidUid}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          setRfidUid(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        className={`font-mono text-center font-bold tracking-wider text-xs h-9 bg-white transition-all ${
                          rfidUid ? 'border-emerald-500 ring-1 ring-emerald-500' : ''
                        }`}
                      />
                      {rfidUid && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => setRfidUid('')}
                          className="h-9 px-2 text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    {rfidUid && (
                      <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 size={12} />
                        <span>Ready to deduct {formatMoney(totalAmount)} from card</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'qr' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <QrCode size={22} />
                  </div>
                  <h5 className="font-bold text-xs text-slate-800">GCash / Maya Dynamic QR</h5>
                  <p className="text-[11px] text-slate-500">
                    Digital QR gateway integration is in progress. Please use Cash or Student RFID.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!successReceipt && (
          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
              className="text-slate-500 text-xs"
            >
              Back to Cart
            </Button>
            <Button
              onClick={handleProcess}
              disabled={
                isSubmitting ||
                (paymentMethod === 'cash' && cashTendered < totalAmount) ||
                (paymentMethod === 'rfid' && !rfidUid.trim()) ||
                paymentMethod === 'qr'
              }
              className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Printer size={15} />
                  Confirm & Print Receipt
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
