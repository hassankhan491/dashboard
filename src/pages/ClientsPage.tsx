import {
  flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  useReactTable, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Pencil, Plus, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ClientFormDialog } from '../features/clients/ClientFormDialog';
import { useAuth } from '../hooks/AuthContext';
import { useClientPerformance, useClients } from '../hooks/useClients';
import { useMarketplaces } from '../hooks/useMarketplaces';
import { useUsers } from '../hooks/useUsers';
import type { Client } from '../types/client';
import { clientStatusStyles } from '../utils/clientStatus';
import { formatCurrency } from '../utils/format';

export function ClientsPage() {
  const { can } = useAuth();
  const { data: clients, isLoading } = useClients();
  const { data: performance } = useClientPerformance();
  const { data: users } = useUsers();
  const { data: marketplaces } = useMarketplaces();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Sum performance rows per client (already filtered by the global marketplace filter)
  const totalsByClient = useMemo(() => {
    const map = new Map<string, { sales: number; profit: number; budget: number }>();
    for (const row of performance ?? []) {
      const current = map.get(row.clientId) ?? { sales: 0, profit: 0, budget: 0 };
      map.set(row.clientId, {
        sales: current.sales + row.grossSales,
        profit: current.profit + row.operatingProfit,
        budget: current.budget + row.availableBudget,
      });
    }
    return map;
  }, [performance]);

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Client <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <Link to={`/clients/${row.original.id}`} className="font-medium hover:underline">
              {row.original.name}
            </Link>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${clientStatusStyles[row.original.status]}`}
            >
              {row.original.status}
            </span>
          </div>
        ),
      },
      {
        id: 'manager',
        header: 'Account Manager',
        cell: ({ row }) => users?.find((u) => u.id === row.original.accountManagerId)?.name ?? '—',
      },
      {
        id: 'marketplaces',
        header: 'Marketplaces',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.marketplaceInfos.length === 0 && (
              <span className="text-muted-foreground">—</span>
            )}
            {row.original.marketplaceInfos.map((info) => {
              const mp = marketplaces?.find((m) => m.id === info.marketplaceId);
              if (!mp) return null;
              return (
                <span
                  key={info.marketplaceId}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: mp.color }} />
                  {mp.name}
                </span>
              );
            })}
          </div>
        ),
      },
      {
        id: 'sales',
        header: 'Sales',
        cell: ({ row }) => {
          const totals = totalsByClient.get(row.original.id);
          return totals ? formatCurrency(totals.sales) : '—';
        },
      },
      {
        id: 'profit',
        header: 'Operating Profit',
        cell: ({ row }) => {
          const totals = totalsByClient.get(row.original.id);
          return totals ? (
            <span className="font-semibold text-green-600">{formatCurrency(totals.profit)}</span>
          ) : (
            '—'
          );
        },
      },
      {
        id: 'budget',
        header: 'Available Budget',
        cell: ({ row }) => {
          const totals = totalsByClient.get(row.original.id);
          return totals ? formatCurrency(totals.budget) : '—';
        },
      },
      {
        id: 'actions',
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            {can('clients', 'edit') && (
              <button
                title="Edit client"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => {
                  setEditingClient(row.original);
                  setDialogOpen(true);
                }}
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [can, users, marketplaces, totalsByClient],
  );

  const table = useReactTable({
    data: clients ?? [],
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!can('clients', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldAlert className="text-muted-foreground" size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role does not allow viewing clients.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Every account, with the numbers behind it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clients…"
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {can('clients', 'create') && (
            <button
              onClick={() => {
                setEditingClient(null);
                setDialogOpen(true);
              }}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={16} /> Add Client
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
                    Loading clients…
                  </td>
                </tr>
              )}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    No clients found.
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

      <ClientFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        client={editingClient}
      />
    </div>
  );
}