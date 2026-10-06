import type {
  PurchaseExpense, PurchaseInvoice, PurchaseOrder, PurchasePayment,
  PurchaseStockException, Supplier,
} from '../types/purchasing';

export const mockSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Mug Factory China', location: 'Guangzhou, CN', contactEmail: 'sales@mugfactory.cn', leadTimeDays: 25 },
  { id: 'sup-2', name: 'Textile Co. Turkey', location: 'Istanbul, TR', contactEmail: 'export@textileco.tr', leadTimeDays: 18 },
  { id: 'sup-3', name: 'HomeGoods Wholesale', location: 'Dallas, US', contactEmail: 'orders@homegoods.us', leadTimeDays: 7 },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1001', poNumber: 'PO-1001', supplierId: 'sup-1', warehouseId: 'wh-1', currency: 'USD', ownerId: 'u-1',
    status: 'received', orderDate: '2026-08-20T10:00:00.000Z', expectedDelivery: '2026-09-15T05:00:00.000Z',
    items: [
      { id: 'poi-1', variantId: 'v-1', orderedQty: 200, receivedQty: 200, unitCost: 9.5, availabilityStatus: 'in_stock' },
    ],
    shippingCost: 0, taxDuty: 0, otherCharges: 0,
    statusHistory: [
      { id: 'pse-1', status: 'draft', changedBy: 'Sara Ali', changedAt: '2026-08-20T10:00:00.000Z' },
      { id: 'pse-2', status: 'ordered', changedBy: 'Sara Ali', changedAt: '2026-08-21T09:00:00.000Z' },
      { id: 'pse-3', status: 'received', changedBy: 'Danish Malik', changedAt: '2026-09-15T10:00:00.000Z' },
    ],
    createdAt: '2026-08-20T10:00:00.000Z', createdBy: 'Sara Ali',
    updatedAt: '2026-09-15T10:00:00.000Z', updatedBy: 'Danish Malik',
  },
  {
    id: 'po-1002', poNumber: 'PO-1002', supplierId: 'sup-2', warehouseId: 'wh-1', currency: 'USD', ownerId: 'u-2',
    status: 'ordered', orderDate: '2026-09-20T09:20:00.000Z', expectedDelivery: '2026-10-10T05:00:00.000Z',
    items: [
      { id: 'poi-2', variantId: 'v-4', orderedQty: 200, receivedQty: 0, unitCost: 16, availabilityStatus: 'in_stock' },
    ],
    shippingCost: 0, taxDuty: 0, otherCharges: 0,
    statusHistory: [
      { id: 'pse-4', status: 'draft', changedBy: 'Sara Ali', changedAt: '2026-09-20T09:20:00.000Z' },
      { id: 'pse-5', status: 'ordered', changedBy: 'Sara Ali', changedAt: '2026-09-21T11:00:00.000Z' },
    ],
    createdAt: '2026-09-20T09:20:00.000Z', createdBy: 'Sara Ali',
    updatedAt: '2026-09-21T11:00:00.000Z', updatedBy: 'Sara Ali',
  },
  {
    id: 'po-1003', poNumber: 'PO-1003', supplierId: 'sup-3', warehouseId: 'wh-1', currency: 'USD', ownerId: 'u-2',
    status: 'partially_received', orderDate: '2026-09-25T11:05:00.000Z', expectedDelivery: '2026-10-05T05:00:00.000Z',
    items: [
      { id: 'poi-3', variantId: 'v-5', orderedQty: 50, receivedQty: 30, unitCost: 9, availabilityStatus: 'short_quantity', availabilityNote: 'Supplier short-shipped 20 units', expectedResolution: '2026-10-20T00:00:00.000Z' },
    ],
    shippingCost: 50, taxDuty: 0, otherCharges: 0,
    statusHistory: [
      { id: 'pse-6', status: 'draft', changedBy: 'Ahmed Khan', changedAt: '2026-09-25T11:05:00.000Z' },
      { id: 'pse-7', status: 'ordered', changedBy: 'Ahmed Khan', changedAt: '2026-09-26T08:00:00.000Z' },
      { id: 'pse-8', status: 'partially_received', changedBy: 'Danish Malik', changedAt: '2026-10-04T14:00:00.000Z', note: 'Received 30 of 50 units' },
    ],
    createdAt: '2026-09-25T11:05:00.000Z', createdBy: 'Ahmed Khan',
    updatedAt: '2026-10-04T14:00:00.000Z', updatedBy: 'Danish Malik',
  },
  {
    id: 'po-1004', poNumber: 'PO-1004', supplierId: 'sup-1', warehouseId: 'wh-1', currency: 'USD', ownerId: 'u-1',
    status: 'draft', orderDate: '2026-10-01T18:22:00.000Z', expectedDelivery: '2026-11-01T05:00:00.000Z',
    items: [
      { id: 'poi-4', variantId: 'v-7', orderedQty: 10, receivedQty: 0, unitCost: 11, availabilityStatus: 'in_stock' },
    ],
    shippingCost: 0, taxDuty: 0, otherCharges: 0,
    statusHistory: [{ id: 'pse-9', status: 'draft', changedBy: 'Ayesha Khan', changedAt: '2026-10-01T18:22:00.000Z' }],
    createdAt: '2026-10-01T18:22:00.000Z', createdBy: 'Ayesha Khan',
    updatedAt: '2026-10-01T18:22:00.000Z', updatedBy: 'Ayesha Khan',
  },
];

export const mockInvoices: PurchaseInvoice[] = [
  { id: 'inv-1', poId: 'po-1001', invoiceNumber: 'INV-88231', invoiceDate: '2026-09-16T00:00:00.000Z', amount: 2100, fileName: 'inv-88231.pdf', createdAt: '2026-09-16T10:00:00.000Z', createdBy: 'Sara Ali' },
  { id: 'inv-2', poId: 'po-1003', invoiceNumber: 'INV-99104', invoiceDate: '2026-10-04T00:00:00.000Z', amount: 500, fileName: 'inv-99104.pdf', createdAt: '2026-10-04T15:00:00.000Z', createdBy: 'Ahmed Khan' },
];

export const mockPayments: PurchasePayment[] = [
  { id: 'pay-1', poId: 'po-1001', invoiceId: 'inv-1', paidAmount: 2100, paymentDate: '2026-09-18T00:00:00.000Z', method: 'bank_transfer', reference: 'TXN-554421', slipFileName: 'slip-554421.pdf', recordedBy: 'Ayesha Khan', createdAt: '2026-09-18T09:00:00.000Z' },
  { id: 'pay-2', poId: 'po-1003', invoiceId: 'inv-2', paidAmount: 250, paymentDate: '2026-10-05T00:00:00.000Z', method: 'bank_transfer', reference: 'TXN-559910', slipFileName: 'slip-559910.pdf', recordedBy: 'Ayesha Khan', createdAt: '2026-10-05T09:00:00.000Z' },
];

export const mockExpenses: PurchaseExpense[] = [
  { id: 'exp-1', poId: 'po-1001', category: 'freight', amount: 150, date: '2026-09-20T00:00:00.000Z', note: 'Sea freight Guangzhou → NY', createdBy: 'Sara Ali', createdAt: '2026-09-20T10:00:00.000Z' },
  { id: 'exp-2', poId: 'po-1001', category: 'customs', amount: 50, date: '2026-09-22T00:00:00.000Z', note: 'Import duty', createdBy: 'Sara Ali', createdAt: '2026-09-22T10:00:00.000Z' },
];

export const mockStockExceptions: PurchaseStockException[] = [
  { id: 'exc-1', poId: 'po-1003', itemId: 'poi-3', variantId: 'v-5', type: 'short_quantity', reason: 'Supplier short-shipped 20 units', expectedResolution: '2026-10-20T00:00:00.000Z', status: 'open', createdAt: '2026-10-04T14:00:00.000Z' },
];