import type { Order, ReturnRecord } from '../types/order';

export interface FlattenedReturn {
  orderId: string;
  orderNumber: string;
  orderedAt: string;
  orderedMonth: string; // YYYY-MM for grouping
  daysAfterSale: number;
  return: ReturnRecord;
}

export interface MonthlyAuditRow {
  month: string; // e.g., "Sep 2026"
  monthKey: string; // e.g., "2026-09" for sorting
  totalCount: number;
  totalRefundAmount: number;
  pendingCount: number; // requested + approved
  refundedCount: number;
}

/** Flattens nested returns from orders into a single list for the audit table */
export function flattenReturns(orders: Order[]): FlattenedReturn[] {
  const result: FlattenedReturn[] = [];
  for (const order of orders) {
    const orderedDate = new Date(order.orderedAt);
    const orderedMonthKey = `${orderedDate.getFullYear()}-${String(orderedDate.getMonth() + 1).padStart(2, '0')}`;
    
    for (const ret of order.returns) {
      const requestedDate = new Date(ret.requestedAt);
      const diffTime = Math.abs(requestedDate.getTime() - orderedDate.getTime());
      const daysAfterSale = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      result.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderedAt: order.orderedAt,
        orderedMonth: orderedMonthKey,
        daysAfterSale,
        return: ret,
      });
    }
  }
  // Sort by requested date descending (newest returns first)
  return result.sort((a, b) => new Date(b.return.requestedAt).getTime() - new Date(a.return.requestedAt).getTime());
}

/** Groups flattened returns into monthly audit rows, attributed by ORDER date */
export function getMonthlyAuditRows(flattened: FlattenedReturn[]): MonthlyAuditRow[] {
  const map = new Map<string, MonthlyAuditRow>();
  
  for (const item of flattened) {
    if (!map.has(item.orderedMonth)) {
      const date = new Date(item.orderedAt);
      const label = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      map.set(item.orderedMonth, {
        month: label,
        monthKey: item.orderedMonth,
        totalCount: 0,
        totalRefundAmount: 0,
        pendingCount: 0,
        refundedCount: 0,
      });
    }
    const row = map.get(item.orderedMonth)!;
    row.totalCount += 1;
    row.totalRefundAmount += item.return.refundAmount;
    if (item.return.status === 'refunded') {
      row.refundedCount += 1;
    } else {
      row.pendingCount += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}