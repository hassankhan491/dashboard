import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => inventoryService.getWarehouses(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getInventory(),
  });
}

export function usePriceHistory(variantId: string | undefined) {
  return useQuery({
    queryKey: ['price-history', variantId],
    queryFn: () => inventoryService.getPriceHistory(variantId!),
    enabled: Boolean(variantId),
  });
}

export function useReceivePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poId: string) => inventoryService.receivePO(poId),
    onSuccess: () => {
      // Invalidate inventory, price history, AND purchase orders (since status changed)
      void qc.invalidateQueries({ queryKey: ['inventory'] });
      void qc.invalidateQueries({ queryKey: ['price-history'] });
      void qc.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}