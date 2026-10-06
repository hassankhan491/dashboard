import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '../../components/ui/Dialog';
import { useAddExpense } from '../../hooks/usePurchasing';
import type { ExpenseCategory } from '../../types/purchasing';

const inputClass = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
const categories: ExpenseCategory[] = ['prep', 'freight', 'labels', 'storage', 'customs', 'misc'];

interface Props { open: boolean; onClose: () => void; poId: string; }
interface ExpenseValues { category: ExpenseCategory; amount: number; date: string; note: string; }

export function ExpenseFormDialog({ open, onClose, poId }: Props) {
  const addExpense = useAddExpense();
  const [fileName, setFileName] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseValues>();

  useEffect(() => {
    if (open) { reset({ category: 'freight', amount: 0, date: '', note: '' }); setFileName(''); }
  }, [open, reset]);

  const onSubmit = handleSubmit((values) => {
    addExpense.mutate({
      poId,
      category: values.category,
      amount: Number(values.amount),
      date: new Date(values.date).toISOString(),
      note: values.note || undefined,
      fileName: fileName || undefined,
    }, { onSuccess: () => onClose() });
  });

  return (
    <Dialog open={open} onClose={onClose} title="Add Indirect Expense">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select className={inputClass} {...register('category')}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Amount</label>
            <input type="number" step="0.01" min="0" className={inputClass} {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Date</label>
          <input type="date" className={inputClass} {...register('date', { required: 'Date is required' })} />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Note</label>
          <textarea className={inputClass} rows={2} placeholder="e.g. Sea freight Guangzhou → NY" {...register('note')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Attachment (optional)</label>
          <input type="file" accept=".pdf,.png,.jpg" className="w-full text-sm" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          <button type="submit" disabled={addExpense.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {addExpense.isPending ? 'Saving…' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}