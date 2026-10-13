import React from 'react';
import { Badge } from '@/Components/ui/badge';
import { Student } from '../types';

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
  const getShortGrade = (level: string) => {
    const match = level.match(/Grade\s*(\d+)/i);
    if (match) return `Gr. ${match[1]}`;
    const parts = level.split('-');
    return parts[0].trim();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5c1516] to-[#7a1420] text-amber-300 font-extrabold text-xl flex items-center justify-center shadow-md">
          {selectedStudent.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {selectedStudent.name}
            </h2>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
              RFID: {selectedStudent.rfidUid}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {selectedStudent.gradeLevel} &bull; Student ID: <strong className="text-slate-700">{selectedStudent.studentId}</strong>
          </p>
        </div>
      </div>

      {/* Switch Child Switcher Pills */}
      {students.length > 1 && (
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 px-2 uppercase tracking-wider">
            Switch Child:
          </span>
          {students.map(s => {
            const isSelected = s.id === selectedStudent.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStudent(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected 
                    ? 'bg-[#5c1516] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                {s.name.split(' ')[0]} ({getShortGrade(s.gradeLevel)})
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
