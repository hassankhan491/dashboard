import {
  flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  useReactTable, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Plus, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/AuthContext';
import { usePurchaseOrders, useSuppliers } from '../hooks/usePurchasing';
import { formatCurrency, formatDate } from '../utils/format';
import type { POStatus, PurchaseOrder } from '../types/purchasing';
import { POFormDialog } from '../features/purchasing/POFormDialog';

const statusStyles: Record<POStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  ordered: 'bg-blue-100 text-blue-700',
  partially_received: 'bg-amber-100 text-amber-700',
  received: 'bg-green-100 text-green-700',
  closed: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function PurchasingPage() {
  const { can } = useAuth();
  const { data: purchaseOrders, isLoading } = usePurchaseOrders();
  const { data: suppliers } = useSuppliers();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns = useMemo<ColumnDef<PurchaseOrder>[]>(
    () => [
      {
        id: 'poNumber',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            PO Number <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row }) => (
          <Link to={`/purchasing/${row.original.id}`} className="font-medium hover:underline">
            {row.original.poNumber}
          </Link>
        ),
      },
      {
        id: 'supplier',
        header: 'Supplier',
        cell: ({ row }) => suppliers?.find((s) => s.id === row.original.supplierId)?.name ?? '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[row.original.status]}`}>
            {row.original.status.replace('_', ' ')}
          </span>
        ),
      },
      {
        id: 'items',
        header: () => <span className="block text-right">Items</span>,
        cell: ({ row }) => (
          <span className="block text-right">
            {row.original.items.reduce((sum, item) => sum + item.orderedQty, 0)} units
          </span>
        ),
      },
      {
        id: 'totalCost',
        header: () => <span className="block text-right">Total Cost</span>,
        cell: ({ row }) => {
          const po = row.original;
          const subtotal = po.items.reduce((sum, i) => sum + i.orderedQty * i.unitCost, 0);
          const total = subtotal + po.shippingCost + po.taxDuty + po.otherCharges;
          return (
            <span className="block text-right font-medium">{formatCurrency(total)}</span>
          );
        },
      },
      {
        id: 'expectedDelivery',
        header: 'Expected Date',
        cell: ({ row }) => formatDate(row.original.expectedDelivery),
      },
    ],
    [suppliers],
  );

  const table = useReactTable({
    data: purchaseOrders ?? [],
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!can('purchasing', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldAlert className="text-muted-foreground" size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role does not allow viewing purchasing.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Purchasing</h1>
          <p className="text-sm text-muted-foreground">
            Manage supplier purchase orders, invoices, and restocking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search POs…"
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {can('purchasing', 'create') && (
            <button
              onClick={() => setDialogOpen(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={16} /> Add PO
            </button>
          )}
        </div>
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
                    Loading purchase orders…
                  </td>
                </tr>
              )}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    No purchase orders found.
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
      <POFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}