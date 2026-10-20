import React, { useRef } from 'react';
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
  const slipRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-full sm:max-w-[420px] p-6 rounded-2xl overflow-hidden bg-white shadow-2xl" 
        showCloseButton={false}
      >
        <div className="space-y-4 font-mono text-xs w-full">
          {/* Printable Thermal Receipt Area */}
          <div ref={slipRef} id="thermal-receipt-print-area" className="space-y-4 w-full">
            {/* Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <div className="w-10 h-10 mx-auto mb-1">
                <img 
                  src="/images/logo.png" 
                  alt="STCT Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <h3 className="font-sans font-extrabold text-sm text-slate-900">STCT CPOSIMS</h3>
              <p className="text-[10px] text-slate-500 font-sans">Saint Theresa College of Tandag, Inc.</p>
              <p className="text-[10px] text-slate-400">Official Electronic Canteen Slip</p>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between items-center gap-2">
                <span className="shrink-0 text-slate-400">Ticket No:</span>
                <strong className="text-slate-800 font-mono text-[11px] truncate">{receipt.id}</strong>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="shrink-0 text-slate-400">Student:</span>
                <span className="font-semibold text-slate-800 truncate">{student.name}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="shrink-0 text-slate-400">Card UID:</span>
                <span className="font-mono text-slate-700">{student.rfidUid}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="shrink-0 text-slate-400">Date/Time:</span>
                <span className="text-slate-700">{receipt.dateTime}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="shrink-0 text-slate-400">Terminal:</span>
                <span className="text-slate-700 text-right truncate max-w-[200px] text-[10px]">{receipt.terminal}</span>
              </div>
            </div>

            {/* Purchased Items Table */}
            <div className="border-t border-b border-dashed border-slate-300 py-2.5 space-y-1.5 text-[11px]">
              {receipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center gap-2">
                  <span className="truncate text-slate-800">{it.qty}x {it.name}</span>
                  <span className="font-semibold text-slate-900 shrink-0">{formatMoney(it.price * it.qty)}</span>
                </div>
              ))}
            </div>

            {/* Total and Remaining Balance */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between items-center text-sm font-black text-[#5c1516]">
                <span>TOTAL PAID:</span>
                <span>{formatMoney(receipt.total)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-normal">
                <span>Remaining RFID Balance:</span>
                <span className="font-semibold text-slate-700">{formatMoney(receipt.balanceAfter)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons in a strict 2-column grid inside the card */}
          <div className="pt-4 grid grid-cols-2 gap-3 font-sans w-full">
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="w-full h-9 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </Button>
            <Button 
              type="button"
              size="sm" 
              onClick={() => printThermalReceiptBrowser(slipRef.current)}
              className="w-full h-9 bg-[#5c1516] text-white hover:bg-[#7a1420] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Slip</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
