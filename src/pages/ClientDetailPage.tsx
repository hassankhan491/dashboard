import { ArrowLeft, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ClientFormDialog } from '../features/clients/ClientFormDialog';
import { ClientOverviewTab } from '../features/clients/ClientOverviewTab';
import { ClientTeamTab } from '../features/clients/ClientTeamTab';
import { useAuth } from '../hooks/AuthContext';
import { useClient } from '../hooks/useClients';
import { clientStatusStyles } from '../utils/clientStatus';
import { ClientContactsTab } from '../features/clients/ClientContactsTab';
import { ClientMarketplacesTab } from '../features/clients/ClientMarketplacesTab';

type TabKey = 'overview' | 'team' | 'contacts' | 'marketplaces';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'team', label: 'Team' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'marketplaces', label: 'Marketplaces' },
];

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { data: client, isLoading } = useClient(clientId);
  const { can } = useAuth();
  const [tab, setTab] = useState<TabKey>('overview');
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Loading client…</p>
      </Card>
    );
  }

  if (!client) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <h1 className="text-xl font-bold">Client not found</h1>
        <Link to="/clients" className="mt-2 text-sm text-primary hover:underline">
          Back to clients
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/clients"
            title="Back to clients"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${clientStatusStyles[client.status]}`}
              >
                {client.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Client profile, performance and team.</p>
          </div>
        </div>
        {can('clients', 'edit') && (
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Pencil size={16} /> Edit Client
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors ' +
              (tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

            {tab === 'overview' && <ClientOverviewTab client={client} />}
      {tab === 'team' && <ClientTeamTab client={client} />}
      {tab === 'contacts' && <ClientContactsTab client={client} />}
      {tab === 'marketplaces' && <ClientMarketplacesTab client={client} />}

      <ClientFormDialog open={editOpen} onClose={() => setEditOpen(false)} client={client} />
    </div>
  );
}