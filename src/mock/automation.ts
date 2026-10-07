import type { Adjustment, AutomationRun } from '../types/automation';

export const mockAutomationRuns: AutomationRun[] = [
  { id: 'run-1', jobName: 'amazon_order_sync', startedAt: '2026-10-06T02:00:00.000Z', endedAt: '2026-10-06T02:04:10.000Z', status: 'success', recordsRead: 42, recordsCreated: 3, recordsUpdated: 6, recordsFailed: 0, triggeredBy: 'scheduler' },
  { id: 'run-2', jobName: 'cost_rollup_cogs', startedAt: '2026-10-06T02:10:00.000Z', endedAt: '2026-10-06T02:11:32.000Z', status: 'success', recordsRead: 9, recordsCreated: 0, recordsUpdated: 9, recordsFailed: 0, triggeredBy: 'scheduler' },
  { id: 'run-3', jobName: 'shipping_cost_import', startedAt: '2026-10-05T02:05:00.000Z', endedAt: '2026-10-05T02:06:41.000Z', status: 'failed', recordsRead: 38, recordsCreated: 0, recordsUpdated: 31, recordsFailed: 7, errorMessage: 'Carrier API rate limit exceeded (HTTP 429) after 3 retries — 7 records skipped. Re-run safe (idempotent).', triggeredBy: 'scheduler' },
];

export const mockAdjustments: Adjustment[] = [
  { id: 'adj-1', orderId: 'ord-1005', type: 'cost', amount: 2.5, reason: 'Extra packaging fee charged by 3PL, not in supplier invoice', reference: 'ADJ-2026-001', source: 'manual', createdBy: 'Ayesha Khan', createdAt: '2026-09-20T10:00:00.000Z' },
];