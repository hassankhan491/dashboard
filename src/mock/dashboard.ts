import type { MarketplaceFilter } from '../types/marketplace';

export interface DashboardKpis {
  grossSales: number;
  operatingProfit: number;
  profitMargin: number;
  availableBudget: number;
  productsReadyToBuy: number;
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'error' | 'info';
}

// Simulates different data based on the selected marketplace filter
const mockKpiData: Record<string, DashboardKpis> = {
  all: { grossSales: 80848.80, operatingProfit: 16948.45, profitMargin: 21.0, availableBudget: 37560.00, productsReadyToBuy: 32 },
  'mp-amazon': { grossSales: 38240.40, operatingProfit: 8016.68, profitMargin: 21.0, availableBudget: 22400.00, productsReadyToBuy: 14 },
  'mp-walmart': { grossSales: 42608.40, operatingProfit: 8931.77, profitMargin: 21.0, availableBudget: 15160.00, productsReadyToBuy: 18 },
};

const mockAlerts: DashboardAlert[] = [
  { id: '1', title: 'Reconcile late refunds', description: 'Evergreen Commerce Inc. · Sara Ali', type: 'warning' },
  { id: '2', title: '$75.00 late refund needs review', description: 'Evergreen Commerce Inc.', type: 'error' },
  { id: '3', title: 'PO-1042 awaits purchase approval', description: 'Northstar Retail LLC · $2,880.00', type: 'info' },
];

export const mockDashboardApi = {
  getKpis: (filter: MarketplaceFilter): Promise<DashboardKpis> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockKpiData[filter] || mockKpiData['all']), 300));
  },
  getAlerts: (): Promise<DashboardAlert[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockAlerts), 200));
  }
};