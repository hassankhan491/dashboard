import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ReturnFormDialog } from '../features/orders/ReturnFormDialog';
import { useAuth } from '../hooks/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { formatCurrency, formatDate } from '../utils/format';
import { returnStatusStyles } from '../utils/returnStatus';
import { flattenReturns, getMonthlyAuditRows } from '../utils/returnsAudit';

export function ReturnsPage() {
  const { can } = useAuth();
  const { data: orders, } = useOrders();
  const [dialogOpen, setDialogOpen] = useState(false);

  const flattened = flattenReturns(orders ?? []);
  const monthlyRows = getMonthlyAuditRows(flattened);

  if (!can('orders', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your role does not allow viewing returns.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Returns & Refunds Audit</h1>
          <p className="text-sm text-muted-foreground">
            All returns are financially attributed to the month of the original sale.
          </p>
        </div>
        {can('orders', 'edit') && (
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> Request Return
          </button>
        )}
      </div>

      {/* Monthly Audit Table */}
      <Card>
        <h2 className="mb-4 font-semibold">Monthly Audit (Attributed by Order Date)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Month of Sale</th>
                <th className="py-2 pr-4 text-right font-medium">Total Returns</th>
                <th className="py-2 pr-4 text-right font-medium">Total Refund Amount</th>
                <th className="py-2 pr-4 text-right font-medium">Pending Approval/Processing</th>
                <th className="py-2 text-right font-medium">Fully Refunded</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monthlyRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No returns found for the selected filters.
                  </td>
                </tr>
              )}
              {monthlyRows.map((row) => (
                <tr key={row.monthKey} className="hover:bg-muted/50">
                  <td className="py-3 pr-4 font-medium">{row.month}</td>
                  <td className="py-3 pr-4 text-right">{row.totalCount}</td>
                  <td className="py-3 pr-4 text-right font-semibold">{formatCurrency(row.totalRefundAmount)}</td>
                  <td className="py-3 pr-4 text-right text-amber-600">{row.pendingCount}</td>
                  <td className="py-3 text-right text-green-600">{row.refundedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed Returns List */}
      <Card>
        <h2 className="mb-4 font-semibold">All Returns</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Order</th>
                <th className="py-2 pr-4 font-medium">Order Date</th>
                <th className="py-2 pr-4 font-medium">Return Reason</th>
                <th className="py-2 pr-4 font-medium">Requested</th>
                <th className="py-2 pr-4 text-right font-medium">Days After Sale</th>
                <th className="py-2 pr-4 text-right font-medium">Refund Amount</th>
                <th className="py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {flattened.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No returns recorded yet.
                  </td>
                </tr>
              )}
              {flattened.map((item) => (
                <tr key={`${item.orderId}-${item.return.id}`} className="hover:bg-muted/50">
                  <td className="py-3 pr-4">
                    <Link to={`/orders/${item.orderId}`} className="font-medium hover:underline">
                      {item.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{formatDate(item.orderedAt)}</td>
                  <td className="py-3 pr-4">
                    <p>{item.return.reason}</p>
                    {item.return.note && <p className="text-xs italic text-muted-foreground">"{item.return.note}"</p>}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{formatDate(item.return.requestedAt)}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.daysAfterSale > 30 ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.daysAfterSale} days
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-medium">{formatCurrency(item.return.refundAmount)}</td>
                  <td className="py-3 text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${returnStatusStyles[item.return.status as keyof typeof returnStatusStyles]}`}>
                      {item.return.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ReturnFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} orders={orders ?? []} />
    </div>
  );
}