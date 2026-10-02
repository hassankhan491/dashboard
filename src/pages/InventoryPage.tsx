import {
  flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  useReactTable, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { AlertTriangle, History, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { PriceHistoryDialog } from '../features/inventory/PriceHistoryDialog';
import { useAuth } from '../hooks/AuthContext';
import { useInventory, useWarehouses } from '../hooks/useInventory';
import { useListings, useProducts } from '../hooks/useProducts';
import { useMarketplaceFilter } from '../hooks/MarketplaceFilterContext';
import { formatCurrency } from '../utils/format';
import { MARKETPLACE_FILTER_ALL } from '../types/marketplace';
import type { InventoryRecord } from '../types/inventory';

export function InventoryPage() {
  const { can } = useAuth();
  const { data: inventory, isLoading } = useInventory();
  const { data: warehouses } = useWarehouses();
  const { data: products } = useProducts();
  const { data: listings } = useListings();
  const { filter } = useMarketplaceFilter(); // Get the global filter

  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; variantId: string; variantName: string }>({
    open: false, variantId: '', variantName: '',
  });

  // 1. Find which variants have active listings for the selected marketplace
  const visibleVariantIds = useMemo(() => {
    if (filter === MARKETPLACE_FILTER_ALL) return null; // Show all if 'All' is selected
    const ids = new Set<string>();
    for (const listing of listings ?? []) {
      if (listing.marketplaceId === filter && listing.status === 'active') {
        ids.add(listing.variantId);
      }
    }
    return ids;
  }, [filter, listings]);

  // 2. Filter the inventory records based on the visible variants
  const filteredInventory = useMemo(() => {
    if (!visibleVariantIds) return inventory ?? [];
    return (inventory ?? []).filter((i) => visibleVariantIds.has(i.variantId));
  }, [inventory, visibleVariantIds]);

  // Helper to find product/variant details
  const getVariantDetails = (variantId: string) => {
    for (const p of products ?? []) {
      const v = p.variants.find((v) => v.id === variantId);
      if (v) return { productName: p.name, sku: v.sku };
    }
    return { productName: 'Unknown', sku: '—' };
  };

  const columns = useMemo<ColumnDef<InventoryRecord>[]>(
    () => [
      {
        id: 'sku',
        header: 'SKU / Product',
        cell: ({ row }) => {
          const details = getVariantDetails(row.original.variantId);
          return (
            <div>
              <p className="font-mono text-xs font-medium">{details.sku}</p>
              <p className="text-sm text-muted-foreground">{details.productName}</p>
            </div>
          );
        },
      },
      {
        id: 'warehouse',
        header: 'Warehouse',
        cell: ({ row }) => warehouses?.find((w) => w.id === row.original.warehouseId)?.name ?? '—',
      },
      {
        id: 'total',
        header: () => <span className="block text-right">Total Qty</span>,
        cell: ({ row }) => <span className="block text-right font-medium">{row.original.quantity}</span>,
      },
      {
        id: 'reserved',
        header: () => <span className="block text-right">Reserved</span>,
        cell: ({ row }) => <span className="block text-right text-muted-foreground">{row.original.reservedQuantity}</span>,
      },
      {
        id: 'available',
        header: () => <span className="block text-right">Available</span>,
        cell: ({ row }) => {
          const available = row.original.quantity - row.original.reservedQuantity;
          const isLow = available < 20; // Low stock threshold
          return (
            <span className={`block text-right font-semibold ${isLow ? 'text-red-600' : ''}`}>
              {isLow && <AlertTriangle size={14} className="inline mr-1" />}
              {available}
            </span>
          );
        },
      },
      {
        id: 'avgCost',
        header: () => <span className="block text-right">Avg Cost (WAC)</span>,
        cell: ({ row }) => (
          <span className="block text-right font-medium">{formatCurrency(row.original.averageCost)}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => {
          const details = getVariantDetails(row.original.variantId);
          return (
            <div className="flex justify-end">
              <button
                onClick={() => setHistoryDialog({ open: true, variantId: row.original.variantId, variantName: details.sku })}
                className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent"
              >
                <History size={14} /> History
              </button>
            </div>
          );
        },
      },
    ],
    [warehouses, products],
  );

  const table = useReactTable({
    data: filteredInventory, // Use filtered data here
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!can('inventory', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldAlert className="text-muted-foreground" size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role does not allow viewing inventory.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Real-time stock levels, reserved quantities, and weighted average costs.
          </p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search SKUs or products…"
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b text-left text-muted-foreground">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {isLoading && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    Loading inventory…
                  </td>
                </tr>
              )}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    No inventory records found for this marketplace.
                  </td>
                </tr>
              )}
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PriceHistoryDialog
        open={historyDialog.open}
        onClose={() => setHistoryDialog({ ...historyDialog, open: false })}
        variantId={historyDialog.variantId}
        variantName={historyDialog.variantName}
      />
    </div>
  );
}