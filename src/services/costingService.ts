import { mockSkuCosts } from '../mock/skuCosts';
import { ordersService } from './ordersService';
import type { SKUCost } from '../types/product';
import type { OrderCostBreakdown, OrderLineCost } from '../types/order';
import { automationsService } from './automationsService';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let skuCostsDb: SKUCost[] = mockSkuCosts.map((c) => ({ ...c }));

/** AUT-03 fallback: estimated outbound shipping until actuals are imported */
const estimateShipping = (units: number): number =>
  Number((3.5 + 0.75 * units).toFixed(2));

export const costingService = {
  async getSkuCosts(): Promise<SKUCost[]> {
    await delay(150);
    return skuCostsDb.map((c) => ({ ...c }));
  },

  /** AUT-04 / 6.2: add a new cost rule; auto-closes the previous open rule for the same SKU */
  async addSkuCost(input: { sku: string; unitCost: number; effectiveFrom: string; note?: string }): Promise<SKUCost> {
    await delay(250);
    const from = new Date(input.effectiveFrom);
    const dayBefore = new Date(from);
    dayBefore.setDate(dayBefore.getDate() - 1);

    skuCostsDb = skuCostsDb.map((c) =>
      c.sku === input.sku && !c.effectiveTo && dayBefore >= new Date(c.effectiveFrom)
        ? { ...c, effectiveTo: dayBefore.toISOString() }
        : c,
    );

    const row: SKUCost = {
      id: `sc-${Date.now()}`,
      sku: input.sku,
      unitCost: input.unitCost,
      currency: 'USD',
      effectiveFrom: from.toISOString(),
      source: 'manual',
      note: input.note,
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
    };
    skuCostsDb = [...skuCostsDb, row];
    return { ...row };
  },

  /** AUT-04: find the cost rule that was effective on a given date (historical locking) */
  findCostAt(sku: string, dateIso: string): SKUCost | undefined {
    const d = new Date(dateIso).getTime();
    return skuCostsDb.find((c) => {
      if (c.sku !== sku) return false;
      const from = new Date(c.effectiveFrom).getTime();
      const to = c.effectiveTo ? new Date(c.effectiveTo).getTime() : Number.POSITIVE_INFINITY;
      return d >= from && d <= to;
    });
  },

  /** AUT-06 / 6.1: deterministic order cost rollup — components stored separately */
  async getCostBreakdown(orderId: string): Promise<OrderCostBreakdown> {
    await delay(200);
    const order = await ordersService.getById(orderId);
    if (!order) throw new Error('Order not found');

    const lines: OrderLineCost[] = order.items.map((item) => {
      const cost = costingService.findCostAt(item.sku, order.orderedAt);
      const unitCogs = cost ? cost.unitCost : null;
      return {
        orderItemId: item.id,
        sku: item.sku,
        quantity: item.quantity,
        unitCogs,
        cogsSource: cost ? 'master' : 'missing',
        lineCogs: unitCogs ? Number((unitCogs * item.quantity).toFixed(2)) : 0,
      };
    });

    const productCogs = Number(lines.reduce((s, l) => s + l.lineCogs, 0).toFixed(2));
    const units = order.items.reduce((s, i) => s + i.quantity, 0);
    const shippingCost = estimateShipping(units);
    const referralFee = order.marketplaceFee;
        const orderAdjustments = await automationsService.getAdjustmentsByOrder(orderId);
    const adjustments = Number(orderAdjustments.reduce((s, a) => s + a.amount, 0).toFixed(2)); // Phase 14 Step 4
    const otherCosts = 0;
    const totalCost = Number((productCogs + shippingCost + referralFee + adjustments + otherCosts).toFixed(2));
    const revenue = order.subtotal;
    const trueProfit = Number((revenue - totalCost).toFixed(2));

    return {
      orderId,
      lines,
      productCogs,
      shippingCost,
      shippingSource: 'estimated',
      referralFee,
      referralSource: 'imported',
      adjustments,
      otherCosts,
      totalCost,
      revenue,
      trueProfit,
      missingCosts: lines.some((l) => l.cogsSource === 'missing'),
    };
  },

  /** AUT-08: queue of orders with missing COGS data */
  async getMissingCostOrders(): Promise<{ orderId: string; orderNumber: string; skus: string[] }[]> {
    await delay(200);
    const orders = await ordersService.getAll();
    const result: { orderId: string; orderNumber: string; skus: string[] }[] = [];
    for (const order of orders) {
      const missing = order.items
        .filter((i) => !costingService.findCostAt(i.sku, order.orderedAt))
        .map((i) => i.sku);
      if (missing.length > 0) {
        result.push({ orderId: order.id, orderNumber: order.orderNumber, skus: missing });
      }
    }
    return result;
  },
};