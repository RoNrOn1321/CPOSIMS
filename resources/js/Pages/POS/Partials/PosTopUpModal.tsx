import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { formatMoney } from '@/lib/formatters';
import {
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Printer,
  Wifi,
} from 'lucide-react';
import axios from 'axios';
import { posStore as posTopup } from '@/actions/App/Http/Controllers/BalanceTopupController';
import ThermalReceipt from '@/Components/POS/ThermalReceipt';

interface PosTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (topupData: any) => void;
}

interface TopupResult {
  reference_number: string;
  student_name: string;
  student_id_number?: string;
  amount: number;
  previous_balance: number;
  new_balance: number;
  created_at?: string;
  cashier?: string;
}

export default function PosTopUpModal({
  isOpen,
  onClose,
  onSuccess,
}: PosTopUpModalProps) {
  const [rfidUid, setRfidUid] = useState<string>('');
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<TopupResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const cashPresets = [50, 100, 200, 500, 1000];
  const activeAmount = isCustom ? (parseFloat(customAmount) || 0) : amount;

  // Reset form and autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setRfidUid('');
      setAmount(100);
      setCustomAmount('');
      setIsCustom(false);
      setIsSubmitting(false);
      setErrorMessage(null);
      setSuccessData(null);

      // Autofocus input for rapid USB RFID scanning
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handlePresetClick = (preset: number) => {
    setIsCustom(false);
    setAmount(preset);
    setErrorMessage(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustom(true);
    setCustomAmount(e.target.value);
    setErrorMessage(null);
  };

  const handleReloadSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const trimmedId = rfidUid.trim();
    if (!trimmedId) {
      setErrorMessage('Please scan student RFID card or enter student ID number.');
      inputRef.current?.focus();
      return;
    }

    if (activeAmount < 10) {
      setErrorMessage('Minimum walk-in reload amount is ₱10.00.');
      return;
    }

    if (activeAmount > 10000) {
      setErrorMessage('Maximum reload amount is ₱10,000.00.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const endpoint = posTopup.url();
      const response = await axios.post(
        endpoint,
        {
          rfid_uid: trimmedId,
          amount: activeAmount,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        const result = response.data?.topup || response.data;
        setSuccessData({
          reference_number: result.reference_number,
          student_name: result.student_name,
          student_id_number: result.student_id_number,
          amount: Number(result.amount),
          previous_balance: Number(result.previous_balance),
          new_balance: Number(result.new_balance),
          created_at: result.created_at,
          cashier: result.cashier,
        });
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err: any) {
      let msg = 'Walk-in cash reload could not be processed.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        msg = err.response.data.errors[firstKey][0];
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      inputRef.current?.select();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setRfidUid('');
    setAmount(100);
    setCustomAmount('');
    setIsCustom(false);
    setErrorMessage(null);
    setSuccessData(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl bg-white"
        closeButtonClassName="text-white/80 hover:text-white hover:bg-white/10"
      >
        {/* Header with STCT Maroon & Gold Palette */}
        <div className="bg-[#5c1516] text-white p-5 border-b-2 border-[#d38c28]">
          <DialogHeader className="text-left space-y-1 pr-10">
            <div className="flex items-center justify-between">
              <Badge className="bg-[#d38c28] text-amber-950 hover:bg-[#d38c28] font-bold text-[10px] px-2 py-0.5 rounded shadow-xs">
                WALK-IN CASH RELOAD
              </Badge>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 font-medium bg-black/20 px-2 py-0.5 rounded-full">
                <Wifi size={12} className="text-emerald-400 animate-pulse" />
                <span>USB Reader Active</span>
              </div>
            </div>
            <DialogTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <CreditCard size={22} className="text-[#d38c28]" />
              Cashier RFID Balance Top-Up
            </DialogTitle>
            <DialogDescription className="text-amber-100/80 text-xs">
              Load physical cash directly to student stored-value RFID cards.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in duration-200">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successData ? (
            /* Thermal Style Reload Receipt Confirmation */
            <div className="py-2 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-slate-800 text-base">
                  Reload Completed Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  Physical cash tendered has been recorded to student ledger.
                </p>
              </div>

              {/* Thermal Receipt Paper Card Component */}
              <ThermalReceipt
                type="topup"
                receiptNumber={successData.reference_number}
                createdAt={successData.created_at}
                cashierName={successData.cashier}
                customerName={successData.student_name}
                studentIdNumber={successData.student_id_number}
                paymentMethod="cash"
                totalAmount={successData.amount}
                amountTendered={successData.amount}
                changeAmount={0}
                previousBalance={successData.previous_balance}
                newBalance={successData.new_balance}
                showPrintButton={true}
              />
            </div>
          ) : (
            /* Top-Up Form */
            <form onSubmit={handleReloadSubmit} className="space-y-4">
              {/* RFID / Student ID input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Student RFID UID or Student ID</span>
                  <span className="text-[10px] text-amber-700 font-semibold normal-case">
                    Tap card on USB reader
                  </span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    ref={inputRef}
                    type="text"
                    data-manual-rfid="true"
                    placeholder="Scan card or type Student ID (e.g. 2026-0042)..."
                    value={rfidUid}
                    onChange={(e) => {
                      setRfidUid(e.target.value);
                      setErrorMessage(null);
                    }}
                    disabled={isSubmitting}
                    className="pl-10 h-11 rounded-xl text-sm font-mono border-slate-300 focus-visible:ring-2 focus-visible:ring-[#5c1516]"
                  />
                </div>
              </div>

              {/* Cash Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Cash Reload Amount
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {cashPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handlePresetClick(preset)}
                      className={`py-2 rounded-xl font-black text-xs border transition-all ${
                        !isCustom && amount === preset
                          ? 'border-[#5c1516] bg-red-50 text-[#5c1516] ring-2 ring-[#5c1516]'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ₱{preset}
                    </button>
                  ))}
                </div>

                {/* Custom Cash Amount */}
                <div className="relative mt-2.5">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="number"
                    min="10"
                    max="10000"
                    step="1"
                    placeholder="Custom amount (min ₱10, max ₱10,000)..."
                    value={customAmount}
                    onChange={handleCustomChange}
                    disabled={isSubmitting}
                    className={`pl-10 h-10 rounded-xl text-sm font-semibold ${
                      isCustom ? 'border-[#5c1516] ring-1 ring-[#5c1516]' : 'border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* Amount Tendered Summary */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Total Cash to Collect:</span>
                <span className="font-black text-[#5c1516] text-base">
                  {formatMoney(activeAmount)}
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between sm:justify-between">
          {successData ? (
            <div className="flex items-center justify-between w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetForAnother}
                className="rounded-xl text-xs font-bold border-slate-300 text-slate-700 flex items-center gap-1.5 h-10"
              >
                <RefreshCw size={14} />
                Reload Another
              </Button>
              <Button
                onClick={onClose}
                className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-6 rounded-xl"
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl text-xs font-semibold text-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleReloadSubmit}
                disabled={isSubmitting || !rfidUid.trim() || activeAmount < 10}
                className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-5 rounded-xl flex items-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Banknote size={16} className="text-[#d38c28]" />
                    <span>Confirm Reload ({formatMoney(activeAmount)})</span>
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
