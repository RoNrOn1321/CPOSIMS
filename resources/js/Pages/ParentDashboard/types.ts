export interface Student {
  id: number;
  name: string;
  gradeLevel: string;
  studentId: string;
  rfidUid: string;
  balance: number;
  dailyLimit: number;
  spentToday: number;
  weeklySpent?: number;
  status?: 'active' | 'lost_card' | 'suspended' | 'inactive';
  prohibitedItems?: string[];
  allergies?: string[];
  transactions?: Transaction[];
  topups?: BalanceTopupRecord[];
}

export interface BalanceTopupRecord {
  id: number;
  referenceNumber: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  createdAt: string;
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
  rawCreatedAt?: string;
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
