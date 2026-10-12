import React, { useState } from 'react';
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
import { formatMoney } from '@/lib/formatters';
import { CheckCircle2 } from 'lucide-react';
import { Student } from '../types';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onConfirmTopUp: (amount: number) => void;
}

export default function TopUpModal({
  isOpen,
  onClose,
  student,
  onConfirmTopUp,
}: TopUpModalProps) {
  const [amount, setAmount] = useState<number>(200);
  const [paymentMethod, setPaymentMethod] = useState<string>('gcash');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleConfirm = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onConfirmTopUp(amount);
      onClose();
    }, 1200);
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
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-lg">Top-Up Successful!</h4>
              <p className="text-xs text-slate-500">
                Added {formatMoney(amount)} to {student.name}'s card.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                  Select Reload Amount
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 200, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-3 rounded-xl font-extrabold text-sm border transition-all ${
                        amount === amt 
                          ? 'border-[#5c1516] bg-red-50 text-[#5c1516] ring-1 ring-[#5c1516]' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ₱{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                  Payment Gateway
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                      paymentMethod === 'gcash' ? 'border-[#008dd5] bg-blue-50 text-[#008dd5] ring-1 ring-[#008dd5]' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="font-black text-sm">GCash</span>
                    <span className="text-[10px] text-slate-400">E-Wallet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('maya')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                      paymentMethod === 'maya' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="font-black text-sm">Maya</span>
                    <span className="text-[10px] text-slate-400">Digital Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                      paymentMethod === 'bank' ? 'border-amber-600 bg-amber-50 text-amber-700 ring-1 ring-amber-600' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="font-black text-sm">Debit Card</span>
                    <span className="text-[10px] text-slate-400">Online</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">New Card Balance After:</span>
                <span className="font-extrabold text-[#5c1516] text-sm">
                  {formatMoney(student.balance + amount)}
                </span>
              </div>
            </>
          )}
        </div>

        {!isSuccess && (
          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between sm:justify-between">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-6 rounded-xl"
            >
              Confirm Payment ({formatMoney(amount)})
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
