import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { costingService } from '../services/costingService';

export function useSkuCosts() {
  return useQuery({
    queryKey: ['sku-costs'],
    queryFn: () => costingService.getSkuCosts(),
  });
}

export function useAddSkuCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { sku: string; unitCost: number; effectiveFrom: string; note?: string }) =>
      costingService.addSkuCost(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['sku-costs'] });
      void qc.invalidateQueries({ queryKey: ['order-cost'] });
      void qc.invalidateQueries({ queryKey: ['missing-cost-orders'] });
    },
  });
}

export function useOrderCostBreakdown(orderId?: string) {
  return useQuery({
    queryKey: ['order-cost', orderId],
    queryFn: () => costingService.getCostBreakdown(orderId!),
    enabled: Boolean(orderId),
  });
}

export function useMissingCostOrders() {
  return useQuery({
    queryKey: ['missing-cost-orders'],
    queryFn: () => costingService.getMissingCostOrders(),
  });
}