import type { ReturnRecord } from '../types/order';

export type ReturnStatus = ReturnRecord['status'];

export const returnStatusStyles: Record<ReturnStatus, string> = {
  requested: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  received: 'bg-indigo-100 text-indigo-700',
  refunded: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

/** Valid next statuses for the return workflow */
export function nextReturnStatuses(status: ReturnStatus): ReturnStatus[] {
  switch (status) {
    case 'requested':
      return ['approved', 'rejected'];
    case 'approved':
      return ['received', 'rejected'];
    case 'received':
      return ['refunded'];
    default:
      return [];
  }
}