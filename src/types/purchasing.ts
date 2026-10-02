export type POStatus = 'draft' | 'ordered' | 'shipped' | 'received' | 'cancelled';

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  leadTimeDays: number; // average days to deliver
  location: string;
}

export interface PurchaseOrderItem {
  id: string;
  /** Links to the ProductVariant (SKU) we are buying */
  variantId: string; 
  quantity: number;
  unitCost: number; // Cost per unit from supplier
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: POStatus;
  items: PurchaseOrderItem[];
  totalCost: number;
  expectedDate: string;
  createdAt: string;
  /** Optional notes from the purchasing team */
  notes?: string;
}

export interface PurchaseOrderInput {
  supplierId: string;
  expectedDate: string;
  notes?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitCost: number;
  }>;
}