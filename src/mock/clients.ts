import type { Client, ClientPerformanceRow } from '../types/client';

/** IDs match the clientIds already referenced in mock/auth.ts user assignments */
export const mockClients: Client[] = [
  {
    id: 'client-northstar',
    name: 'Northstar Retail LLC',
    status: 'active',
    accountManagerId: 'u-2',
    teamUserIds: ['u-2', 'u-3'],
    contacts: [
      { id: 'c-n1', name: 'Maria Lopez', email: 'maria@northstarretail.com', phone: '+1 555-0134', role: 'Primary Contact' },
      { id: 'c-n2', name: 'James Chen', email: 'james@northstarretail.com', phone: '+1 555-0187', role: 'Billing' },
    ],
    billing: {
      billingEmail: 'accounts@northstarretail.com',
      phone: '+1 555-0100',
      address: '410 Harbor Ave, Seattle, WA, USA',
      taxId: 'US-91-5534210',
      paymentTerms: 'Net 30',
      currency: 'USD',
    },
    marketplaceInfos: [
      { marketplaceId: 'mp-amazon', storeName: 'Northstar Official', accountStatus: 'active', monthlyFee: 39.99 },
    ],
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'client-evergreen',
    name: 'Evergreen Commerce Inc.',
    status: 'active',
    accountManagerId: 'u-3',
    teamUserIds: ['u-3'],
    contacts: [
      { id: 'c-e1', name: 'Priya Shah', email: 'priya@evergreencommerce.com', phone: '+1 555-0221', role: 'Primary Contact' },
    ],
    billing: {
      billingEmail: 'billing@evergreencommerce.com',
      phone: '+1 555-0200',
      address: '88 Pine Road, Austin, TX, USA',
      taxId: 'US-74-8890341',
      paymentTerms: 'Net 15',
      currency: 'USD',
    },
    marketplaceInfos: [
      { marketplaceId: 'mp-walmart', storeName: 'Evergreen Home', accountStatus: 'active', monthlyFee: 0 },
    ],
    createdAt: '2026-01-22T09:00:00.000Z',
  },
  {
    id: 'client-atlas',
    name: 'Atlas Home Goods LLC',
    status: 'active',
    accountManagerId: 'u-4',
    teamUserIds: ['u-4', 'u-5'],
    contacts: [
      { id: 'c-a1', name: 'Omar Farooq', email: 'omar@atlashomegoods.com', phone: '+1 555-0312', role: 'Primary Contact' },
    ],
    billing: {
      billingEmail: 'finance@atlashomegoods.com',
      phone: '+1 555-0300',
      address: '12 Canyon Blvd, Denver, CO, USA',
      taxId: 'US-84-2210976',
      paymentTerms: 'Net 30',
      currency: 'USD',
    },
    marketplaceInfos: [
      { marketplaceId: 'mp-amazon', storeName: 'Atlas HomeGoods', accountStatus: 'active', monthlyFee: 39.99 },
    ],
    createdAt: '2026-02-05T09:00:00.000Z',
  },
  {
    id: 'client-blueharbor',
    name: 'Blue Harbor Trading LLC',
    status: 'onboarding',
    accountManagerId: 'u-3',
    teamUserIds: ['u-3', 'u-5'],
    contacts: [
      { id: 'c-b1', name: 'Lena Fischer', email: 'lena@blueharbortrading.com', phone: '+1 555-0418', role: 'Primary Contact' },
    ],
    billing: {
      billingEmail: 'ap@blueharbortrading.com',
      phone: '+1 555-0400',
      address: '77 Dock Street, Boston, MA, USA',
      taxId: 'US-33-7654420',
      paymentTerms: 'Net 45',
      currency: 'USD',
    },
    marketplaceInfos: [
      { marketplaceId: 'mp-walmart', storeName: 'Blue Harbor Store', accountStatus: 'pending', monthlyFee: 0 },
    ],
    createdAt: '2026-09-02T09:00:00.000Z',
  },
];

export const mockClientPerformance: ClientPerformanceRow[] = [
  { clientId: 'client-northstar', marketplaceId: 'mp-amazon', grossSales: 16936.2, operatingProfit: 3578.48, availableBudget: 11400 },
  { clientId: 'client-evergreen', marketplaceId: 'mp-walmart', grossSales: 19120.2, operatingProfit: 3992.63, availableBudget: 7760 },
  { clientId: 'client-atlas', marketplaceId: 'mp-amazon', grossSales: 21304.2, operatingProfit: 4438.2, availableBudget: 11000 },
  { clientId: 'client-blueharbor', marketplaceId: 'mp-walmart', grossSales: 23488.2, operatingProfit: 4939.14, availableBudget: 7400 },
];