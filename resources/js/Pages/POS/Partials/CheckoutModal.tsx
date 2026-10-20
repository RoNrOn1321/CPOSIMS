import React, { useState, useEffect, useRef } from 'react';
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
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { StudentCustomer, CartItem } from './ActiveCart';
import { formatCartForCheckout } from '@/Hooks/usePOSCart';
import PosCheckoutController from '@/actions/App/Http/Controllers/PosCheckoutController';
import { lookupStudent as lookupStudentAction } from '@/actions/App/Http/Controllers/PosController';
import axios from 'axios';
import ThermalReceipt, { printThermalReceipt } from '@/Components/POS/ThermalReceipt';

export interface StudentLookupData {
  id: number;
  student_id_number: string;
  rfid_uid: string;
  name: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  section: string;
  current_balance: number;
  daily_spending_limit: number;
  is_spending_limited: boolean;
  spent_today: number;
  remaining_daily_limit: number | null;
  status: string;
}

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

  // Live student account lookup state
  const [lookupStudent, setLookupStudent] = useState<StudentLookupData | null>(null);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Quick cash denominations in Philippine Peso
  const denominations = [50, 100, 200, 500, 1000];
  const change = Math.max(0, cashTendered - totalAmount);

  const prevIsOpenRef = useRef(false);

  // Synchronize initial state when modal opens or closes
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setCashTendered(totalAmount);
      setErrorMessage(null);
      setSuccessReceipt(null);
      setIsSubmitting(false);
      if (selectedCustomer?.rfidUid) {
        setRfidUid(selectedCustomer.rfidUid);
      }
    } else if (!isOpen) {
      setRfidUid('');
      setErrorMessage(null);
      setSuccessReceipt(null);
      setIsSubmitting(false);
      setLookupStudent(null);
      setLookupError(null);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, selectedCustomer]);

  // Keep cash tendered in sync with cart total before checkout
  useEffect(() => {
    if (isOpen && !successReceipt) {
      setCashTendered(totalAmount);
    }
  }, [totalAmount, isOpen, successReceipt]);

  // Live student account lookup debounced query
  useEffect(() => {
    if (!isOpen || paymentMethod !== 'rfid') {
      return;
    }

    const trimmed = rfidUid.trim();
    if (trimmed.length < 3) {
      setLookupStudent(null);
      setLookupError(null);
      setIsLookingUp(false);
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);

    const timer = setTimeout(async () => {
      try {
        const endpoint = lookupStudentAction.url({ query: { identifier: trimmed } });
        const res = await axios.get(endpoint, {
          headers: { Accept: 'application/json' },
        });
        if (res.status === 200) {
          setLookupStudent(res.data);
          setLookupError(null);
        }
      } catch (err: any) {
        setLookupStudent(null);
        if (err.response?.status === 404) {
          setLookupError('No student account found for this RFID / ID.');
        } else {
          setLookupError(err.response?.data?.message || 'Error looking up student account.');
        }
      } finally {
        setIsLookingUp(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [rfidUid, isOpen, paymentMethod]);

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
    if (paymentMethod === 'rfid') {
      if (!rfidUid.trim()) {
        setErrorMessage('Please tap or enter a student RFID card before confirming checkout.');
        return;
      }

      if (lookupStudent?.status === 'lost_card') {
        setErrorMessage('Transaction blocked: Student RFID card is frozen / reported lost.');
        return;
      }

      if (lookupStudent && ['suspended', 'inactive'].includes(lookupStudent.status)) {
        setErrorMessage(`Transaction blocked: Student account is ${lookupStudent.status}.`);
        return;
      }

      if (lookupStudent && lookupStudent.current_balance < totalAmount) {
        setErrorMessage('Insufficient balance on student RFID card.');
        return;
      }

      if (lookupStudent && lookupStudent.is_spending_limited && lookupStudent.remaining_daily_limit !== null && lookupStudent.remaining_daily_limit < totalAmount) {
        setErrorMessage('Daily transaction limit exceeded for this student.');
        return;
      }
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
      const endpoint = PosCheckoutController.url();
      const response = await axios.post(endpoint, payload, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.status === 201 || response.status === 200) {
        const receipt = response.data?.receipt;
        setSuccessReceipt(receipt);

        const customerName = receipt?.student
          ? receipt.student.name
          : (selectedCustomer?.name || 'Walk-in Customer');

        const printPayload = {
          type: 'sale' as const,
          receipt_number: receipt?.receipt_number || '',
          created_at: receipt?.created_at,
          cashier_name: receipt?.cashier,
          customer_name: customerName,
          student_id_number: receipt?.student?.student_id_number,
          payment_method: receipt?.payment_method || (paymentMethod === 'rfid' ? 'cashless' : 'cash'),
          items: receipt?.items || [],
          total_amount: Number(receipt?.total_amount ?? totalAmount),
          amount_tendered: receipt?.amount_tendered !== undefined ? Number(receipt.amount_tendered) : undefined,
          change_amount: receipt?.change_amount !== undefined ? Number(receipt.change_amount) : 0,
          previous_balance: receipt?.student?.previous_balance !== undefined ? Number(receipt.student.previous_balance) : undefined,
          new_balance: receipt?.student?.remaining_balance !== undefined ? Number(receipt.student.remaining_balance) : undefined,
          kick_drawer: true,
        };

        printThermalReceipt(printPayload);
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
      <DialogContent 
        className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl bg-white"
        closeButtonClassName="text-white/80 hover:text-white hover:bg-white/10"
      >
        {/* Header */}
        <div className="bg-[#5c1516] text-white p-6 relative">
          <DialogHeader className="text-left space-y-1 pr-10">
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
            /* Success Thermal Receipt Display */
            <div className="py-2 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-slate-800 text-base">Transaction Successful!</h4>
                <p className="text-xs text-slate-500">Official canteen receipt ready for 58mm thermal printing.</p>
              </div>

              {/* Thermal Receipt Paper Card Component */}
              <ThermalReceipt
                type="sale"
                receiptNumber={successReceipt.receipt_number}
                createdAt={successReceipt.created_at}
                cashierName={successReceipt.cashier}
                customerName={successReceipt.student ? successReceipt.student.name : (selectedCustomer?.name || 'Walk-in Customer')}
                studentIdNumber={successReceipt.student?.student_id_number}
                paymentMethod={successReceipt.payment_method}
                items={successReceipt.items || []}
                totalAmount={Number(successReceipt.total_amount)}
                amountTendered={successReceipt.amount_tendered !== undefined ? Number(successReceipt.amount_tendered) : undefined}
                changeAmount={successReceipt.change_amount !== undefined ? Number(successReceipt.change_amount) : 0}
                previousBalance={successReceipt.student?.previous_balance !== undefined ? Number(successReceipt.student.previous_balance) : undefined}
                newBalance={successReceipt.student ? Number(successReceipt.student.remaining_balance) : undefined}
                showPrintButton={true}
              />

              <Button
                variant="outline"
                onClick={onClose}
                className="w-full text-slate-700 font-bold text-xs h-9 rounded-xl border-slate-300 hover:bg-slate-50"
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
                        lookupStudent?.status === 'lost_card'
                          ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                          : lookupStudent
                          ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                          : scanPulse
                          ? 'bg-amber-200 text-amber-900 ring-4 ring-amber-300'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {lookupStudent?.status === 'lost_card' ? (
                        <ShieldAlert size={22} />
                      ) : lookupStudent ? (
                        <Check size={22} />
                      ) : isLookingUp ? (
                        <Loader2 size={22} className="animate-spin" />
                      ) : (
                        <CreditCard size={22} />
                      )}
                    </div>

                    <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      {isLookingUp ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-amber-600" />
                          <span>Verifying Student Account...</span>
                        </>
                      ) : lookupStudent?.status === 'lost_card' ? (
                        <span className="text-red-700 font-extrabold flex items-center gap-1">
                          <ShieldAlert size={14} /> Card Frozen (Reported Lost)
                        </span>
                      ) : lookupStudent ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <ShieldCheck size={14} /> Account Verified
                        </span>
                      ) : (
                        <>
                          <Radio size={14} className="animate-spin text-amber-600" />
                          <span>Tap RFID Card to Terminal Reader</span>
                        </>
                      )}
                    </h5>

                    <p className="text-[11px] text-slate-500 max-w-xs">
                      {lookupStudent
                        ? `${lookupStudent.name} (${lookupStudent.student_id_number})`
                        : selectedCustomer
                        ? `Selected: ${selectedCustomer.name} (Balance: ${formatMoney(selectedCustomer.balance)})`
                        : 'Hardware scanner inputs automatically or enter UID manually below.'}
                    </p>
                  </div>

                  {/* RFID Input Field (Keyboard Scanner or Manual Entry) */}
                  <div className="space-y-2 pt-1">
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
                          lookupStudent?.status === 'lost_card'
                            ? 'border-red-500 ring-1 ring-red-500 text-red-700'
                            : lookupStudent
                            ? 'border-emerald-500 ring-1 ring-emerald-500'
                            : ''
                        }`}
                      />
                      {rfidUid && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => {
                            setRfidUid('');
                            setLookupStudent(null);
                            setLookupError(null);
                          }}
                          className="h-9 px-2 text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Lookup Error Banner */}
                    {lookupError && (
                      <div className="p-2.5 rounded-lg bg-red-100/80 border border-red-200 text-red-800 text-[11px] flex items-center gap-1.5 font-medium">
                        <AlertTriangle size={14} className="shrink-0 text-red-600" />
                        <span>{lookupError}</span>
                      </div>
                    )}

                    {/* Frozen / Lost Card Alert Banner */}
                    {lookupStudent?.status === 'lost_card' && (
                      <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-red-800">
                          <ShieldAlert size={15} className="text-red-700" />
                          <span>CARD FROZEN &bull; TRANSACTION BLOCKED</span>
                        </div>
                        <p className="text-[11px] text-red-700 leading-tight">
                          This RFID card is reported lost and frozen by the parent. Canteen purchases and reloads are blocked.
                        </p>
                      </div>
                    )}

                    {/* Active Student Summary Box */}
                    {lookupStudent && lookupStudent.status === 'active' && (
                      <div className="p-3 rounded-xl bg-white border border-emerald-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-slate-800 text-xs">{lookupStudent.name}</span>
                            <p className="text-[10px] text-slate-500">
                              {lookupStudent.student_id_number} &bull; {lookupStudent.grade_level} - {lookupStudent.section}
                            </p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px] font-bold">
                            Active Card
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100">
                          <div className="p-1.5 rounded-lg bg-emerald-50/70">
                            <span className="text-[9px] font-semibold text-emerald-800 uppercase block">Balance</span>
                            <strong className="text-xs font-black text-emerald-700">{formatMoney(lookupStudent.current_balance)}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-50">
                            <span className="text-[9px] font-semibold text-slate-500 uppercase block">Daily Limit Left</span>
                            <strong className="text-xs font-black text-slate-800">
                              {lookupStudent.is_spending_limited && lookupStudent.remaining_daily_limit !== null
                                ? formatMoney(lookupStudent.remaining_daily_limit)
                                : 'No Limit'}
                            </strong>
                          </div>
                        </div>

                        {lookupStudent.current_balance < totalAmount && (
                          <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 pt-0.5">
                            <AlertTriangle size={12} /> Insufficient balance for this order.
                          </p>
                        )}

                        {lookupStudent.is_spending_limited && lookupStudent.remaining_daily_limit !== null && lookupStudent.remaining_daily_limit < totalAmount && (
                          <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 pt-0.5">
                            <AlertTriangle size={12} /> Exceeds student daily allowance limit.
                          </p>
                        )}

                        {lookupStudent.current_balance >= totalAmount &&
                          (!lookupStudent.is_spending_limited || lookupStudent.remaining_daily_limit === null || lookupStudent.remaining_daily_limit >= totalAmount) && (
                            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-semibold pt-0.5">
                              <CheckCircle2 size={12} />
                              <span>Ready to deduct {formatMoney(totalAmount)} from card</span>
                            </div>
                          )}
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
                (paymentMethod === 'rfid' && (
                  !rfidUid.trim() ||
                  isLookingUp ||
                  lookupStudent?.status === 'lost_card' ||
                  lookupStudent?.status === 'suspended' ||
                  lookupStudent?.status === 'inactive' ||
                  (lookupStudent !== null && lookupStudent.current_balance < totalAmount) ||
                  (lookupStudent !== null && lookupStudent.is_spending_limited && lookupStudent.remaining_daily_limit !== null && lookupStudent.remaining_daily_limit < totalAmount)
                )) ||
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
