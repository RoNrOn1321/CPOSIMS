import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Student } from '../types';

interface DietaryRestrictionsTabProps {
  student: Student;
}

export default function DietaryRestrictionsTab({
  student,
}: DietaryRestrictionsTabProps) {
  const allergies = student.allergies || [];
  const prohibited = student.prohibitedItems || [];

  const [restrictions, setRestrictions] = useState({
    peanutAllergy: allergies.includes('Peanuts'),
    seafoodAllergy: allergies.includes('Seafood / Shrimp'),
    blockSoda: prohibited.includes('Carbonated Sodas'),
    blockNoodles: prohibited.includes('Instant Noodles'),
    blockCaffeine: prohibited.includes('High-Caffeine Energy Drinks'),
  });

  React.useEffect(() => {
    const currentAllergies = student.allergies || [];
    const currentProhibited = student.prohibitedItems || [];
    setRestrictions({
      peanutAllergy: currentAllergies.includes('Peanuts'),
      seafoodAllergy: currentAllergies.includes('Seafood / Shrimp'),
      blockSoda: currentProhibited.includes('Carbonated Sodas'),
      blockNoodles: currentProhibited.includes('Instant Noodles'),
      blockCaffeine: currentProhibited.includes('High-Caffeine Energy Drinks'),
    });
  }, [student.id, student.allergies, student.prohibitedItems]);


  return (
    <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
      <CardHeader>
        <CardTitle className="text-base font-extrabold text-slate-800">
          Dietary Directives & Allergen Safeguards
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          These directives are transmitted instantly to the CPOSIMS cashier screen when {student.name}'s RFID is scanned.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Allergen Protection */}
        <div>
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
            Allergen Health Alerts
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-4 rounded-xl border transition-colors flex items-center justify-between ${
              restrictions.peanutAllergy ? 'border-red-300 bg-red-50/60' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                  ⚠️
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">Severe Peanut / Tree Nut Allergy</span>
                  <p className="text-[11px] text-slate-500">Locks bakery items containing nuts</p>
                </div>
              </div>
              <Badge className="bg-red-600 text-white font-bold text-[10px]">Enforced</Badge>
            </div>

            <div className={`p-4 rounded-xl border transition-colors flex items-center justify-between ${
              restrictions.seafoodAllergy ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  🦐
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">Seafood / Shellfish Sensitivity</span>
                  <p className="text-[11px] text-slate-500">Warns cashier on shrimp & fish dishes</p>
                </div>
              </div>
              <Badge variant="outline" className="border-slate-300 text-slate-600 font-bold text-[10px]">
                {restrictions.seafoodAllergy ? 'Active' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Junk Food & Nutrition Rules */}
        <div>
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
            Canteen Purchase Restrictions
          </h4>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Block Carbonated Soft Drinks & Sodas</span>
                <p className="text-[11px] text-slate-400">Forces student to select water, calamansi, or fresh buko juice.</p>
              </div>
              <Badge className="bg-[#5c1516] text-white font-bold text-[10px]">Blocked at POS</Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Limit Deep-Fried Snacks</span>
                <p className="text-[11px] text-slate-400">Maximum of 1 fried item per school day.</p>
              </div>
              <Badge className="bg-amber-500 text-white font-bold text-[10px]">Max 1 Item</Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Encourage Fresh Fruit Option</span>
                <p className="text-[11px] text-slate-400">Applies 10% canteen subsidy on fresh fruit purchases.</p>
              </div>
              <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Subsidized</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
