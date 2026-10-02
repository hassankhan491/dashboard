export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isDefault: boolean;
}

export interface InventoryRecord {
  id: string;
  variantId: string; // Links to ProductVariant
  warehouseId: string;
  quantity: number;
  reservedQuantity: number; // Qty allocated to unshipped orders
  /** Weighted Average Cost (WAC) per unit */
  averageCost: number; 
}

export interface PriceHistoryEvent {
  id: string;
  variantId: string;
  oldCost: number;
  newCost: number; // The unit cost of the new PO
  newAverageCost: number; // The calculated WAC after the PO is received
  quantityAdded: number;
  poId?: string;
  recordedAt: string;
}