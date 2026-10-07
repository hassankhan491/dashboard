import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/AuthContext';
import { useDeleteReturnAddress, useReturnAddresses, useSetDefaultReturnAddress } from '../../hooks/useOrders';
import type { ReturnAddress } from '../../types/order';
import { ReturnAddressFormDialog } from './ReturnAddressFormDialog';

export function ReturnAddressesManager() {
  const { can } = useAuth();
  const { data: addresses, isLoading } = useReturnAddresses();
  const setDefault = useSetDefaultReturnAddress();
  const remove = useDeleteReturnAddress();
  const [dialog, setDialog] = useState<{ mode: 'add' } | { mode: 'edit'; address: ReturnAddress } | null>(null);

  const canEdit = can('settings', 'edit') || can('settings', 'create') || can('orders', 'edit');

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this return address? Addresses referenced by return records cannot be deleted.')) return;
    remove.mutate(id, { onError: (err) => alert(err.message) });
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-semibold"><MapPin size={16} className="text-muted-foreground" /> Return Addresses (Master Data)</h2>
          <p className="mt-1 text-xs text-muted-foreground">Warehouses where customers send returns. The receiving dialog always reads from this list — never free-typed (5.2).</p>
        </div>
        {canEdit && (
          <button onClick={() => setDialog({ mode: 'add' })} className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus size={14} /> Add Address
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Label</th>
              <th className="py-2 pr-4 font-medium">Address</th>
              <th className="py-2 pr-4 font-medium">City</th>
              <th className="py-2 pr-4 font-medium">Country</th>
              {canEdit && <th className="py-2 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Loading addresses…</td></tr>}
            {addresses?.map((a) => (
              <tr key={a.id} className="hover:bg-muted/50">
                <td className="py-3 pr-4">
                  <span className="font-medium">{a.label}</span>
                  {a.isDefault && <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Default</span>}
                </td>
                <td className="py-3 pr-4 text-xs text-muted-foreground">{a.addressLine}</td>
                <td className="py-3 pr-4">{a.city}</td>
                <td className="py-3 pr-4">{a.country}</td>
                {canEdit && (
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {!a.isDefault && (
                        <button title="Set as default" onClick={() => setDefault.mutate(a.id)} className="rounded-md p-1.5 text-amber-600 hover:bg-amber-50">
                          <Star size={14} />
                        </button>
                      )}
                      <button title="Edit" onClick={() => setDialog({ mode: 'edit', address: a })} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
                        <Pencil size={14} />
                      </button>
                      <button title="Delete" onClick={() => handleDelete(a.id)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dialog && (
        <ReturnAddressFormDialog
          open
          onClose={() => setDialog(null)}
          existing={dialog.mode === 'edit' ? dialog.address : undefined}
        />
      )}
    </Card>
  );
}