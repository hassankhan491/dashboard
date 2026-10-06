import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '../../components/ui/Dialog';
import { useAddInvoice } from '../../hooks/usePurchasing';

const inputClass = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

interface Props { open: boolean; onClose: () => void; poId: string; }
interface InvoiceValues { invoiceNumber: string; invoiceDate: string; amount: number; }

export function InvoiceFormDialog({ open, onClose, poId }: Props) {
  const addInvoice = useAddInvoice();
  const [fileName, setFileName] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvoiceValues>();

  useEffect(() => {
    if (open) { reset({ invoiceNumber: '', invoiceDate: '', amount: 0 }); setFileName(''); }
  }, [open, reset]);

  const onSubmit = handleSubmit((values) => {
    addInvoice.mutate({
      poId,
      invoiceNumber: values.invoiceNumber,
      invoiceDate: new Date(values.invoiceDate).toISOString(),
      amount: Number(values.amount),
      fileName: fileName || undefined,
    }, { onSuccess: () => onClose() });
  });

  return (
    <Dialog open={open} onClose={onClose} title="Attach Supplier Invoice">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Invoice Number</label>
          <input className={inputClass} placeholder="INV-000123" {...register('invoiceNumber', { required: 'Invoice number is required' })} />
          {errors.invoiceNumber && <p className="mt-1 text-xs text-red-600">{errors.invoiceNumber.message}</p>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Invoice Date</label>
            <input type="date" className={inputClass} {...register('invoiceDate', { required: 'Date is required' })} />
            {errors.invoiceDate && <p className="mt-1 text-xs text-red-600">{errors.invoiceDate.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Amount</label>
            <input type="number" step="0.01" min="0" className={inputClass} {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Invoice File (PDF/Image)</label>
          <input type="file" accept=".pdf,.png,.jpg" className="w-full text-sm" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
          {fileName && <p className="mt-1 text-xs text-muted-foreground">Selected: {fileName}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          <button type="submit" disabled={addInvoice.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {addInvoice.isPending ? 'Attaching…' : 'Attach Invoice'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}