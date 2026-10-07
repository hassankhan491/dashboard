export type AutomationJobName =
  | 'amazon_order_sync'
  | 'shipping_cost_import'
  | 'cost_rollup_cogs';

export type AutomationRunStatus = 'success' | 'failed' | 'running';

/** AUT-09: job execution log */
export interface AutomationRun {
  id: string;
  jobName: AutomationJobName;
  startedAt: string;
  endedAt?: string;
  status: AutomationRunStatus;
  recordsRead: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errorMessage?: string;
  triggeredBy: string; // user name or 'scheduler'
}

/** AUT-07: traceable cost/operational adjustment */
export type AdjustmentType = 'cost' | 'fee' | 'operational' | 'other';

export interface Adjustment {
  id: string;
  orderId?: string; // undefined = global adjustment
  type: AdjustmentType;
  amount: number; // signed: positive adds cost, negative reduces
  reason: string; // REQUIRED (audit rule 14)
  reference?: string;
  source: 'manual' | 'import';
  createdBy: string;
  createdAt: string;
}