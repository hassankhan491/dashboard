import { Link } from 'react-router-dom';
import { AlertTriangle, PackageX, Receipt, Undo2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useExceptionCounts } from '../../hooks/useOrders';
import { usePurchasingExceptions } from '../../hooks/usePurchasing';

export function ExceptionQueueWidget() {
  const { data: orderExc } = useExceptionCounts();
  const { data: purExc } = usePurchasingExceptions();

  const items = [
    { label: 'Overdue Returns', count: orderExc?.overdueReturns ?? 0, icon: Undo2, color: 'text-red-600', link: '/returns', desc: 'Approved >14 days without receipt' },
    { label: 'Open Stock Exceptions', count: purExc?.openStockExceptions ?? 0, icon: PackageX, color: 'text-amber-600', link: '/purchasing', desc: 'Shortages or out-of-stock on POs' },
    { label: 'Unpaid / Partial Invoices', count: purExc?.unpaidInvoices ?? 0, icon: Receipt, color: 'text-blue-600', link: '/purchasing', desc: 'POs with outstanding balances' },
  ];

  const hasExceptions = items.some((i) => i.count > 0);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-500" />
        <h2 className="font-semibold">Exception Queue</h2>
      </div>
      {!hasExceptions ? (
        <p className="py-4 text-center text-sm text-muted-foreground">All clear! No operational exceptions.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.link}
              className="flex items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
            >
              <item.icon size={20} className={item.color} />
              <div>
                <p className="text-lg font-bold">{item.count}</p>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}