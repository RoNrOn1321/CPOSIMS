import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { formatMoney } from '@/lib/formatters';
import { 
  DollarSign, 
  Receipt, 
  Users, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  ChevronRight, 
  Plus, 
  ShoppingBag, 
  FileText, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { index as productsIndex } from '@/actions/App/Http/Controllers/Admin/ProductController';
import { index as studentsIndex } from '@/actions/App/Http/Controllers/Admin/StudentAccountController';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/Admin/ReportController';
import { index as auditLogsIndex } from '@/actions/App/Http/Controllers/Admin/AuditLogController';
import { index as posIndex } from '@/actions/App/Http/Controllers/PosController';

interface DashboardMetrics {
  todayRevenue: number;
  cashSalesToday: number;
  cashlessSalesToday: number;
  todayCompletedCount: number;
  totalStudents: number;
  activeStudents: number;
  totalBalancePool: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  todayTopupsAmount: number;
  todayTopupsCount: number;
}

interface RecentTransaction {
  id: number;
  receipt_number: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  cashier?: { id: number; full_name: string; username: string };
  studentAccount?: {
    id: number;
    student_id_number: string;
    first_name: string;
    last_name: string;
    grade_level: string;
    section: string;
  };
}

interface LowStockProduct {
  id: number;
  name: string;
  barcode?: string;
  stock_quantity: number;
  reorder_level: number;
  price: number;
  category?: { id: number; name: string };
}

interface RecentAuditLog {
  id: number;
  action: string;
  quantity_changed: number;
  previous_stock: number;
  new_stock: number;
  remarks?: string;
  created_at: string;
  product?: { id: number; name: string; barcode?: string };
  user?: { id: number; full_name: string; username: string };
}

interface CategoryBreakdown {
  id: number;
  name: string;
  products_count: number;
}

interface AdminDashboardProps {
  metrics: DashboardMetrics;
  recentTransactions: RecentTransaction[];
  lowStockProducts: LowStockProduct[];
  recentAuditLogs: RecentAuditLog[];
  categoryBreakdown: CategoryBreakdown[];
}

export default function AdminDashboard({
  metrics,
  recentTransactions = [],
  lowStockProducts = [],
  recentAuditLogs = [],
  categoryBreakdown = [],
}: AdminDashboardProps) {
  return (
    <AdminLayout portal="admin" activeNav="dashboard" title="Admin Operations Dashboard">
      <Head title="Admin Dashboard - Operations Center" />

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#5c1516] via-[#751c1e] to-amber-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className="bg-amber-400 text-amber-950 font-bold text-[10px] px-2 py-0.5 border-0 shadow-xs">
                CAMPUS OPERATIONS
              </Badge>
              <span className="text-xs text-amber-200/90 font-medium">Saint Theresa College of Tandag</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
              Management & Operations Center
            </h1>
            <p className="text-xs text-amber-100/80 max-w-xl mt-1">
              Live monitoring for cafeteria sales, registered student balances, real-time inventory restock alerts, and audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={posIndex.url()}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <ShoppingBag size={14} />
              Open POS Register
            </Link>
            <Link
              href={reportsIndex.url()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              <FileText size={14} />
              Full Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Total Revenue */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {formatMoney(metrics.todayRevenue)}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-1.5">
                <span className="flex items-center gap-1 text-slate-700">
                  <Banknote size={11} className="text-slate-400" />
                  {formatMoney(metrics.cashSalesToday)} cash
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-[#5c1516]">
                  <CreditCard size={11} className="text-[#5c1516]" />
                  {formatMoney(metrics.cashlessSalesToday)} RFID
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Transactions */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Orders Succeeded</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Receipt size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics.todayCompletedCount} Sales
              </div>
              <p className="text-[11px] font-medium text-emerald-600 mt-1.5 flex items-center gap-1">
                <CheckCircle2 size={12} /> Active across all canteen registers
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Student Accounts */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Students</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics.totalStudents} Accounts
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-1.5">
                Float Balance Pool: <strong className="text-emerald-700">{formatMoney(metrics.totalBalancePool)}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Attention */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Health</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                metrics.lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {metrics.lowStockCount > 0 ? <AlertTriangle size={18} /> : <Package size={18} />}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {metrics.lowStockCount > 0 ? (
                  <span className="text-amber-700">{metrics.lowStockCount} Low Stock</span>
                ) : (
                  <span className="text-emerald-700">Stock Optimal</span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-1.5">
                {metrics.totalProducts} Tracked Items &bull; {metrics.outOfStockCount} Out of Stock
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Operational Launchpad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          href={productsIndex.url()}
          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition-all flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5c1516]/10 text-[#5c1516] flex items-center justify-center font-bold">
              <Package size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-[#5c1516]">Products & Menu</div>
              <div className="text-[10px] text-slate-400">Inventory & Pricing</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-[#5c1516] group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href={studentsIndex.url()}
          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition-all flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-[#5c1516]">Students & RFID</div>
              <div className="text-[10px] text-slate-400">Cards & Balances</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-[#5c1516] group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href={reportsIndex.url()}
          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition-all flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-[#5c1516]">Financial Reports</div>
              <div className="text-[10px] text-slate-400">Analytics & Sales</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-[#5c1516] group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href={auditLogsIndex.url()}
          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition-all flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileText size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-[#5c1516]">Audit Trails</div>
              <div className="text-[10px] text-slate-400">Stock & System Logs</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-[#5c1516] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Main Split Section: Recent Transactions & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Live Sales Stream */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Receipt size={16} className="text-[#5c1516]" />
                  Live Sales Feed & Recent Transactions
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Latest cafeteria sales processed by cashiers across registered station registers.
                </CardDescription>
              </div>
              <Link
                href={reportsIndex.url()}
                className="text-xs font-bold text-[#5c1516] hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentTransactions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No transactions recorded today yet.
                  </div>
                ) : (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-mono text-xs font-bold text-slate-700 shrink-0">
                          {tx.payment_method === 'cashless' ? (
                            <CreditCard size={16} className="text-[#5c1516]" />
                          ) : (
                            <Banknote size={16} className="text-emerald-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {tx.studentAccount
                                ? `${tx.studentAccount.first_name} ${tx.studentAccount.last_name}`
                                : 'Walk-in Customer'}
                            </span>
                            <Badge variant="outline" className="font-mono text-[10px] py-0 px-1.5 border-slate-200 text-slate-500">
                              {tx.receipt_number}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Cashier: {tx.cashier?.full_name || tx.cashier?.username || 'Register Staff'} &bull; {tx.created_at}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-sm text-[#5c1516]">
                          {formatMoney(tx.total_amount)}
                        </div>
                        <Badge className={`text-[9px] px-1.5 py-0 font-bold ${
                          tx.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 col): Low Stock Alert & Category Split */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  Inventory Restock Alerts
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Items currently at or below their reorder threshold.
                </CardDescription>
              </div>
              <Link
                href={productsIndex.url()}
                className="text-xs font-bold text-[#5c1516] hover:underline flex items-center gap-1"
              >
                Manage <ArrowUpRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {lowStockProducts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-emerald-600 font-medium">
                    All inventory levels are currently above reorder limits!
                  </div>
                ) : (
                  lowStockProducts.map((p) => {
                    const isOut = p.stock_quantity <= 0;
                    return (
                      <div key={p.id} className="p-3 hover:bg-slate-50/70 transition-colors flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-800">{p.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {p.category?.name || 'Uncategorized'} &bull; {formatMoney(p.price)}
                          </div>
                        </div>
                        <Badge className={`text-[10px] font-bold ${
                          isOut ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {isOut ? 'Out of Stock' : `${p.stock_quantity} left`}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories Overview */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Package size={16} className="text-[#5c1516]" />
                Cafeteria Menu Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {categoryBreakdown.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-slate-200 text-slate-500">
                    {cat.products_count} items
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Recent Audit Events */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-700" />
              Latest Stock & Inventory Operations Log
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Automated record of inventory adjustments, restocks, sales deductions, and void refunds.
            </CardDescription>
          </div>
          <Link
            href={auditLogsIndex.url()}
            className="text-xs font-bold text-[#5c1516] hover:underline flex items-center gap-1"
          >
            Audit History <ArrowUpRight size={13} />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {recentAuditLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No recent inventory logs found.
              </div>
            ) : (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="p-3 px-5 hover:bg-slate-50/70 transition-colors flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-600 border-slate-200">
                      {log.action}
                    </Badge>
                    <span className="font-bold text-slate-800">
                      {log.product?.name || 'Item'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      ({log.quantity_changed > 0 ? `+${log.quantity_changed}` : log.quantity_changed} units)
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                    <span>By: {log.user?.full_name || log.user?.username || 'System'}</span>
                    <span>&bull;</span>
                    <span className="font-mono text-slate-400">{log.created_at}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
