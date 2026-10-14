import React from 'react';
import { Button } from '@/Components/ui/button';
import { formatMoney } from '@/lib/formatters';
import { Printer } from 'lucide-react';

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ThermalReceiptProps {
  type: 'sale' | 'topup';
  receiptNumber: string;
  createdAt?: string;
  cashierName?: string;
  customerName?: string;
  studentIdNumber?: string;
  paymentMethod?: string;
  items?: ReceiptLineItem[];
  totalAmount: number;
  amountTendered?: number;
  changeAmount?: number;
  previousBalance?: number;
  newBalance?: number;
  showPrintButton?: boolean;
}

/**
 * Triggers clean 58mm thermal receipt printing for the Xprinter XP-58IIH.
 */
export function printThermalReceipt() {
  document.body.classList.add('printing-thermal-receipt');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-thermal-receipt');
  }, 1000);
}

export default function ThermalReceipt({
  type,
  receiptNumber,
  createdAt,
  cashierName = 'Cashier',
  customerName,
  studentIdNumber,
  paymentMethod = 'cash',
  items = [],
  totalAmount,
  amountTendered,
  changeAmount = 0,
  previousBalance,
  newBalance,
  showPrintButton = true,
}: ThermalReceiptProps) {
  const timestamp = createdAt ?? new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* 58mm Receipt Ticket Container */}
      <div
        id="thermal-receipt-print-area"
        className="w-full max-w-[340px] bg-white border border-slate-300 rounded-xl p-4 shadow-inner font-mono text-[11px] leading-tight text-black text-left select-all"
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        {/* Header */}
        <div className="text-center space-y-0.5">
          <p className="font-bold text-xs uppercase tracking-tight">
            SAINT THERESA COLLEGE OF TANDAG, INC.
          </p>
          <p className="text-[10px] uppercase font-bold text-slate-800">
            Canteen Point of Sale & Inventory
          </p>
          <p className="text-[9px] text-slate-600">
            Quezon St., Tandag City, Surigao del Sur
          </p>
          <p className="text-[9px] text-slate-600">
            TIN: 001-234-567-000 Non-VAT
          </p>
        </div>

        <div className="my-2 border-t border-dashed border-black" />

        {/* Receipt Document Title */}
        <div className="text-center font-bold text-xs tracking-wider uppercase">
          {type === 'sale' ? 'OFFICIAL CANTEEN RECEIPT' : 'RFID RELOAD RECEIPT'}
        </div>

        <div className="my-1.5 border-t border-dashed border-black" />

        {/* Transaction Metadata */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span className="text-slate-600">Ref / Rcpt No:</span>
            <span className="font-bold text-black">{receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Date & Time:</span>
            <span>{timestamp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Cashier:</span>
            <span className="font-semibold">{cashierName}</span>
          </div>
          {customerName && (
            <div className="flex justify-between">
              <span className="text-slate-600">Customer:</span>
              <span className="font-bold">{customerName}</span>
            </div>
          )}
          {studentIdNumber && (
            <div className="flex justify-between">
              <span className="text-slate-600">Student ID:</span>
              <span>{studentIdNumber}</span>
            </div>
          )}
        </div>

        <div className="my-2 border-t border-dashed border-black" />

        {/* Sales Itemized Section */}
        {type === 'sale' && (
          <>
            <div className="grid grid-cols-12 text-[10px] font-bold pb-1 border-b border-black">
              <span className="col-span-6">ITEM</span>
              <span className="col-span-2 text-center">QTY</span>
              <span className="col-span-4 text-right">PRICE</span>
            </div>

            <div className="py-1 space-y-1 text-[10px]">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12">
                  <span className="col-span-6 truncate font-medium">{item.name}</span>
                  <span className="col-span-2 text-center">{item.quantity}</span>
                  <span className="col-span-4 text-right">{formatMoney(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="my-1.5 border-t border-dashed border-black" />
          </>
        )}

        {/* Financial Totals */}
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between text-xs font-bold pt-0.5">
            <span>TOTAL AMOUNT:</span>
            <span>{formatMoney(totalAmount)}</span>
          </div>

          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="uppercase font-bold">
              {paymentMethod === 'cashless' ? 'RFID CASHLESS' : 'CASH'}
            </span>
          </div>

          {amountTendered !== undefined && (
            <div className="flex justify-between">
              <span>Amount Tendered:</span>
              <span>{formatMoney(amountTendered)}</span>
            </div>
          )}

          {changeAmount > 0 && (
            <div className="flex justify-between font-bold">
              <span>Change Due:</span>
              <span>{formatMoney(changeAmount)}</span>
            </div>
          )}
        </div>

        {/* RFID Card Ledger Details */}
        {(previousBalance !== undefined || newBalance !== undefined) && (
          <>
            <div className="my-2 border-t border-dashed border-black" />
            <div className="space-y-0.5 text-[10px] bg-slate-50 p-1.5 border border-slate-200 rounded">
              <div className="text-center font-bold text-[9px] uppercase pb-0.5 border-b border-slate-300">
                [ STUDENT RFID CARD BALANCE ]
              </div>
              {previousBalance !== undefined && (
                <div className="flex justify-between pt-0.5">
                  <span>Previous Balance:</span>
                  <span>{formatMoney(previousBalance)}</span>
                </div>
              )}
              {type === 'sale' ? (
                <div className="flex justify-between font-bold">
                  <span>Deduction:</span>
                  <span>-{formatMoney(totalAmount)}</span>
                </div>
              ) : (
                <div className="flex justify-between font-bold">
                  <span>Cash Reloaded:</span>
                  <span>+{formatMoney(totalAmount)}</span>
                </div>
              )}
              {newBalance !== undefined && (
                <div className="flex justify-between font-black text-[11px] pt-0.5 border-t border-slate-300">
                  <span>New Balance:</span>
                  <span>{formatMoney(newBalance)}</span>
                </div>
              )}
            </div>
          </>
        )}

        <div className="my-2 border-t border-dashed border-black" />

        {/* Footer */}
        <div className="text-center space-y-0.5 text-[9px] text-slate-700">
          <p className="font-bold">Thank you for dining at STCT Canteen!</p>
          <p>Please keep this receipt for your records.</p>
          <p className="text-[8px] text-slate-500 italic pt-1">
            * RJ11 Cash Drawer Kick Triggered *
          </p>
        </div>
      </div>

      {/* Screen Action Button */}
      {showPrintButton && (
        <div className="mt-3 w-full flex justify-center">
          <Button
            type="button"
            onClick={printThermalReceipt}
            className="w-full bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <Printer size={16} />
            <span>Print Thermal Receipt (58mm)</span>
          </Button>
        </div>
      )}
    </div>
  );
}
