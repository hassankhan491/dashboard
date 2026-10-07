import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '../../components/ui/Dialog';
import { useAddAdjustment } from '../../hooks/useAutomations';
import type { AdjustmentType } from '../../types/automation';

const inputClass = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
const types: AdjustmentType[] = ['cost', 'fee', 'operational', 'other'];

interface Props { open: boolean; onClose: () => void; orderId: string; }
interface FormValues { type: AdjustmentType; amount: number; reason: string; reference: string; }

export function AdjustmentFormDialog({ open, onClose, orderId }: Props) {
  const addAdjustment = useAddAdjustment();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (open) reset({ type: 'cost', amount: 0, reason: '', reference: '' });
  }, [open, reset]);

  const onSubmit = handleSubmit((values) => {
    addAdjustment.mutate({
      orderId,
      type: values.type,
      amount: Number(values.amount),
      reason: values.reason,
      reference: values.reference || undefined,
    }, { onSuccess: onClose });
  });

  return (
    <Dialog open={open} onClose={onClose} title="Add Cost Adjustment">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select className={inputClass} {...register('type')}>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Amount (use negative to reduce cost)</label>
            <input type="number" step="0.01" className={inputClass} {...register('amount', { required: 'Amount is required' })} />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Reason (required — audit rule)</label>
          <textarea className={inputClass} rows={2} placeholder="e.g. 3PL packaging surcharge not in supplier invoice" {...register('reason', { required: 'Reason is required for audit traceability' })} />
          {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Reference (optional)</label>
          <input className={inputClass} placeholder="ADJ-2026-002" {...register('reference')} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          <button type="submit" disabled={addAdjustment.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {addAdjustment.isPending ? 'Saving…' : 'Save Adjustment'}
          </button>
        </div>
      </form>
    </Dialog>
  );
} 