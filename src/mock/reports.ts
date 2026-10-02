import type { DailyBreakdown } from '../types/reports';

// Generate 30 days of mock daily data
const generateMockDailyData = (): DailyBreakdown[] => {
  const data: DailyBreakdown[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Randomize data slightly
    const orders = Math.floor(Math.random() * 20) + 5; // 5 to 25 orders
    const revenue = orders * (Math.random() * 30 + 20); // Avg order value ~$20-$50
    
    data.push({
      date: dateStr,
      revenue: Number(revenue.toFixed(2)),
      orders,
    });
  }
  return data;
};

export const mockDailyBreakdown: DailyBreakdown[] = generateMockDailyData();