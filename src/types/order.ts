export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string; // will link to real products in Phase 4
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface Shipment {
  id: string;
  carrier: string;
  trackingNumber: string;
  status: 'label_created' | 'in_transit' | 'delivered';
  shippedAt?: string;
  deliveredAt?: string;
}

export type ReturnStatus = 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';

export interface ReturnStatusEvent {
  id: string;
  status: ReturnStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface ReturnRecord {
  id: string;
  reason: string;
  status: ReturnStatus;
  refundAmount: number;
  requestedAt: string;
  note?: string;
  statusHistory: ReturnStatusEvent[];
}

export interface OrderStatusEvent {
  id: string;
  status: OrderStatus;
  note?: string;
  changedBy: string;
  changedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  marketplaceId: string;
  clientId: string;
  status: OrderStatus;
  orderedAt: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  marketplaceFee: number;
  total: number;
  shipment?: Shipment;
  returns: ReturnRecord[];
  statusHistory: OrderStatusEvent[];
  /** Exception/issue description, if any */
  exception?: string;
}