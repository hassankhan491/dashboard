export type POStatus =
  | 'draft'
  | 'ordered'
  | 'partially_received'
  | 'received'
  | 'closed'
  | 'cancelled';

export type LineAvailabilityStatus = 'in_stock' | 'out_of_stock' | 'short_quantity' | 'backordered';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'paypal' | 'cash' | 'other';
export type ExpenseCategory = 'prep' | 'freight' | 'labels' | 'storage' | 'customs' | 'misc';
export type StockExceptionType = 'out_of_stock' | 'unavailable' | 'short_quantity' | 'backordered';

export interface Supplier {
  id: string;
  name: string;
  location: string;
  contactEmail: string;
  leadTimeDays: number;
}

export interface PurchaseOrderItem {
  id: string;
  variantId: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  availabilityStatus: LineAvailabilityStatus;
  availabilityNote?: string;
  expectedResolution?: string;
}

export interface POStatusEvent {
  id: string;
  status: POStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  warehouseId: string;
  currency: string;
  ownerId: string;
  status: POStatus;
  orderDate: string;
  expectedDelivery: string;
  items: PurchaseOrderItem[];
  shippingCost: number;
  taxDuty: number;
  otherCharges: number;
  notes?: string;
  statusHistory: POStatusEvent[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PurchaseInvoice {
  id: string;
  poId: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  fileName?: string;
  createdAt: string;
  createdBy: string;
}

export interface PurchasePayment {
  id: string;
  poId: string;
  invoiceId: string;
  paidAmount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference?: string;
  slipFileName?: string;
  recordedBy: string;
  createdAt: string;
}

export interface PurchaseExpense {
  id: string;
  poId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note?: string;
  fileName?: string;
  createdBy: string;
  createdAt: string;
}

export interface PurchaseStockException {
  id: string;
  poId: string;
  itemId: string;
  variantId: string;
  type: StockExceptionType;
  reason: string;
  expectedResolution?: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

/** Input shape used by the Create PO dialog (service fills the rest) */
export interface PurchaseOrderInput {
  supplierId: string;
  warehouseId?: string;
  expectedDelivery: string;
  notes?: string;
  shippingCost?: number;
  taxDuty?: number;
  otherCharges?: number;
  items: { variantId: string; quantity: number; unitCost: number }[];
}

/** Derived financial reconciliation (PUR-05) */
export interface POFinancialSummary {
  subtotal: number;
  shipping: number;
  taxDuty: number;
  otherCharges: number;
  indirectExpenses: number;
  expectedTotal: number;
  invoiceTotal: number;
  paidTotal: number;
  remainingBalance: number;
  poVsInvoiceDiff: number;
  invoiceVsPaidDiff: number;
  paymentStatus: PaymentStatus;
  toleranceBreached: boolean;
}