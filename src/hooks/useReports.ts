import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reportsService';
import type { DateRange } from '../types/reports';

export function useReportMetrics(range: DateRange) {
  return useQuery({
    queryKey: ['report-metrics', range.startDate, range.endDate],
    queryFn: () => reportsService.getMetrics(range),
  });
}

export function useDailyBreakdown(range: DateRange) {
  return useQuery({
    queryKey: ['daily-breakdown', range.startDate, range.endDate],
    queryFn: () => reportsService.getDailyBreakdown(range),
  });
}