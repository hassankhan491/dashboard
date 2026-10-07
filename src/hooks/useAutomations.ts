import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { automationsService } from '../services/automationsService';
import type { AutomationJobName, AdjustmentType } from '../types/automation';

export function useAutomationRuns() {
  return useQuery({
    queryKey: ['automation-runs'],
    queryFn: () => automationsService.getRuns(),
  });
}

export function useRunAutomationJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobName: AutomationJobName) => automationsService.runJob(jobName, 'Current User'),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['automation-runs'] });
      void qc.invalidateQueries({ queryKey: ['order-cost'] });
    },
  });
}

export function useAdjustments() {
  return useQuery({
    queryKey: ['adjustments'],
    queryFn: () => automationsService.getAdjustments(),
  });
}

export function useOrderAdjustments(orderId?: string) {
  return useQuery({
    queryKey: ['adjustments', orderId],
    queryFn: () => automationsService.getAdjustmentsByOrder(orderId!),
    enabled: Boolean(orderId),
  });
}

export function useAddAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { orderId?: string; type: AdjustmentType; amount: number; reason: string; reference?: string }) =>
      automationsService.addAdjustment(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['adjustments'] });
      void qc.invalidateQueries({ queryKey: ['order-cost'] });
    },
  });
}