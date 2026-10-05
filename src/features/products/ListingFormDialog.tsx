import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { useClients } from '../../hooks/useClients';
import { useCreateListing } from '../../hooks/useProducts';
import { useMarketplaces } from '../../hooks/useMarketplaces';
import type { ProductVariant } from '../../types/product';

const listingSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  marketplaceId: z.string().min(1, 'Marketplace is required'),
  variantId: z.string().min(1, 'Variant (SKU) is required'),
  listingPrice: z.number().min(0.01, 'Price must be greater than 0'),
  status: z.enum(['active', 'inactive', 'draft']),
});

type ListingValues = z.infer<typeof listingSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  productId: string;
  variants: ProductVariant[];
}

const inputClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function ListingFormDialog({ open, onClose, productId, variants }: Props) {
  const { data: clients } = useClients();
  const { data: marketplaces } = useMarketplaces();
  const createListing = useCreateListing();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListingValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      clientId: '',
      marketplaceId: '',
      variantId: variants[0]?.id ?? '',
      listingPrice: variants[0]?.sellingPrice ?? 0,
      status: 'draft',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      clientId: '',
      marketplaceId: '',
      variantId: variants[0]?.id ?? '',
      listingPrice: variants[0]?.sellingPrice ?? 0,
      status: 'draft',
    });
  }, [open, variants, reset]);

  const onSubmit = async (values: ListingValues) => {
    try {
      await createListing.mutateAsync({
        productId,
        ...values,
      });
      onClose();
    } catch {
      // keep dialog open
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add Marketplace Listing">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium">Client</label>
          <select className={inputClass} {...register('clientId')}>
            <option value="">Select client…</option>
            {clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.clientId && <p className="mt-1 text-xs text-destructive">{errors.clientId.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Marketplace</label>
          <select className={inputClass} {...register('marketplaceId')}>
            <option value="">Select marketplace…</option>
            {marketplaces?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {errors.marketplaceId && <p className="mt-1 text-xs text-destructive">{errors.marketplaceId.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Variant (SKU)</label>
          <select className={inputClass} {...register('variantId')}>
            {variants.map((v) => <option key={v.id} value={v.id}>{v.sku} — {v.name}</option>)}
          </select>
          {errors.variantId && <p className="mt-1 text-xs text-destructive">{errors.variantId.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Listing Price</label>
            <input type="number" step="0.01" className={inputClass} {...register('listingPrice', { valueAsNumber: true })} />
            {errors.listingPrice && <p className="mt-1 text-xs text-destructive">{errors.listingPrice.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select className={inputClass} {...register('status')}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {isSubmitting ? 'Creating…' : 'Create Listing'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}