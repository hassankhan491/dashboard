import { mockDailyBreakdown } from '../mock/reports';
import type { DateRange, DailyBreakdown, ReportMetrics } from '../types/reports';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const reportsService = {
  async getMetrics(range: DateRange): Promise<ReportMetrics> {
    await delay(300);
    
    const start = new Date(range.startDate).getTime();
    const end = new Date(range.endDate).getTime();
    
    // Filter data within the range
    const filtered = mockDailyBreakdown.filter((d) => {
      const dTime = new Date(d.date).getTime();
      return dTime >= start && dTime <= end;
    });

    const totalRevenue = filtered.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = filtered.reduce((sum, d) => sum + d.orders, 0);
    
    // Mocking refunds and profit as percentages for the demo
    const totalRefunds = totalRevenue * 0.05; // 5% refund rate
    const netProfit = totalRevenue * 0.35;    // 35% profit margin

    return {
      totalRevenue,
      totalOrders,
      totalRefunds,
      netProfit,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  },

  async getDailyBreakdown(range: DateRange): Promise<DailyBreakdown[]> {
    await delay(300);
    
    const start = new Date(range.startDate).getTime();
    const end = new Date(range.endDate).getTime();
    
    return mockDailyBreakdown.filter((d) => {
      const dTime = new Date(d.date).getTime();
      return dTime >= start && dTime <= end;
    });
  },
};