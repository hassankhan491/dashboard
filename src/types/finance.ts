export type TransactionType = 
  | 'sale' 
  | 'refund' 
  | 'marketplace_fee' 
  | 'shipping_fee' 
  | 'payout' 
  | 'agency_fee';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number; // Negative for fees/refunds, positive for sales/payouts
  currency: string;
  description: string;
  orderId?: string;
  marketplaceId?: string;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalRefunds: number;
  totalFees: number; // Marketplace + Shipping fees
  totalCOGS: number; // Cost of Goods Sold
  netProfit: number;
  availableBalance: number; // Cash in bank
  pendingBalance: number; // Funds held by Amazon/Walmart
}