import type { OrderStatus } from '../types/order';

export const orderStatusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

/** Valid next statuses for the update workflow */
export function nextStatuses(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case 'pending':
      return ['processing', 'cancelled'];
    case 'processing':
      return ['shipped', 'cancelled'];
    case 'shipped':
      return ['delivered'];
    default:
      return [];
  }
}