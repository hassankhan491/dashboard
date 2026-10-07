import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '../../components/ui/Dialog';
import { useAddSkuCost } from '../../hooks/useCosting';
import { useProducts } from '../../hooks/useProducts';

const inputClass = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

interface Props { open: boolean; onClose: () => void; }
interface FormValues { sku: string; unitCost: number; effectiveFrom: string; note: string; }

export function SkuCostFormDialog({ open, onClose }: Props) {
  const addSkuCost = useAddSkuCost();
  const { data: products } = useProducts();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (open) reset({ sku: '', unitCost: 0, effectiveFrom: new Date().toISOString().slice(0, 10), note: '' });
  }, [open, reset]);

  const skus = (products ?? []).flatMap((p) => p.variants.map((v) => ({ sku: v.sku, name: p.name })));

  const onSubmit = handleSubmit((values) => {
    addSkuCost.mutate({
      sku: values.sku,
      unitCost: Number(values.unitCost),
      effectiveFrom: new Date(values.effectiveFrom).toISOString(),
      note: values.note || undefined,
    }, { onSuccess: onClose });
  });

  return (
    <Dialog open={open} onClose={onClose} title="Add SKU Cost Rule">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">SKU</label>
          <select className={inputClass} {...register('sku', { required: 'Select a SKU' })}>
            <option value="">Select SKU…</option>
            {skus.map((s) => (
              <option key={s.sku} value={s.sku}>{s.sku} — {s.name}</option>
            ))}
          </select>
          {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Unit Cost (USD)</label>
            <input type="number" step="0.01" min="0" className={inputClass} {...register('unitCost', { required: 'Cost is required', min: { value: 0.01, message: 'Must be greater than 0' } })} />
            {errors.unitCost && <p className="mt-1 text-xs text-red-600">{errors.unitCost.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Effective From</label>
            <input type="date" className={inputClass} {...register('effectiveFrom', { required: 'Date is required' })} />
            {errors.effectiveFrom && <p className="mt-1 text-xs text-red-600">{errors.effectiveFrom.message}</p>}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Note (optional)</label>
          <input className={inputClass} placeholder="e.g. Price increase from PO-1005" {...register('note')} />
        </div>
        <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Per rule 6.2: adding a new rule for a SKU automatically closes the previous open rule the day before this effective date. Historical orders always keep the cost that was in effect on their order date.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          <button type="submit" disabled={addSkuCost.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {addSkuCost.isPending ? 'Saving…' : 'Save Cost Rule'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}