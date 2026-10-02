import {
  flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  useReactTable, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { AlertTriangle, ArrowUpDown, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/AuthContext';
import { useClients } from '../hooks/useClients';
import { useMarketplaces } from '../hooks/useMarketplaces';
import { useOrders } from '../hooks/useOrders';
import type { Order, OrderStatus } from '../types/order';
import { formatCurrency, formatDate } from '../utils/format';
import { ORDER_STATUSES, orderStatusStyles } from '../utils/orderStatus';

type StatusTab = 'all' | OrderStatus;

export function OrdersPage() {
  const { can } = useAuth();
  const { data: orders, isLoading } = useOrders();
  const { data: clients } = useClients();
  const { data: marketplaces } = useMarketplaces();

  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    const map = new Map<OrderStatus, number>();
    for (const order of orders ?? []) {
      map.set(order.status, (map.get(order.status) ?? 0) + 1);
    }
    return map;
  }, [orders]);

  const statusFiltered = useMemo(
    () => (orders ?? []).filter((order) => statusTab === 'all' || order.status === statusTab),
    [orders, statusTab],
  );

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Order <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link to={`/orders/${row.original.id}`} className="font-medium hover:underline">
              {row.original.orderNumber}
            </Link>
            {row.original.exception && (
              <span title={row.original.exception}>
                <AlertTriangle size={14} className="text-amber-500" />
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'client',
        header: 'Client',
        cell: ({ row }) => clients?.find((c) => c.id === row.original.clientId)?.name ?? '—',
      },
      {
        id: 'marketplace',
        header: 'Marketplace',
        cell: ({ row }) => {
          const mp = marketplaces?.find((m) => m.id === row.original.marketplaceId);
          if (!mp) return '—';
          return (
            <span className="flex w-fit items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: mp.color }} />
              {mp.name}
            </span>
          );
        },
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => (
          <div>
            <p>{row.original.customerName}</p>
            <p className="text-xs text-muted-foreground">{row.original.customerEmail}</p>
          </div>
        ),
      },
      {
        accessorKey: 'orderedAt',
        header: 'Ordered',
        cell: ({ row }) => formatDate(row.original.orderedAt),
      },
      {
        id: 'items',
        header: 'Items',
        cell: ({ row }) => row.original.items.reduce((sum, item) => sum + item.quantity, 0),
      },
      {
        accessorKey: 'total',
        header: () => <span className="block text-right">Total</span>,
        cell: ({ row }) => (
          <span className="block text-right font-medium">{formatCurrency(row.original.total)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${orderStatusStyles[row.original.status]}`}
          >
            {row.original.status}
          </span>
        ),
      },
    ],
    [clients, marketplaces],
  );

  const table = useReactTable({
    data: statusFiltered,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!can('orders', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldAlert className="text-muted-foreground" size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role does not allow viewing orders.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            All marketplace orders in one operational view.
          </p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search orders, customers…"
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Status tabs with live counts */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusTab('all')}
          className={
            'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ' +
            (statusTab === 'all'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground')
          }
        >
          All ({orders?.length ?? 0})
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusTab(status)}
            className={
              'rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors ' +
              (statusTab === status
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground')
            }
          >
            {status} ({counts.get(status) ?? 0})
          </button>
        ))}
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
                    Loading orders…
                  </td>
                </tr>
              )}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    No orders found.
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
    </div>
  );
}