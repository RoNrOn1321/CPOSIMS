import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { formatMoney } from '@/lib/formatters';
import { CreditCard, Sliders, TrendingUp, Apple, CheckCircle2 } from 'lucide-react';
import { Student } from '../types';

interface QuickStatsGridProps {
  student: Student;
  onTopUpClick: () => void;
  weeklyTotal?: number;
}

export default function QuickStatsGrid({
  student,
  onTopUpClick,
  weeklyTotal = 280.0,
}: QuickStatsGridProps) {
  const limitProgress = Math.min(100, Math.round((student.spentToday / student.dailyLimit) * 100));
  const remainingToday = Math.max(0, student.dailyLimit - student.spentToday);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {/* Card 1: Balance */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-60" />
        <CardHeader className="pb-1.5 pt-4 px-4 sm:px-5">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              RFID Balance
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#008dd5] flex items-center justify-center shrink-0">
              <CreditCard size={15} />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 truncate">
            {formatMoney(student.balance)}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-4 pt-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Ready to Tap
            </span>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onTopUpClick}
              className="text-xs h-7 px-2 font-bold text-[#5c1516] hover:bg-red-50 -mr-2 cursor-pointer"
            >
              + Reload
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Today's Spending Limit */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader className="pb-1.5 pt-4 px-4 sm:px-5">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Today's Spending Cap
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#d38c28] flex items-center justify-center shrink-0">
              <Sliders size={15} />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <CardTitle className="text-xl sm:text-2xl font-black text-[#5c1516] tracking-tight truncate">
              {formatMoney(student.spentToday)}
            </CardTitle>
            <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">
              / {formatMoney(student.dailyLimit)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-4 pt-0 space-y-1.5">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-[#5c1516]"
              style={{ width: `${limitProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-500">
            <span>{limitProgress}% used</span>
            <span>{formatMoney(remainingToday)} left</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: 5-Day Weekly Total */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader className="pb-1.5 pt-4 px-4 sm:px-5">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Weekly Spent Total
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp size={15} />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 truncate">
            {formatMoney(weeklyTotal)}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-4 pt-0">
          <p className="text-[11px] text-slate-500 font-medium truncate">
            Daily avg: <strong className="text-slate-800">{formatMoney(weeklyTotal / 5)}</strong> (5 school days)
          </p>
        </CardContent>
      </Card>

      {/* Card 4: Health & Nutrition Status */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader className="pb-1.5 pt-4 px-4 sm:px-5">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Health & Diet Index
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Apple size={15} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <CardTitle className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              Balanced
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold border-0">
              Grade A
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-4 pt-0">
          <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
            High fresh meal intake &bull; 0 prohibited junk items
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
