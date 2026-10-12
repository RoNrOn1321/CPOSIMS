import React from 'react';
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
  weeklySpendingData: WeeklySpendingPoint[];
  categoryDistribution: CategoryDistributionPoint[];
  todayTransaction: Transaction;
  onViewReceipt: (txn: Transaction) => void;
}

export default function OverviewTab({
  student,
  weeklySpendingData,
  categoryDistribution,
  todayTransaction,
  onViewReceipt,
}: OverviewTabProps) {
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
                <AreaChart data={weeklySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    data={categoryDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatMoney(Number(value)), 'Total']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
              {categoryDistribution.map(cat => (
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
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#d38c28] flex items-center justify-center shrink-0">
                  <Utensils size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Chicken Adobo Rice Bowl + Calamansi Juice</span>
                    <Badge variant="outline" className="text-[10px] font-semibold">Lunch (12:15 PM)</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Terminal #01 (Main High School Canteen) &bull; 450 kcal
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                <span className="font-extrabold text-sm text-[#5c1516]">{formatMoney(todayTransaction.total)}</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onViewReceipt(todayTransaction)}
                  className="text-xs h-8 px-2.5 rounded-lg border-slate-200 text-slate-700"
                >
                  <Receipt size={13} className="mr-1" /> e-Receipt
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
