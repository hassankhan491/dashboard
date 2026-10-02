import type { FinanceSummary, Transaction } from '../types/finance';

export const mockFinanceSummary: FinanceSummary = {
  totalRevenue: 12450.00,
  totalRefunds: 185.50,
  totalFees: 2100.00,
  totalCOGS: 4500.00,
  netProfit: 5664.50, // Revenue - Refunds - Fees - COGS
  availableBalance: 12500.00,
  pendingBalance: 3200.00,
};

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1', date: '2026-10-01T10:00:00.000Z', type: 'sale', amount: 24.99, currency: 'USD',
    description: 'Sale: Ceramic Mug Set (12pc)', orderId: 'ord-1001', marketplaceId: 'mp-amazon',
  },
  {
    id: 'txn-2', date: '2026-10-01T10:00:00.000Z', type: 'marketplace_fee', amount: -3.75, currency: 'USD',
    description: 'Amazon Referral Fee (15%)', orderId: 'ord-1001', marketplaceId: 'mp-amazon',
  },
  {
    id: 'txn-3', date: '2026-10-01T10:00:00.000Z', type: 'shipping_fee', amount: -5.99, currency: 'USD',
    description: 'FBA Fulfillment Fee', orderId: 'ord-1001', marketplaceId: 'mp-amazon',
  },
  {
    id: 'txn-4', date: '2026-10-02T14:30:00.000Z', type: 'sale', amount: 39.99, currency: 'USD',
    description: 'Sale: Organic Cotton Towels', orderId: 'ord-1005', marketplaceId: 'mp-walmart',
  },
  {
    id: 'txn-5', date: '2026-10-02T14:30:00.000Z', type: 'marketplace_fee', amount: -5.99, currency: 'USD',
    description: 'Walmart Referral Fee', orderId: 'ord-1005', marketplaceId: 'mp-walmart',
  },
  {
    id: 'txn-6', date: '2026-10-03T09:15:00.000Z', type: 'refund', amount: -24.99, currency: 'USD',
    description: 'Refund: Ceramic Mug Set (Damaged)', orderId: 'ord-1001', marketplaceId: 'mp-amazon',
  },
  {
    id: 'txn-7', date: '2026-10-03T09:15:00.000Z', type: 'marketplace_fee', amount: 3.75, currency: 'USD',
    description: 'Refund Fee Reversal', orderId: 'ord-1001', marketplaceId: 'mp-amazon',
  },
  {
    id: 'txn-8', date: '2026-10-05T00:00:00.000Z', type: 'agency_fee', amount: -500.00, currency: 'USD',
    description: 'Shariq Enterprises - Monthly Management Fee (Oct)',
  },
  {
    id: 'txn-9', date: '2026-10-10T00:00:00.000Z', type: 'payout', amount: 8500.00, currency: 'USD',
    description: 'Bi-weekly Amazon Payout', marketplaceId: 'mp-amazon',
  },
];