import { OrderReturnsCard } from '../features/orders/OrderReturnsCard';
import { AlertTriangle, ArrowLeft, Package, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/AuthContext';
import { useClients } from '../hooks/useClients';
import { useMarketplaces } from '../hooks/useMarketplaces';
import { useOrder, useUpdateOrderStatus } from '../hooks/useOrders';
import type { OrderStatus } from '../types/order';
import { formatCurrency, formatDate } from '../utils/format';
import { nextStatuses, orderStatusStyles } from '../utils/orderStatus';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrder(orderId);
  const { can } = useAuth();
  const { data: clients } = useClients();
  const { data: marketplaces } = useMarketplaces();
  const updateStatus = useUpdateOrderStatus();

  const [nextStatus, setNextStatus] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Loading order…</p>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <h1 className="text-xl font-bold">Order not found</h1>
        <Link to="/orders" className="mt-2 text-sm text-primary hover:underline">
          Back to orders
        </Link>
      </Card>
    );
  }

  const client = clients?.find((c) => c.id === order.clientId);
  const mp = marketplaces?.find((m) => m.id === order.marketplaceId);
  const options = nextStatuses(order.status);
  const canEdit = can('orders', 'edit');

  const handleUpdate = () => {
    if (!nextStatus) return;
    updateStatus.mutate(
      { id: order.id, status: nextStatus, note: note || undefined },
      {
        onSuccess: () => {
          setNextStatus('');
          setNote('');
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/orders"
          title="Back to orders"
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${orderStatusStyles[order.status]}`}
        >
          {order.status}
        </span>
        {mp && (
          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: mp.color }} />
            {mp.name}
          </span>
        )}
        <span className="text-sm text-muted-foreground">· {client?.name ?? '—'}</span>
      </div>

      {order.exception && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Exception</p>
            <p>{order.exception}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column: items + status history */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Package size={16} className="text-muted-foreground" /> Order items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">SKU</th>
                    <th className="py-2 pr-4 font-medium">Product</th>
                    <th className="py-2 pr-4 text-right font-medium">Qty</th>
                    <th className="py-2 pr-4 text-right font-medium">Unit Price</th>
                    <th className="py-2 text-right font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 pr-4 font-mono text-xs">{item.sku}</td>
                      <td className="py-2 pr-4">{item.title}</td>
                      <td className="py-2 pr-4 text-right">{item.quantity}</td>
                      <td className="py-2 pr-4 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

                  <OrderReturnsCard order={order} />
          <Card>
            <h2 className="mb-4 font-semibold">Status history</h2>
            <ol className="space-y-4">
              {order.statusHistory.map((event, index) => (
                <li key={event.id} className="relative flex gap-3 pl-1">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        index === order.statusHistory.length - 1
                          ? 'bg-primary'
                          : 'bg-muted-foreground/40'
                      }`}
                    />
                    {index < order.statusHistory.length - 1 && (
                      <span className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${orderStatusStyles[event.status]}`}
                      >
                        {event.status}
                      </span>
                      <span className="ml-2 text-muted-foreground">by {event.changedBy}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(event.changedAt)}
                    </p>
                    {event.note && (
                      <p className="mt-1 text-xs italic text-muted-foreground">"{event.note}"</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Right column: summary, customer, shipment, status update */}
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-semibold">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{formatCurrency(order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Marketplace fee</dt>
                <dd>{formatCurrency(order.marketplaceFee)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Customer</h2>
            <p className="text-sm font-medium">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            <p className="mt-2 text-xs text-muted-foreground">Ordered {formatDate(order.orderedAt)}</p>
          </Card>

          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Truck size={16} className="text-muted-foreground" /> Shipment & tracking
            </h2>
            {order.shipment ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Carrier</dt>
                  <dd>{order.shipment.carrier}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tracking</dt>
                  <dd className="font-mono text-xs">{order.shipment.trackingNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="capitalize">{order.shipment.status.replace('_', ' ')}</dd>
                </div>
                {order.shipment.shippedAt && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipped</dt>
                    <dd>{formatDate(order.shipment.shippedAt)}</dd>
                  </div>
                )}
                {order.shipment.deliveredAt && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivered</dt>
                    <dd>{formatDate(order.shipment.deliveredAt)}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Not shipped yet.</p>
            )}
          </Card>

          {canEdit && options.length > 0 && (
            <Card>
              <h2 className="mb-3 font-semibold">Update status</h2>
              <div className="space-y-3">
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as OrderStatus | '')}
                >
                  <option value="">Select new status…</option>
                  {options.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Note (optional)"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
                <button
                  onClick={handleUpdate}
                  disabled={!nextStatus || updateStatus.isPending}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {updateStatus.isPending ? 'Updating…' : 'Update Status'}
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}