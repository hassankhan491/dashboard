import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { useAddReturn } from '../../hooks/useOrders';
import type { Order } from '../../types/order';

const returnSchema = z.object({
  reason: z.string().min(5, 'Please describe the reason (min 5 characters)'),
  refundAmount: z.number().min(0.01, 'Refund amount must be greater than 0'),
  note: z.string(),
});

type ReturnValues = z.infer<typeof returnSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  order: Order;
}

const inputClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function ReturnFormDialog({ open, onClose, order }: Props) {
  const addReturn = useAddReturn();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReturnValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: { reason: '', refundAmount: order.total, note: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset({ reason: '', refundAmount: order.total, note: '' });
  }, [open, order.total, reset]);

  const onSubmit = async (values: ReturnValues) => {
    try {
      await addReturn.mutateAsync({
        id: order.id,
        input: {
          reason: values.reason,
          refundAmount: values.refundAmount,
          note: values.note || undefined,
        },
      });
      onClose();
    } catch {
      // keep dialog open on failure
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={`Request return — ${order.orderNumber}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="return-reason" className="mb-1 block text-sm font-medium">Reason</label>
          <input
            id="return-reason"
            className={inputClass}
            placeholder="e.g. Damaged on arrival"
            {...register('reason')}
          />
          {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>}
        </div>
        <div>
          <label htmlFor="return-amount" className="mb-1 block text-sm font-medium">
            Refund amount (USD)
          </label>
          <input
            id="return-amount"
            type="number"
            min="0.01"
            step="0.01"
            className={inputClass}
            {...register('refundAmount', { valueAsNumber: true })}
          />
          {errors.refundAmount && (
            <p className="mt-1 text-xs text-destructive">{errors.refundAmount.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="return-note" className="mb-1 block text-sm font-medium">
            Note (optional)
          </label>
          <textarea id="return-note" rows={3} className={inputClass} {...register('note')} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting…' : 'Request Return'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}