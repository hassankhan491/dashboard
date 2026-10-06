import { inventoryService } from './inventoryService';
import {
  mockExpenses, mockInvoices, mockPayments, mockPurchaseOrders, mockStockExceptions, mockSuppliers,
} from '../mock/purchasing';
import type {
  ExpenseCategory, PaymentMethod, POFinancialSummary, POStatus, PurchaseExpense,
  PurchaseInvoice, PurchaseOrder, PurchaseOrderInput, PurchasePayment,
  PurchaseStockException, StockExceptionType, Supplier, LineAvailabilityStatus,
} from '../types/purchasing';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let poDb: PurchaseOrder[] = mockPurchaseOrders.map((p) => ({
  ...p, items: p.items.map((i) => ({ ...i })), statusHistory: p.statusHistory.map((s) => ({ ...s })),
}));
let invoiceDb: PurchaseInvoice[] = mockInvoices.map((i) => ({ ...i }));
let paymentDb: PurchasePayment[] = mockPayments.map((p) => ({ ...p }));
let expenseDb: PurchaseExpense[] = mockExpenses.map((e) => ({ ...e }));
let exceptionDb: PurchaseStockException[] = mockStockExceptions.map((e) => ({ ...e }));

/** PUR-08: Controlled status workflow */
const ALLOWED_TRANSITIONS: Record<POStatus, POStatus[]> = {
  draft: ['ordered', 'cancelled'],
  ordered: ['received', 'cancelled'],
  partially_received: ['received', 'cancelled'],
  received: ['closed'],
  closed: [],
  cancelled: [],
};

export const purchasingService = {
  async getSuppliers(): Promise<Supplier[]> {
    await delay(100);
    return mockSuppliers.map((s) => ({ ...s }));
  },

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    await delay(250);
    return poDb.map((p) => ({ ...p }));
  },

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
    await delay(150);
    const found = poDb.find((p) => p.id === id);
    return found ? { ...found } : undefined;
  },

  async createPO(input: PurchaseOrderInput): Promise<PurchaseOrder> {
    await delay(300);
    const now = new Date().toISOString();
    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${Date.now()}`,
      supplierId: input.supplierId,
      warehouseId: input.warehouseId || 'wh-1',
      currency: 'USD',
      ownerId: 'u-current',
      status: 'draft',
      orderDate: now,
      expectedDelivery: input.expectedDelivery,
      items: input.items.map((item, idx) => ({
        id: `poi-${Date.now()}-${idx}`,
        variantId: item.variantId,
        orderedQty: item.quantity,
        receivedQty: 0,
        unitCost: item.unitCost,
        availabilityStatus: 'in_stock',
      })),
      shippingCost: input.shippingCost || 0,
      taxDuty: input.taxDuty || 0,
      otherCharges: input.otherCharges || 0,
      notes: input.notes,
      statusHistory: [{ id: `pse-${Date.now()}`, status: 'draft', changedBy: 'Current User', changedAt: now }],
      createdAt: now, createdBy: 'Current User', updatedAt: now, updatedBy: 'Current User',
    };
    poDb = [...poDb, po];
    return { ...po };
  },

      async updatePOStatus(id: string, status: POStatus, note?: string): Promise<PurchaseOrder> {
    await delay(250);
    const existing = poDb.find((p) => p.id === id);
    if (!existing) throw new Error('PO not found');

    if (!ALLOWED_TRANSITIONS[existing.status].includes(status)) {
      throw new Error(`Invalid status change: ${existing.status} → ${status}`);
    }

    if (status === 'received') {
      const fullyClosed = existing.items.every(
        (i) => i.receivedQty >= i.orderedQty || i.availabilityStatus === 'short_quantity' || i.availabilityStatus === 'out_of_stock',
      );
      if (!fullyClosed) {
        throw new Error('Cannot mark as Received: some lines are not fully received. Use "Receive Items" first.');
      }
    }

    const now = new Date().toISOString();
    const updated: PurchaseOrder = {
      ...existing,
      status,
      items: existing.items.map((i) => ({ ...i })),
      statusHistory: [
        ...existing.statusHistory,
        { id: `pse-${Date.now()}`, status, changedBy: 'Current User', changedAt: now, note },
      ],
      updatedAt: now,
      updatedBy: 'Current User',
    };

    poDb = poDb.map((p) => (p.id === id ? updated : p));
    return { ...updated };
  },



/** PUR-07 / PUR-08: Line-item receiving with partial quantities & stock exceptions */
  async receiveItems(
    poId: string,
    receipts: { itemId: string; receivedQty: number; availabilityStatus: LineAvailabilityStatus; reason?: string; expectedResolution?: string }[],
  ): Promise<PurchaseOrder> {
    await delay(300);
    const existing = poDb.find((p) => p.id === poId);
    if (!existing) throw new Error('PO not found');
    if (existing.status !== 'ordered' && existing.status !== 'partially_received') {
      throw new Error(`Cannot receive items while PO is ${existing.status}.`);
    }

    const now = new Date().toISOString();
    let receivedNow = 0;
    const stockEntries: { variantId: string; quantity: number; unitCost: number }[] = [];

    const updatedItems = existing.items.map((item) => {
      const rec = receipts.find((r) => r.itemId === item.id);
      if (!rec) return { ...item };
      const qty = Math.max(0, Math.min(rec.receivedQty, item.orderedQty - item.receivedQty));
      receivedNow += qty;
      if (qty > 0) stockEntries.push({ variantId: item.variantId, quantity: qty, unitCost: item.unitCost });
      return {
        ...item,
        receivedQty: item.receivedQty + qty,
        availabilityStatus: rec.availabilityStatus,
        availabilityNote: rec.reason || item.availabilityNote,
        expectedResolution: rec.expectedResolution || item.expectedResolution,
      };
    });

    // Create stock exceptions for flagged lines
    const newExceptions: PurchaseStockException[] = [];
    for (const rec of receipts) {
      if (rec.availabilityStatus !== 'in_stock' && rec.reason) {
        const item = existing.items.find((i) => i.id === rec.itemId);
        if (item) {
          newExceptions.push({
            id: `exc-${Date.now()}-${rec.itemId}`,
            poId, itemId: item.id, variantId: item.variantId,
            type: rec.availabilityStatus, reason: rec.reason,
            expectedResolution: rec.expectedResolution, status: 'open', createdAt: now,
          });
        }
      }
    }
    exceptionDb = [...exceptionDb, ...newExceptions];

    // Push received stock into Inventory (WAC + price history) reusing existing logic
    if (stockEntries.length > 0) {
      await inventoryService.receivePO({
        ...existing,
        items: stockEntries.map((s, idx) => ({
          id: `tmp-${idx}`, variantId: s.variantId, orderedQty: s.quantity,
          receivedQty: s.quantity, unitCost: s.unitCost, availabilityStatus: 'in_stock',
        })),
      });
    }

    const allClosed = updatedItems.every(
      (i) => i.receivedQty >= i.orderedQty || i.availabilityStatus === 'short_quantity' || i.availabilityStatus === 'out_of_stock',
    );
    const newStatus: POStatus = allClosed ? 'received' : 'partially_received';
    const totalOrdered = updatedItems.reduce((s, i) => s + i.orderedQty, 0);
    const totalReceived = updatedItems.reduce((s, i) => s + i.receivedQty, 0);

    const updated: PurchaseOrder = {
      ...existing,
      items: updatedItems,
      status: newStatus,
      statusHistory: [
        ...existing.statusHistory,
        { id: `pse-${Date.now()}`, status: newStatus, changedBy: 'Current User', changedAt: now, note: `Received ${receivedNow} units (${totalReceived}/${totalOrdered} total)` },
      ],
      updatedAt: now,
      updatedBy: 'Current User',
    };

    poDb = poDb.map((p) => (p.id === poId ? updated : p));
    return { ...updated };
  },



  // ---------- Invoices (PUR-02) ----------
  async getInvoicesByPO(poId: string): Promise<PurchaseInvoice[]> {
    await delay(150);
    return invoiceDb.filter((i) => i.poId === poId).map((i) => ({ ...i }));
  },

  async addInvoice(input: { poId: string; invoiceNumber: string; invoiceDate: string; amount: number; fileName?: string }): Promise<PurchaseInvoice> {
    await delay(250);
    const invoice: PurchaseInvoice = { ...input, id: `inv-${Date.now()}`, createdAt: new Date().toISOString(), createdBy: 'Current User' };
    invoiceDb = [...invoiceDb, invoice];
    return { ...invoice };
  },

  // ---------- Payments (PUR-03, PUR-04) ----------
  async getPaymentsByPO(poId: string): Promise<PurchasePayment[]> {
    await delay(150);
    return paymentDb.filter((p) => p.poId === poId).map((p) => ({ ...p }));
  },

  async addPayment(input: { poId: string; invoiceId: string; paidAmount: number; paymentDate: string; method: PaymentMethod; reference?: string; slipFileName?: string }): Promise<PurchasePayment> {
    await delay(250);
    const payment: PurchasePayment = { ...input, id: `pay-${Date.now()}`, recordedBy: 'Current User', createdAt: new Date().toISOString() };
    paymentDb = [...paymentDb, payment];
    return { ...payment };
  },

  // ---------- Indirect Expenses (PUR-06) ----------
  async getExpensesByPO(poId: string): Promise<PurchaseExpense[]> {
    await delay(150);
    return expenseDb.filter((e) => e.poId === poId).map((e) => ({ ...e }));
  },

  async addExpense(input: { poId: string; category: ExpenseCategory; amount: number; date: string; note?: string; fileName?: string }): Promise<PurchaseExpense> {
    await delay(250);
    const expense: PurchaseExpense = { ...input, id: `exp-${Date.now()}`, createdBy: 'Current User', createdAt: new Date().toISOString() };
    expenseDb = [...expenseDb, expense];
    return { ...expense };
  },

  // ---------- Stock Exceptions (PUR-07) ----------
  async getExceptionsByPO(poId: string): Promise<PurchaseStockException[]> {
    await delay(150);
    return exceptionDb.filter((e) => e.poId === poId).map((e) => ({ ...e }));
  },

  async addStockException(input: { poId: string; itemId: string; variantId: string; type: StockExceptionType; reason: string; expectedResolution?: string }): Promise<PurchaseStockException> {
    await delay(250);
    const exc: PurchaseStockException = { ...input, id: `exc-${Date.now()}`, status: 'open', createdAt: new Date().toISOString() };
    exceptionDb = [...exceptionDb, exc];
    return { ...exc };
  },

  async resolveStockException(id: string): Promise<void> {
    await delay(150);
    exceptionDb = exceptionDb.map((e) => (e.id === id ? { ...e, status: 'resolved' } : e));
  },

  // ---------- Financial Reconciliation (PUR-05) ----------
  async getFinancialSummary(poId: string): Promise<POFinancialSummary> {
    await delay(200);
    const po = poDb.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');

    const invoices = invoiceDb.filter((i) => i.poId === poId);
    const payments = paymentDb.filter((p) => p.poId === poId);
    const expenses = expenseDb.filter((e) => e.poId === poId);

    const subtotal = po.items.reduce((sum, i) => sum + i.orderedQty * i.unitCost, 0);
    const indirectExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const expectedTotal = subtotal + po.shippingCost + po.taxDuty + po.otherCharges + indirectExpenses;
    const invoiceTotal = invoices.reduce((sum, i) => sum + i.amount, 0);
    const paidTotal = payments.reduce((sum, p) => sum + p.paidAmount, 0);

    const paymentStatus: POFinancialSummary['paymentStatus'] =
      invoiceTotal === 0 || paidTotal === 0 ? 'unpaid'
      : paidTotal >= invoiceTotal ? 'paid'
      : 'partially_paid';

    const poVsInvoiceDiff = expectedTotal - invoiceTotal;

    return {
      subtotal,
      shipping: po.shippingCost,
      taxDuty: po.taxDuty,
      otherCharges: po.otherCharges,
      indirectExpenses,
      expectedTotal,
      invoiceTotal,
      paidTotal,
      remainingBalance: invoiceTotal - paidTotal,
      poVsInvoiceDiff,
      invoiceVsPaidDiff: invoiceTotal - paidTotal,
      paymentStatus,
      toleranceBreached: invoiceTotal > 0 && Math.abs(poVsInvoiceDiff) > 0.01,
    };
  },

  async getExceptionCounts(): Promise<{ openStockExceptions: number; unpaidInvoices: number }> {
    await delay(100);
    const openStockExceptions = exceptionDb.filter((e) => e.status === 'open').length;
    let unpaidInvoices = 0;
    for (const po of poDb) {
      const poInvoices = invoiceDb.filter((i) => i.poId === po.id);
      const poPayments = paymentDb.filter((p) => p.poId === po.id);
      const invTotal = poInvoices.reduce((s, i) => s + i.amount, 0);
      const payTotal = poPayments.reduce((s, p) => s + p.paidAmount, 0);
      if (invTotal > 0 && payTotal < invTotal) unpaidInvoices++;
    }
    return { openStockExceptions, unpaidInvoices };
  },
    
};