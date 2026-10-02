import type { InventoryRecord, PriceHistoryEvent, Warehouse } from '../types/inventory';

export const mockWarehouses: Warehouse[] = [
  { id: 'wh-1', name: 'Main Warehouse', location: 'New Jersey, US', isDefault: true },
  { id: 'wh-2', name: 'West Coast Hub', location: 'Los Angeles, US', isDefault: false },
];

/** Initial stock levels for our mock variants */
export const mockInventory: InventoryRecord[] = [
  { id: 'inv-1', variantId: 'v-1', warehouseId: 'wh-1', quantity: 150, reservedQuantity: 20, averageCost: 9.5 }, // NS-MUG-12
  { id: 'inv-2', variantId: 'v-2', warehouseId: 'wh-1', quantity: 300, reservedQuantity: 0, averageCost: 5.5 },  // NS-MUG-06
  { id: 'inv-3', variantId: 'v-3', warehouseId: 'wh-1', quantity: 45, reservedQuantity: 10, averageCost: 4.2 },  // NS-TUM-20
  { id: 'inv-4', variantId: 'v-4', warehouseId: 'wh-1', quantity: 0, reservedQuantity: 0, averageCost: 16.0 },   // EG-ORG-10 (Out of stock!)
  { id: 'inv-5', variantId: 'v-6', warehouseId: 'wh-1', quantity: 80, reservedQuantity: 5, averageCost: 11.0 },  // AT-LAM-01
];

export const mockPriceHistory: PriceHistoryEvent[] = [
  {
    id: 'ph-1',
    variantId: 'v-1',
    oldCost: 9.0,
    newCost: 9.5,
    newAverageCost: 9.2857, // The true Weighted Average!
    quantityAdded: 200,
    poId: 'po-1001',
    recordedAt: '2026-09-15T10:00:00.000Z',
  },
];