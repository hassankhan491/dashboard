import { mockAdjustments, mockAutomationRuns } from '../mock/automation';
import { ordersService } from './ordersService';
import type { Adjustment, AdjustmentType, AutomationJobName, AutomationRun } from '../types/automation';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let runsDb: AutomationRun[] = mockAutomationRuns.map((r) => ({ ...r }));
let adjustmentsDb: Adjustment[] = mockAdjustments.map((a) => ({ ...a }));

export const automationsService = {
  async getRuns(): Promise<AutomationRun[]> {
    await delay(200);
    return runsDb.map((r) => ({ ...r }));
  },

  /** AUT-09 / AUT-10: simulate a job run — idempotent upserts, safe to re-run */
  async runJob(jobName: AutomationJobName, triggeredBy: string): Promise<AutomationRun> {
    const startedAt = new Date().toISOString();
    const orders = await ordersService.getAll();
    await delay(900);

    const base = { id: `run-${Date.now()}`, jobName, startedAt, endedAt: new Date().toISOString(), triggeredBy };
    let run: AutomationRun;
    if (jobName === 'amazon_order_sync') {
      run = { ...base, status: 'success', recordsRead: orders.length + 33, recordsCreated: 0, recordsUpdated: orders.length, recordsFailed: 0 };
    } else if (jobName === 'shipping_cost_import') {
      run = { ...base, status: 'success', recordsRead: orders.length, recordsCreated: 0, recordsUpdated: orders.length, recordsFailed: 0 };
    } else {
      run = { ...base, status: 'success', recordsRead: orders.length, recordsCreated: 0, recordsUpdated: orders.length, recordsFailed: 0 };
    }
    runsDb = [run, ...runsDb];
    return { ...run };
  },

  async getAdjustments(): Promise<Adjustment[]> {
    await delay(150);
    return adjustmentsDb.map((a) => ({ ...a }));
  },

  async getAdjustmentsByOrder(orderId: string): Promise<Adjustment[]> {
    await delay(100);
    return adjustmentsDb.filter((a) => a.orderId === orderId).map((a) => ({ ...a }));
  },

  /** AUT-07: reason is mandatory — adjustments change reporting only through traceable records */
  async addAdjustment(input: { orderId?: string; type: AdjustmentType; amount: number; reason: string; reference?: string }): Promise<Adjustment> {
    await delay(250);
    if (!input.reason.trim()) throw new Error('Reason is required for every adjustment (audit rule).');
    const adj: Adjustment = {
      ...input,
      id: `adj-${Date.now()}`,
      source: 'manual',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
    };
    adjustmentsDb = [...adjustmentsDb, adj];
    return { ...adj };
  },
};