import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { formatMoney } from '@/lib/formatters';
import { Receipt } from 'lucide-react';
import { Transaction } from '../types';

interface MealHistoryTabProps {
  transactions: Transaction[];
  onViewReceipt: (txn: Transaction) => void;
}

export default function MealHistoryTab({
  transactions,
  onViewReceipt,
}: MealHistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(txn => {
    const term = searchTerm.toLowerCase();
    const matchMeal = txn.mealType.toLowerCase().includes(term);
    const matchId = txn.id.toLowerCase().includes(term);
    const matchItems = txn.items.some(i => i.name.toLowerCase().includes(term));
    return matchMeal || matchId || matchItems;
  });

  return (
    <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-800">
              Complete Cafeteria Purchase History
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Audit log of all canteen card transactions, item breakdowns, and deductions.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search meal or item..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 text-xs w-48 rounded-xl bg-slate-50"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => alert('Exporting monthly meal summary PDF...')}
              className="h-9 text-xs font-bold rounded-xl border-slate-200"
            >
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No transactions match your search filter.
            </div>
          ) : (
            filteredTransactions.map(txn => (
              <div 
                key={txn.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#5c1516] flex items-center justify-center shrink-0 mt-0.5">
                    <Receipt size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-800">{txn.mealType}</span>
                      <span className="text-[11px] text-slate-400">&bull; {txn.dateTime}</span>
                      <Badge className="bg-slate-100 text-slate-700 text-[9px] border-0">
                        {txn.id}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {txn.items.map(i => `${i.name} (x${i.qty})`).join(', ')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {txn.terminal} &bull; Paid via: {txn.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-2 md:pt-0">
                  <div className="text-right">
                    <span className="font-black text-base text-[#5c1516]">{formatMoney(txn.total)}</span>
                    <div className="text-[10px] text-slate-400">Bal after: {formatMoney(txn.balanceAfter)}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewReceipt(txn)}
                    className="text-xs h-7 px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    View Slip
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
