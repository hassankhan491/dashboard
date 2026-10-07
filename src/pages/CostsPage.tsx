import { Coins, Plus, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { useSkuCosts } from '../hooks/useCosting';
import { formatCurrency, formatDate } from '../utils/format';
import { SkuCostFormDialog } from '../features/costing/SkuCostFormDialog';

export function CostsPage() {
  const { can } = useAuth();
  const { data: costs, isLoading } = useSkuCosts();
  const { data: products } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const productNameFor = (sku: string) => {
    for (const p of products ?? []) {
      if (p.variants.some((v) => v.sku === sku)) return p.name;
    }
    return '—';
  };

  const rows = useMemo(() => {
    const list = (costs ?? []).filter((c) => c.sku.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort(
      (a, b) => a.sku.localeCompare(b.sku) || new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime(),
    );
  }, [costs, search]);

  const canEdit = can('purchasing', 'create') || can('products', 'create');

  if (!can('products', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldAlert size={40} className="text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Coins size={22} /> COGS Master</h1>
          <p className="text-sm text-muted-foreground">SKU unit costs with effective dates (AUT-04 / 6.2).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU…"
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {canEdit && (
            <button
              onClick={() => setDialogOpen(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={16} /> Add Cost Rule
            </button>
          )}
        </div>
      </div>

      <Card className="bg-muted/30">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">How it works:</span> Each rule is valid from its Effective From date until its Effective To date.
          Rules with a green <span className="font-semibold text-green-700">Current</span> badge are open-ended. When you add a new rule for a SKU, the previous open rule closes automatically the day before.
          Orders always use the rule that was effective on their order date — historical profits never change.
        </p>
      </Card>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">SKU / Product</th>
                <th className="px-4 py-3 text-right font-medium">Unit Cost</th>
                <th className="px-4 py-3 font-medium">Effective From</th>
                <th className="px-4 py-3 font-medium">Effective To</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 font-medium">Added By</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading cost rules…</td></tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No cost rules found.</td></tr>
              )}
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold">{c.sku}</p>
                    <p className="text-xs text-muted-foreground">{productNameFor(c.sku)}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(c.unitCost)}</td>
                  <td className="px-4 py-3">{formatDate(c.effectiveFrom)}</td>
                  <td className="px-4 py-3">
                    {c.effectiveTo ? (
                      formatDate(c.effectiveTo)
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Current</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><span className="rounded bg-muted px-2 py-0.5 text-xs font-medium capitalize">{c.source}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.note ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SkuCostFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}