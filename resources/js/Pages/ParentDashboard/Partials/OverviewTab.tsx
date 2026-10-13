import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { formatMoney } from '@/lib/formatters';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Utensils, Receipt } from 'lucide-react';
import { Student, Transaction, WeeklySpendingPoint, CategoryDistributionPoint } from '../types';

interface OverviewTabProps {
  student: Student;
  weeklySpendingData?: WeeklySpendingPoint[];
  categoryDistribution?: CategoryDistributionPoint[];
  todayTransaction?: Transaction | null;
  onViewReceipt: (txn: Transaction) => void;
}

export default function OverviewTab({
  student,
  weeklySpendingData,
  categoryDistribution,
  todayTransaction,
  onViewReceipt,
}: OverviewTabProps) {
  const transactions = useMemo(() => student.transactions || [], [student.transactions]);

  // Dynamic Weekly Spending calculation
  const computedWeeklySpendingData = useMemo<WeeklySpendingPoint[]>(() => {
    if (weeklySpendingData && weeklySpendingData.length > 0) {
      return weeklySpendingData;
    }

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const dayIndexMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };

    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0=Sun, 1=Mon...

    const points: WeeklySpendingPoint[] = dayLabels.map((day, idx) => {
      const isToday = (idx + 1) === currentDayOfWeek;
      return {
        day: isToday ? `${day} (Today)` : day,
        amount: 0,
        limit: student.dailyLimit,
        meals: 0,
        snacks: 0,
      };
    });

    const diffToMonday = (currentDayOfWeek === 0 ? -6 : 1) - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    transactions.forEach(txn => {
      const txnDate = txn.rawCreatedAt ? new Date(txn.rawCreatedAt) : new Date(txn.dateTime);
      if (!isNaN(txnDate.getTime())) {
        const dayOfWeek = txnDate.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && txnDate >= monday && txnDate <= friday) {
          const pointIdx = dayIndexMap[dayOfWeek];
          if (pointIdx !== undefined) {
            points[pointIdx].amount = Number((points[pointIdx].amount + txn.total).toFixed(2));
            if (txn.mealType.toLowerCase().includes('lunch') || txn.mealType.toLowerCase().includes('meal')) {
              points[pointIdx].meals += 1;
            } else {
              points[pointIdx].snacks += 1;
            }
          }
        }
      }
    });

    return points;
  }, [transactions, student.dailyLimit, weeklySpendingData]);

  // Dynamic Category Distribution calculation
  const computedCategoryDistribution = useMemo<CategoryDistributionPoint[]>(() => {
    if (categoryDistribution && categoryDistribution.length > 0) {
      return categoryDistribution;
    }

    const categoryTotals: Record<string, number> = {};
    transactions.forEach(txn => {
      txn.items.forEach(item => {
        const cat = item.category || 'Cafeteria Items';
        categoryTotals[cat] = (categoryTotals[cat] ?? 0) + (item.price * item.qty);
      });
    });

    const categoryColors: Record<string, string> = {
      'Rice Meals': '#5c1516',
      'Beverages': '#008dd5',
      'Fresh Drinks': '#008dd5',
      'Snacks & Sandwiches': '#d38c28',
      'Snacks': '#d38c28',
      'Fruits & Bakery': '#10b981',
      'Bakery': '#10b981',
      'Healthy': '#10b981',
      'Cafeteria Items': '#5c1516',
    };

    const defaultPalette = ['#5c1516', '#008dd5', '#d38c28', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];
    const entries = Object.entries(categoryTotals);

    if (entries.length === 0) {
      return [
        { name: 'No Purchases Yet', value: 1, color: '#e2e8f0' }
      ];
    }

    return entries.map(([name, value], idx) => ({
      name,
      value: Number(value.toFixed(2)),
      color: categoryColors[name] || defaultPalette[idx % defaultPalette.length],
    }));
  }, [transactions, categoryDistribution]);

  const activeTodayTransaction = todayTransaction !== undefined 
    ? todayTransaction 
    : (transactions.find(t => t.dateTime.toLowerCase().includes('today')) ?? null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Weekly Spending Trend Area Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold text-slate-800">
                  Weekly Spending vs Daily Allowance
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Tracking Monday to Friday cafeteria spending against {formatMoney(student.dailyLimit)} ceiling.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900 font-bold text-xs">
                Cap: {formatMoney(student.dailyLimit)}/day
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={computedWeeklySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="maroonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5c1516" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#5c1516" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [formatMoney(Number(value)), 'Spent Amount']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#5c1516" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#maroonGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Category Breakdown Donut / Pie */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white flex flex-col justify-between">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-extrabold text-slate-800">
              Food Category Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Where your child's meal funds are allocated this month.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={computedCategoryDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {computedCategoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatMoney(Number(value)), 'Total']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
              {computedCategoryDistribution.map(cat => (
                <div key={cat.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600 truncate text-[11px] font-semibold">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Meals Quick Feed */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-800">
                Today's Cafeteria Purchases
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Live feed of meals dispensed to {student.name} today.
              </CardDescription>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px] font-bold">
              Verified RFID Scan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {activeTodayTransaction ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#d38c28] flex items-center justify-center shrink-0">
                    <Utensils size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {activeTodayTransaction.items.map(i => `${i.name} (x${i.qty})`).join(', ') || 'Cafeteria Order'}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {activeTodayTransaction.mealType} ({activeTodayTransaction.dateTime})
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {activeTodayTransaction.terminal} &bull; Paid via: {activeTodayTransaction.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="font-extrabold text-sm text-[#5c1516]">{formatMoney(activeTodayTransaction.total)}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onViewReceipt(activeTodayTransaction)}
                    className="text-xs h-8 px-2.5 rounded-lg border-slate-200 text-slate-700"
                  >
                    <Receipt size={13} className="mr-1" /> e-Receipt
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No cafeteria purchases recorded for today.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
