import { UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/AuthContext';
import { useUpdateClient } from '../../hooks/useClients';
import { useUsers } from '../../hooks/useUsers';
import type { Client, ClientInput } from '../../types/client';
import { Card } from '../../components/ui/Card';

interface Props {
  client: Client;
}

/** Builds a full ClientInput with a replaced team list */
function withTeam(client: Client, teamUserIds: string[]): ClientInput {
  return {
    name: client.name,
    status: client.status,
    accountManagerId: client.accountManagerId,
    teamUserIds,
    contacts: client.contacts,
    billing: client.billing,
    marketplaceInfos: client.marketplaceInfos,
  };
}

export function ClientTeamTab({ client }: Props) {
  const { data: users } = useUsers();
  const { can } = useAuth();
  const updateClient = useUpdateClient();
  const canEdit = can('clients', 'edit');

  const toggleMember = (userId: string, checked: boolean) => {
    const teamUserIds = checked
      ? [...client.teamUserIds, userId]
      : client.teamUserIds.filter((id) => id !== userId);
    updateClient.mutate({ id: client.id, input: withTeam(client, teamUserIds) });
  };

  const changeManager = (managerId: string) => {
    updateClient.mutate({
      id: client.id,
      input: { ...withTeam(client, client.teamUserIds), accountManagerId: managerId || undefined },
    });
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <UserCheck size={16} className="text-muted-foreground" /> Assigned team
        </h2>
        {updateClient.isPending && <span className="text-xs text-muted-foreground">Saving…</span>}
      </div>

      <div className="mb-4 max-w-xs">
        <label htmlFor="account-manager" className="mb-1 block text-sm font-medium">
          Account manager
        </label>
        <select
          id="account-manager"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={client.accountManagerId ?? ''}
          disabled={!canEdit}
          onChange={(event) => changeManager(event.target.value)}
        >
          <option value="">Unassigned</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        {users?.map((user) => {
          const checked = client.teamUserIds.includes(user.id);
          const isManager = client.accountManagerId === user.id;
          return (
            <label key={user.id} className="flex items-center gap-3 rounded-md border p-3">
              <input
                type="checkbox"
                checked={checked}
                disabled={!canEdit}
                onChange={(event) => toggleMember(user.id, event.target.checked)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.role.name}
                  {user.department ? ` · ${user.department.name}` : ''}
                </p>
              </div>
              {isManager && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Manager
                </span>
              )}
            </label>
          );
        })}
      </div>

      {!canEdit && (
        <p className="mt-3 text-xs text-muted-foreground">
          You have read-only access to team assignments.
        </p>
      )}
    </Card>
  );
}