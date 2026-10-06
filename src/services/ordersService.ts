import { mockOrders } from "../mock/orders";
import type { Order, OrderStatus, ReturnRecord } from "../types/order";
import { mockReturnAddresses } from "../mock/returnAddresses";
import type { ReturnAddress } from "../types/order";

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
};
