import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PackageCheck } from 'lucide-react';
import { Dialog } from '../../components/ui/Dialog';
import { useReturnAddresses, useReceiveReturn } from '../../hooks/useOrders';
import type { ReturnCondition, ReturnRecord } from '../../types/order';

const inputClass = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
const conditions: { value: ReturnCondition; label: string }[] = [
  { value: 'sellable', label: 'Sellable (Restock)' },
  { value: 'damaged', label: 'Damaged (Unsellable)' },
  { value: 'used', label: 'Used / Opened' },
  { value: 'missing_parts', label: 'Missing Parts' },
  { value: 'other', label: 'Other' },
];

interface Props { open: boolean; onClose: () => void; returnRecord: ReturnRecord; orderNumber: string; }
interface FormValues { returnAddressId: string; receivedQty: number; condition: ReturnCondition; conditionNote: string; }

export function ReturnReceivingDialog({ open, onClose, returnRecord, orderNumber }: Props) {
  const { data: addresses } = useReturnAddresses();
  const receiveReturn = useReceiveReturn();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const expectedQty = returnRecord.expectedQty ?? 1;
  const alreadyReceived = returnRecord.receipts?.reduce((sum, r) => sum + r.receivedQty, 0) ?? 0;
  const remaining = expectedQty - alreadyReceived;

  useEffect(() => {
    if (open) {
      const defaultAddress = addresses?.find((a) => a.isDefault)?.id || addresses?.[0]?.id || '';
      reset({
        returnAddressId: returnRecord.returnAddressId || defaultAddress,
        receivedQty: remaining,
        condition: 'sellable',
        conditionNote: '',
      });
    }
  }, [open, reset, addresses, returnRecord, remaining]);

  const onSubmit = handleSubmit((values) => {
    receiveReturn.mutate({
      returnId: returnRecord.id,
      receipt: {
        receivedQty: values.receivedQty,
        receivedAt: new Date().toISOString(),
        condition: values.condition,
        conditionNote: values.conditionNote || undefined,
        returnAddressId: values.returnAddressId,
        receivedBy: 'Current User',
      },
    }, { onSuccess: onClose });
  });

  return (
    <Dialog open={open} onClose={onClose} title={`Receive Return — ${orderNumber}`}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
          <p><span className="font-medium">Reason:</span> {returnRecord.reason}</p>
          <p><span className="font-medium">Expected:</span> {expectedQty} units · <span className="font-medium">Already Received:</span> {alreadyReceived} units</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Receiving Address (Master Settings)</label>
          <select className={inputClass} {...register('returnAddressId', { required: 'Select an address' })}>
            {addresses?.map((addr) => (
              <option key={addr.id} value={addr.id}>{addr.label} ({addr.city})</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Received Quantity</label>
            <input type="number" min={1} max={remaining} className={inputClass} {...register('receivedQty', { valueAsNumber: true, required: 'Qty is required', min: { value: 1, message: 'Min 1' }, max: { value: remaining, message: `Max ${remaining}` } })} />
            {errors.receivedQty && <p className="mt-1 text-xs text-red-600">{errors.receivedQty.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Condition</label>
            <select className={inputClass} {...register('condition')}>
              {conditions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Condition Notes (Optional)</label>
          <textarea className={inputClass} rows={2} placeholder="e.g. Box crushed, item scratched" {...register('conditionNote')} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          <button type="submit" disabled={receiveReturn.isPending} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <PackageCheck size={16} /> {receiveReturn.isPending ? 'Recording…' : 'Confirm Receipt'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}