import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { formatMoney } from '@/lib/formatters';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { topup } from '@/routes/parent/student-accounts';
import { Student } from '../types';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onConfirmTopUp?: (amount: number) => void;
}

export default function TopUpModal({
  isOpen,
  onClose,
  student,
  onConfirmTopUp,
}: TopUpModalProps) {
  const [amount, setAmount] = useState<number>(200);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'bank'>('gcash');
  const [accountNumber, setAccountNumber] = useState<string>('0917-882-1049');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  // Synchronize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount(200);
      setCustomAmount('');
      setIsCustom(false);
      setPaymentMethod('gcash');
      setAccountNumber('0917-882-1049');
      setIsSubmitting(false);
      setErrorMessage(null);
      setIsSuccess(false);
      setReferenceNumber('');
    }
  }, [isOpen, student]);

  // Adjust default simulated account number based on payment method
  const handlePaymentMethodChange = (method: 'gcash' | 'maya' | 'bank') => {
    setPaymentMethod(method);
    if (method === 'bank') {
      setAccountNumber('4242 •••• 4242');
    } else {
      setAccountNumber('0917-882-1049');
    }
  };

  const activeAmount = isCustom ? (parseFloat(customAmount) || 0) : amount;

  const handlePresetSelect = (preset: number) => {
    setIsCustom(false);
    setAmount(preset);
    setErrorMessage(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustom(true);
    setCustomAmount(e.target.value);
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    if (activeAmount < 50) {
      setErrorMessage('Minimum top-up reload is ₱50.00.');
      return;
    }
    if (activeAmount > 10000) {
      setErrorMessage('Maximum reload limit is ₱10,000.00 per transaction.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    router.post(
      topup.url(student.id),
      {
        amount: activeAmount,
        payment_method: paymentMethod,
        account_number: accountNumber.trim(),
      },
      {
        preserveScroll: true,
        onSuccess: (page) => {
          setIsSubmitting(false);
          setIsSuccess(true);
          const flashRef = (page.props as any)?.flash?.reference_number;
          if (flashRef) {
            setReferenceNumber(flashRef);
          }
          if (onConfirmTopUp) {
            onConfirmTopUp(activeAmount);
          }
        },
        onError: (errors) => {
          setIsSubmitting(false);
          const firstError = Object.values(errors)[0] as string;
          setErrorMessage(firstError || 'Top-up failed. Please check your inputs.');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white">
        <div className="bg-[#5c1516] text-white p-6">
          <DialogHeader className="text-left space-y-1">
            <Badge className="bg-amber-400 text-amber-950 font-bold text-[10px] w-fit">
              INSTANT CASH RELOAD
            </Badge>
            <DialogTitle className="text-xl font-extrabold text-white">
              Top-Up {student.name}'s RFID Card
            </DialogTitle>
            <DialogDescription className="text-amber-100/80 text-xs">
              Card: {student.rfidUid} &bull; Current: {formatMoney(student.balance)}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-lg">Top-Up Successful!</h4>
              {referenceNumber && (
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono text-xs font-semibold">
                  Ref: {referenceNumber}
                </div>
              )}
              <p className="text-xs text-slate-500">
                Added <strong className="text-slate-800">{formatMoney(activeAmount)}</strong> to {student.name}'s card.
              </p>
              <div className="w-full mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">New Persisted Balance:</span>
                <span className="font-black text-[#5c1516] text-base">
                  {formatMoney(student.balance + activeAmount)}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                  Select Reload Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[100, 200, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handlePresetSelect(amt)}
                      className={`py-2.5 rounded-xl font-extrabold text-sm border transition-all ${
                        !isCustom && amount === amt 
                          ? 'border-[#5c1516] bg-red-50 text-[#5c1516] ring-1 ring-[#5c1516]' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ₱{amt}
                    </button>
                  ))}
                </div>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₱
                  </span>
                  <Input
                    type="number"
                    min="50"
                    max="10000"
                    step="1"
                    placeholder="Custom amount (min ₱50, max ₱10,000)"
                    value={customAmount}
                    onChange={handleCustomChange}
                    disabled={isSubmitting}
                    className={`pl-8 text-sm h-10 rounded-xl font-semibold ${
                      isCustom ? 'border-[#5c1516] ring-1 ring-[#5c1516]' : 'border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                  Payment Gateway
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handlePaymentMethodChange('gcash')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'gcash' 
                        ? 'border-[#008dd5] bg-blue-50 text-[#008dd5] ring-1 ring-[#008dd5]' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-black text-sm">GCash</span>
                    <span className="text-[10px] text-slate-400">E-Wallet</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handlePaymentMethodChange('maya')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'maya' 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-black text-sm">Maya</span>
                    <span className="text-[10px] text-slate-400">Digital Pay</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handlePaymentMethodChange('bank')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'bank' 
                        ? 'border-amber-600 bg-amber-50 text-amber-700 ring-1 ring-amber-600' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-black text-sm">Debit Card</span>
                    <span className="text-[10px] text-slate-400">Online</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                  Simulated Mobile / Account No.
                </label>
                <Input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  disabled={isSubmitting}
                  placeholder={paymentMethod === 'bank' ? '4242 •••• 4242' : '0917-882-1049'}
                  className="text-xs h-10 rounded-xl font-mono border-slate-200"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Simulated sandbox gateway for defense panel demonstration.
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">New Card Balance After:</span>
                <span className="font-extrabold text-[#5c1516] text-sm">
                  {formatMoney(student.balance + activeAmount)}
                </span>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between sm:justify-between">
          {isSuccess ? (
            <Button 
              onClick={onClose}
              className="w-full bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 rounded-xl"
            >
              Done
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={isSubmitting || activeAmount < 50}
                className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-6 rounded-xl flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Confirm Payment ({formatMoney(activeAmount)})
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
