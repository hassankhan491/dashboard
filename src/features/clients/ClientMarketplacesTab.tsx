import { Store } from 'lucide-react';
import { useMarketplaces } from '../../hooks/useMarketplaces';
import { useUpdateClient } from '../../hooks/useClients';
import type { Client, ClientInput, ClientMarketplaceInfo, MarketplaceAccountStatus } from '../../types/client';
import { Card } from '../../components/ui/Card';

interface Props {
  client: Client;
}

export function ClientMarketplacesTab({ client }: Props) {
  const { data: marketplaces } = useMarketplaces();
  const updateClient = useUpdateClient();

  const updateInfo = (marketplaceId: string, patch: Partial<ClientMarketplaceInfo>) => {
    const marketplaceInfos = client.marketplaceInfos.map((info) =>
      info.marketplaceId === marketplaceId ? { ...info, ...patch } : info,
    );
    const input: ClientInput = {
      name: client.name,
      status: client.status,
      accountManagerId: client.accountManagerId,
      teamUserIds: client.teamUserIds,
      contacts: client.contacts,
      billing: client.billing,
      marketplaceInfos,
    };
    updateClient.mutate({ id: client.id, input });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Marketplace Stores</h2>
        <p className="text-xs text-muted-foreground">Use "Edit Client" above to add or remove marketplaces.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {client.marketplaceInfos.map((info) => {
          const mp = marketplaces?.find((m) => m.id === info.marketplaceId);
          return (
            <Card key={info.marketplaceId}>
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${mp?.color}20` }}
                >
                  <Store size={20} style={{ color: mp?.color }} />
                </div>
                <div>
                  <p className="font-medium">{mp?.name ?? 'Unknown Marketplace'}</p>
                  <p className="text-xs text-muted-foreground">{info.storeName}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium">Account Status</label>
                  <select
                    value={info.accountStatus}
                    onChange={(e) => updateInfo(info.marketplaceId, { accountStatus: e.target.value as MarketplaceAccountStatus })}
                    className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Monthly Fee</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={info.monthlyFee}
                    onChange={(e) => updateInfo(info.marketplaceId, { monthlyFee: Number(e.target.value) || 0 })}
                    className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
            </Card>
          );
        })}
        {client.marketplaceInfos.length === 0 && (
          <Card className="flex flex-col items-center justify-center p-8 text-center md:col-span-2">
            <Store className="text-muted-foreground" size={32} />
            <p className="mt-2 text-sm text-muted-foreground">No marketplaces assigned.</p>
            <p className="mt-1 text-xs text-muted-foreground">Click "Edit Client" above to add stores.</p>
          </Card>
        )}
      </div>
    </div>
  );
}