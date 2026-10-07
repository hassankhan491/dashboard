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

export type ReturnStatus = 'requested' | 'approved' | 'in_transit' | 'received' | 'closed' | 'refunded' | 'rejected';

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
  expectedQty?: number;          // Units expected back (defaults to 1)
  returnAddressId?: string;      // Master address where the return should arrive
  receipts?: ReturnReceipt[];    // Physical receiving events (partial supported)
  
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

// ---------- Phase 13: Return Receiving (ORD-07, 5.2) ----------

/** Physical condition of a returned unit checked by warehouse staff */
export type ReturnCondition = 'sellable' | 'damaged' | 'used' | 'missing_parts' | 'other';

/** One physical receiving event against a return (supports partial receiving) */
export interface ReturnReceipt {
  id: string;
  receivedQty: number;
  receivedAt: string;
  condition: ReturnCondition;
  conditionNote?: string;
  returnAddressId: string;
  receivedBy: string;
}

/** Master return destination from Settings (never free-typed) */
export interface ReturnAddress {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  country: string;
  isDefault: boolean;
}


// ---------- Phase 14: Order Cost Rollup (AUT-06 / 6.1) ----------

export interface OrderLineCost {
  orderItemId: string;
  sku: string;
  quantity: number;
  unitCogs: number | null;      // null = missing cost (AUT-08)
  cogsSource: 'master' | 'missing';
  lineCogs: number;
}

/** 6.1: Total Order Cost = COGS + Shipping + Referral Fees + Adjustments + Other */
export interface OrderCostBreakdown {
  orderId: string;
  lines: OrderLineCost[];
  productCogs: number;
  shippingCost: number;
  shippingSource: 'actual' | 'estimated';
  referralFee: number;
  referralSource: 'imported' | 'calculated';
  adjustments: number;
  otherCosts: number;
  totalCost: number;
  revenue: number;
  trueProfit: number;
  missingCosts: boolean;
}