import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '../../components/ui/Dialog';
import { useAddPayment } from '../../hooks/usePurchasing';
import type { PaymentMethod, PurchaseInvoice } from '../../types/purchasing';

const inputClass = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
const methods: PaymentMethod[] = ['bank_transfer', 'credit_card', 'paypal', 'cash', 'other'];

interface Props { open: boolean; onClose: () => void; poId: string; invoices: PurchaseInvoice[]; }
interface PaymentValues { invoiceId: string; paidAmount: number; paymentDate: string; method: PaymentMethod; reference: string; }

export function PaymentFormDialog({ open, onClose, poId, invoices }: Props) {
  const addPayment = useAddPayment();
  const [slipName, setSlipName] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentValues>();

  useEffect(() => {
    if (open) { reset({ invoiceId: '', paidAmount: 0, paymentDate: '', method: 'bank_transfer', reference: '' }); setSlipName(''); }
  }, [open, reset]);

  const onSubmit = handleSubmit((values) => {
    addPayment.mutate({
      poId,
      invoiceId: values.invoiceId,
      paidAmount: Number(values.paidAmount),
      paymentDate: new Date(values.paymentDate).toISOString(),
      method: values.method,
      reference: values.reference || undefined,
      slipFileName: slipName || undefined,
    }, { onSuccess: () => onClose() });
  });

  return (
    <Dialog open={open} onClose={onClose} title="Record Payment">
      {invoices.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Attach a supplier invoice first before recording payments.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Invoice</label>
            <select className={inputClass} {...register('invoiceId', { required: 'Select an invoice' })}>
              <option value="">Select invoice…</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {inv.amount.toFixed(2)}</option>
              ))}
            </select>
            {errors.invoiceId && <p className="mt-1 text-xs text-red-600">{errors.invoiceId.message}</p>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Paid Amount</label>
              <input type="number" step="0.01" min="0" className={inputClass} {...register('paidAmount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} />
              {errors.paidAmount && <p className="mt-1 text-xs text-red-600">{errors.paidAmount.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Payment Date</label>
              <input type="date" className={inputClass} {...register('paymentDate', { required: 'Date is required' })} />
              {errors.paymentDate && <p className="mt-1 text-xs text-red-600">{errors.paymentDate.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Method</label>
              <select className={inputClass} {...register('method')}>
                {methods.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Reference #</label>
              <input className={inputClass} placeholder="TXN-000123" {...register('reference')} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Payment Slip / Proof</label>
            <input type="file" accept=".pdf,.png,.jpg" className="w-full text-sm" onChange={(e) => setSlipName(e.target.files?.[0]?.name ?? '')} />
            {slipName && <p className="mt-1 text-xs text-muted-foreground">Selected: {slipName}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
            <button type="submit" disabled={addPayment.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {addPayment.isPending ? 'Saving…' : 'Record Payment'}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}