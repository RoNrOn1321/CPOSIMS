import React, { useState } from 'react';
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
import { router } from '@inertiajs/react';
import { index as auditLogsIndex } from '@/actions/App/Http/Controllers/Admin/AuditLogController';
import { 
  ShieldCheck, 
  Search, 
  Layers, 
  Eye, 
  FileText,
  Activity,
  History
} from 'lucide-react';

export interface InventoryLogItem {
  id: number;
  product_id: number;
  user_id: number;
  action: 'restock' | 'sale' | 'adjustment' | 'void';
  quantity_changed: number;
  previous_stock: number;
  new_stock: number;
  remarks: string | null;
  created_at: string;
  product?: {
    id: number;
    name: string;
    barcode: string | null;
  } | null;
  user?: {
    id: number;
    full_name: string;
    username: string;
  } | null;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
  prev_page_url: string | null;
  next_page_url: string | null;
}

interface AuditLogsIndexProps {
  inventoryLogs: PaginatedData<InventoryLogItem>;
  audits?: PaginatedData<any>;
  metrics?: {
    totalEvents: number;
    inventoryEvents: number;
    systemAudits: number;
    inventoryAdjustments: number;
  };
  filters?: {
    search?: string;
    action?: string;
  };
}

export default function AuditLogsIndex({ 
  inventoryLogs, 
  metrics,
  filters = {} 
}: AuditLogsIndexProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
  const [selectedAction, setSelectedAction] = useState<string>(filters.action ?? 'All');
  const [inspectedLog, setInspectedLog] = useState<InventoryLogItem | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(auditLogsIndex.url(), {
      search: searchTerm || undefined,
      action: selectedAction !== 'All' ? selectedAction : undefined,
    }, { preserveState: true });
  };

  const handleActionFilter = (action: string) => {
    setSelectedAction(action);
    router.get(auditLogsIndex.url(), {
      search: searchTerm || undefined,
      action: action !== 'All' ? action : undefined,
    }, { preserveState: true });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'restock':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'sale':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'adjustment':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'void':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

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
            Immutable forensic logging for all POS card debits, stock movements, and inventory adjustments.
          </p>
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
              {metrics?.totalEvents ?? inventoryLogs.total}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              100% verification rate &bull; Tamper-evident ledger
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Inventory Events
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-emerald-700 tracking-tight mt-1">
              {metrics?.inventoryEvents ?? inventoryLogs.total}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Restocks, POS deductions, and adjustments.
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Manual Adjustments
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#d38c28] flex items-center justify-center">
                <Layers size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {metrics?.inventoryAdjustments ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Recorded inventory variance calibrations.
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                System Audits
              </CardDescription>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-emerald-700 tracking-tight mt-1">
              {metrics?.systemAudits ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Model mutator changes captured.
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Data Grid */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white overflow-hidden">
        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search product, actor, barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs bg-white rounded-xl border-slate-200"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['All', 'restock', 'sale', 'adjustment', 'void'].map(act => (
              <button
                key={act}
                onClick={() => handleActionFilter(act)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all ${
                  selectedAction === act
                    ? 'bg-[#5c1516] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {act}
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
                <TableHead className="text-xs font-bold text-slate-700">Action Type</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Product</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Stock Transition</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Operator / Actor</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Remarks / Reference</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right">Inspect</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryLogs.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-slate-400 text-xs">
                    No inventory audit records match your query.
                  </TableCell>
                </TableRow>
              ) : (
                inventoryLogs.data.map(log => {
                  const qtySign = log.quantity_changed > 0 ? `+${log.quantity_changed}` : `${log.quantity_changed}`;
                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="py-3.5">
                        <div className="font-mono text-xs font-bold text-slate-800">INV-#{log.id}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{formatDateTime(log.created_at)}</div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase ${getActionBadgeColor(log.action)}`}>
                          {log.action} ({qtySign} pcs)
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="font-extrabold text-xs text-slate-800">
                          {log.product?.name || 'Deleted Product'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {log.product?.barcode || 'N/A'}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs font-mono text-slate-700">
                        <span className="text-slate-400">{log.previous_stock}</span>
                        <span className="mx-1.5 text-slate-400">&rarr;</span>
                        <strong className="text-slate-800">{log.new_stock}</strong>
                      </TableCell>

                      <TableCell className="text-xs font-medium text-slate-700">
                        {log.user?.full_name || log.user?.username || 'System User'}
                      </TableCell>

                      <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                        {log.remarks || '—'}
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
          <div>
            Showing {inventoryLogs.from || 0} - {inventoryLogs.to || 0} of {inventoryLogs.total} audit entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inventoryLogs.prev_page_url && router.visit(inventoryLogs.prev_page_url)}
              disabled={!inventoryLogs.prev_page_url}
              className="h-8 px-3 text-xs rounded-lg border-slate-200 disabled:opacity-40"
            >
              Previous
            </Button>
            <span className="font-bold text-slate-700">
              Page {inventoryLogs.current_page} of {inventoryLogs.last_page || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inventoryLogs.next_page_url && router.visit(inventoryLogs.next_page_url)}
              disabled={!inventoryLogs.next_page_url}
              className="h-8 px-3 text-xs rounded-lg border-slate-200 disabled:opacity-40"
            >
              Next
            </Button>
          </div>
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
                    INV-#{inspectedLog.id}
                  </Badge>
                  <Badge className={`uppercase text-xs font-bold ${getActionBadgeColor(inspectedLog.action)}`}>
                    {inspectedLog.action}
                  </Badge>
                </div>
                <DialogTitle className="text-base font-extrabold text-slate-800 pt-1">
                  Inventory Event: {inspectedLog.product?.name || 'Product'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Recorded on {formatDateTime(inspectedLog.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operator / Actor:</span>
                    <strong className="text-slate-800">{inspectedLog.user?.full_name || inspectedLog.user?.username || 'System User'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Item Barcode:</span>
                    <strong className="font-mono text-slate-800">{inspectedLog.product?.barcode || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity Changed:</span>
                    <strong className="text-slate-800">{inspectedLog.quantity_changed > 0 ? `+${inspectedLog.quantity_changed}` : inspectedLog.quantity_changed} units</strong>
                  </div>
                  {inspectedLog.remarks && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Remarks:</span>
                      <strong className="text-slate-800">{inspectedLog.remarks}</strong>
                    </div>
                  )}
                </div>

                {/* State Transition Diff */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Stock Balance State Transition:
                  </label>
                  <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                    <div className="text-red-400">
                      - [BEFORE]: {inspectedLog.previous_stock} units on hand
                    </div>
                    <div className="text-emerald-400">
                      + [AFTER] : {inspectedLog.new_stock} units on hand
                    </div>
                  </div>
                </div>
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
