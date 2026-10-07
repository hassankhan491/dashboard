import type { SKUCost } from '../types/product';

export const mockSkuCosts: SKUCost[] = [
  { id: 'sc-1', sku: 'NS-MUG-12', unitCost: 8.2, currency: 'USD', effectiveFrom: '2026-01-01T00:00:00.000Z', effectiveTo: '2026-08-31T23:59:59.000Z', source: 'purchasing', note: 'Original supplier cost', createdBy: 'Sara Ali', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc-2', sku: 'NS-MUG-12', unitCost: 9.1, currency: 'USD', effectiveFrom: '2026-09-01T00:00:00.000Z', source: 'purchasing', note: 'Price increase from PO-1001', createdBy: 'Sara Ali', createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'sc-3', sku: 'NS-TUM-20', unitCost: 6.4, currency: 'USD', effectiveFrom: '2026-01-01T00:00:00.000Z', source: 'purchasing', createdBy: 'Sara Ali', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc-4', sku: 'EG-ORG-10', unitCost: 21.5, currency: 'USD', effectiveFrom: '2026-01-01T00:00:00.000Z', source: 'purchasing', createdBy: 'Ahmed Khan', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc-5', sku: 'EG-SHE-01', unitCost: 33.0, currency: 'USD', effectiveFrom: '2026-01-01T00:00:00.000Z', source: 'purchasing', createdBy: 'Ahmed Khan', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc-6', sku: 'AT-LAM-01', unitCost: 14.75, currency: 'USD', effectiveFrom: '2026-01-01T00:00:00.000Z', source: 'purchasing', createdBy: 'Bilal Ahmed', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc-7', sku: 'AT-CHA-02', unitCost: 52.0, currency: 'USD', effectiveFrom: '2026-01-01T00:00:00.000Z', source: 'purchasing', createdBy: 'Bilal Ahmed', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc-8', sku: 'BH-DEC-05', unitCost: 9.8, currency: 'USD', effectiveFrom: '2026-01-01T00:00:00.000Z', source: 'purchasing', createdBy: 'Danish Ali', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc-9', sku: 'BH-RUG-03', unitCost: 41.0, currency: 'USD', effectiveFrom: '2026-01-01T00:00:00.000Z', source: 'purchasing', createdBy: 'Danish Ali', createdAt: '2026-01-01T00:00:00.000Z' },
  // NOTE: NS-KIT-09 intentionally missing → powers the AUT-08 Missing Cost alert demo
];