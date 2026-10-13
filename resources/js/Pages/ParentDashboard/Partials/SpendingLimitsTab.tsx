import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { formatMoney } from '@/lib/formatters';
import { Check, Loader2 } from 'lucide-react';
import { Student } from '../types';

interface SpendingLimitsTabProps {
  student: Student;
  onSaveLimit?: (newLimit: number) => void;
}

export default function SpendingLimitsTab({
  student,
  onSaveLimit,
}: SpendingLimitsTabProps) {
  const [dailyLimitInput, setDailyLimitInput] = useState<number>(student.dailyLimit);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);

  useEffect(() => {
    setDailyLimitInput(student.dailyLimit);
  }, [student.id, student.dailyLimit]);

  const handleSave = () => {
    setIsSubmitting(true);
    router.patch(
      `/parent/student-limits/${student.id}`,
      { daily_limit: dailyLimitInput },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSavedToast(true);
          if (onSaveLimit) {
            onSaveLimit(dailyLimitInput);
          }
          setTimeout(() => setIsSavedToast(false), 3000);
        },
        onFinish: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 rounded-2xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader>
          <CardTitle className="text-base font-extrabold text-slate-800">
            Daily Spending Allowance Settings
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Enforce strict daily maximums at the point-of-sale terminal to instill smart financial habits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Cap Control */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-xs text-slate-800">Max Daily Spending Limit</h4>
                <p className="text-[11px] text-slate-500">Canteen register will block transactions exceeding this amount.</p>
              </div>
              <div className="w-36">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₱</span>
                  <Input 
                    type="number"
                    value={dailyLimitInput}
                    onChange={(e) => setDailyLimitInput(Number(e.target.value))}
                    disabled={isSubmitting}
                    className="pl-8 text-right font-extrabold text-sm h-10 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Preset quick buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-400">Presets:</span>
              {[80, 100, 120, 150, 200].map(val => (
                <button
                  key={val}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setDailyLimitInput(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    dailyLimitInput === val 
                      ? 'bg-[#5c1516] text-white' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ₱{val}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-white">
              <span className="text-xs font-bold text-slate-700">Recess Time Maximum</span>
              <p className="text-[11px] text-slate-400">Cap for morning/afternoon snack periods</p>
              <div className="pt-2 font-black text-base text-[#5c1516]">
                {formatMoney(Math.round(dailyLimitInput * 0.35))} (35% of cap)
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-white">
              <span className="text-xs font-bold text-slate-700">Lunch Meal Maximum</span>
              <p className="text-[11px] text-slate-400">Cap for midday heavy meal period</p>
              <div className="pt-2 font-black text-base text-[#5c1516]">
                {formatMoney(Math.round(dailyLimitInput * 0.65))} (65% of cap)
              </div>
            </div>
          </div>

          {/* Save Feedback */}
          {isSavedToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <Check size={16} /> New daily allowance synchronized with school cashier terminals!
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-slate-100 pt-4 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-[#5c1516] hover:bg-[#7a1420] text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center gap-1.5"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save Spending Limits'}
          </Button>
        </CardFooter>
      </Card>

      {/* Notifications & Warning Rules */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white space-y-4">
        <CardHeader>
          <CardTitle className="text-base font-extrabold text-slate-800">
            Notification Thresholds
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Receive SMS or in-app alerts when rules trigger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-700">Low Balance Alert</span>
              <p className="text-[11px] text-slate-400">Alert when balance drops below ₱100</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[10px]">Active</Badge>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-700">Over-Limit Warning</span>
              <p className="text-[11px] text-slate-400">Notify parent if student attempts extra order</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[10px]">Active</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700">Instant Receipt Notifications</span>
              <p className="text-[11px] text-slate-400">Send purchase breakdown to parent email</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[10px]">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
