import React from 'react';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { formatMoney } from '@/lib/formatters';
import { Printer } from 'lucide-react';
import { Student, Transaction } from '../types';
import { printThermalReceiptBrowser } from '@/Components/POS/ThermalReceipt';

interface EReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Transaction | null;
  student: Student;
}

export default function EReceiptModal({
  isOpen,
  onClose,
  receipt,
  student,
}: EReceiptModalProps) {
  const slipRef = React.useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-6 rounded-2xl" showCloseButton={false}>
        <div className="space-y-4 font-mono text-xs">
          <div ref={slipRef} id="thermal-receipt-print-area" className="space-y-4">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <div className="w-10 h-10 mx-auto mb-1">
                <img src="/images/logo.png" alt="STCT Logo" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-sans font-extrabold text-sm text-slate-900">STCT CPOSIMS</h3>
              <p className="text-[10px] text-slate-500 font-sans">Saint Theresa College of Tandag, Inc.</p>
              <p className="text-[10px] text-slate-400">Official Electronic Canteen Slip</p>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Ticket No:</span>
                <strong className="text-slate-800">{receipt.id}</strong>
              </div>
              <div className="flex justify-between">
                <span>Student:</span>
                <span>{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Card UID:</span>
                <span>{student.rfidUid}</span>
              </div>
              <div className="flex justify-between">
                <span>Date/Time:</span>
                <span>{receipt.dateTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Terminal:</span>
                <span className="text-[10px] truncate max-w-[180px]">{receipt.terminal}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5 text-[11px]">
              {receipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.qty}x {it.name}</span>
                  <span>{formatMoney(it.price * it.qty)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1 font-bold text-xs">
              <div className="flex justify-between text-base font-extrabold text-[#5c1516]">
                <span>TOTAL PAID:</span>
                <span>{formatMoney(receipt.total)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] font-normal">
                <span>Remaining RFID Card Balance:</span>
                <span>{formatMoney(receipt.balanceAfter)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between gap-2 font-sans">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="w-full h-9 rounded-xl text-xs"
            >
              Close
            </Button>
            <Button 
              size="sm" 
              onClick={() => printThermalReceiptBrowser(slipRef.current)}
              className="w-full h-9 bg-[#5c1516] text-white hover:bg-[#7a1420] rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} /> Print Slip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
