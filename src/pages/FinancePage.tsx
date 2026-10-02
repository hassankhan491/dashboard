import { DollarSign, TrendingDown, TrendingUp, Wallet, Receipt } from 'lucide-react';
import { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/AuthContext';
import { useFinanceSummary, useTransactions } from '../hooks/useFinance';
import { useMarketplaceFilter } from '../hooks/MarketplaceFilterContext';
import { formatCurrency, formatDate } from '../utils/format';
import { MARKETPLACE_FILTER_ALL } from '../types/marketplace';

export function FinancePage() {
  const { can } = useAuth();
  const { data: summary, isLoading: summaryLoading } = useFinanceSummary();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { filter } = useMarketplaceFilter();

  // 1. Filter transactions based on the global marketplace filter
  const filteredTransactions = useMemo(() => {
    if (filter === MARKETPLACE_FILTER_ALL) return transactions ?? [];
    // Show marketplace-specific transactions, plus general agency fees on all views
    return (transactions ?? []).filter((t) => 
      t.marketplaceId === filter || !t.marketplaceId
    );
  }, [filter, transactions]);

  // 2. Calculate KPIs dynamically from the filtered transactions
  const dynamicKPIs = useMemo(() => {
    let revenue = 0;
    let fees = 0;
    let refunds = 0;

    for (const txn of filteredTransactions) {
      if (txn.type === 'sale') {
        revenue += txn.amount;
      } else if (txn.type === 'marketplace_fee' || txn.type === 'shipping_fee') {
        fees += Math.abs(txn.amount);
      } else if (txn.type === 'refund') {
        refunds += Math.abs(txn.amount);
      }
    }

    return {
      revenue,
      fees,
      refunds,
      netProfit: revenue - fees - refunds, // Dynamic Net Profit
    };
  }, [filteredTransactions]);

  if (!can('finance', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <Wallet className="text-muted-foreground" size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role does not allow viewing finance.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance & Accounting</h1>
        <p className="text-sm text-muted-foreground">
          Track revenue, fees, and net profit across all marketplaces.
        </p>
      </div>

      {/* KPI Cards - NOW DYNAMIC */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <TrendingUp className="text-green-600" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {txLoading ? '...' : formatCurrency(dynamicKPIs.revenue)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Gross sales before fees</p>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Fees</p>
            <Receipt className="text-amber-600" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {txLoading ? '...' : formatCurrency(dynamicKPIs.fees)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Marketplace & shipping fees</p>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Refunds</p>
            <TrendingDown className="text-red-600" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {txLoading ? '...' : formatCurrency(dynamicKPIs.refunds)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Customer returns processed</p>
        </Card>

        <Card className="flex flex-col bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary">Net Profit</p>
            <DollarSign className="text-primary" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">
            {txLoading ? '...' : formatCurrency(dynamicKPIs.netProfit)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Revenue minus fees & refunds</p>
        </Card>
      </div>

      {/* Balances Row - Kept static as they represent the overall bank account */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
              <p className="mt-1 text-xl font-bold">{summaryLoading ? '...' : formatCurrency(summary?.availableBalance ?? 0)}</p>
            </div>
            <Wallet className="text-muted-foreground" size={24} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Funds ready for payout or agency fees</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Balance</p>
              <p className="mt-1 text-xl font-bold">{summaryLoading ? '...' : formatCurrency(summary?.pendingBalance ?? 0)}</p>
            </div>
            <Wallet className="text-muted-foreground opacity-50" size={24} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Funds held by marketplace (reserve)</p>
        </Card>
      </div>

      {/* Transaction Ledger */}
      <Card>
        <h2 className="mb-4 font-semibold">Transaction Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Description</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Marketplace</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {txLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading transactions…</td>
                </tr>
              )}
              {!txLoading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No transactions found for this filter.</td>
                </tr>
              )}
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-muted/50">
                  <td className="py-3 pr-4 text-muted-foreground">{formatDate(txn.date)}</td>
                  <td className="py-3 pr-4 font-medium">{txn.description}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                      {txn.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">
                    {txn.marketplaceId === 'mp-amazon' ? 'Amazon' : 
                     txn.marketplaceId === 'mp-walmart' ? 'Walmart' : '—'}
                  </td>
                  <td className={`py-3 text-right font-semibold ${txn.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {txn.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}