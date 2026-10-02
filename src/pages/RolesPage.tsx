import { Check, Minus, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/AuthContext';
import { useRoles } from '../hooks/useUsers';
import type { ModuleKey, PermissionAction } from '../types/auth';

const ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  orders: 'Orders',
  products: 'Products',
  purchasing: 'Purchasing',
  inventory: 'Inventory',
  finance: 'Finance',
  reports: 'Reports',
  users: 'Users & Roles',
  settings: 'Settings',
  audit: 'Audit Logs',
};

export function RolesPage() {
  const { can } = useAuth();
  const { data: roles, isLoading } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  if (!can('users', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldCheck className="text-muted-foreground" size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role does not allow viewing roles & permissions.
        </p>
      </Card>
    );
  }

  const selectedRole = roles?.find((role) => role.id === selectedRoleId) ?? roles?.[0] ?? null;

  const grantedCount = selectedRole
    ? Object.values(selectedRole.permissions).reduce((sum, actions) => sum + actions.length, 0)
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Visual permission matrix per role. Matrix editing arrives in Phase 9 (Settings).
        </p>
      </div>

      {isLoading && (
        <Card>
          <p className="text-sm text-muted-foreground">Loading roles…</p>
        </Card>
      )}

      {!isLoading && roles && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Role list */}
          <div className="rounded-lg border bg-card p-2 shadow-sm">
            <div className="space-y-1">
              {roles.map((role) => {
                const active = selectedRole?.id === role.id;
                const count = Object.values(role.permissions).reduce(
                  (sum, actions) => sum + actions.length,
                  0,
                );
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={
                      'w-full rounded-md px-3 py-2 text-left transition-colors ' +
                      (active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')
                    }
                  >
                    <span className="flex items-center justify-between text-sm font-medium">
                      {role.name}
                      <span
                        className={
                          'rounded-full px-2 py-0.5 text-xs ' +
                          (active ? 'bg-primary-foreground/20' : 'bg-muted text-muted-foreground')
                        }
                      >
                        {count}
                      </span>
                    </span>
                    <span
                      className={
                        'mt-0.5 block text-xs ' +
                        (active ? 'text-primary-foreground/80' : 'text-muted-foreground')
                      }
                    >
                      {role.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permission matrix */}
          <Card className="overflow-x-auto lg:col-span-2">
            {selectedRole ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">{selectedRole.name} — permission matrix</h2>
                  <span className="text-xs text-muted-foreground">
                    {grantedCount} of {Object.keys(selectedRole.permissions).length * ACTIONS.length} permissions
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Module</th>
                      {ACTIONS.map((action) => (
                        <th key={action} className="px-2 py-2 text-center font-medium capitalize">
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(Object.keys(selectedRole.permissions) as ModuleKey[]).map((module) => (
                      <tr key={module}>
                        <td className="py-2 pr-4 font-medium">{MODULE_LABELS[module]}</td>
                        {ACTIONS.map((action) => {
                          const granted = selectedRole.permissions[module].includes(action);
                          return (
                            <td key={action} className="px-2 py-2 text-center">
                              {granted ? (
                                <Check size={16} className="mx-auto text-green-600" />
                              ) : (
                                <Minus size={16} className="mx-auto text-muted-foreground/40" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No roles found.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}