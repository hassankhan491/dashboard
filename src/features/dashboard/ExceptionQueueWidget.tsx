import { Link } from 'react-router-dom';
import { AlertTriangle, FileWarning, PackageX, Receipt, Undo2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useExceptionCounts } from '../../hooks/useOrders';
import { usePurchasingExceptions } from '../../hooks/usePurchasing';
import { useMissingCostOrders } from '../../hooks/useCosting';

export function ExceptionQueueWidget() {
  const { data: orderExc } = useExceptionCounts();
  const { data: purExc } = usePurchasingExceptions();
  const { data: missing } = useMissingCostOrders();

  const items = [
    { label: 'Overdue Returns', count: orderExc?.overdueReturns ?? 0, icon: Undo2, color: 'text-red-600', link: '/returns', desc: 'Approved >14 days without receipt' },
    { label: 'Open Stock Exceptions', count: purExc?.openStockExceptions ?? 0, icon: PackageX, color: 'text-amber-600', link: '/purchasing', desc: 'Shortages or out-of-stock on POs' },
    { label: 'Unpaid / Partial Invoices', count: purExc?.unpaidInvoices ?? 0, icon: Receipt, color: 'text-blue-600', link: '/purchasing', desc: 'POs with outstanding balances' },
  ];

  const missingCount = missing?.length ?? 0;
  const hasExceptions = items.some((i) => i.count > 0) || missingCount > 0;

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-500" />
        <h2 className="font-semibold">Exception Queue</h2>
      </div>
      {!hasExceptions ? (
        <p className="py-4 text-center text-sm text-muted-foreground">All clear! No operational exceptions.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

          {/* AUT-08: Missing cost queue with direct order links */}
          <div className="flex items-start gap-3 rounded-md border p-3">
            <FileWarning size={20} className="text-purple-600" />
            <div className="min-w-0">
              <p className="text-lg font-bold">{missingCount}</p>
              <p className="text-sm font-medium">Missing Cost Data</p>
              <p className="text-xs text-muted-foreground">Orders without COGS mapping</p>
              {missingCount > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {missing?.map((m) => (
                    <Link
                      key={m.orderId}
                      to={`/orders/${m.orderId}`}
                      className="rounded bg-purple-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-purple-700 hover:underline"
                    >
                      {m.orderNumber}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}