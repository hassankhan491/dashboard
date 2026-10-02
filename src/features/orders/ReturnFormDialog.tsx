import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { useAddReturn } from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/format';
import type { Order } from '../../types/order';

const returnSchema = z.object({
  orderId: z.string().min(1, 'Please select an order'),
  reason: z.string().min(5, 'Please describe the reason (min 5 characters)'),
  refundAmount: z.number().min(0.01, 'Refund amount must be greater than 0'),
  note: z.string(),
});

type ReturnValues = z.infer<typeof returnSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  orders: Order[];
}

const inputClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function ReturnFormDialog({ open, onClose, orders }: Props) {
  const addReturn = useAddReturn();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReturnValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: { orderId: '', reason: '', refundAmount: 0, note: '' },
  });

  useEffect(() => {
    if (!open) {
      reset({ orderId: '', reason: '', refundAmount: 0, note: '' });
      setSelectedOrder(null);
    }
  }, [open, reset]);

  const handleOrderSelect = (orderId: string) => {
    setValue('orderId', orderId);
    const order = orders.find((o) => o.id === orderId);
    setSelectedOrder(order ?? null);
    if (order) {
      setValue('refundAmount', order.total);
    } else {
      setValue('refundAmount', 0);
    }
  };

  const onSubmit = async (values: ReturnValues) => {
    if (!selectedOrder) return;
    try {
      await addReturn.mutateAsync({
        id: selectedOrder.id,
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
    <Dialog open={open} onClose={onClose} title="Request New Return">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="return-order" className="mb-1 block text-sm font-medium">Select Order</label>
          <select
            id="return-order"
            className={inputClass}
            onChange={(e) => handleOrderSelect(e.target.value)}
            value={selectedOrder?.id ?? ''}
          >
            <option value="">Choose an order...</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.orderNumber} - {order.customerName} ({formatCurrency(order.total)})
              </option>
            ))}
          </select>
          {errors.orderId && <p className="mt-1 text-xs text-destructive">{errors.orderId.message}</p>}
        </div>

        {selectedOrder && (
          <>
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
          </>
        )}

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
            disabled={isSubmitting || !selectedOrder}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting…' : 'Request Return'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}