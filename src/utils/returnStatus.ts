import type { ReturnStatus } from '../types/order';

export const returnStatusStyles: Record<ReturnStatus, string> = {
  requested: 'bg-blue-100 text-blue-700',
  approved: 'bg-amber-100 text-amber-700',
  in_transit: 'bg-purple-100 text-purple-700', // <-- ADD THIS
  received: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',         // <-- ADD THIS
  refunded: 'bg-indigo-100 text-indigo-700',
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