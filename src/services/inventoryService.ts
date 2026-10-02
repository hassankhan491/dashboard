import { mockInventory, mockPriceHistory, mockWarehouses } from '../mock/inventory';
import { mockPurchaseOrders } from '../mock/purchasing';
import type { InventoryRecord, PriceHistoryEvent, Warehouse } from '../types/inventory';
import type { POStatus, PurchaseOrder } from '../types/purchasing';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let inventoryDb: InventoryRecord[] = mockInventory.map((i) => ({ ...i }));
let priceHistoryDb: PriceHistoryEvent[] = mockPriceHistory.map((p) => ({ ...p }));
// We share the PO DB reference to update its status when received
let poDb: PurchaseOrder[] = mockPurchaseOrders.map((po) => ({ ...po }));

export const inventoryService = {
  async getWarehouses(): Promise<Warehouse[]> {
    await delay(100);
    return [...mockWarehouses];
  },

  async getInventory(): Promise<InventoryRecord[]> {
    await delay(200);
    return inventoryDb.map((i) => ({ ...i }));
  },

  async getPriceHistory(variantId: string): Promise<PriceHistoryEvent[]> {
    await delay(150);
    return priceHistoryDb
      .filter((p) => p.variantId === variantId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .map((p) => ({ ...p }));
  },

  /** 
   * The core WAC (Weighted Average Cost) logic. 
   * Triggered when a PO status changes to 'received'.
   */
  async receivePO(poId: string): Promise<{ inventory: InventoryRecord[]; priceEvents: PriceHistoryEvent[] }> {
    await delay(300);
    const po = poDb.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');
    if (po.status === 'received') throw new Error('PO already received');

    const newInventory: InventoryRecord[] = [];
    const newPriceEvents: PriceHistoryEvent[] = [];

    for (const item of po.items) {
      // Find existing inventory for this variant in the default warehouse
      let record = inventoryDb.find((i) => i.variantId === item.variantId && i.warehouseId === 'wh-1');
      
      if (!record) {
        // Create new record if it doesn't exist
        record = {
          id: `inv-${Date.now()}-${item.variantId}`,
          variantId: item.variantId,
          warehouseId: 'wh-1',
          quantity: 0,
          reservedQuantity: 0,
          averageCost: item.unitCost,
        };
      }

      const oldCost = record.averageCost;
      const currentQty = record.quantity;
      const newQty = item.quantity;
      const newUnitCost = item.unitCost;

      // Calculate Weighted Average Cost (WAC)
      let newAvgCost = oldCost;
      if (currentQty === 0) {
        newAvgCost = newUnitCost;
      } else {
        newAvgCost = ((currentQty * oldCost) + (newQty * newUnitCost)) / (currentQty + newQty);
      }

      // Update the record
      record.quantity += newQty;
      record.averageCost = Number(newAvgCost.toFixed(4)); // Round to 4 decimals for accuracy

      newInventory.push({ ...record });

      // Log price history ONLY if the cost actually changed
      if (oldCost !== newUnitCost) {
        newPriceEvents.push({
          id: `ph-${Date.now()}-${item.variantId}`,
          variantId: item.variantId,
          oldCost,
          newCost: newUnitCost,
          quantityAdded: newQty,
          poId: po.id,
          recordedAt: new Date().toISOString(),
        });
      }
    }

    // Update DBs
    for (const updated of newInventory) {
      const idx = inventoryDb.findIndex((i) => i.id === updated.id);
      if (idx >= 0) inventoryDb[idx] = updated;
      else inventoryDb.push(updated);
    }
    priceHistoryDb = [...priceHistoryDb, ...newPriceEvents];
    
    // Update PO status
    poDb = poDb.map((p) => (p.id === poId ? { ...p, status: 'received' as POStatus } : p));

    return { inventory: newInventory, priceEvents: newPriceEvents };
  },
};