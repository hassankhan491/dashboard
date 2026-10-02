import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { purchasingService } from '../services/purchasingService';
import type { POStatus, PurchaseOrderInput } from '../types/purchasing';

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => purchasingService.getSuppliers(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => purchasingService.getAllPOs(),
  });
}

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: () => purchasingService.getPOById(id!),
    enabled: Boolean(id),
  });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PurchaseOrderInput) => purchasingService.createPO(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });
}

export function useUpdatePOStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: POStatus }) =>
      purchasingService.updatePOStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      void qc.invalidateQueries({ queryKey: ['inventory'] }); // <--- ADD THIS
      void qc.invalidateQueries({ queryKey: ['price-history'] }); // <--- ADD THIS
    },
  });
}