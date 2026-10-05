import { DollarSign, Store, TrendingUp, Wallet } from 'lucide-react';
import { useClientPerformanceByClient } from '../../hooks/useClients';
import { useMarketplaces } from '../../hooks/useMarketplaces';
import type { Client, MarketplaceAccountStatus } from '../../types/client';
// import { clientStatusStyles } from '../../utils/clientStatus';
import { formatCurrency } from '../../utils/format';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';

interface Props {
  client: Client;
}

const accountStatusStyles: Record<MarketplaceAccountStatus, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
};

export function ClientOverviewTab({ client }: Props) {
  const { data: performance } = useClientPerformanceByClient(client.id);
  const { data: marketplaces } = useMarketplaces();

  const totals = (performance ?? []).reduce(
    (acc, row) => ({
      sales: acc.sales + row.grossSales,
      profit: acc.profit + row.operatingProfit,
      budget: acc.budget + row.availableBudget,
    }),
    { sales: 0, profit: 0, budget: 0 },
  );
  const hasData = (performance ?? []).length > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Gross Sales"
          value={hasData ? formatCurrency(totals.sales) : '—'}
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <StatCard
          title="Operating Profit"
          value={hasData ? formatCurrency(totals.profit) : '—'}
          icon={TrendingUp}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Available Budget"
          value={hasData ? formatCurrency(totals.budget) : '—'}
          icon={Wallet}
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Store size={16} className="text-muted-foreground" /> Marketplace stores
          </h2>
          <div className="space-y-3">
            {client.marketplaceInfos.length === 0 && (
              <p className="text-sm text-muted-foreground">No marketplaces assigned yet.</p>
            )}
            {client.marketplaceInfos.map((info) => {
              const mp = marketplaces?.find((m) => m.id === info.marketplaceId);
              return (
                <div key={info.marketplaceId} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mp?.color }} />
                    <div>
                      <p className="text-sm font-medium">{mp?.name ?? info.marketplaceId}</p>
                      <p className="text-xs text-muted-foreground">{info.storeName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${accountStatusStyles[info.accountStatus]}`}
                    >
                      {info.accountStatus}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(info.monthlyFee)}/mo</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Billing information</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Billing email</dt>
              <dd className="text-right">{client.billing.billingEmail}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="text-right">{client.billing.phone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="text-right">{client.billing.address}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Tax ID</dt>
              <dd className="text-right">{client.billing.taxId || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Payment terms</dt>
              <dd className="text-right">{client.billing.paymentTerms}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Currency</dt>
              <dd className="text-right">{client.billing.currency}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}