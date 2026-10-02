import { PackageMinus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { useUpdateReturnStatus } from '../../hooks/useOrders';
import type { Order } from '../../types/order';
import { formatCurrency, formatDate } from '../../utils/format';
import { nextReturnStatuses, returnStatusStyles } from '../../utils/returnStatus';
import { Card } from '../../components/ui/Card';
import { ReturnFormDialog } from './ReturnFormDialog';

interface Props {
  order: Order;
}

export function OrderReturnsCard({ order }: Props) {
  const { can } = useAuth();
  const updateReturnStatus = useUpdateReturnStatus();
  const [dialogOpen, setDialogOpen] = useState(false);

  const canEdit = can('orders', 'edit');
  const canApprove = can('orders', 'approve');

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <PackageMinus size={16} className="text-muted-foreground" /> Returns & refunds
        </h2>
        {canEdit && (
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            <Plus size={14} /> Request Return
          </button>
        )}
      </div>

      {order.returns.length === 0 ? (
        <p className="text-sm text-muted-foreground">No returns for this order.</p>
      ) : (
        <div className="space-y-3">
          {order.returns.map((ret) => {
            const options = nextReturnStatuses(ret.status);
            return (
              <div key={ret.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{ret.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested {formatDate(ret.requestedAt)} · Refund{' '}
                      {formatCurrency(ret.refundAmount)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${returnStatusStyles[ret.status]}`}
                  >
                    {ret.status}
                  </span>
                </div>
                {ret.note && (
                  <p className="mt-2 text-xs italic text-muted-foreground">"{ret.note}"</p>
                )}
                {canApprove && options.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {options.map((status) => (
                      <button
                        key={status}
                        disabled={updateReturnStatus.isPending}
                        onClick={() =>
                          updateReturnStatus.mutate({ id: order.id, returnId: ret.id, status })
                        }
                        className={
                          'rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ' +
                          (status === 'rejected'
                            ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-primary text-primary-foreground hover:opacity-90')
                        }
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ReturnFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} order={order} />
    </Card>
  );
}