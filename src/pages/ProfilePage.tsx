import { Building2, KeyRound, Mail, ShieldCheck, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { ChangePasswordForm } from '../features/auth/ChangePasswordForm';
import { useAuth } from '../hooks/AuthContext';
import { useClientOptions, useWarehouseOptions } from '../hooks/useUsers';

export function ProfilePage() {
  const { user } = useAuth();
  const { data: clientOptions } = useClientOptions();
  const { data: warehouseOptions } = useWarehouseOptions();

  if (!user) return null;

  const assignedClients =
    user.clientIds.length === 0
      ? ['All clients (no restriction)']
      : user.clientIds.map((id) => clientOptions?.find((c) => c.id === id)?.name ?? id);

  const assignedWarehouses =
    user.warehouseIds.length === 0
      ? ['All warehouses (no restriction)']
      : user.warehouseIds.map((id) => warehouseOptions?.find((w) => w.id === id)?.name ?? id);

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">Your account, role and access assignments.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-muted-foreground" />
              <dt className="font-medium">Role:</dt>
              <dd>{user.role.name}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-muted-foreground" />
              <dt className="font-medium">Department:</dt>
              <dd>{user.department?.name ?? '—'}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted-foreground" />
              <dt className="font-medium">Status:</dt>
              <dd>{user.isActive ? 'Active' : 'Inactive'}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Users size={16} className="text-muted-foreground" /> Access assignments
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-1 font-medium">Clients</p>
              <div className="flex flex-wrap gap-1">
                {assignedClients.map((name) => (
                  <span key={name} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 font-medium">Warehouses</p>
              <div className="flex flex-wrap gap-1">
                {assignedWarehouses.map((name) => (
                  <span key={name} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Assignments are managed by administrators on the Users page.
            </p>
          </div>
        </Card>
      </div>

      <Card className="max-w-xl">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <KeyRound size={16} className="text-muted-foreground" /> Change password
        </h2>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}