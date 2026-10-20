import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { formatMoney } from '@/lib/formatters';
import { router } from '@inertiajs/react';
import { index as reportsIndex, exportMethod } from '@/actions/App/Http/Controllers/Admin/ReportController';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  AlertTriangle, 
  Package, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Award,
  ShieldAlert
} from 'lucide-react';

export interface Metrics {
  totalRevenue: number;
  cashSales: number;
  cashlessSales: number;
  completedCount: number;
  voidedCount: number;
  totalTopupsAmount: number;
  totalTopupsCount: number;
  totalValuation: number;
  lowStockCount: number;
}

export interface TransactionItem {
  id: number;
  receipt_number: string;
  total_amount: number;
  payment_method: string;
  amount_tendered: number;
  change_amount: number;
  status: string;
  created_at: string;
  cashier?: {
    id: number;
    full_name: string;
    username: string;
  } | null;
  student_account?: {
    id: number;
    student_id_number: string;
    first_name: string;
    last_name: string;
    grade_level: string;
    section: string;
  } | null;
}

export interface TopProductItem {
  product_id: number;
  total_quantity: string | number;
  total_subtotal: string | number;
  product?: {
    id: number;
    name: string;
    price: number;
    cost: number;
    barcode: string | null;
    category?: {
      id: number;
      name: string;
    } | null;
  } | null;
}

export interface TopupItem {
  id: number;
  reference_number: string;
  amount: number;
  previous_balance: number;
  new_balance: number;
  created_at: string;
  cashier?: {
    id: number;
    full_name: string;
    username: string;
  } | null;
  student_account?: {
    id: number;
    student_id_number: string;
    first_name: string;
    last_name: string;
    grade_level: string;
    section: string;
  } | null;
}

export interface LowStockProductItem {
  id: number;
  name: string;
  barcode: string | null;
  price: number;
  cost: number;
  stock_quantity: number;
  reorder_level: number;
  status: string;
  category?: {
    id: number;
    name: string;
  } | null;
}

interface ReportsIndexProps {
  metrics: Metrics;
  transactions: TransactionItem[];
  topProducts: TopProductItem[];
  topups: TopupItem[];
  lowStockProducts: LowStockProductItem[];
  filters: {
    start_date: string;
    end_date: string;
  };
}

export default function ReportsIndex({
  metrics,
  transactions,
  topProducts,
  topups,
  lowStockProducts,
  filters,
}: ReportsIndexProps) {
  const [startDate, setStartDate] = useState(filters.start_date);
  const [endDate, setEndDate] = useState(filters.end_date);
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'topups' | 'inventory'>('sales');

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(reportsIndex.url(), {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }, { preserveState: true });
  };

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    const endStr = end.toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);

    router.get(reportsIndex.url(), {
      start_date: startStr,
      end_date: endStr,
    }, { preserveState: true });
  };

  const handleThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const startStr = firstDay.toISOString().split('T')[0];
    const endStr = now.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);

    router.get(reportsIndex.url(), {
      start_date: startStr,
      end_date: endStr,
    }, { preserveState: true });
  };

  const handlePrint = () => {
    window.print();
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

  // Percentage calculations
  const totalSalesRevenue = metrics.totalRevenue;
  const cashPercent = totalSalesRevenue > 0 ? Math.round((metrics.cashSales / totalSalesRevenue) * 100) : 0;
  const cashlessPercent = totalSalesRevenue > 0 ? Math.round((metrics.cashlessSales / totalSalesRevenue) * 100) : 0;

  return (
    <AdminLayout portal="admin" activeNav="reports">
      {/* ===================== SCREEN VIEW (Hidden in Print) ===================== */}
      <div className="space-y-6 print:hidden">
        {/* Top Header & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#5c1516] text-white flex items-center justify-center shadow-md">
                <BarChart3 size={20} className="text-[#d38c28]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  Reports & Financial Analytics
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Audited sales figures, cashless reload volumes, top cafeteria products, and inventory valuation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Export Sales Excel */}
            <a
              href={exportMethod.url({ query: { type: 'sales', format: 'xlsx', start_date: startDate, end_date: endDate } })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <FileSpreadsheet size={14} className="text-[#5c1516]" />
              <span>Export Sales (.xlsx)</span>
            </a>

            {/* Quick Export Topups Excel */}
            <a
              href={exportMethod.url({ query: { type: 'topups', format: 'xlsx', start_date: startDate, end_date: endDate } })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <FileSpreadsheet size={14} className="text-[#d38c28]" />
              <span>Export Top-Ups (.xlsx)</span>
            </a>

            {/* Print Formal Report Button */}
            <Button
              onClick={handlePrint}
              className="bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-extrabold h-9 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Printer size={15} />
              <span>Print Official Report</span>
            </Button>
          </div>
        </div>

        {/* Date Filter & Preset Controls */}
        <Card className="border border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <form onSubmit={handleApplyFilter} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date Coverage:</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-9 text-xs font-medium w-36 rounded-xl border-slate-300 bg-slate-50/50"
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-bold">to</span>
                  <div className="relative">
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-9 text-xs font-medium w-36 rounded-xl border-slate-300 bg-slate-50/50"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs flex items-center gap-1"
                >
                  <Filter size={13} />
                  <span>Filter Period</span>
                </Button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">Presets:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickRange(1)}
                  className="h-8 text-[11px] font-semibold rounded-lg bg-slate-50 border-slate-200 hover:bg-slate-100"
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickRange(7)}
                  className="h-8 text-[11px] font-semibold rounded-lg bg-slate-50 border-slate-200 hover:bg-slate-100"
                >
                  Last 7 Days
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleThisMonth}
                  className="h-8 text-[11px] font-semibold rounded-lg bg-slate-50 border-slate-200 hover:bg-slate-100"
                >
                  This Month
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickRange(30)}
                  className="h-8 text-[11px] font-semibold rounded-lg bg-slate-50 border-slate-200 hover:bg-slate-100"
                >
                  Last 30 Days
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Financial & Inventory KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Gross Sales Revenue */}
          <Card className="border border-red-100 bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5c1516]">
                Gross Canteen Sales
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-100 text-[#5c1516] flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {formatMoney(metrics.totalRevenue)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{metrics.completedCount} completed orders</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 font-bold px-1.5">
                  Audited
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Cash vs Cashless Breakdown */}
          <Card className="border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#d38c28]">
                Payment Channels
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#d38c28] flex items-center justify-center">
                <CreditCard size={16} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1 text-slate-600">
                  <Banknote size={13} className="text-emerald-600" /> Cash ({cashPercent}%)
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <CreditCard size={13} className="text-[#5c1516]" /> RFID ({cashlessPercent}%)
                </span>
              </div>
              {/* Progress bar split */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div style={{ width: `${cashPercent}%` }} className="bg-emerald-500 h-full" title={`Cash: ${formatMoney(metrics.cashSales)}`} />
                <div style={{ width: `${cashlessPercent}%` }} className="bg-[#5c1516] h-full" title={`Cashless: ${formatMoney(metrics.cashlessSales)}`} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>{formatMoney(metrics.cashSales)}</span>
                <span>{formatMoney(metrics.cashlessSales)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Balance Top-Ups Volume */}
          <Card className="border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900">
                RFID Balance Top-Ups
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <CreditCard size={16} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {formatMoney(metrics.totalTopupsAmount)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{metrics.totalTopupsCount} reload events</span>
                <span className="text-blue-700 font-bold">Stored-Value Fund</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Inventory Valuation & Alerts */}
          <Card className="border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                Inventory Valuation
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Package size={16} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {formatMoney(metrics.totalValuation)}
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-slate-500">Warehouse stock</span>
                {metrics.lowStockCount > 0 ? (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 font-bold px-1.5 text-[10px] flex items-center gap-1">
                    <AlertTriangle size={11} /> {metrics.lowStockCount} Low Stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold px-1.5 text-[10px]">
                    Stocks Stable
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs for Granular Reporting */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sales'
                ? 'bg-[#5c1516] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TrendingUp size={14} />
            <span>Sales Transactions ({transactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-[#5c1516] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Award size={14} />
            <span>Top-Selling Cafeteria Items ({topProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('topups')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'topups'
                ? 'bg-[#5c1516] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard size={14} />
            <span>RFID Reloads ({topups.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-[#5c1516] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package size={14} />
            <span>Low-Stock Alerts ({lowStockProducts.length})</span>
          </button>
        </div>

        {/* Tab 1: Sales Transactions Table */}
        {activeTab === 'sales' && (
          <Card className="border border-slate-200 rounded-2xl shadow-xs overflow-hidden bg-white">
            <CardHeader className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-extrabold text-slate-800">
                  Canteen POS Sales Transactions
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Itemized register orders in the selected period ({startDate} to {endDate}).
                </CardDescription>
              </div>
              <a
                href={exportMethod.url({ query: { type: 'sales', format: 'xlsx', start_date: startDate, end_date: endDate } })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <FileSpreadsheet size={13} className="text-[#5c1516]" />
                <span>Export Sales (.xlsx)</span>
              </a>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Receipt No.</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Date & Time</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Cashier</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Customer / Student</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Method</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-right">Amount</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-mono font-bold text-xs text-slate-900">
                            {tx.receipt_number}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {formatDateTime(tx.created_at)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-700 font-medium">
                            {tx.cashier?.full_name ?? tx.cashier?.username ?? 'System / POS'}
                          </TableCell>
                          <TableCell className="text-xs text-slate-700">
                            {tx.student_account ? (
                              <div>
                                <span className="font-bold block">
                                  {tx.student_account.first_name} {tx.student_account.last_name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {tx.student_account.student_id_number} &bull; {tx.student_account.grade_level}-{tx.student_account.section}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Walk-in Customer</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${
                                tx.payment_method === 'cashless'
                                  ? 'bg-red-50 text-[#5c1516] border-red-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {tx.payment_method}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-xs text-slate-900 text-right">
                            {formatMoney(tx.total_amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            {tx.status === 'completed' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[10px] border-emerald-200">
                                Completed
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 font-bold text-[10px] border-red-200">
                                Voided
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                          No sales transactions found in this date range.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Top-Selling Cafeteria Items Table */}
        {activeTab === 'products' && (
          <Card className="border border-slate-200 rounded-2xl shadow-xs overflow-hidden bg-white">
            <CardHeader className="p-4 bg-slate-50/60 border-b border-slate-200">
              <CardTitle className="text-sm font-extrabold text-slate-800">
                Top-Selling Cafeteria Menu Items
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Ranked by total quantity purchased during the period ({startDate} to {endDate}).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="text-xs font-black uppercase text-slate-700 w-16 text-center">Rank</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Product Name</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Category</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-right">Unit Price</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-right">Units Sold</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-right">Gross Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.length > 0 ? (
                      topProducts.map((item, index) => (
                        <TableRow key={item.product_id} className="hover:bg-slate-50/50">
                          <TableCell className="text-center">
                            <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                              index === 0
                                ? 'bg-[#d38c28] text-amber-950 ring-2 ring-amber-300'
                                : index === 1
                                ? 'bg-slate-200 text-slate-800'
                                : index === 2
                                ? 'bg-amber-100 text-amber-900'
                                : 'text-slate-500'
                            }`}>
                              {index + 1}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-xs text-slate-900">
                            {item.product?.name ?? `Product #${item.product_id}`}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {item.product?.category?.name ?? 'General'}
                          </TableCell>
                          <TableCell className="font-medium text-xs text-slate-700 text-right">
                            {item.product ? formatMoney(item.product.price) : 'N/A'}
                          </TableCell>
                          <TableCell className="font-black text-xs text-[#5c1516] text-right">
                            {Number(item.total_quantity).toLocaleString()} pcs
                          </TableCell>
                          <TableCell className="font-black text-xs text-emerald-700 text-right">
                            {formatMoney(Number(item.total_subtotal))}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                          No cafeteria sales registered in this date range.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: RFID Balance Top-Ups Table */}
        {activeTab === 'topups' && (
          <Card className="border border-slate-200 rounded-2xl shadow-xs overflow-hidden bg-white">
            <CardHeader className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-extrabold text-slate-800">
                  Student RFID Stored-Value Reload Ledger
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Cashier walk-in reloads and online parent balance top-ups.
                </CardDescription>
              </div>
              <a
                href={exportMethod.url({ query: { type: 'topups', format: 'xlsx', start_date: startDate, end_date: endDate } })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <FileSpreadsheet size={13} className="text-[#d38c28]" />
                <span>Export Top-Ups (.xlsx)</span>
              </a>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Reference No.</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Date & Time</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Cashier / Channel</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Student Account</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-right">Reload Amount</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-right">Previous Bal</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-right">New Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topups.length > 0 ? (
                      topups.map((topup) => (
                        <TableRow key={topup.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-mono font-bold text-xs text-slate-900">
                            {topup.reference_number}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {formatDateTime(topup.created_at)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-700 font-medium">
                            {topup.cashier?.full_name ?? topup.cashier?.username ?? 'Online Gateway'}
                          </TableCell>
                          <TableCell className="text-xs text-slate-700">
                            {topup.student_account ? (
                              <div>
                                <span className="font-bold block">
                                  {topup.student_account.first_name} {topup.student_account.last_name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {topup.student_account.student_id_number}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="font-black text-xs text-emerald-700 text-right">
                            +{formatMoney(topup.amount)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 text-right">
                            {formatMoney(topup.previous_balance)}
                          </TableCell>
                          <TableCell className="font-extrabold text-xs text-slate-900 text-right">
                            {formatMoney(topup.new_balance)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                          No RFID balance reload records in this date range.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Low-Stock Inventory Alerts Table */}
        {activeTab === 'inventory' && (
          <Card className="border border-slate-200 rounded-2xl shadow-xs overflow-hidden bg-white">
            <CardHeader className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-red-600" />
                  <span>Low-Stock & Reorder Warnings</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Products currently at or below minimum threshold levels requiring cafeteria replenishment.
                </CardDescription>
              </div>
              <a
                href={exportMethod.url({ query: { type: 'inventory', format: 'xlsx' } })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <FileSpreadsheet size={13} className="text-slate-700" />
                <span>Export Master Inventory (.xlsx)</span>
              </a>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Barcode</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Product Name</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700">Category</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-right">Current Stock</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-right">Reorder Threshold</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-right">Selling Price</TableHead>
                      <TableHead className="text-xs font-black uppercase text-slate-700 text-center">Urgency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.length > 0 ? (
                      lowStockProducts.map((prod) => (
                        <TableRow key={prod.id} className="hover:bg-red-50/20">
                          <TableCell className="font-mono text-xs text-slate-600">
                            {prod.barcode ?? 'N/A'}
                          </TableCell>
                          <TableCell className="font-bold text-xs text-slate-900">
                            {prod.name}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {prod.category?.name ?? 'General'}
                          </TableCell>
                          <TableCell className="font-black text-xs text-red-600 text-right">
                            {prod.stock_quantity} units
                          </TableCell>
                          <TableCell className="font-medium text-xs text-slate-500 text-right">
                            {prod.reorder_level} units
                          </TableCell>
                          <TableCell className="font-bold text-xs text-slate-900 text-right">
                            {formatMoney(prod.price)}
                          </TableCell>
                          <TableCell className="text-center">
                            {prod.stock_quantity <= 0 ? (
                              <Badge className="bg-red-600 text-white font-extrabold text-[10px]">
                                OUT OF STOCK
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-900 font-extrabold text-[10px] border-amber-300">
                                CRITICAL LOW
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-emerald-700 text-xs font-semibold">
                          <CheckCircle2 size={16} className="inline mr-1 text-emerald-600" />
                          All cafeteria items have healthy stock quantities above reorder levels.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ===================== A4 PRINT VIEW (Only visible during print) ===================== */}
      <div className="hidden print:block font-sans text-slate-900 p-6 space-y-6 max-w-4xl mx-auto bg-white">
        {/* STCT Formal Header */}
        <div className="text-center border-b-2 border-[#5c1516] pb-4 space-y-1">
          <h2 className="text-xl font-black uppercase tracking-wider text-[#5c1516]">
            Saint Theresa College of Tandag, Inc.
          </h2>
          <p className="text-xs font-bold text-slate-700">
            Canteen Point of Sale & Inventory Management System (CPOSIMS)
          </p>
          <p className="text-[11px] text-slate-500">
            Quezon Street, Tandag City, Surigao del Sur &bull; Tel. No. (086) 211-3042
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 text-xs font-black uppercase text-slate-800 rounded">
              Official Periodic Canteen Audit & Financial Report
            </span>
          </div>
          <p className="text-[11px] text-slate-600 pt-1 font-semibold">
            Coverage Period: <strong className="text-slate-900">{startDate}</strong> to <strong className="text-slate-900">{endDate}</strong>
            &bull; Printed: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Executive Summary Metrics */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#5c1516] mb-2 border-b border-slate-300 pb-1">
            I. Executive Financial & Operating Summary
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-300 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Gross Revenue</span>
              <strong className="text-base font-black text-slate-900">{formatMoney(metrics.totalRevenue)}</strong>
              <p className="text-[10px] text-slate-600">{metrics.completedCount} completed orders</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Cash Tendered</span>
              <strong className="text-base font-black text-slate-900">{formatMoney(metrics.cashSales)}</strong>
              <p className="text-[10px] text-slate-600">{cashPercent}% of total volume</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Cashless RFID Revenue</span>
              <strong className="text-base font-black text-[#5c1516]">{formatMoney(metrics.cashlessSales)}</strong>
              <p className="text-[10px] text-slate-600">{cashlessPercent}% of total volume</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">RFID Reload Volume</span>
              <strong className="text-base font-black text-slate-900">{formatMoney(metrics.totalTopupsAmount)}</strong>
              <p className="text-[10px] text-slate-600">{metrics.totalTopupsCount} top-ups recorded</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Voided Transactions</span>
              <strong className="text-base font-black text-red-700">{metrics.voidedCount} records</strong>
              <p className="text-[10px] text-slate-600">Logged in audit trail</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Inventory Stock Valuation</span>
              <strong className="text-base font-black text-slate-900">{formatMoney(metrics.totalValuation)}</strong>
              <p className="text-[10px] text-slate-600">{metrics.lowStockCount} items at reorder level</p>
            </div>
          </div>
        </div>

        {/* Top-Selling Items Table */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#5c1516] mb-2 border-b border-slate-300 pb-1">
            II. Top-Selling Cafeteria Menu Items
          </h3>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-1.5 font-bold text-slate-700">Rank</th>
                <th className="p-1.5 font-bold text-slate-700">Product Name</th>
                <th className="p-1.5 font-bold text-slate-700">Category</th>
                <th className="p-1.5 font-bold text-slate-700 text-right">Unit Price</th>
                <th className="p-1.5 font-bold text-slate-700 text-right">Units Sold</th>
                <th className="p-1.5 font-bold text-slate-700 text-right">Gross Sales</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.slice(0, 5).map((item, idx) => (
                <tr key={item.product_id} className="border-b border-slate-200">
                  <td className="p-1.5 font-bold">{idx + 1}</td>
                  <td className="p-1.5 font-semibold">{item.product?.name ?? `Product #${item.product_id}`}</td>
                  <td className="p-1.5 text-slate-600">{item.product?.category?.name ?? 'General'}</td>
                  <td className="p-1.5 text-right">{item.product ? formatMoney(item.product.price) : 'N/A'}</td>
                  <td className="p-1.5 font-bold text-right">{Number(item.total_quantity).toLocaleString()}</td>
                  <td className="p-1.5 font-black text-right">{formatMoney(Number(item.total_subtotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#5c1516] mb-2 border-b border-slate-300 pb-1">
            III. Critical Inventory & Reorder Level Warnings
          </h3>
          {lowStockProducts.length > 0 ? (
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="p-1.5 font-bold text-slate-700">Barcode</th>
                  <th className="p-1.5 font-bold text-slate-700">Product Name</th>
                  <th className="p-1.5 font-bold text-slate-700 text-right">Current Stock</th>
                  <th className="p-1.5 font-bold text-slate-700 text-right">Reorder Level</th>
                  <th className="p-1.5 font-bold text-slate-700 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.slice(0, 8).map((prod) => (
                  <tr key={prod.id} className="border-b border-slate-200">
                    <td className="p-1.5 font-mono">{prod.barcode ?? 'N/A'}</td>
                    <td className="p-1.5 font-semibold">{prod.name}</td>
                    <td className="p-1.5 font-bold text-right text-red-700">{prod.stock_quantity}</td>
                    <td className="p-1.5 text-right text-slate-600">{prod.reorder_level}</td>
                    <td className="p-1.5 text-center font-bold text-[10px] uppercase">
                      {prod.stock_quantity <= 0 ? 'Out of Stock' : 'Low Stock'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-600 italic">No low-stock items detected at this time.</p>
          )}
        </div>

        {/* Official Signatures Section */}
        <div className="pt-8 grid grid-cols-2 gap-12 text-xs">
          <div className="space-y-8">
            <p className="font-semibold text-slate-600">Prepared by:</p>
            <div className="border-t border-slate-800 pt-1 text-center">
              <p className="font-bold text-slate-900 uppercase">Canteen Cashier / System Administrator</p>
              <p className="text-[10px] text-slate-500">STCT Canteen Management</p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="font-semibold text-slate-600">Noted and Verified by:</p>
            <div className="border-t border-slate-800 pt-1 text-center">
              <p className="font-bold text-slate-900 uppercase">School Finance Officer / Treasurer</p>
              <p className="text-[10px] text-slate-500">Saint Theresa College of Tandag, Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
