import { mockAuditLogs } from '../mock/audit';
import type { AuditLog } from '../types/audit';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const auditService = {
  async getLogs(): Promise<AuditLog[]> {
    await delay(300);
    // Return sorted by newest first
    return mockAuditLogs
      .map((log) => ({ ...log }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
};