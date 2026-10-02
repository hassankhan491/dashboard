import {
  flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  useReactTable, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Pencil, Plus, Power, ShieldAlert, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { UserFormDialog } from '../features/users/UserFormDialog';
import { useAuth } from '../hooks/AuthContext';
import { useDeleteUser, useToggleUserActive, useUsers } from '../hooks/useUsers';
import type { User } from '../types/auth';

export function UsersPage() {
  const { can } = useAuth();
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const toggleActive = useToggleUserActive();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      { accessorKey: 'role.name', header: 'Role' },
      { id: 'department', header: 'Department', cell: ({ row }) => row.original.department?.name ?? '—' },
      {
        id: 'clients',
        header: 'Client Access',
        cell: ({ row }) =>
          row.original.clientIds.length === 0
            ? 'All Clients'
            : `${row.original.clientIds.length} client(s)`,
      },
      {
        id: 'warehouses',
        header: 'Warehouse Access',
        cell: ({ row }) =>
          row.original.warehouseIds.length === 0
            ? 'All Warehouses'
            : `${row.original.warehouseIds.length} warehouse(s)`,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              row.original.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {row.original.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            {can('users', 'edit') && (
              <button
                title="Edit"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => {
                  setEditingUser(row.original);
                  setDialogOpen(true);
                }}
              >
                <Pencil size={16} />
              </button>
            )}
            {can('users', 'edit') && (
              <button
                title={row.original.isActive ? 'Deactivate' : 'Activate'}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() =>
                  toggleActive.mutate({ id: row.original.id, isActive: !row.original.isActive })
                }
              >
                <Power size={16} />
              </button>
            )}
            {can('users', 'delete') && (
              <button
                title="Delete"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  if (window.confirm(`Delete ${row.original.name}? This cannot be undone.`)) {
                    deleteUser.mutate(row.original.id);
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [can, deleteUser, toggleActive],
  );

  const table = useReactTable({
    data: users ?? [],
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!can('users', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldAlert className="text-muted-foreground" size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role does not allow viewing the Users module.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage team members, roles and access assignments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users…"
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {can('users', 'create') && (
            <button
              onClick={() => {
                setEditingUser(null);
                setDialogOpen(true);
              }}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={16} /> Add User
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
                    Loading users…
                  </td>
                </tr>
              )}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    No users found.
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

      <UserFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} user={editingUser} />
    </div>
  );
}