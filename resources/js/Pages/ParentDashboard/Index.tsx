import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Student, Transaction, WeeklySpendingPoint, CategoryDistributionPoint } from './types';
import StudentHeader from './Partials/StudentHeader';
import QuickStatsGrid from './Partials/QuickStatsGrid';
import OverviewTab from './Partials/OverviewTab';
import MealHistoryTab from './Partials/MealHistoryTab';
import SpendingLimitsTab from './Partials/SpendingLimitsTab';
import DietaryRestrictionsTab from './Partials/DietaryRestrictionsTab';
import TopUpModal from './Partials/TopUpModal';
import EReceiptModal from './Partials/EReceiptModal';

const initialStudents: Student[] = [
  {
    id: 101,
    name: 'Juan Dela Cruz',
    gradeLevel: 'Grade 6 - St. Therese (Elementary)',
    studentId: '2024-0012',
    rfidUid: 'RF-882194',
    balance: 450.0,
    dailyLimit: 120.0,
    spentToday: 40.0,
    prohibitedItems: ['Carbonated Sodas', 'Instant Noodles'],
    allergies: ['Peanuts'],
  },
  {
    id: 102,
    name: 'Maria Clara Dela Cruz',
    gradeLevel: 'Grade 10 - St. Francis (Junior High)',
    studentId: '2022-0451',
    rfidUid: 'RF-882195',
    balance: 620.0,
    dailyLimit: 200.0,
    spentToday: 85.0,
    prohibitedItems: ['High-Caffeine Energy Drinks'],
    allergies: ['Seafood / Shrimp'],
  },
];

const weeklySpendingData: WeeklySpendingPoint[] = [
  { day: 'Mon', amount: 65, limit: 120, meals: 1, snacks: 1 },
  { day: 'Tue', amount: 40, limit: 120, meals: 0, snacks: 2 },
  { day: 'Wed', amount: 85, limit: 120, meals: 1, snacks: 2 },
  { day: 'Thu', amount: 50, limit: 120, meals: 1, snacks: 0 },
  { day: 'Fri (Today)', amount: 40, limit: 120, meals: 1, snacks: 0 },
];

const categoryDistribution: CategoryDistributionPoint[] = [
  { name: 'Rice Meals', value: 155, color: '#5c1516' },
  { name: 'Fresh Drinks', value: 50, color: '#008dd5' },
  { name: 'Snacks & Sandwiches', value: 45, color: '#d38c28' },
  { name: 'Fruits & Bakery', value: 30, color: '#10b981' },
];

const sampleTransactions: Transaction[] = [
  {
    id: 'TXN-8092',
    studentId: 101,
    dateTime: 'Today, 12:15 PM',
    mealType: 'Lunch Meal',
    items: [
      { name: 'Chicken Adobo Rice Bowl', qty: 1, price: 70.0, category: 'Rice Meals' },
      { name: 'Fresh Calamansi Juice', qty: 1, price: 20.0, category: 'Beverages' },
    ],
    total: 40.0,
    terminal: 'Canteen Terminal #01 (Main Building)',
    paymentMethod: 'Student RFID Card Tap',
    balanceAfter: 450.0,
  },
  {
    id: 'TXN-8071',
    studentId: 101,
    dateTime: 'Yesterday, 09:45 AM',
    mealType: 'Morning Recess',
    items: [
      { name: 'Ham & Egg Toasted Sandwich', qty: 1, price: 35.0, category: 'Snacks & Sandwiches' },
      { name: 'Mineral Water (500ml)', qty: 1, price: 15.0, category: 'Beverages' },
    ],
    total: 50.0,
    terminal: 'Canteen Terminal #02 (Annex Canteen)',
    paymentMethod: 'Student RFID Card Tap',
    balanceAfter: 490.0,
  },
  {
    id: 'TXN-8055',
    studentId: 101,
    dateTime: 'Wednesday, 12:20 PM',
    mealType: 'Lunch Meal',
    items: [
      { name: 'Pork Sinigang with Steamed Rice', qty: 1, price: 75.0, category: 'Rice Meals' },
      { name: 'Fresh Fruit Cup (Melon)', qty: 1, price: 35.0, category: 'Healthy' },
    ],
    total: 85.0,
    terminal: 'Canteen Terminal #01 (Main Building)',
    paymentMethod: 'Student RFID Card Tap',
    balanceAfter: 540.0,
  },
  {
    id: 'TXN-8032',
    studentId: 101,
    dateTime: 'Tuesday, 03:30 PM',
    mealType: 'Afternoon Snack',
    items: [
      { name: 'Cheese Ensaymada', qty: 1, price: 20.0, category: 'Bakery' },
      { name: 'Dutch Chocolate Milk', qty: 1, price: 20.0, category: 'Beverages' },
    ],
    total: 40.0,
    terminal: 'Canteen Terminal #01 (Main Building)',
    paymentMethod: 'Student RFID Card Tap',
    balanceAfter: 625.0,
  },
  {
    id: 'TXN-8010',
    studentId: 101,
    dateTime: 'Monday, 12:10 PM',
    mealType: 'Lunch Meal',
    items: [
      { name: 'Sweet Style Spaghetti with Cheese', qty: 1, price: 50.0, category: 'Rice Meals' },
      { name: 'Purified Water (500ml)', qty: 1, price: 15.0, category: 'Beverages' },
    ],
    total: 65.0,
    terminal: 'Canteen Terminal #01 (Main Building)',
    paymentMethod: 'Student RFID Card Tap',
    balanceAfter: 665.0,
  },
];

export default function ParentDashboardIndex() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(101);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Handlers
  const handleTopUpConfirm = (amount: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentId) {
        return { ...s, balance: s.balance + amount };
      }
      return s;
    }));
  };

  const handleSaveDailyLimit = (newLimit: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentId) {
        return { ...s, dailyLimit: newLimit };
      }
      return s;
    }));
  };

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
        weeklyTotal={280.0}
      />

      {/* 3. Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl h-12 shadow-xs grid grid-cols-4 w-full md:w-fit">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-bold data-[state=active]:bg-[#5c1516] data-[state=active]:text-white">
            Overview & Analytics
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl text-xs font-bold data-[state=active]:bg-[#5c1516] data-[state=active]:text-white">
            Meal History (Receipts)
          </TabsTrigger>
          <TabsTrigger value="limits" className="rounded-xl text-xs font-bold data-[state=active]:bg-[#5c1516] data-[state=active]:text-white">
            Daily Allowance Limits
          </TabsTrigger>
          <TabsTrigger value="restrictions" className="rounded-xl text-xs font-bold data-[state=active]:bg-[#5c1516] data-[state=active]:text-white">
            Dietary & Restrictions
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Analytics */}
        <TabsContent value="overview" className="m-0">
          <OverviewTab
            student={currentStudent}
            weeklySpendingData={weeklySpendingData}
            categoryDistribution={categoryDistribution}
            todayTransaction={sampleTransactions[0]}
            onViewReceipt={setSelectedReceipt}
          />
        </TabsContent>

        {/* Tab 2: Meal History */}
        <TabsContent value="history" className="m-0">
          <MealHistoryTab
            transactions={sampleTransactions}
            onViewReceipt={setSelectedReceipt}
          />
        </TabsContent>

        {/* Tab 3: Daily Allowance Limits */}
        <TabsContent value="limits" className="m-0">
          <SpendingLimitsTab
            student={currentStudent}
            onSaveLimit={handleSaveDailyLimit}
          />
        </TabsContent>

        {/* Tab 4: Dietary Safeguards */}
        <TabsContent value="restrictions" className="m-0">
          <DietaryRestrictionsTab
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
