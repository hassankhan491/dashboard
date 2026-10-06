import { AlertTriangle, DollarSign, Info, Package, TrendingUp, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { useMarketplaceFilter } from '../hooks/MarketplaceFilterContext';
import { useDashboardAlerts, useDashboardKpis } from '../hooks/useDashboard';
import { MARKETPLACE_FILTER_ALL } from '../types/marketplace';
import { ExceptionQueueWidget } from '../features/dashboard/ExceptionQueueWidget';

export function DashboardPage() {
  const { filter } = useMarketplaceFilter();
  const { data: kpis, isLoading: kpiLoading } = useDashboardKpis();
  const { data: alerts, isLoading: alertsLoading } = useDashboardAlerts();

  const filterLabel = filter === MARKETPLACE_FILTER_ALL ? 'All Marketplaces' : filter.replace('mp-', '').toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Operations Overview</h1>
        <p className="text-sm text-muted-foreground">
          Viewing data for: <span className="font-semibold text-foreground">{filterLabel}</span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Gross Sales" 
          value={kpiLoading ? '...' : `$${kpis?.grossSales.toLocaleString()}`} 
          subtitle="96 daily transaction batches" 
          icon={DollarSign} 
          iconColor="text-green-600" 
        />
        <StatCard 
          title="Operating Profit" 
          value={kpiLoading ? '...' : `$${kpis?.operatingProfit.toLocaleString()}`} 
          subtitle={kpiLoading ? '' : `${kpis?.profitMargin}% margin`} 
          icon={TrendingUp} 
          iconColor="text-blue-600" 
        />
        <StatCard 
          title="Available to Purchase" 
          value={kpiLoading ? '...' : `$${kpis?.availableBudget.toLocaleString()}`} 
          subtitle="$1,140 committed, unpaid" 
          icon={DollarSign} 
          iconColor="text-purple-600" 
        />
        <StatCard 
          title="Products Ready to Buy" 
          value={kpiLoading ? '...' : kpis?.productsReadyToBuy.toString() || '0'} 
          subtitle="Restock & new products" 
          icon={Package} 
          iconColor="text-orange-600" 
        />
      </div>

      {/* EXCEPTION QUEUE WIDGET (ORD-09 / PUR-07) */}
      <ExceptionQueueWidget />

      {/* Alerts & Table Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Needs Attention Feed */}
        <Card className="lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Needs your attention</h2>
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {alerts?.length || 0} open
            </span>
          </div>
          <div className="space-y-3">
            {alertsLoading && <p className="text-sm text-muted-foreground">Loading alerts...</p>}
            {alerts?.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 rounded-md border p-3">
                {alert.type === 'warning' && <AlertTriangle size={18} className="mt-0.5 text-yellow-500" />}
                {alert.type === 'error' && <XCircle size={18} className="mt-0.5 text-red-500" />}
                {alert.type === 'info' && <Info size={18} className="mt-0.5 text-blue-500" />}
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Client Performance Table Placeholder */}
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Client Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Client</th>
                  <th className="pb-2 font-medium">Marketplace</th>
                  <th className="pb-2 text-right font-medium">Sales</th>
                  <th className="pb-2 text-right font-medium">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 font-medium">Northstar Retail LLC</td>
                  <td className="py-3">Amazon</td>
                  <td className="py-3 text-right">$16,936.20</td>
                  <td className="py-3 text-right font-semibold text-green-600">$3,578.48</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Evergreen Commerce Inc.</td>
                  <td className="py-3">Walmart</td>
                  <td className="py-3 text-right">$19,120.20</td>
                  <td className="py-3 text-right font-semibold text-green-600">$3,992.63</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Atlas Home Goods LLC</td>
                  <td className="py-3">Amazon</td>
                  <td className="py-3 text-right">$21,304.20</td>
                  <td className="py-3 text-right font-semibold text-green-600">$4,438.20</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            * Advanced sorting, pagination, and dynamic filtering will be added in Phase 2 & 10 using TanStack Table.
          </p>
        </Card>
      </div>
    </div>
  );
}