import { PackageCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dialog } from '../../components/ui/Dialog';
import { useProducts } from '../../hooks/useProducts';
import { useReceivePOItems } from '../../hooks/usePurchasing';
import type { LineAvailabilityStatus, PurchaseOrder } from '../../types/purchasing';

const inputClass = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

interface LineState { qty: string; status: LineAvailabilityStatus; reason: string; resolution: string; }
interface Receipt { itemId: string; receivedQty: number; availabilityStatus: LineAvailabilityStatus; reason?: string; expectedResolution?: string; }
interface Props { open: boolean; onClose: () => void; po: PurchaseOrder; }

export function ReceivePODialog({ open, onClose, po }: Props) {
  const receive = useReceivePOItems();
  const { data: products } = useProducts();
  const [lines, setLines] = useState<Record<string, LineState>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      const init: Record<string, LineState> = {};
      for (const item of po.items) {
        init[item.id] = { qty: String(item.orderedQty - item.receivedQty), status: 'in_stock', reason: '', resolution: '' };
      }
      setLines(init);
    }
  }, [open, po]);

  const getVariantDetails = (variantId: string) => {
    for (const p of products ?? []) {
      const v = p.variants.find((v) => v.id === variantId);
      if (v) return { productName: p.name, sku: v.sku };
    }
    return { productName: 'Unknown Product', sku: '—' };
  };

  const updateLine = (itemId: string, patch: Partial<LineState>) => {
    setLines((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }));
  };

  const onSubmit = () => {
    setError('');
    const receipts: Receipt[] = [];

    for (const item of po.items) {
      const state = lines[item.id];
      if (!state) continue;
      const remaining = item.orderedQty - item.receivedQty;
      const qty = Number(state.qty);
      const sku = getVariantDetails(item.variantId).sku;

      if (Number.isNaN(qty) || qty < 0 || qty > remaining) {
        setError(`Received quantity for ${sku} must be between 0 and ${remaining}.`);
        return;
      }
      if (state.status !== 'in_stock' && !state.reason.trim()) {
        setError(`A reason is required when marking ${sku} as ${state.status.replace('_', ' ')}.`);
        return;
      }
      if (qty > 0 || state.status !== 'in_stock') {
        receipts.push({
          itemId: item.id,
          receivedQty: qty,
          availabilityStatus: state.status,
          reason: state.reason.trim() || undefined,
          expectedResolution: state.resolution ? new Date(state.resolution).toISOString() : undefined,
        });
      }
    }

    if (receipts.length === 0 || receipts.every((r) => r.receivedQty === 0)) {
      setError('Enter a received quantity for at least one line.');
      return;
    }

    receive.mutate({ poId: po.id, receipts }, { onSuccess: onClose, onError: (e) => setError(e.message) });
  };

  return (
    <Dialog open={open} onClose={onClose} title={`Receive Items — ${po.poNumber}`} wide>
      <div className="space-y-4">
        {po.items.map((item) => {
          const details = getVariantDetails(item.variantId);
          const remaining = item.orderedQty - item.receivedQty;
          const state = lines[item.id];
          if (!state) return null;
          return (
            <div key={item.id} className="rounded-md border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{details.productName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{details.sku}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Ordered <span className="font-semibold text-foreground">{item.orderedQty}</span> · Received <span className="font-semibold text-foreground">{item.receivedQty}</span> · Remaining <span className="font-semibold text-amber-600">{remaining}</span>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Receive Now</label>
                  <input type="number" min={0} max={remaining} className={inputClass} value={state.qty} onChange={(e) => updateLine(item.id, { qty: e.target.value })} disabled={remaining === 0} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Availability Status</label>
                  <select className={inputClass} value={state.status} onChange={(e) => updateLine(item.id, { status: e.target.value as LineAvailabilityStatus })} disabled={remaining === 0}>
                    <option value="in_stock">In Stock</option>
                    <option value="short_quantity">Short Quantity</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="backordered">Backordered</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Expected Resolution (optional)</label>
                  <input type="date" className={inputClass} value={state.resolution} onChange={(e) => updateLine(item.id, { resolution: e.target.value })} />
                </div>
              </div>
              {state.status !== 'in_stock' && (
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium">Reason (required)</label>
                  <input className={inputClass} placeholder="e.g. Supplier short-shipped 20 units" value={state.reason} onChange={(e) => updateLine(item.id, { reason: e.target.value })} />
                </div>
              )}
            </div>
          );
        })}

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          <button type="button" onClick={onSubmit} disabled={receive.isPending} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <PackageCheck size={16} /> {receive.isPending ? 'Receiving…' : 'Confirm Receiving'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}