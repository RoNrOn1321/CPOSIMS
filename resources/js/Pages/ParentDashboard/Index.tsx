import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Student, Transaction } from './types';
import StudentHeader from './Partials/StudentHeader';
import QuickStatsGrid from './Partials/QuickStatsGrid';
import OverviewTab from './Partials/OverviewTab';
import MealHistoryTab from './Partials/MealHistoryTab';
import SpendingLimitsTab from './Partials/SpendingLimitsTab';
import TopUpModal from './Partials/TopUpModal';
import EReceiptModal from './Partials/EReceiptModal';
import { Users } from 'lucide-react';

interface ParentDashboardProps {
  students?: Student[];
}

export default function ParentDashboardIndex({ students = [] }: ParentDashboardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.id ?? 0);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  // Synchronize selected child if students array changes
  useEffect(() => {
    if (students.length > 0 && !students.some(s => s.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  const studentTransactions = useMemo(() => {
    return currentStudent?.transactions || [];
  }, [currentStudent]);

  const weeklyTotal = useMemo(() => {
    if (currentStudent?.weeklySpent !== undefined) {
      return currentStudent.weeklySpent;
    }
    return studentTransactions.reduce((acc, t) => acc + t.total, 0);
  }, [currentStudent, studentTransactions]);

  const todayTransaction = useMemo(() => {
    return studentTransactions.find(t => t.dateTime.toLowerCase().includes('today')) || studentTransactions[0] || null;
  }, [studentTransactions]);

  // Handle local optimistic balance top-up display
  const handleTopUpConfirm = (amount: number) => {
    if (currentStudent) {
      currentStudent.balance += amount;
    }
  };

  // Graceful empty state when parent has no linked student accounts
  if (!currentStudent || students.length === 0) {
    return (
      <AdminLayout 
        portal="parent" 
        activeNav={activeTab} 
        onNavigate={setActiveTab}
      >
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#5c1516] flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <Users size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            No Linked Student Accounts Found
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            There are currently no student accounts linked to your parent portal profile. Please contact the school canteen cashier or registrar with your child's Student ID to link their RFID tag.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      portal="parent" 
      activeNav={activeTab} 
      onNavigate={setActiveTab}
      onTopUpClick={() => setIsTopUpOpen(true)}
    >
      {/* 1. Student Header Profile & Switcher */}
      <StudentHeader
        students={students}
        selectedStudent={currentStudent}
        onSelectStudent={setSelectedStudentId}
      />

      {/* 2. Top 4 Metric Cards */}
      <QuickStatsGrid
        student={currentStudent}
        onTopUpClick={() => setIsTopUpOpen(true)}
        weeklyTotal={weeklyTotal}
      />

      {/* 3. Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl h-12 shadow-xs grid grid-cols-3 w-full md:w-fit">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-bold data-[state=active]:bg-[#5c1516] data-[state=active]:text-white">
            Overview & Analytics
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl text-xs font-bold data-[state=active]:bg-[#5c1516] data-[state=active]:text-white">
            Meal History (Receipts)
          </TabsTrigger>
          <TabsTrigger value="limits" className="rounded-xl text-xs font-bold data-[state=active]:bg-[#5c1516] data-[state=active]:text-white">
            Daily Allowance Limits
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Analytics */}
        <TabsContent value="overview" className="m-0">
          <OverviewTab
            student={currentStudent}
            todayTransaction={todayTransaction}
            onViewReceipt={setSelectedReceipt}
          />
        </TabsContent>

        {/* Tab 2: Meal History */}
        <TabsContent value="history" className="m-0">
          <MealHistoryTab
            transactions={studentTransactions}
            onViewReceipt={setSelectedReceipt}
          />
        </TabsContent>

        {/* Tab 3: Daily Allowance Limits */}
        <TabsContent value="limits" className="m-0">
          <SpendingLimitsTab
            student={currentStudent}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        student={currentStudent}
        onConfirmTopUp={handleTopUpConfirm}
      />

      <EReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
        student={currentStudent}
      />
    </AdminLayout>
  );
}
