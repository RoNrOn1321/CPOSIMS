export interface Student {
  id: number;
  name: string;
  gradeLevel: string;
  studentId: string;
  rfidUid: string;
  balance: number;
  dailyLimit: number;
  spentToday: number;
  prohibitedItems: string[];
  allergies: string[];
}

export interface TransactionItem {
  name: string;
  qty: number;
  price: number;
  category: string;
}

export interface Transaction {
  id: string;
  studentId: number;
  dateTime: string;
  mealType: string;
  items: TransactionItem[];
  total: number;
  terminal: string;
  paymentMethod: string;
  balanceAfter: number;
}

export interface WeeklySpendingPoint {
  day: string;
  amount: number;
  limit: number;
  meals: number;
  snacks: number;
}

export interface CategoryDistributionPoint {
  name: string;
  value: number;
  color: string;
}
