import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersService, type ReturnInput } from '../services/ordersService';
import { MARKETPLACE_FILTER_ALL } from '../types/marketplace';
import type { OrderStatus, ReturnRecord } from '../types/order';
import { useAuth } from './AuthContext';
import { useMarketplaceFilter } from './MarketplaceFilterContext';

/** Orders respect BOTH the global marketplace filter and client-level access */
export function useOrders() {
  const { user } = useAuth();
  const { filter } = useMarketplaceFilter();
  return useQuery({
    queryKey: ['orders', filter, user?.id],
    queryFn: async () => {
      const all = await ordersService.getAll();
      return all.filter((order) => {
        const marketplaceOk =
          filter === MARKETPLACE_FILTER_ALL || order.marketplaceId === filter;
        const clientOk =
          !user || user.clientIds.length === 0 || user.clientIds.includes(order.clientId);
        return marketplaceOk && clientOk;
      });
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      ordersService.updateStatus(id, status, user?.name ?? 'System', note),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: ['orders', updated.id] });
    },
  });
}

export function useAddReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReturnInput }) =>
      ordersService.addReturn(id, input),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: ['orders', updated.id] });
    },
  });
}

export function useUpdateReturnStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, returnId, status }: { id: string; returnId: string; status: ReturnRecord['status'] }) =>
      ordersService.updateReturnStatus(id, returnId, status),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: ['orders', updated.id] });
    },
  });
}



export function useReturnAddresses() {
  return useQuery({
    queryKey: ['return-addresses'],
    queryFn: () => ordersService.getReturnAddresses(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useReceiveReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ returnId, receipt }: { returnId: string; receipt: Omit<import('../types/order').ReturnReceipt, 'id'> }) =>
      ordersService.receiveReturn(returnId, receipt),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useRefundExposure() {
  return useQuery({
    queryKey: ['orders', 'refund-exposure'],
    queryFn: () => ordersService.getRefundExposure(),
  });
}