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
    queryFn: () => purchasingService.getPurchaseOrders(),
  });
}

export function usePurchaseOrder(id?: string) {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => purchasingService.getPurchaseOrderById(id!),
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
    mutationFn: ({ id, status, note }: { id: string; status: POStatus; note?: string }) =>
      purchasingService.updatePOStatus(id, status, note),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      void qc.invalidateQueries({ queryKey: ['purchase-order', vars.id] });
      void qc.invalidateQueries({ queryKey: ['inventory'] });
      void qc.invalidateQueries({ queryKey: ['price-history'] });
    },
  });
}

// ---------- Phase 12 Step 2: Invoices, Payments, Expenses, Exceptions, Financials ----------

export function usePOInvoices(poId?: string) {
  return useQuery({
    queryKey: ['po-invoices', poId],
    queryFn: () => purchasingService.getInvoicesByPO(poId!),
    enabled: Boolean(poId),
  });
}

export function usePOPayments(poId?: string) {
  return useQuery({
    queryKey: ['po-payments', poId],
    queryFn: () => purchasingService.getPaymentsByPO(poId!),
    enabled: Boolean(poId),
  });
}

export function usePOExpenses(poId?: string) {
  return useQuery({
    queryKey: ['po-expenses', poId],
    queryFn: () => purchasingService.getExpensesByPO(poId!),
    enabled: Boolean(poId),
  });
}

export function usePOExceptions(poId?: string) {
  return useQuery({
    queryKey: ['po-exceptions', poId],
    queryFn: () => purchasingService.getExceptionsByPO(poId!),
    enabled: Boolean(poId),
  });
}

export function usePOFinancials(poId?: string) {
  return useQuery({
    queryKey: ['po-financials', poId],
    queryFn: () => purchasingService.getFinancialSummary(poId!),
    enabled: Boolean(poId),
  });
}

export function useAddInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { poId: string; invoiceNumber: string; invoiceDate: string; amount: number; fileName?: string }) =>
      purchasingService.addInvoice(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['po-invoices', vars.poId] });
      void qc.invalidateQueries({ queryKey: ['po-financials', vars.poId] });
    },
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { poId: string; invoiceId: string; paidAmount: number; paymentDate: string; method: 'bank_transfer' | 'credit_card' | 'paypal' | 'cash' | 'other'; reference?: string; slipFileName?: string }) =>
      purchasingService.addPayment(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['po-payments', vars.poId] });
      void qc.invalidateQueries({ queryKey: ['po-financials', vars.poId] });
    },
  });
}

export function useAddExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { poId: string; category: 'prep' | 'freight' | 'labels' | 'storage' | 'customs' | 'misc'; amount: number; date: string; note?: string; fileName?: string }) =>
      purchasingService.addExpense(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['po-expenses', vars.poId] });
      void qc.invalidateQueries({ queryKey: ['po-financials', vars.poId] });
    },
  });
}

export function useAddStockException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { poId: string; itemId: string; variantId: string; type: 'out_of_stock' | 'unavailable' | 'short_quantity' | 'backordered'; reason: string; expectedResolution?: string }) =>
      purchasingService.addStockException(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['po-exceptions', vars.poId] });
      void qc.invalidateQueries({ queryKey: ['purchase-order', vars.poId] });
    },
  });
}

export function useResolveStockException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchasingService.resolveStockException(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['po-exceptions'] }),
  });
}

// ---------- Phase 12 Step 3: Line-Item Receiving Engine ----------

export function useReceivePOItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ poId, receipts }: { poId: string; receipts: { itemId: string; receivedQty: number; availabilityStatus: 'in_stock' | 'out_of_stock' | 'short_quantity' | 'backordered'; reason?: string; expectedResolution?: string }[] }) =>
      purchasingService.receiveItems(poId, receipts),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      void qc.invalidateQueries({ queryKey: ['purchase-order', vars.poId] });
      void qc.invalidateQueries({ queryKey: ['po-exceptions', vars.poId] });
      void qc.invalidateQueries({ queryKey: ['inventory'] });
      void qc.invalidateQueries({ queryKey: ['price-history'] });
    },
  });
}

export function usePurchasingExceptions() {
  return useQuery({
    queryKey: ['purchasing', 'exception-counts'],
    queryFn: () => purchasingService.getExceptionCounts(),
  });
}