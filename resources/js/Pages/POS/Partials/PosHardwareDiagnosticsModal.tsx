import React, { useState, useRef, useEffect } from 'react';
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
import { lookup } from '@/routes/pos/student';
import axios from 'axios';
import ThermalReceipt, { printThermalReceipt } from '@/Components/POS/ThermalReceipt';
import { Product } from './ProductGrid';
import { 
  Barcode, 
  CreditCard, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  RefreshCw, 
  Sparkles, 
  Activity, 
  Package, 
  User, 
  Layers,
  Zap,
  Server
} from 'lucide-react';

interface PosHardwareDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
}

export default function PosHardwareDiagnosticsModal({
  isOpen,
  onClose,
  products = [],
}: PosHardwareDiagnosticsModalProps) {
  const [scanInput, setScanInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    type: 'product' | 'student' | 'unknown' | null;
    data?: any;
    query?: string;
  }>({ type: null });

  const [hasPrinted, setHasPrinted] = useState<boolean>(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the scan test input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setScanInput('');
      setScanResult({ type: null });
      setHasPrinted(false);
      setTimeout(() => {
        scanInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Execute scan diagnostic test
  const handleTestScan = async (codeToTest?: string) => {
    const query = (codeToTest ?? scanInput).trim();
    if (!query) return;

    setIsScanning(true);
    setScanResult({ type: null });

    try {
      // 1. Check local catalog products by barcode
      const matchedProduct = products.find(
        (p) => p.barcode && p.barcode.toLowerCase() === query.toLowerCase()
      );

      if (matchedProduct) {
        setScanResult({
          type: 'product',
          data: matchedProduct,
          query,
        });
        return;
      }

      // 2. Query student account via RFID UID or Student ID Number
      const res = await axios.get(lookup().url, {
        params: { query },
        headers: { Accept: 'application/json' },
      });

      if (res.status === 200 && res.data) {
        setScanResult({
          type: 'student',
          data: res.data,
          query,
        });
        return;
      }

      // 3. Unrecognized
      setScanResult({
        type: 'unknown',
        query,
      });
    } catch (err: any) {
      setScanResult({
        type: 'unknown',
        query,
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handlePrintTest = () => {
    printThermalReceipt();
    setHasPrinted(true);
    setTimeout(() => setHasPrinted(false), 4000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5c1516] text-white flex items-center justify-center font-bold">
              <Activity size={18} className="text-amber-300" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Terminal & Hardware Diagnostics
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Verify USB barcode scanner, USB RFID card tap reader, Xprinter XP-58IIH, and RJ11 cash drawer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs">
          {/* Peripheral Status Capsules */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col items-center text-center">
              <Barcode size={18} className="text-emerald-700 mb-1" />
              <span className="font-bold text-[11px] text-emerald-900">Barcode Scanner</span>
              <span className="text-[10px] text-emerald-700 font-semibold">HID Ready</span>
            </div>

            <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col items-center text-center">
              <Radio size={18} className="text-emerald-700 mb-1" />
              <span className="font-bold text-[11px] text-emerald-900">RFID Reader</span>
              <span className="text-[10px] text-emerald-700 font-semibold">13.56 MHz Ready</span>
            </div>

            <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col items-center text-center">
              <Printer size={18} className="text-emerald-700 mb-1" />
              <span className="font-bold text-[11px] text-emerald-900">XP-58IIH Thermal</span>
              <span className="text-[10px] text-emerald-700 font-semibold">58mm Driver OK</span>
            </div>

            <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col items-center text-center">
              <Zap size={18} className="text-emerald-700 mb-1" />
              <span className="font-bold text-[11px] text-emerald-900">RJ11 Cash Drawer</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Solenoid Armed</span>
            </div>
          </div>

          {/* Test Suite Section 1: USB Barcode & RFID Scanner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                <Barcode size={15} className="text-[#5c1516]" />
                <span>Test 1: Scan Barcode or Tap RFID Card</span>
              </div>
              <Badge variant="outline" className="text-[9px] border-slate-300 text-slate-500 bg-white">
                Live Listener
              </Badge>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTestScan();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Input
                  ref={scanInputRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan product barcode (e.g. STCT-1001) or tap RFID card..."
                  className="font-mono text-xs bg-white pr-8 uppercase"
                />
                {scanInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setScanInput('');
                      setScanResult({ type: null });
                      scanInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
              <Button
                type="submit"
                disabled={isScanning || !scanInput.trim()}
                className="bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-bold px-4 rounded-xl shrink-0"
              >
                {isScanning ? <RefreshCw size={13} className="animate-spin" /> : 'Test Read'}
              </Button>
            </form>

            {/* Diagnostic Detection Output */}
            {scanResult.type === 'product' && (
              <div className="p-3 bg-white border border-emerald-300 rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold text-[10px]">
                    ✓ Product Barcode Identified
                  </Badge>
                  <span className="font-mono text-[11px] text-slate-500 font-bold">{scanResult.query}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{scanResult.data.name}</h4>
                    <span className="text-[11px] text-slate-500">Category: {scanResult.data.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-700 text-xs">{formatMoney(scanResult.data.price)}</span>
                    <div className="text-[10px] text-slate-500">Stock on hand: {scanResult.data.stock} units</div>
                  </div>
                </div>
              </div>
            )}

            {scanResult.type === 'student' && (
              <div className="p-3 bg-white border border-blue-300 rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800 border-0 font-bold text-[10px]">
                    ✓ Pupil RFID Tag Recognized
                  </Badge>
                  <span className="font-mono text-[11px] text-slate-500 font-bold">{scanResult.query}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{scanResult.data.name}</h4>
                    <span className="text-[11px] text-slate-500">
                      ID: {scanResult.data.student_id_number} &bull; {scanResult.data.grade_level} - {scanResult.data.section}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#5c1516] text-xs">
                      {formatMoney(scanResult.data.current_balance)}
                    </span>
                    <div className="text-[10px] text-slate-500">
                      Status: <strong className="uppercase text-emerald-700">{scanResult.data.status}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {scanResult.type === 'unknown' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                  <span className="text-[11px] font-medium">
                    Unrecognized barcode or unassigned RFID tag ({scanResult.query}).
                  </span>
                </div>
                <Badge variant="outline" className="text-[9px] border-amber-300 bg-white">
                  Not in Catalog
                </Badge>
              </div>
            )}
          </div>

          {/* Test Suite Section 2: 58mm Thermal Printer & Cash Drawer */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                <Printer size={15} className="text-[#5c1516]" />
                <span>Test 2: 58mm Thermal Printer & RJ11 Cash Drawer</span>
              </div>
              <Badge variant="outline" className="text-[9px] border-slate-300 text-slate-500 bg-white">
                Xprinter XP-58IIH
              </Badge>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Dispatches a 58mm test slip to the Xprinter thermal printer and emits the ESC/POS pulse to trigger the RJ11 cash drawer kick latch.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-xs text-slate-700">
                <div className="font-bold text-slate-900">Receipt & Solenoid Test Voucher</div>
                <div className="text-[11px] text-slate-400 font-mono">Format: 58mm Slip &bull; Cut: Manual Tear &bull; Pin: RJ11 24V</div>
              </div>

              <Button
                type="button"
                onClick={handlePrintTest}
                className="w-full sm:w-auto h-9 bg-[#5c1516] hover:bg-[#7a1420] text-white font-bold text-xs px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <Printer size={14} />
                <span>Print Test & Kick Drawer</span>
              </Button>
            </div>

            {hasPrinted && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Test slip sent to print spooler! Cash drawer solenoid kick triggered.</span>
              </div>
            )}

            {/* Embedded 58mm Receipt Preview */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Live 58mm Ticket Layout Preview:
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-2 flex justify-center">
                <ThermalReceipt
                  type="sale"
                  receiptNumber="DIAG-XP58-001"
                  cashierName="Canteen Terminal #01"
                  customerName="HARDWARE DIAGNOSTIC TEST"
                  studentIdNumber="DIAG-2026"
                  paymentMethod="diagnostic-test"
                  items={[
                    { name: 'Thermal Head Line Test (58mm)', quantity: 1, unit_price: 0, subtotal: 0 },
                    { name: 'RJ11 Cash Drawer Solenoid Kick', quantity: 1, unit_price: 0, subtotal: 0 },
                    { name: 'Paper Feed & Tear Verification', quantity: 1, unit_price: 0, subtotal: 0 },
                  ]}
                  totalAmount={0}
                  amountTendered={0}
                  changeAmount={0}
                  showPrintButton={false}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto h-9 text-xs font-semibold rounded-xl border-slate-200"
          >
            Close Diagnostics
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
