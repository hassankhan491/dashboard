import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '../../components/ui/Dialog';
import { useAddReturnAddress, useUpdateReturnAddress } from '../../hooks/useOrders';
import type { ReturnAddress } from '../../types/order';

const inputClass = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

interface Props { open: boolean; onClose: () => void; existing?: ReturnAddress; }
interface FormValues { label: string; addressLine: string; city: string; country: string; isDefault: boolean; }

export function ReturnAddressFormDialog({ open, onClose, existing }: Props) {
  const add = useAddReturnAddress();
  const update = useUpdateReturnAddress();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (open) {
      reset({
        label: existing?.label ?? '',
        addressLine: existing?.addressLine ?? '',
        city: existing?.city ?? '',
        country: existing?.country ?? 'USA',
        isDefault: existing?.isDefault ?? false,
      });
    }
  }, [open, existing, reset]);

  const onSubmit = handleSubmit((values) => {
    const payload = { label: values.label, addressLine: values.addressLine, city: values.city, country: values.country, isDefault: values.isDefault };
    if (existing) {
      update.mutate({ id: existing.id, input: payload }, { onSuccess: onClose });
    } else {
      add.mutate(payload, { onSuccess: onClose });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} title={existing ? 'Edit Return Address' : 'Add Return Address'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Label</label>
          <input className={inputClass} placeholder="e.g. NJ Warehouse (Default)" {...register('label', { required: 'Label is required' })} />
          {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Address Line</label>
          <input className={inputClass} placeholder="Street, unit, postal code" {...register('addressLine', { required: 'Address is required' })} />
          {errors.addressLine && <p className="mt-1 text-xs text-red-600">{errors.addressLine.message}</p>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input className={inputClass} {...register('city', { required: 'City is required' })} />
            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Country</label>
            <input className={inputClass} {...register('country', { required: 'Country is required' })} />
            {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300" {...register('isDefault')} />
          Set as default return destination
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          <button type="submit" disabled={add.isPending || update.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {add.isPending || update.isPending ? 'Saving…' : 'Save Address'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}