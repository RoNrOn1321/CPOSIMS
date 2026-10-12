import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/Components/ui/dialog';
import { formatMoney } from '@/lib/formatters';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Terminal, 
  Receipt, 
  Layers, 
  Eye, 
  ArrowUpDown,
  FileText
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  category: 'POS Sales' | 'Inventory' | 'RFID Top-Up' | 'Limits & Safeguards' | 'System & Auth';
  action: string;
  actor: string;
  target: string;
  terminalIp: string;
  severity: 'success' | 'warning' | 'critical';
  details: {
    referenceNo?: string;
    amount?: number;
    beforeState?: string;
    afterState?: string;
    deviceHash?: string;
  };
}

const sampleAuditLogs: AuditLog[] = [
  {
    id: 'AUD-9941',
    timestamp: 'Today, 12:15:22 PM',
    category: 'POS Sales',
    action: 'Canteen Order Debited',
    actor: 'Cashier Maria Santos (Terminal #01)',
    target: 'Juan Dela Cruz (RFID: RF-882194)',
    terminalIp: 'Terminal #01 (192.168.1.101)',
    severity: 'success',
    details: {
      referenceNo: 'ORD-1248',
      amount: 40.0,
      beforeState: 'Card Balance: ₱490.00',
      afterState: 'Card Balance: ₱450.00',
      deviceHash: 'SHA256-88F3A199BC',
    },
  },
  {
    id: 'AUD-9938',
    timestamp: 'Today, 11:45:10 AM',
    category: 'Inventory',
    action: 'Stock Restocked (+20 pcs)',
    actor: 'Admin User',
    target: 'Chicken Adobo Rice Bowl (STCT-MEAL-001)',
    terminalIp: 'Admin Console (192.168.1.10)',
    severity: 'success',
    details: {
      beforeState: 'Stock: 4 portions',
      afterState: 'Stock: 24 portions',
      referenceNo: 'RESTOCK-BATCH-08',
    },
  },
  {
    id: 'AUD-9925',
    timestamp: 'Today, 10:30:15 AM',
    category: 'RFID Top-Up',
    action: 'Online Parent Reload Verified',
    actor: 'Mrs. Elena Dela Cruz (via GCash)',
    target: 'Juan Dela Cruz (Card UID: RF-882194)',
    terminalIp: 'GCash Webhook Gateway',
    severity: 'success',
    details: {
      referenceNo: 'GCASH-REF-992019',
      amount: 200.0,
      beforeState: 'Card Balance: ₱250.00',
      afterState: 'Card Balance: ₱450.00',
    },
  },
  {
    id: 'AUD-9912',
    timestamp: 'Today, 09:55:04 AM',
    category: 'Limits & Safeguards',
    action: 'Elementary Daily Limit Flagged',
    actor: 'CPOSIMS Enforcement Engine',
    target: 'Juan Dela Cruz (Grade 6)',
    terminalIp: 'Terminal #01 (192.168.1.101)',
    severity: 'warning',
    details: {
      referenceNo: 'LIMIT-EXCEED-WARN',
      amount: 145.0,
      beforeState: 'Daily Cap: ₱120.00',
      afterState: 'Attempted Total: ₱145.00 (Cashier Prompted)',
    },
  },
  {
    id: 'AUD-9890',
    timestamp: 'Today, 07:02:18 AM',
    category: 'System & Auth',
    action: 'Terminal Register Shift Opened',
    actor: 'Cashier Maria Santos',
    target: 'Terminal #01 Cash Drawer',
    terminalIp: 'Terminal #01 (192.168.1.101)',
    severity: 'success',
    details: {
      referenceNo: 'SHIFT-AM-OPEN',
      amount: 1500.0, // Initial cash drawer float
      beforeState: 'Drawer: Closed',
      afterState: 'Opening Float: ₱1,500.00',
      deviceHash: 'POS-STCT-SN8921',
    },
  },
  {
    id: 'AUD-9875',
    timestamp: 'Yesterday, 04:30:00 PM',
    category: 'System & Auth',
    action: 'Terminal Register Shift Closed',
    actor: 'Cashier John Doe',
    target: 'Terminal #02 Cash Drawer',
    terminalIp: 'Terminal #02 (192.168.1.102)',
    severity: 'success',
    details: {
      referenceNo: 'SHIFT-PM-CLOSE',
      amount: 18450.0,
      beforeState: 'Active Shift',
      afterState: 'Gross End Cash: ₱18,450.00 (Reconciled)',
    },
  },
  {
    id: 'AUD-9860',
    timestamp: 'Yesterday, 02:14:50 PM',
    category: 'Limits & Safeguards',
    action: 'Allergen Guard Intercepted Soda',
    actor: 'CPOSIMS Nutrition Safeguard',
    target: 'Maria Clara Santos (Grade 10)',
    terminalIp: 'Terminal #01 (192.168.1.101)',
    severity: 'warning',
    details: {
      referenceNo: 'NUTRITION-BLOCK-SODA',
      beforeState: 'Item: Carbonated Drink',
      afterState: 'POS Action: Item Blocked by Parent Directive',
    },
  },
  {
    id: 'AUD-9844',
    timestamp: 'Yesterday, 01:20:11 PM',
    category: 'Inventory',
    action: 'Unit Price Modified',
    actor: 'Admin User',
    target: 'Beef Tapa with Egg & Garlic Rice',
    terminalIp: 'Admin Console (192.168.1.10)',
    severity: 'success',
    details: {
      beforeState: 'Price: ₱80.00',
      afterState: 'Price: ₱85.00',
      referenceNo: 'PRICE-REVISE-04',
    },
  },
];

export default function AuditLogsIndex() {
  const [logs, setLogs] = useState<AuditLog[]>(sampleAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [inspectedLog, setInspectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.terminalIp.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'All' || log.category === selectedCategory;
      const matchesSev = selectedSeverity === 'All' || log.severity === selectedSeverity;

      return matchesSearch && matchesCat && matchesSev;
    });
  }, [logs, searchTerm, selectedCategory, selectedSeverity]);

  return (
    <AdminLayout portal="admin" activeNav="audit">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Strict Transaction & System Audit Trail
            </h1>
            <Badge className="bg-[#5c1516] text-white font-extrabold text-[10px]">
              Read-Only
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable forensic logging for all POS card debits, stock movements, and security authentications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => alert('Exporting audit log CSV...')}
            className="h-10 text-xs font-bold border-slate-200"
          >
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => alert('Opening printable audit journal...')}
            className="h-10 text-xs font-bold border-slate-200"
          >
            <Printer size={14} className="mr-1.5" /> Print Journal
          </Button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Events Logged
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#008dd5] flex items-center justify-center">
                <FileText size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              1,482
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              100% verification rate &bull; 0 data discrepancies
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Sales & RFID Charges
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Receipt size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-emerald-700 tracking-tight mt-1">
              {formatMoney(34580.0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Reconciled across 2 active canteen terminals.
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Inventory Adjustments
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#d38c28] flex items-center justify-center">
                <Layers size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              8 Batches
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Recorded restocking & waste write-offs.
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Security Violations
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-emerald-700 tracking-tight mt-1">
              0 Breaches
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              All register sessions authenticated.
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Data Grid */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white overflow-hidden">
        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search actor, action, student, RFID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs bg-white rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['All', 'POS Sales', 'Inventory', 'RFID Top-Up', 'Limits & Safeguards', 'System & Auth'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#5c1516] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Read-Only Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-700 py-3.5">Log ID & Time</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Category</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Action & Event</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Operator / Actor</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Target Affected</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Terminal / Source</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right">Inspect</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-slate-400 text-xs">
                    No audit records match your search parameters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map(log => {
                  const isSuccess = log.severity === 'success';
                  const isWarn = log.severity === 'warning';
                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="py-3.5">
                        <div className="font-mono text-xs font-bold text-slate-800">{log.id}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{log.timestamp}</div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-slate-50 text-slate-700">
                          {log.category}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isSuccess ? 'bg-emerald-500' : isWarn ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="font-extrabold text-xs text-slate-800">{log.action}</span>
                        </div>
                        {log.details.amount && (
                          <div className="text-[11px] font-bold text-[#5c1516] mt-0.5">
                            Amount: {formatMoney(log.details.amount)}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-xs font-medium text-slate-700">
                        {log.actor}
                      </TableCell>

                      <TableCell className="text-xs text-slate-600 font-medium">
                        {log.target}
                      </TableCell>

                      <TableCell className="text-[11px] font-mono text-slate-500">
                        {log.terminalIp}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectedLog(log)}
                          className="h-8 px-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                          <Eye size={13} className="mr-1 text-slate-400" /> Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Showing {filteredLogs.length} audit entries</span>
          <span>Cryptographically chained journal &bull; Hash verification valid</span>
        </div>
      </Card>

      {/* Forensic Inspection Dialog */}
      <Dialog open={!!inspectedLog} onOpenChange={() => setInspectedLog(null)}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          {inspectedLog && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-slate-100 text-slate-800 border-0 font-mono text-xs">
                    {inspectedLog.id}
                  </Badge>
                  <Badge className={inspectedLog.severity === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                    {inspectedLog.severity.toUpperCase()}
                  </Badge>
                </div>
                <DialogTitle className="text-base font-extrabold text-slate-800 pt-1">
                  {inspectedLog.action}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Logged on {inspectedLog.timestamp} from {inspectedLog.terminalIp}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <strong className="text-slate-800">{inspectedLog.category}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operator / Actor:</span>
                    <strong className="text-slate-800">{inspectedLog.actor}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Affected:</span>
                    <strong className="text-slate-800">{inspectedLog.target}</strong>
                  </div>
                  {inspectedLog.details.referenceNo && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reference Token:</span>
                      <strong className="font-mono text-slate-800">{inspectedLog.details.referenceNo}</strong>
                    </div>
                  )}
                </div>

                {/* State Transition Diff */}
                {(inspectedLog.details.beforeState || inspectedLog.details.afterState) && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Audit State Transition:
                    </label>
                    <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                      {inspectedLog.details.beforeState && (
                        <div className="text-red-400">
                          - [PREV]: {inspectedLog.details.beforeState}
                        </div>
                      )}
                      {inspectedLog.details.afterState && (
                        <div className="text-emerald-400">
                          + [POST]: {inspectedLog.details.afterState}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  size="sm" 
                  onClick={() => setInspectedLog(null)}
                  className="w-full h-9 bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-bold rounded-xl"
                >
                  Close Inspection
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
