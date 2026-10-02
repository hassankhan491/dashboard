export type DateRangePreset = 'daily' | 'weekly' | 'monthly' | '3months' | '6months' | 'yearly' | 'custom';

export interface DateRange {
  preset: DateRangePreset;
  startDate: string; // ISO string
  endDate: string;   // ISO string
}

export interface ReportMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalRefunds: number;
  netProfit: number;
  averageOrderValue: number;
}

export interface DailyBreakdown {
  date: string; // YYYY-MM-DD
  revenue: number;
  orders: number;
}