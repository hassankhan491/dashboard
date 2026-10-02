import { ArrowLeft, CheckCircle2, Package, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { usePurchaseOrder, useSuppliers, useUpdatePOStatus } from '../hooks/usePurchasing';
import { useProducts } from '../hooks/useProducts';
import { formatCurrency, formatDate } from '../utils/format';
import { poStatusStyles } from '../utils/poStatus';
import type { POStatus } from '../types/purchasing';

export function PODetailPage() {
  const { poId } = useParams<{ poId: string }>();
  const { data: po, isLoading } = usePurchaseOrder(poId);
  const { data: suppliers } = useSuppliers();
  const { data: products } = useProducts();
  const updateStatus = useUpdatePOStatus();

  if (isLoading) return <Card><p className="text-sm text-muted-foreground">Loading PO…</p></Card>;
  if (!po) return <Card className="text-center p-12"><h1 className="text-xl font-bold">PO not found</h1><Link to="/purchasing" className="mt-2 text-sm text-primary hover:underline">Back to purchasing</Link></Card>;

  const supplier = suppliers?.find((s) => s.id === po.supplierId);
  
  // Helper to find variant details for the table
  const getVariantDetails = (variantId: string) => {
    for (const p of products ?? []) {
      const v = p.variants.find((v) => v.id === variantId);
      if (v) return { productName: p.name, sku: v.sku };
    }
    return { productName: 'Unknown Product', sku: '—' };
  };

  // Define the next valid status based on current status
  const getNextStatus = (): POStatus | null => {
    switch (po.status) {
      case 'draft': return 'ordered';
      case 'ordered': return 'shipped';
      case 'shipped': return 'received';
      default: return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/purchasing" className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{po.id.toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDate(po.createdAt)} · Expected {formatDate(po.expectedDate)}
          </p>
        </div>
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-medium capitalize ${poStatusStyles[po.status]}`}>
          {po.status}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column: Items & Notes */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Package size={16} className="text-muted-foreground" /> Order Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Product / SKU</th>
                    <th className="py-2 pr-4 text-right font-medium">Qty</th>
                    <th className="py-2 pr-4 text-right font-medium">Unit Cost</th>
                    <th className="py-2 text-right font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {po.items.map((item) => {
                    const details = getVariantDetails(item.variantId);
                    return (
                      <tr key={item.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium">{details.productName}</p>
                          <p className="font-mono text-xs text-muted-foreground">{details.sku}</p>
                        </td>
                        <td className="py-3 pr-4 text-right">{item.quantity}</td>
                        <td className="py-3 pr-4 text-right">{formatCurrency(item.unitCost)}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(item.quantity * item.unitCost)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end border-t pt-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-xl font-bold">{formatCurrency(po.totalCost)}</p>
              </div>
            </div>
          </Card>

          {po.notes && (
            <Card>
              <h2 className="mb-2 font-semibold">Notes</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{po.notes}</p>
            </Card>
          )}
        </div>

        {/* Right Column: Supplier Info & Actions */}
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-semibold">Supplier Details</h2>
            {supplier ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="text-right font-medium">{supplier.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="text-right">{supplier.location}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Contact</dt>
                  <dd className="text-right text-xs">{supplier.contactEmail}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Lead Time</dt>
                  <dd className="text-right">{supplier.leadTimeDays} days</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Supplier not found.</p>
            )}
          </Card>

          {nextStatus && (
            <Card>
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <Truck size={16} className="text-muted-foreground" /> Update Status
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Move this PO to the next stage of the fulfillment process.
              </p>
              <button
                onClick={() => updateStatus.mutate({ id: po.id, status: nextStatus })}
                disabled={updateStatus.isPending}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateStatus.isPending ? 'Updating…' : (
                  <>
                    <CheckCircle2 size={16} />
                    Mark as {nextStatus}
                  </>
                )}
              </button>
              {nextStatus === 'received' && (
                <p className="mt-3 text-[10px] text-center text-muted-foreground">
                  * Stock will be automatically added to Inventory in Phase 6.
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}