import { useQuery } from '@tanstack/react-query';
import { financeService } from '../services/financeService';

export function useFinanceSummary() {
  return useQuery({
    queryKey: ['finance-summary'],
    queryFn: () => financeService.getSummary(),
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => financeService.getTransactions(),
  });
}