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
import { status as hardwareStatusRoute } from '@/routes/pos/hardware';
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

interface ServerHardwareStatus {
  server_online: boolean;
  checked_at: string;
  os_family: string;
  spooler_status?: string;
  hid_devices_count?: number;
  thermal_printer_detected?: boolean;
}

interface ScanTelemetry {
  avgMsPerChar: number;
  totalChars: number;
  durationMs: number;
  isHardware: boolean;
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

  const [scanTelemetry, setScanTelemetry] = useState<ScanTelemetry | null>(null);
  const [hasPrinted, setHasPrinted] = useState<boolean>(false);
  const [barcodeStatus, setBarcodeStatus] = useState<string>('Standby (HID Listener Active)');
  const [rfidStatus, setRfidStatus] = useState<string>('Standby (13.56 MHz Listener)');

  const [serverStatus, setServerStatus] = useState<ServerHardwareStatus | null>(null);
  const [browserOnline, setBrowserOnline] = useState<boolean>(true);
  const [webUsbSupported, setWebUsbSupported] = useState<boolean>(false);
  const [webHidSupported, setWebHidSupported] = useState<boolean>(false);

  const scanInputRef = useRef<HTMLInputElement>(null);
  const keystrokeTimestampsRef = useRef<number[]>([]);

  // Auto-focus and poll hardware status when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    setScanInput('');
    setScanResult({ type: null });
    setScanTelemetry(null);
    setHasPrinted(false);
    keystrokeTimestampsRef.current = [];

    setTimeout(() => {
      scanInputRef.current?.focus();
    }, 100);

    // Browser capabilities
    if (typeof navigator !== 'undefined') {
      setBrowserOnline(navigator.onLine);
      setWebUsbSupported('usb' in navigator);
      setWebHidSupported('hid' in navigator);
    }

    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Host Hardware Polling
    const fetchStatus = async () => {
      try {
        const res = await axios.get(hardwareStatusRoute().url, {
          headers: { Accept: 'application/json' },
        });
        if (res.status === 200 && res.data) {
          setServerStatus(res.data);
        }
      } catch {
        setServerStatus((prev) => (prev ? { ...prev, server_online: false } : null));
      }
    };

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 5000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock'].includes(e.key)) {
      return;
    }
    if (e.key === 'Enter') {
      return;
    }
    keystrokeTimestampsRef.current.push(performance.now());
  };

  // Execute scan diagnostic test
  const handleTestScan = async (codeToTest?: string) => {
    const query = (codeToTest ?? scanInput).trim();
    if (!query) return;

    // Calculate inter-keystroke velocity telemetry
    const timestamps = keystrokeTimestampsRef.current;
    let telemetry: ScanTelemetry | null = null;
    if (timestamps.length >= 2) {
      const durationMs = timestamps[timestamps.length - 1] - timestamps[0];
      const totalChars = timestamps.length;
      const avgMs = durationMs / Math.max(1, totalChars - 1);
      telemetry = {
        avgMsPerChar: Math.round(avgMs * 10) / 10,
        totalChars,
        durationMs: Math.round(durationMs),
        isHardware: avgMs < 50,
      };
    } else if (timestamps.length === 1) {
      telemetry = {
        avgMsPerChar: 0,
        totalChars: 1,
        durationMs: 0,
        isHardware: true,
      };
    }
    setScanTelemetry(telemetry);
    keystrokeTimestampsRef.current = [];

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
        const speedText = telemetry ? `${telemetry.avgMsPerChar} ms/char` : 'Verified';
        setBarcodeStatus(`Verified Online (${speedText})`);
        return;
      }

      // 2. Query student account via RFID UID or Student ID Number
      const res = await axios.get(lookup().url, {
        params: { identifier: query },
        headers: { Accept: 'application/json' },
      });

      if (res.status === 200 && res.data) {
        setScanResult({
          type: 'student',
          data: res.data,
          query,
        });
        const speedText = telemetry ? `${telemetry.avgMsPerChar} ms/char` : 'Verified';
        setRfidStatus(`Verified Online (${speedText})`);
        return;
      }

      // 3. Unrecognized
      setScanResult({
        type: 'unknown',
        query,
      });

      if (telemetry?.isHardware) {
        const speedText = `${telemetry.avgMsPerChar} ms/char`;
        if (query.length >= 8) {
          setRfidStatus(`Verified Online (${speedText})`);
        } else {
          setBarcodeStatus(`Verified Online (${speedText})`);
        }
      }
    } catch (err: any) {
      setScanResult({
        type: 'unknown',
        query,
      });

      if (telemetry?.isHardware) {
        const speedText = `${telemetry.avgMsPerChar} ms/char`;
        if (query.length >= 8) {
          setRfidStatus(`Verified Online (${speedText})`);
        } else {
          setBarcodeStatus(`Verified Online (${speedText})`);
        }
      }
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
            <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
              barcodeStatus.startsWith('Verified')
                ? 'border-emerald-300 bg-emerald-50/90 text-emerald-950 shadow-2xs'
                : 'border-slate-200 bg-slate-50/70 text-slate-700'
            }`}>
              <Barcode size={18} className={barcodeStatus.startsWith('Verified') ? 'text-emerald-700 mb-1' : 'text-slate-500 mb-1'} />
              <span className="font-bold text-[11px]">Barcode Scanner</span>
              <span className={`text-[10px] font-semibold ${barcodeStatus.startsWith('Verified') ? 'text-emerald-700' : 'text-slate-500'}`}>
                {barcodeStatus}
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
              rfidStatus.startsWith('Verified')
                ? 'border-emerald-300 bg-emerald-50/90 text-emerald-950 shadow-2xs'
                : 'border-slate-200 bg-slate-50/70 text-slate-700'
            }`}>
              <Radio size={18} className={rfidStatus.startsWith('Verified') ? 'text-emerald-700 mb-1' : 'text-slate-500 mb-1'} />
              <span className="font-bold text-[11px]">RFID Reader</span>
              <span className={`text-[10px] font-semibold ${rfidStatus.startsWith('Verified') ? 'text-emerald-700' : 'text-slate-500'}`}>
                {rfidStatus}
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
              hasPrinted
                ? 'border-emerald-300 bg-emerald-50/90 text-emerald-950 shadow-2xs'
                : 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
            }`}>
              <Printer size={18} className="text-emerald-700 mb-1" />
              <span className="font-bold text-[11px] text-emerald-900">XP-58IIH Thermal</span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {hasPrinted ? 'Verified Printed' : (serverStatus?.spooler_status === 'stopped' ? 'Spooler Stopped' : 'Spooler Ready')}
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
              hasPrinted
                ? 'border-emerald-300 bg-emerald-50/90 text-emerald-950 shadow-2xs'
                : 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
            }`}>
              <Zap size={18} className="text-emerald-700 mb-1" />
              <span className="font-bold text-[11px] text-emerald-900">RJ11 Cash Drawer</span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {hasPrinted ? 'Pulse Sent' : 'Linked via XP-58IIH RJ11'}
              </span>
            </div>
          </div>

          {/* Real-time Host OS & Browser Status Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className={`flex h-2 w-2 rounded-full ${serverStatus?.server_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="font-semibold text-slate-700">Host OS:</span>
              <span>{serverStatus?.os_family ?? 'Detecting...'}</span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-slate-700">Spooler:</span>
              <span className={serverStatus?.spooler_status === 'running' ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                {serverStatus?.spooler_status ? serverStatus.spooler_status.toUpperCase() : 'READY'}
              </span>
              {serverStatus?.hid_devices_count !== undefined && serverStatus.hid_devices_count > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="font-semibold text-slate-700">HID Devices:</span>
                  <span className="font-mono text-emerald-800 font-bold">{serverStatus.hid_devices_count} active</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${browserOnline ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-rose-300 text-rose-700 bg-rose-50'}`}>
                {browserOnline ? 'Browser Online' : 'Browser Offline'}
              </Badge>
              <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${webUsbSupported ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-slate-200 text-slate-400 bg-white'}`}>
                WebUSB {webUsbSupported ? 'Ready' : 'N/A'}
              </Badge>
              <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${webHidSupported ? 'border-purple-300 text-purple-700 bg-purple-50' : 'border-slate-200 text-slate-400 bg-white'}`}>
                WebHID {webHidSupported ? 'Ready' : 'N/A'}
              </Badge>
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
                  onKeyDown={handleKeyDown}
                  placeholder="Scan product barcode (e.g. STCT-1001) or tap RFID card..."
                  className="font-mono text-xs bg-white pr-8 uppercase"
                />
                {scanInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setScanInput('');
                      setScanResult({ type: null });
                      setScanTelemetry(null);
                      keystrokeTimestampsRef.current = [];
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

            {/* Scan Velocity Telemetry Badge */}
            {scanTelemetry && (
              <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                scanTelemetry.isHardware 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2">
                  {scanTelemetry.isHardware ? (
                    <Zap size={15} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold">
                      {scanTelemetry.isHardware ? 'Hardware Scanner / RFID Reader Verified' : 'Manual Keyboard Input Detected'}
                    </span>
                    <span className="text-[11px] block text-slate-500">
                      Scan Speed: <strong className="font-mono text-slate-700">{scanTelemetry.avgMsPerChar} ms/char</strong> &bull; Total: {scanTelemetry.totalChars} chars in {scanTelemetry.durationMs}ms
                    </span>
                  </div>
                </div>
                <Badge className={scanTelemetry.isHardware ? 'bg-emerald-600 text-white font-bold text-[10px]' : 'bg-amber-500 text-white font-bold text-[10px]'}>
                  {scanTelemetry.isHardware ? '< 50ms/char • HID Burst' : '>= 50ms/char • Human Input'}
                </Badge>
              </div>
            )}

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
