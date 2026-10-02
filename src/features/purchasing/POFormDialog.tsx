import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { useCreatePO } from '../../hooks/usePurchasing';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/usePurchasing';
import { formatCurrency } from '../../utils/format';
import type { PurchaseOrderInput } from '../../types/purchasing';

const itemSchema = z.object({
  variantId: z.string().min(1, 'Variant is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitCost: z.number().min(0.01, 'Cost must be greater than 0'),
});

const poSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  expectedDate: z.string().min(1, 'Expected date is required'),
  notes: z.string(),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
});

type POFormValues = z.infer<typeof poSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function POFormDialog({ open, onClose }: Props) {
  const { data: suppliers } = useSuppliers();
  const { data: products } = useProducts();
  const createPO = useCreatePO();

  // Flatten products and variants for the dropdown
  const flatVariants = useMemo(() => {
    return products?.flatMap((p) =>
      p.variants.map((v) => ({
        id: v.id,
        label: `${p.name} (${v.sku})`,
        defaultCost: v.costPrice,
      }))
    ) ?? [];
  }, [products]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<POFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      supplierId: '',
      expectedDate: '',
      notes: '',
      items: [{ variantId: '', quantity: 0, unitCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch items to calculate grand total
  const watchedItems = watch('items');
  const grandTotal = watchedItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0), 0);

  useEffect(() => {
    if (!open) {
      reset({
        supplierId: '',
        expectedDate: '',
        notes: '',
        items: [{ variantId: '', quantity: 0, unitCost: 0 }],
      });
    }
  }, [open, reset]);

  const onSubmit = async (values: POFormValues) => {
    const input: PurchaseOrderInput = {
      supplierId: values.supplierId,
      expectedDate: values.expectedDate,
      notes: values.notes || undefined,
      items: values.items,
    };
    try {
      await createPO.mutateAsync(input);
      onClose();
    } catch {
      // keep dialog open
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create Purchase Order" wide>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Supplier</label>
            <select className={inputClass} {...register('supplierId')}>
              <option value="">Select supplier…</option>
              {suppliers?.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
              ))}
            </select>
            {errors.supplierId && <p className="mt-1 text-xs text-destructive">{errors.supplierId.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Expected Date</label>
            <input type="date" className={inputClass} {...register('expectedDate')} />
            {errors.expectedDate && <p className="mt-1 text-xs text-destructive">{errors.expectedDate.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
          <textarea className={inputClass} rows={2} {...register('notes')} />
        </div>

        {/* Items Section */}
        <div className="rounded-md border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Order Items</h3>
            <button
              type="button"
              onClick={() => append({ variantId: '', quantity: 0, unitCost: 0 })}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {errors.items?.message && <p className="mb-2 text-xs text-destructive">{errors.items.message}</p>}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-md border bg-card p-3 md:grid-cols-12">
                <div className="md:col-span-5">
                  <label className="mb-1 block text-xs font-medium">Product / SKU</label>
                  <select className={inputClass} {...register(`items.${index}.variantId`)}>
                    <option value="">Select variant…</option>
                    {flatVariants.map((v) => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                  {errors.items?.[index]?.variantId && (
                    <p className="mt-1 text-[10px] text-destructive">{errors.items[index].variantId?.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium">Qty</label>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium">Unit Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={inputClass}
                    {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                  />
                </div>
                <div className="flex items-end justify-between md:col-span-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Row Total</p>
                    <p className="font-medium">
                      {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitCost || 0))}
                    </p>
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end border-t pt-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Grand Total</p>
              <p className="text-xl font-bold">{formatCurrency(grandTotal)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating…' : 'Create PO'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}