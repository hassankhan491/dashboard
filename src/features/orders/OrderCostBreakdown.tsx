import { AlertTriangle, Calculator, Plus } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/AuthContext';
import { useOrderAdjustments } from '../../hooks/useAutomations';
import { useOrderCostBreakdown } from '../../hooks/useCosting';
import { formatCurrency } from '../../utils/format';
import { AdjustmentFormDialog } from './AdjustmentFormDialog';

interface Props { orderId: string; }

export function OrderCostBreakdown({ orderId }: Props) {
  const { can } = useAuth();
  const { data, isLoading } = useOrderCostBreakdown(orderId);
  const { data: adjustments } = useOrderAdjustments(orderId);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading || !data) return null;
  const canAdjust = can('finance', 'edit') || can('finance', 'create');

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Calculator size={16} className="text-muted-foreground" /> Cost Breakdown (AUT-06)
        </h2>
        {canAdjust && (
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold text-primary hover:bg-accent"
          >
            <Plus size={12} /> Add Adjustment
          </button>
        )}
      </div>

      {data.missingCosts && (
        <p className="mb-3 flex items-center gap-2 rounded-md bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700">
          <AlertTriangle size={14} /> Some SKUs have no COGS rule for this order date — the COGS below is incomplete. Add rules in COGS Master.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">SKU</th>
              <th className="py-2 pr-4 text-right font-medium">Qty</th>
              <th className="py-2 pr-4 text-right font-medium">Unit COGS</th>
              <th className="py-2 pr-4 text-right font-medium">Line COGS</th>
              <th className="py-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.lines.map((line) => (
              <tr key={line.orderItemId}>
                <td className="py-2 pr-4 font-mono text-xs">{line.sku}</td>
                <td className="py-2 pr-4 text-right">{line.quantity}</td>
                <td className="py-2 pr-4 text-right">{line.unitCogs === null ? '—' : formatCurrency(line.unitCogs)}</td>
                <td className="py-2 pr-4 text-right font-medium">{formatCurrency(line.lineCogs)}</td>
                <td className="py-2">
                  {line.cogsSource === 'master' ? (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Master</span>
                  ) : (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Missing</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-4 space-y-2 border-t pt-3 text-sm">
        <div className="flex justify-between"><dt className="text-muted-foreground">Product COGS</dt><dd className="font-medium">{formatCurrency(data.productCogs)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Shipping Cost{' '}
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${data.shippingSource === 'estimated' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {data.shippingSource}
            </span>
          </dt>
          <dd className="font-medium">{formatCurrency(data.shippingCost)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Referral Fee{' '}
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">{data.referralSource}</span>
          </dt>
          <dd className="font-medium">{formatCurrency(data.referralFee)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Adjustments {adjustments && adjustments.length > 0 && <span className="ml-1 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">{adjustments.length}</span>}</dt>
          <dd className="font-medium">{formatCurrency(data.adjustments)}</dd>
        </div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Other Allocated</dt><dd className="font-medium">{formatCurrency(data.otherCosts)}</dd></div>
        <div className="flex justify-between border-t pt-2"><dt className="font-semibold">Total Order Cost</dt><dd className="font-bold">{formatCurrency(data.totalCost)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Revenue (items)</dt><dd className="font-medium">{formatCurrency(data.revenue)}</dd></div>
        <div className="flex justify-between">
          <dt className="font-semibold">True Profit</dt>
          <dd className={`text-lg font-bold ${data.trueProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(data.trueProfit)}</dd>
        </div>
      </dl>

      {adjustments && adjustments.length > 0 && (
        <div className="mt-3 rounded-md bg-muted/40 p-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Adjustment trail (AUT-07)</p>
          <ul className="space-y-1 text-xs">
            {adjustments.map((a) => (
              <li key={a.id} className="flex flex-wrap gap-x-2 text-muted-foreground">
                <span className="font-mono font-semibold text-foreground">{a.reference ?? a.id}</span>
                <span className="capitalize">{a.type}</span>
                <span className={a.amount >= 0 ? 'font-semibold text-red-600' : 'font-semibold text-green-600'}>
                  {a.amount >= 0 ? '+' : ''}{formatCurrency(a.amount)}
                </span>
                <span>— {a.reason}</span>
                <span className="italic">by {a.createdBy}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AdjustmentFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} orderId={orderId} />
    </Card>
  );
}