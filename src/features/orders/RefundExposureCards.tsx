import { PackageCheck, Truck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useRefundExposure } from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/format';

export function RefundExposureCards() {
  const { data, isLoading } = useRefundExposure();
  if (isLoading || !data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Truck size={14} /> Refunded + Shipped
        </p>
        <p className="mt-1 text-2xl font-bold text-red-600">{formatCurrency(data.refundedShipped)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {data.refundedShippedCount} refund(s) — money refunded AND merchandise already shipped (full loss).
        </p>
      </Card>
      <Card>
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <PackageCheck size={14} /> Refunded + Non-Shipped
        </p>
        <p className="mt-1 text-2xl font-bold text-amber-600">{formatCurrency(data.refundedNotShipped)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {data.refundedNotShippedCount} refund(s) — money refunded but item never shipped (inventory retained).
        </p>
      </Card>
    </div>
  );
}