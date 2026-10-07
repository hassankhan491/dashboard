import { Bot, Play, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { useAdjustments, useAutomationRuns, useRunAutomationJob } from '../hooks/useAutomations';
import { formatCurrency, formatDate } from '../utils/format';
import type { AutomationJobName } from '../types/automation';

const jobs: { name: AutomationJobName; label: string; desc: string }[] = [
  { name: 'amazon_order_sync', label: 'Amazon Order Sync', desc: 'Upserts orders by marketplace order ID (AUT-01/02). Idempotent — safe to re-run any range (AUT-10).' },
  { name: 'shipping_cost_import', label: 'Shipping Cost Import', desc: 'Imports actual carrier costs; falls back to the estimated rule and labels it (AUT-03).' },
  { name: 'cost_rollup_cogs', label: 'COGS Mapping & Cost Rollup', desc: 'Applies effective-dated COGS and rebuilds every order cost component (AUT-04/06).' },
];

const runStatusStyles: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  running: 'bg-blue-100 text-blue-700',
};

export function AutomationsPage() {
  const { can } = useAuth();
  const { data: runs, isLoading } = useAutomationRuns();
  const { data: adjustments } = useAdjustments();
  const { data: orders } = useOrders();
  const runJob = useRunAutomationJob();

  const canRun = can('settings', 'edit') || can('settings', 'create');

  if (!can('settings', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldAlert size={40} className="text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
      </Card>
    );
  }

  const orderNumberFor = (id?: string) => orders?.find((o) => o.id === id)?.orderNumber ?? 'Global';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Bot size={22} /> Automations</h1>
        <p className="text-sm text-muted-foreground">Scheduled jobs, run history and traceable adjustments (AUT-07/09/10).</p>
      </div>

      {/* Job cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {jobs.map((job) => {
          const lastRun = runs?.find((r) => r.jobName === job.name);
          return (
            <Card key={job.name}>
              <p className="font-semibold">{job.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{job.desc}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Last run: {lastRun ? `${formatDate(lastRun.startedAt)} · ` : 'never · '}
                {lastRun && <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${runStatusStyles[lastRun.status]}`}>{lastRun.status}</span>}
              </p>
              {canRun && (
                <button
                  onClick={() => runJob.mutate(job.name)}
                  disabled={runJob.isPending}
                  className="mt-3 flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Play size={12} /> {runJob.isPending ? 'Running…' : 'Run Now'}
                </button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Run log (AUT-09) */}
      <Card>
        <h2 className="mb-3 font-semibold">Automation Run Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Job</th>
                <th className="py-2 pr-4 font-medium">Started</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 text-right font-medium">Read</th>
                <th className="py-2 pr-4 text-right font-medium">Created</th>
                <th className="py-2 pr-4 text-right font-medium">Updated</th>
                <th className="py-2 pr-4 text-right font-medium">Failed</th>
                <th className="py-2 font-medium">Triggered By</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Loading runs…</td></tr>}
              {runs?.map((run) => (
                <>
                  <tr key={run.id} className="hover:bg-muted/50">
                    <td className="py-2 pr-4 font-mono text-xs">{run.jobName}</td>
                    <td className="py-2 pr-4 text-xs">{formatDate(run.startedAt)}</td>
                    <td className="py-2 pr-4"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${runStatusStyles[run.status]}`}>{run.status}</span></td>
                    <td className="py-2 pr-4 text-right">{run.recordsRead}</td>
                    <td className="py-2 pr-4 text-right">{run.recordsCreated}</td>
                    <td className="py-2 pr-4 text-right">{run.recordsUpdated}</td>
                    <td className={`py-2 pr-4 text-right ${run.recordsFailed > 0 ? 'font-semibold text-red-600' : ''}`}>{run.recordsFailed}</td>
                    <td className="py-2 text-xs text-muted-foreground">{run.triggeredBy}</td>
                  </tr>
                  {run.errorMessage && (
                    <tr key={`${run.id}-err`}>
                      <td colSpan={8} className="pb-3 pr-4">
                        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">⚠ {run.errorMessage}</p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjustments ledger (AUT-07) */}
      <Card>
        <h2 className="mb-3 font-semibold">Adjustments Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Reference</th>
                <th className="py-2 pr-4 font-medium">Order</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 text-right font-medium">Amount</th>
                <th className="py-2 pr-4 font-medium">Reason</th>
                <th className="py-2 font-medium">By / Source</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {adjustments && adjustments.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No adjustments recorded.</td></tr>
              )}
              {adjustments?.map((a) => (
                <tr key={a.id} className="hover:bg-muted/50">
                  <td className="py-2 pr-4 font-mono text-xs">{a.reference ?? a.id}</td>
                  <td className="py-2 pr-4 text-xs">
                    {a.orderId ? (
                      <Link to={`/orders/${a.orderId}`} className="font-medium text-primary hover:underline">{orderNumberFor(a.orderId)}</Link>
                    ) : (
                      <span className="text-muted-foreground">Global</span>
                    )}
                  </td>
                  <td className="py-2 pr-4"><span className="rounded bg-muted px-2 py-0.5 text-xs font-medium capitalize">{a.type}</span></td>
                  <td className={`py-2 pr-4 text-right font-medium ${a.amount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {a.amount >= 0 ? '+' : ''}{formatCurrency(a.amount)}
                  </td>
                  <td className="py-2 pr-4 text-xs text-muted-foreground">{a.reason}</td>
                  <td className="py-2 text-xs text-muted-foreground">{a.createdBy} · {a.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}