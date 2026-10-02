import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { useCreateClient, useUpdateClient } from '../../hooks/useClients';
import { useMarketplaces } from '../../hooks/useMarketplaces';
import { useUsers } from '../../hooks/useUsers';
import type { Client, ClientInput, ClientMarketplaceInfo } from '../../types/client';

const clientSchema = z.object({
  name: z.string().min(2, 'Client name is required'),
  status: z.enum(['active', 'inactive', 'onboarding']),
  accountManagerId: z.string(),
  billingEmail: z.string().min(1, 'Billing email is required').email('Enter a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(5, 'Address is required'),
  taxId: z.string(),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  currency: z.string().min(1, 'Currency is required'),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  client: Client | null; // null = create mode
}

const inputClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

const emptyValues: ClientFormValues = {
  name: '',
  status: 'onboarding',
  accountManagerId: '',
  billingEmail: '',
  phone: '',
  address: '',
  taxId: '',
  paymentTerms: 'Net 30',
  currency: 'USD',
};

export function ClientFormDialog({ open, onClose, client }: Props) {
  const { data: users } = useUsers();
  const { data: marketplaces } = useMarketplaces();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  // Marketplace assignments are managed with local state (dynamic list)
  const [marketplaceInfos, setMarketplaceInfos] = useState<ClientMarketplaceInfo[]>([]);
  const [marketplaceError, setMarketplaceError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    setMarketplaceInfos(client?.marketplaceInfos ?? []);
    setMarketplaceError(null);
    reset(
      client
        ? {
            name: client.name,
            status: client.status,
            accountManagerId: client.accountManagerId ?? '',
            billingEmail: client.billing.billingEmail,
            phone: client.billing.phone,
            address: client.billing.address,
            taxId: client.billing.taxId,
            paymentTerms: client.billing.paymentTerms,
            currency: client.billing.currency,
          }
        : emptyValues,
    );
  }, [open, client, reset]);

  const toggleMarketplace = (marketplaceId: string, checked: boolean) => {
    setMarketplaceInfos((prev) =>
      checked
        ? [...prev, { marketplaceId, storeName: '', accountStatus: 'pending', monthlyFee: 0 }]
        : prev.filter((info) => info.marketplaceId !== marketplaceId),
    );
  };

  const updateMarketplaceInfo = (marketplaceId: string, patch: Partial<ClientMarketplaceInfo>) => {
    setMarketplaceInfos((prev) =>
      prev.map((info) => (info.marketplaceId === marketplaceId ? { ...info, ...patch } : info)),
    );
  };

  const onSubmit = async (values: ClientFormValues) => {
    if (marketplaceInfos.some((info) => !info.storeName.trim())) {
      setMarketplaceError('Please enter a store name for every selected marketplace.');
      return;
    }
    setMarketplaceError(null);
    const input: ClientInput = {
      name: values.name,
      status: values.status,
      accountManagerId: values.accountManagerId || undefined,
      teamUserIds: client?.teamUserIds ?? [],
      contacts: client?.contacts ?? [],
      marketplaceInfos,
      billing: {
        billingEmail: values.billingEmail,
        phone: values.phone,
        address: values.address,
        taxId: values.taxId,
        paymentTerms: values.paymentTerms,
        currency: values.currency,
      },
    };
    try {
      if (client) {
        await updateClient.mutateAsync({ id: client.id, input });
      } else {
        await createClient.mutateAsync(input);
      }
      onClose();
    } catch {
      // keep dialog open on failure
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={client ? 'Edit Client' : 'Add Client'} wide>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="client-name" className="mb-1 block text-sm font-medium">Client name</label>
            <input id="client-name" className={inputClass} placeholder="e.g. Northstar Retail LLC" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="client-status" className="mb-1 block text-sm font-medium">Status</label>
            <select id="client-status" className={inputClass} {...register('status')}>
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="client-manager" className="mb-1 block text-sm font-medium">Account manager</label>
          <select id="client-manager" className={inputClass} {...register('accountManagerId')}>
            <option value="">Unassigned</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-3 rounded-md border p-4">
          <legend className="px-1 text-sm font-semibold">Marketplaces</legend>
          {marketplaces?.map((mp) => {
            const info = marketplaceInfos.find((i) => i.marketplaceId === mp.id);
            const checked = Boolean(info);
            return (
              <div key={mp.id} className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => toggleMarketplace(mp.id, event.target.checked)}
                  />
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mp.color }} />
                  Sell on {mp.name}
                </label>
                {checked && info && (
                  <div className="grid gap-3 rounded-md bg-muted/50 p-3 md:grid-cols-3">
                    <div>
                      <label htmlFor={`store-${mp.id}`} className="mb-1 block text-xs font-medium">
                        Store name
                      </label>
                      <input
                        id={`store-${mp.id}`}
                        className={inputClass}
                        value={info.storeName}
                        onChange={(event) =>
                          updateMarketplaceInfo(mp.id, { storeName: event.target.value })
                        }
                        placeholder="e.g. Northstar Official"
                      />
                    </div>
                    <div>
                      <label htmlFor={`status-${mp.id}`} className="mb-1 block text-xs font-medium">
                        Account status
                      </label>
                      <select
                        id={`status-${mp.id}`}
                        className={inputClass}
                        value={info.accountStatus}
                        onChange={(event) =>
                          updateMarketplaceInfo(mp.id, {
                            accountStatus: event.target.value as ClientMarketplaceInfo['accountStatus'],
                          })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`fee-${mp.id}`} className="mb-1 block text-xs font-medium">
                        Monthly fee
                      </label>
                      <input
                        id={`fee-${mp.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={info.monthlyFee}
                        onChange={(event) =>
                          updateMarketplaceInfo(mp.id, { monthlyFee: Number(event.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {marketplaceError && <p className="text-xs text-destructive">{marketplaceError}</p>}
        </fieldset>

        <fieldset className="space-y-4 rounded-md border p-4">
          <legend className="px-1 text-sm font-semibold">Billing information</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="client-billing-email" className="mb-1 block text-sm font-medium">Billing email</label>
              <input id="client-billing-email" type="email" className={inputClass} {...register('billingEmail')} />
              {errors.billingEmail && <p className="mt-1 text-xs text-destructive">{errors.billingEmail.message}</p>}
            </div>
            <div>
              <label htmlFor="client-phone" className="mb-1 block text-sm font-medium">Phone</label>
              <input id="client-phone" className={inputClass} {...register('phone')} />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="client-address" className="mb-1 block text-sm font-medium">Address</label>
              <input id="client-address" className={inputClass} {...register('address')} />
              {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div>
              <label htmlFor="client-tax" className="mb-1 block text-sm font-medium">Tax ID</label>
              <input id="client-tax" className={inputClass} {...register('taxId')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="client-terms" className="mb-1 block text-sm font-medium">Payment terms</label>
                <select id="client-terms" className={inputClass} {...register('paymentTerms')}>
                  <option>Net 15</option>
                  <option>Net 30</option>
                  <option>Net 45</option>
                  <option>Net 60</option>
                </select>
              </div>
              <div>
                <label htmlFor="client-currency" className="mb-1 block text-sm font-medium">Currency</label>
                <select id="client-currency" className={inputClass} {...register('currency')}>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>PKR</option>
                </select>
              </div>
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : client ? 'Save Changes' : 'Create Client'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}