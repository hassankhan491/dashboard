import { mockOrders } from "../mock/orders";
import { mockReturnAddresses } from "../mock/returnAddresses";
import type {
  Order,
  OrderStatus,
  ReturnAddress,
  ReturnReceipt,
  ReturnRecord,
} from "../types/order";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ReturnInput {
  reason: string;
  refundAmount: number;
  note?: string;
}

/** In-memory "database" — later replaced by REST calls */
let db: Order[] = mockOrders.map((order) => ({ ...order }));

export const ordersService = {
  async getAll(): Promise<Order[]> {
    await delay(250);
    return db.map((order) => ({ ...order }));
  },

  async getById(id: string): Promise<Order | undefined> {
    await delay(150);
    const found = db.find((order) => order.id === id);
    return found ? { ...found } : undefined;
  },

  async updateStatus(
    id: string,
    status: OrderStatus,
    changedBy: string,
    note?: string,
  ): Promise<Order> {
    await delay(250);
    const existing = db.find((order) => order.id === id);
    if (!existing) throw new Error("Order not found");

    const event = {
      id: `ev-${Date.now()}`,
      status,
      note,
      changedBy,
      changedAt: new Date().toISOString(),
    };

    // Auto-create/update shipment when the order ships or is delivered
    let shipment = existing.shipment;
    if (status === "shipped" && !shipment) {
      shipment = {
        id: `shp-${Date.now()}`,
        carrier: "MockExpress",
        trackingNumber: `TRK-${existing.orderNumber}`,
        status: "in_transit",
        shippedAt: new Date().toISOString(),
      };
    }
    if (status === "delivered" && shipment) {
      shipment = {
        ...shipment,
        status: "delivered",
        deliveredAt: new Date().toISOString(),
      };
    }

    const updated: Order = {
      ...existing,
      status,
      shipment,
      exception: undefined, // resolving status clears the exception
      statusHistory: [...existing.statusHistory, event],
    };
    db = db.map((order) => (order.id === id ? updated : order));
    return { ...updated };
  },

  /** 5.2: Master return destinations from settings */
  async getReturnAddresses(): Promise<ReturnAddress[]> {
    await delay(100);
    return mockReturnAddresses.map((a) => ({ ...a }));
  },

  async addReturn(id: string, input: ReturnInput): Promise<Order> {
    await delay(250);
    const existing = db.find((order) => order.id === id);
    if (!existing) throw new Error("Order not found");
    const ret: ReturnRecord = {
      id: `ret-${Date.now()}`,
      reason: input.reason,
      status: "requested",
      refundAmount: input.refundAmount,
      requestedAt: new Date().toISOString(),
      note: input.note,
      statusHistory: [
        {
          id: `rse-${Date.now()}`,
          status: "requested",
          changedBy: "System", // In real app, get from auth context
          changedAt: new Date().toISOString(),
        },
      ],
    };
    const updated: Order = { ...existing, returns: [...existing.returns, ret] };
    db = db.map((order) => (order.id === id ? updated : order));
    return { ...updated };
  },

  async updateReturnStatus(
    id: string,
    returnId: string,
    status: ReturnRecord["status"],
  ): Promise<Order> {
    await delay(200);
    const existing = db.find((order) => order.id === id);
    if (!existing) throw new Error("Order not found");
    const updated: Order = {
      ...existing,
      returns: existing.returns.map((r) =>
        r.id === returnId ? { ...r, status } : r,
      ),
    };
    db = db.map((order) => (order.id === id ? updated : order));
    return { ...updated };
  },

  


      async receiveReturn(
    returnId: string,
    receipt: Omit<ReturnReceipt, "id">,
  ): Promise<void> {
    await delay(250);
    let found = false;
    db = db.map((order) => {
      const returnIdx = order.returns.findIndex((r) => r.id === returnId);
      if (returnIdx === -1) return order;

      found = true;
      const ret = order.returns[returnIdx];
      const newReceipt: ReturnReceipt = { ...receipt, id: `rcpt-${Date.now()}` };
      const updatedReceipts = [...(ret.receipts || []), newReceipt];

      const expected = ret.expectedQty ?? 1;
      const totalReceived = updatedReceipts.reduce(
        (sum, r) => sum + r.receivedQty,
        0,
      );

      let newStatus = ret.status;
      if (totalReceived >= expected) newStatus = "received";
      else if (ret.status === "approved") newStatus = "in_transit";

      const updatedReturns = order.returns.map((r, idx) =>
        idx === returnIdx
          ? {
              ...r,
              receipts: updatedReceipts,
              status: newStatus,
              statusHistory: [
                ...r.statusHistory,
                {
                  id: `rse-${Date.now()}`,
                  status: newStatus,
                  changedBy: receipt.receivedBy,
                  changedAt: receipt.receivedAt,
                },
              ],
            }
          : r,
      );
      return { ...order, returns: updatedReturns };
    });

    if (!found) throw new Error("Return not found");
  },









    /** ORD-05 / ORD-06: Financial exposure of refunds split by shipment state */
  async getRefundExposure(): Promise<{
    refundedShipped: number;
    refundedNotShipped: number;
    refundedShippedCount: number;
    refundedNotShippedCount: number;
  }> {
    await delay(150);
    let shipped = 0;
    let notShipped = 0;
    let shippedCount = 0;
    let notShippedCount = 0;

    for (const order of db) {
      const isShipped =
        Boolean(order.shipment) || order.status === 'shipped' || order.status === 'delivered';
      for (const ret of order.returns) {
        if (ret.status === 'refunded' || ret.status === 'closed') {
          if (isShipped) {
            shipped += ret.refundAmount;
            shippedCount += 1;
          } else {
            notShipped += ret.refundAmount;
            notShippedCount += 1;
          }
        }
      }
    }

        return {
      refundedShipped: shipped,
      refundedNotShipped: notShipped,
      refundedShippedCount: shippedCount,
      refundedNotShippedCount: notShippedCount,
    };
  },
};
