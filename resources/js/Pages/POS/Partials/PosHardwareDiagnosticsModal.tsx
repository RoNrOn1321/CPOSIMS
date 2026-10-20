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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import { formatMoney } from '@/lib/formatters';
import { lookupStudent } from '@/actions/App/Http/Controllers/PosController';
import axios from 'axios';
import { printThermalReceipt } from '@/Components/POS/ThermalReceipt';
import { Product } from './ProductGrid';
import { toast } from '@/Hooks/use-toast';
import { 
  Settings, 
  Printer, 
  Barcode, 
  Radio, 
  Store, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Sliders, 
  FileText, 
  HelpCircle,
  Check,
  RotateCcw
} from 'lucide-react';

interface PosHardwareDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
}

interface ScanTelemetry {
  avgMsPerChar: number;
  totalChars: number;
  durationMs: number;
  isHardware: boolean;
}

export const TERMINAL_SETTINGS_STORAGE_KEY = 'cposims_terminal_settings';

export interface TerminalSettings {
  terminalName: string;
  canteenLocation: string;
  receiptWidth: '58mm' | '80mm';
  receiptFooter: string;
  autoPrintOnCheckout: boolean;
  printEngine: 'browser' | 'escpos';
}

export const defaultTerminalSettings: TerminalSettings = {
  terminalName: 'Terminal #01',
  canteenLocation: 'Senior High / College Canteen',
  receiptWidth: '58mm',
  receiptFooter: 'Thank you for dining at STCT Canteen!',
  autoPrintOnCheckout: false,
  printEngine: 'browser',
};

export function getSavedTerminalSettings(): TerminalSettings {
  if (typeof window === 'undefined') return defaultTerminalSettings;
  try {
    const raw = localStorage.getItem(TERMINAL_SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...defaultTerminalSettings, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore JSON errors
  }
  return defaultTerminalSettings;
}

export default function PosHardwareDiagnosticsModal({
  isOpen,
  onClose,
  products = [],
}: PosHardwareDiagnosticsModalProps) {
  const [activeTab, setActiveTab] = useState<string>('station');

  // Terminal Settings State
  const [settings, setSettings] = useState<TerminalSettings>(defaultTerminalSettings);

  // Scanner Sandbox State
  const [scanInput, setScanInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    type: 'product' | 'student' | 'unknown' | null;
    data?: any;
    query?: string;
  }>({ type: null });
  const [scanTelemetry, setScanTelemetry] = useState<ScanTelemetry | null>(null);

  // Print Test State
  const [isTestPrinting, setIsTestPrinting] = useState<boolean>(false);
  const [testPrintSuccess, setTestPrintSuccess] = useState<boolean>(false);

  const scanInputRef = useRef<HTMLInputElement>(null);
  const keystrokeTimestampsRef = useRef<number[]>([]);

  // Load settings from localStorage when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    setSettings(getSavedTerminalSettings());
    setScanInput('');
    setScanResult({ type: null });
    setScanTelemetry(null);
    setTestPrintSuccess(false);
    keystrokeTimestampsRef.current = [];
  }, [isOpen]);

  // Focus tester input when switching to input tab
  useEffect(() => {
    if (activeTab === 'input') {
      setTimeout(() => {
        scanInputRef.current?.focus();
      }, 150);
    }
  }, [activeTab]);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(TERMINAL_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      toast.success('Terminal preferences saved successfully.');
      onClose();
    } catch {
      toast.error('Unable to save settings to local storage.');
    }
  };

  const handleResetSettings = () => {
    setSettings(defaultTerminalSettings);
    localStorage.removeItem(TERMINAL_SETTINGS_STORAGE_KEY);
    toast.info('Terminal settings reset to default.');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock'].includes(e.key)) {
      return;
    }
    if (e.key === 'Enter') {
      return;
    }
    keystrokeTimestampsRef.current.push(performance.now());
  };

  // Test read scanner / RFID in sandbox
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
        isHardware: avgMs < 60,
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
        return;
      }

      // 2. Query student account via RFID UID or Student ID Number
      const res = await axios.get(lookupStudent.url(), {
        params: { identifier: query },
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
    } catch {
      setScanResult({
        type: 'unknown',
        query,
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleExecutePrintTest = async () => {
    setIsTestPrinting(true);
    try {
      await printThermalReceipt({
        type: 'diagnostic',
        receipt_number: `TEST-${Date.now().toString().slice(-4)}`,
        created_at: new Date().toLocaleString(),
        cashier_name: 'Canteen Staff',
        customer_name: 'Printer Alignment Test',
        payment_method: 'test',
        items: [
          { name: '58mm Alignment Test', quantity: 1, unit_price: 0, subtotal: 0 },
          { name: 'Feed & Header Line Test', quantity: 1, unit_price: 0, subtotal: 0 },
        ],
        total_amount: 0,
        kick_drawer: false,
      });
      setTestPrintSuccess(true);
      setTimeout(() => setTestPrintSuccess(false), 4000);
    } finally {
      setIsTestPrinting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px] rounded-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 pr-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5c1516]/10 text-[#5c1516] flex items-center justify-center font-bold">
              <Settings size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Terminal & Station Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Configure station identity, receipt printing preferences, and test scanner inputs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-slate-100/80 p-1 rounded-xl">
              <TabsTrigger 
                value="station"
                className="rounded-lg text-xs font-semibold py-2 data-[active=true]:bg-white data-[active=true]:text-[#5c1516] data-[active=true]:shadow-xs"
              >
                <Store size={14} className="mr-1.5" />
                Station Info
              </TabsTrigger>
              <TabsTrigger 
                value="receipt"
                className="rounded-lg text-xs font-semibold py-2 data-[active=true]:bg-white data-[active=true]:text-[#5c1516] data-[active=true]:shadow-xs"
              >
                <Printer size={14} className="mr-1.5" />
                Receipt & Printing
              </TabsTrigger>
              <TabsTrigger 
                value="input"
                className="rounded-lg text-xs font-semibold py-2 data-[active=true]:bg-white data-[active=true]:text-[#5c1516] data-[active=true]:shadow-xs"
              >
                <Barcode size={14} className="mr-1.5" />
                Scanner Sandbox
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Station Info */}
            <TabsContent value="station" className="space-y-4 pt-3 focus:outline-none">
              <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Terminal Identifier
                  </label>
                  <Input
                    type="text"
                    value={settings.terminalName}
                    onChange={(e) => setSettings({ ...settings, terminalName: e.target.value })}
                    placeholder="e.g. Terminal #01"
                    className="h-9 text-xs rounded-xl bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Displayed on printed sales vouchers and transaction audit records.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Canteen Station / Location
                  </label>
                  <Input
                    type="text"
                    value={settings.canteenLocation}
                    onChange={(e) => setSettings({ ...settings, canteenLocation: e.target.value })}
                    placeholder="e.g. Senior High / College Canteen"
                    className="h-9 text-xs rounded-xl bg-white"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-700 block">Organization</span>
                    <span className="text-[11px]">Saint Theresa College of Tandag, Inc.</span>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                    Station Active
                  </Badge>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Receipt & Printing */}
            <TabsContent value="receipt" className="space-y-4 pt-3 focus:outline-none">
              <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Thermal Paper Width
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, receiptWidth: '58mm' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.receiptWidth === '58mm'
                          ? 'border-[#5c1516] bg-red-50/40 text-slate-900 ring-1 ring-[#5c1516]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">58mm (XP-58 / Standard)</span>
                        {settings.receiptWidth === '58mm' && <Check size={14} className="text-[#5c1516]" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Standard compact canteen receipt roll.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, receiptWidth: '80mm' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.receiptWidth === '80mm'
                          ? 'border-[#5c1516] bg-red-50/40 text-slate-900 ring-1 ring-[#5c1516]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">80mm (Wide POS)</span>
                        {settings.receiptWidth === '80mm' && <Check size={14} className="text-[#5c1516]" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Wide receipt layout with expanded columns.</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receipt Footer Note
                  </label>
                  <Input
                    type="text"
                    value={settings.receiptFooter}
                    onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                    placeholder="e.g. Thank you for dining at STCT Canteen!"
                    className="h-9 text-xs rounded-xl bg-white"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-700 block">Auto-Print Receipt</span>
                    <span className="text-[11px] text-slate-400">Automatically prompt print dialog after checkout.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, autoPrintOnCheckout: !settings.autoPrintOnCheckout })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.autoPrintOnCheckout ? 'bg-[#5c1516]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        settings.autoPrintOnCheckout ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Print Test Action */}
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 block">Receipt Test Voucher</span>
                    <span className="text-[11px]">Send a test print slip to verify paper alignment.</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExecutePrintTest}
                    disabled={isTestPrinting}
                    className="h-8 text-xs font-bold rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 shrink-0"
                  >
                    <Printer size={13} className="mr-1.5" />
                    {isTestPrinting ? 'Printing...' : 'Print Test'}
                  </Button>
                </div>

                {testPrintSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                    <span>Test slip sent to print spooler / browser print dialog.</span>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: Scanner Sandbox */}
            <TabsContent value="input" className="space-y-4 pt-3 focus:outline-none">
              {/* Honest Explanation Card */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                <HelpCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">How USB Scanners & RFID Readers Work:</span>
                  <p className="text-[11px] leading-relaxed text-amber-800/90">
                    USB Barcode scanners and RFID card tap readers connect as standard <strong>USB HID Keyboards</strong>.
                    They do not maintain a permanent serial connection with the browser. When you scan a barcode or tap a card,
                    the hardware rapidly types the string and presses Enter.
                  </p>
                </div>
              </div>

              {/* Live Sandbox Input */}
              <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Interactive Scanner / RFID Test Sandbox
                </label>
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
                      placeholder="Scan a product barcode or tap RFID card to test..."
                      className="font-mono text-xs bg-white pr-8 uppercase h-9 rounded-xl"
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
                    className="bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-bold px-3.5 h-9 rounded-xl shrink-0"
                  >
                    {isScanning ? <RefreshCw size={13} className="animate-spin" /> : 'Test Read'}
                  </Button>
                </form>

                {/* Scan Velocity Telemetry */}
                {scanTelemetry && (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    scanTelemetry.isHardware 
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Zap size={14} className={scanTelemetry.isHardware ? 'text-emerald-600' : 'text-slate-500'} />
                      <div>
                        <span className="font-bold">
                          {scanTelemetry.isHardware ? 'Rapid Hardware Burst (< 60ms/char)' : 'Manual Keyboard Input'}
                        </span>
                        <span className="text-[11px] block text-slate-500">
                          Transmission speed: <strong className="font-mono text-slate-700">{scanTelemetry.avgMsPerChar} ms/char</strong> ({scanTelemetry.totalChars} chars)
                        </span>
                      </div>
                    </div>
                    <Badge className={scanTelemetry.isHardware ? 'bg-emerald-600 text-white font-bold text-[9px]' : 'bg-slate-500 text-white font-bold text-[9px]'}>
                      {scanTelemetry.isHardware ? 'Hardware Scanner' : 'Keyboard'}
                    </Badge>
                  </div>
                )}

                {/* Scan Result Output */}
                {scanResult.type === 'product' && (
                  <div className="p-3 bg-white border border-emerald-300 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold text-[10px]">
                        ✓ Catalog Product Found
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
                        <div className="text-[10px] text-slate-500">Stock: {scanResult.data.stock} units</div>
                      </div>
                    </div>
                  </div>
                )}

                {scanResult.type === 'student' && (
                  <div className="p-3 bg-white border border-blue-300 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-800 border-0 font-bold text-[10px]">
                        ✓ Student RFID Tag Found
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
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                      <span className="text-[11px]">
                        Unrecognized barcode or unregistered RFID tag (<strong>{scanResult.query}</strong>).
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-slate-300 bg-white">
                      Not in Database
                    </Badge>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResetSettings}
            className="text-xs text-slate-500 hover:text-slate-800 h-9 px-3 rounded-xl"
          >
            <RotateCcw size={13} className="mr-1.5" />
            Reset Defaults
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 text-xs font-semibold rounded-xl border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveSettings}
              className="h-9 bg-[#5c1516] hover:bg-[#7a1420] text-white font-bold text-xs px-4 rounded-xl shadow-xs"
            >
              Save Preferences
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
