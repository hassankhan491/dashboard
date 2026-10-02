export type ClientStatus = 'active' | 'inactive' | 'onboarding';
export type MarketplaceAccountStatus = 'active' | 'suspended' | 'pending';

export interface ClientContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface ClientBilling {
  billingEmail: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  currency: string;
}

export interface ClientMarketplaceInfo {
  marketplaceId: string;
  storeName: string;
  accountStatus: MarketplaceAccountStatus;
  monthlyFee: number;
}

export interface Client {
  id: string;
  name: string;
  status: ClientStatus;
  accountManagerId?: string;
  teamUserIds: string[];
  contacts: ClientContact[];
  billing: ClientBilling;
  marketplaceInfos: ClientMarketplaceInfo[];
  createdAt: string;
}

export interface ClientInput {
  name: string;
  status: ClientStatus;
  accountManagerId?: string;
  teamUserIds: string[];
  contacts: ClientContact[];
  billing: ClientBilling;
  marketplaceInfos: ClientMarketplaceInfo[];
}

/** Aggregated financial performance per client + marketplace (mock finance data) */
export interface ClientPerformanceRow {
  clientId: string;
  marketplaceId: string;
  grossSales: number;
  operatingProfit: number;
  availableBudget: number;
}