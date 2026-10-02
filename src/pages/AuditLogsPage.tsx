import {
  flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  useReactTable, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import {
  CheckCircle, FileDown, LogIn, Pencil, Plus, ShieldAlert, Trash2, XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/AuthContext';
import { useAuditLogs } from '../hooks/useAudit';
import { formatDate } from '../utils/format';
import type { AuditAction, AuditLog } from '../types/audit';

// Map actions to colors and icons
const actionStyles: Record<AuditAction, { bg: string; text: string; icon: React.ReactNode }> = {
  create: { bg: 'bg-green-100', text: 'text-green-700', icon: <Plus size={12} /> },
  update: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Pencil size={12} /> },
  delete: { bg: 'bg-red-100', text: 'text-red-700', icon: <Trash2 size={12} /> },
  approve: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <CheckCircle size={12} /> },
  reject: { bg: 'bg-orange-100', text: 'text-orange-700', icon: <XCircle size={12} /> },
  login: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <LogIn size={12} /> },
  export: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: <FileDown size={12} /> },
};

export function AuditLogsPage() {
  const { can } = useAuth();
  const { data: logs, isLoading } = useAuditLogs();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(row.original.timestamp)}
          </span>
        ),
      },
      {
        id: 'user',
        header: 'User',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-sm">{row.original.userName}</p>
            <p className="text-xs text-muted-foreground">{row.original.userRole}</p>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => {
          const style = actionStyles[row.original.action];
          return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style.bg} ${style.text}`}>
              {style.icon} {row.original.action}
            </span>
          );
        },
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono capitalize">
            {row.original.module}
          </span>
        ),
      },
      {
        accessorKey: 'targetName',
        header: 'Target',
        cell: ({ row }) => row.original.targetName || '—',
      },
      {
        accessorKey: 'details',
        header: 'Details',
        cell: ({ row }) => <p className="text-sm text-muted-foreground max-w-md truncate">{row.original.details}</p>,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: logs ?? [],
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!can('settings', 'view')) { // Using 'settings' permission for Audit Logs
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldAlert className="text-muted-foreground" size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role does not allow viewing audit logs.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Track all user actions, approvals, and system changes.
          </p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search logs..."
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
                    Loading logs…
                  </td>
                </tr>
              )}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    No audit logs found.
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