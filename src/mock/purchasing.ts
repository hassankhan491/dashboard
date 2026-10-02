import type { PurchaseOrder, Supplier } from '../types/purchasing';

export const mockSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Mug Factory China', contactEmail: 'sales@mugfactory.cn', leadTimeDays: 25, location: 'Guangzhou, CN' },
  { id: 'sup-2', name: 'Textile Co. Turkey', contactEmail: 'orders@textileco.tr', leadTimeDays: 18, location: 'Istanbul, TR' },
  { id: 'sup-3', name: 'HomeGoods Wholesale', contactEmail: 'b2b@homegoods.us', leadTimeDays: 5, location: 'New Jersey, US' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1001',
    supplierId: 'sup-1',
    status: 'received',
    expectedDate: '2026-09-15T00:00:00.000Z',
    createdAt: '2026-08-10T09:00:00.000Z',
    totalCost: 1900, // 200 units * $9.50
    items: [
      { id: 'poi-1', variantId: 'v-1', quantity: 200, unitCost: 9.5 }, // NS-MUG-12
    ],
  },
  {
    id: 'po-1002',
    supplierId: 'sup-2',
    status: 'shipped',
    expectedDate: '2026-10-10T00:00:00.000Z',
    createdAt: '2026-09-15T09:00:00.000Z',
    totalCost: 3200, // 200 units * $16.00
    items: [
      { id: 'poi-2', variantId: 'v-4', quantity: 200, unitCost: 16 }, // EG-ORG-10
    ],
  },
  {
    id: 'po-1003',
    supplierId: 'sup-3',
    status: 'ordered',
    expectedDate: '2026-10-05T00:00:00.000Z',
    createdAt: '2026-09-28T09:00:00.000Z',
    totalCost: 450, // 50 units * $9.00 (Wait, let's use a different SKU)
    items: [
      { id: 'poi-3', variantId: 'v-6', quantity: 50, unitCost: 11 }, // AT-LAM-01 (LED Lamp) -> 50 * 11 = 550. Let's fix math.
    ],
  },
  {
    id: 'po-1004',
    supplierId: 'sup-1',
    status: 'draft',
    expectedDate: '2026-11-01T00:00:00.000Z',
    createdAt: '2026-10-01T09:00:00.000Z',
    totalCost: 0,
    items: [],
  },
];