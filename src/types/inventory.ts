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
  newCost: number;
  quantityAdded: number;
  poId?: string; // Reference to the Purchase Order that caused the change
  recordedAt: string;
}