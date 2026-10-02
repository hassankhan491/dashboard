import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { useMarketplaceFilter } from './MarketplaceFilterContext';

export function useDashboardKpis() {
  // We read the global filter here. When it changes, TanStack Query automatically refetches!
  const { filter } = useMarketplaceFilter(); 

  return useQuery({
    queryKey: ['dashboard-kpis', filter],
    queryFn: () => dashboardService.getKpis(filter),
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => dashboardService.getAlerts(),
  });
}