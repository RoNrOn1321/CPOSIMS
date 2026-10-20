import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Student } from '../types';
import { update as updateStudentStatus } from '@/actions/App/Http/Controllers/ParentStudentStatusController';
import { ShieldAlert, ShieldCheck, Lock, Unlock, Loader2 } from 'lucide-react';
import { useConfirm } from '@/Hooks/use-confirm';

interface StudentHeaderProps {
  students: Student[];
  selectedStudent: Student;
  onSelectStudent: (id: number) => void;
}

export default function StudentHeader({
  students,
  selectedStudent,
  onSelectStudent,
}: StudentHeaderProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const { confirm } = useConfirm();

  const getShortGrade = (level: string) => {
    const match = level.match(/Grade\s*(\d+)/i);
    if (match) return `Gr. ${match[1]}`;
    const parts = level.split('-');
    return parts[0].trim();
  };

  const isLostCard = selectedStudent.status === 'lost_card';

  const handleToggleStatus = async () => {
    const newStatus = isLostCard ? 'active' : 'lost_card';

    const confirmed = await confirm({
      title: isLostCard ? 'Reactivate RFID Card?' : 'Freeze & Report Card Lost?',
      description: isLostCard
        ? `Reactivate RFID card for ${selectedStudent.name}? This will restore immediate cafeteria purchasing privileges.`
        : `Report lost and immediately freeze RFID card for ${selectedStudent.name}? All POS cafeteria purchases will be blocked immediately to prevent unauthorized spending.`,
      confirmText: isLostCard ? 'Yes, Reactivate Card' : 'Freeze Card Immediately',
      cancelText: 'Keep Current Status',
      variant: isLostCard ? 'success' : 'danger',
    });

    if (!confirmed) {
      return;
    }

    setIsUpdatingStatus(true);
    router.patch(
      updateStudentStatus.url(selectedStudent.id),
      { status: newStatus },
      {
        preserveScroll: true,
        onFinish: () => setIsUpdatingStatus(false),
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Multi-Child Switcher Tabs (Shown prominently if parent has > 1 child) */}
      {students.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Select Child:
          </span>
          {students.map(s => {
            const isSelected = s.id === selectedStudent.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStudent(s.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'bg-[#5c1516] text-white shadow-xs ring-2 ring-[#5c1516]/20' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isSelected ? 'bg-amber-300 text-amber-950' : 'bg-slate-100 text-slate-600'
                }`}>
                  {s.name.charAt(0)}
                </span>
                <span>{s.name}</span>
                <span className="text-[10px] opacity-75 font-medium">({getShortGrade(s.gradeLevel)})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Student Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-extrabold text-lg sm:text-xl flex items-center justify-center shadow-md shrink-0 transition-colors ${
            isLostCard 
              ? 'bg-gradient-to-br from-red-600 to-rose-800 text-white' 
              : 'bg-gradient-to-br from-[#5c1516] to-[#7a1420] text-amber-300'
          }`}>
            {selectedStudent.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight truncate">
                {selectedStudent.name}
              </h2>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold shrink-0">
                RFID: {selectedStudent.rfidUid}
              </Badge>

              {/* Card Status Badge */}
              {isLostCard ? (
                <Badge className="bg-red-100 text-red-800 border-red-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <ShieldAlert size={12} className="text-red-600" />
                  Lost Card - Frozen
                </Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  Active Card
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {selectedStudent.gradeLevel} &bull; Student ID: <strong className="text-slate-700">{selectedStudent.studentId}</strong>
            </p>
          </div>
        </div>

        {/* Action Button: Freeze / Reactivate Card */}
        <div className="shrink-0 flex items-center">
          <Button
            size="sm"
            variant={isLostCard ? "default" : "outline"}
            disabled={isUpdatingStatus}
            onClick={handleToggleStatus}
            className={`h-9 px-3.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isLostCard
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900'
            }`}
          >
            {isUpdatingStatus ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isLostCard ? (
              <>
                <Unlock size={14} />
                <span>Reactivate RFID Card</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>Freeze / Report Lost RFID</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
