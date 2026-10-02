import { mockPurchaseOrders, mockSuppliers } from '../mock/purchasing';
import type { POStatus, PurchaseOrder, PurchaseOrderInput, Supplier } from '../types/purchasing';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let poDb: PurchaseOrder[] = mockPurchaseOrders.map((po) => ({ ...po }));

export const purchasingService = {
  async getSuppliers(): Promise<Supplier[]> {
    await delay(100);
    return [...mockSuppliers];
  },

  async getAllPOs(): Promise<PurchaseOrder[]> {
    await delay(250);
    return poDb.map((po) => ({ ...po }));
  },

  async getPOById(id: string): Promise<PurchaseOrder | undefined> {
    await delay(150);
    const found = poDb.find((po) => po.id === id);
    return found ? { ...found } : undefined;
  },

  async createPO(input: PurchaseOrderInput): Promise<PurchaseOrder> {
    await delay(300);
    const totalCost = input.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      supplierId: input.supplierId,
      status: 'draft',
      expectedDate: input.expectedDate,
      createdAt: new Date().toISOString(),
      notes: input.notes,
      items: input.items.map((item, idx) => ({ id: `poi-${Date.now()}-${idx}`, ...item })),
      totalCost,
    };
    poDb = [...poDb, po];
    return { ...po };
  },

  async updatePOStatus(id: string, status: POStatus): Promise<PurchaseOrder> {
    await delay(250);
    const existing = poDb.find((po) => po.id === id);
    if (!existing) throw new Error('PO not found');
    const updated = { ...existing, status };
    poDb = poDb.map((po) => (po.id === id ? updated : po));
    return { ...updated };
  },
};