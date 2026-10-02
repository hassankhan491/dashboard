import { mockDashboardApi, type DashboardKpis, type DashboardAlert } from '../mock/dashboard';
import type { MarketplaceFilter } from '../types/marketplace';

export const dashboardService = {
  getKpis: (filter: MarketplaceFilter): Promise<DashboardKpis> => mockDashboardApi.getKpis(filter),
  getAlerts: (): Promise<DashboardAlert[]> => mockDashboardApi.getAlerts(),
};