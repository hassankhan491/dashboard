import type { Brand, Category, MarketplaceListing, Product } from '../types/product';

export const mockCategories: Category[] = [
  { id: 'cat-home', name: 'Home & Kitchen' },
  { id: 'cat-bath', name: 'Bath & Bedding' },
  { id: 'cat-office', name: 'Office' },
  { id: 'cat-decor', name: 'Decor' },
];

export const mockBrands: Brand[] = [
  { id: 'brand-northstar', name: 'Northstar Home' },
  { id: 'brand-evergreen', name: 'Evergreen Living' },
  { id: 'brand-atlas', name: 'Atlas Office' },
  { id: 'brand-blueharbor', name: 'Blue Harbor Co.' },
];

export const mockProducts: Product[] = [
  {
    id: 'p-1', name: 'Ceramic Mug Set', categoryId: 'cat-home', brandId: 'brand-northstar',
    description: 'Stoneware ceramic mugs, dishwasher & microwave safe.',
    variants: [
      { id: 'v-1', sku: 'NS-MUG-12', name: '12-piece set', costPrice: 9.5, sellingPrice: 24.99, isActive: true },
      { id: 'v-2', sku: 'NS-MUG-06', name: '6-piece set', costPrice: 5.5, sellingPrice: 14.99, isActive: true },
    ],
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'p-2', name: 'Stainless Tumbler 20oz', categoryId: 'cat-home', brandId: 'brand-northstar',
    description: 'Double-wall vacuum insulated tumbler.',
    variants: [{ id: 'v-3', sku: 'NS-TUM-20', name: '20oz Silver', costPrice: 4.2, sellingPrice: 12.5, isActive: true }],
    createdAt: '2026-01-15T09:30:00.000Z',
  },
  {
    id: 'p-3', name: 'Organic Cotton Towels', categoryId: 'cat-bath', brandId: 'brand-evergreen',
    description: 'GOTS-certified organic cotton, 10-piece bundle.',
    variants: [{ id: 'v-4', sku: 'EG-ORG-10', name: '10-piece bundle', costPrice: 16, sellingPrice: 39.99, isActive: true }],
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'p-4', name: 'Bamboo Sheet Set', categoryId: 'cat-bath', brandId: 'brand-evergreen',
    description: 'Cooling bamboo viscose sheets, Queen size.',
    variants: [{ id: 'v-5', sku: 'EG-SHE-01', name: 'Queen', costPrice: 24, sellingPrice: 59, isActive: true }],
    createdAt: '2026-01-20T09:30:00.000Z',
  },
  {
    id: 'p-5', name: 'LED Desk Lamp', categoryId: 'cat-office', brandId: 'brand-atlas',
    description: 'Dimmable LED lamp with USB charging port.',
    variants: [{ id: 'v-6', sku: 'AT-LAM-01', name: 'Black', costPrice: 11, sellingPrice: 29.99, isActive: true }],
    createdAt: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'p-6', name: 'Ergonomic Office Chair', categoryId: 'cat-office', brandId: 'brand-atlas',
    description: 'Mesh back chair with lumbar support.',
    variants: [{ id: 'v-7', sku: 'AT-CHA-02', name: 'Standard', costPrice: 41, sellingPrice: 89.99, isActive: true }],
    createdAt: '2026-02-01T09:30:00.000Z',
  },
  {
    id: 'p-7', name: 'Nautical Wall Decor', categoryId: 'cat-decor', brandId: 'brand-blueharbor',
    description: 'Coastal-themed wooden wall art set.',
    variants: [{ id: 'v-8', sku: 'BH-DEC-05', name: 'Set of 5', costPrice: 7, sellingPrice: 18.75, isActive: true }],
    createdAt: '2026-09-05T09:00:00.000Z',
  },
  {
    id: 'p-8', name: 'Coastal Rug 5x7', categoryId: 'cat-decor', brandId: 'brand-blueharbor',
    description: 'Woven area rug in coastal blue tones.',
    variants: [{ id: 'v-9', sku: 'BH-RUG-03', name: '5x7 ft', costPrice: 31, sellingPrice: 74, isActive: true }],
    createdAt: '2026-09-05T09:30:00.000Z',
  },
  {
    id: 'p-9', name: 'Kitchen Knife Block Set', categoryId: 'cat-home', brandId: 'brand-northstar',
    description: '15-piece knife block set with wooden block.',
    variants: [{ id: 'v-10', sku: 'NS-KIT-09', name: '15-piece', costPrice: 19, sellingPrice: 45, isActive: true }],
    createdAt: '2026-02-10T09:00:00.000Z',
  },
];

/** Client–product relationships: who sells what, where, and at which price */
export const mockListings: MarketplaceListing[] = [
  { id: 'lst-1', productId: 'p-1', variantId: 'v-1', clientId: 'client-northstar', marketplaceId: 'mp-amazon', listingPrice: 24.99, status: 'active', externalId: 'B0AMZ0001' },
  { id: 'lst-2', productId: 'p-2', variantId: 'v-3', clientId: 'client-northstar', marketplaceId: 'mp-amazon', listingPrice: 12.5, status: 'active', externalId: 'B0AMZ0002' },
  { id: 'lst-3', productId: 'p-3', variantId: 'v-4', clientId: 'client-evergreen', marketplaceId: 'mp-walmart', listingPrice: 39.99, status: 'active' },
  { id: 'lst-4', productId: 'p-4', variantId: 'v-5', clientId: 'client-evergreen', marketplaceId: 'mp-walmart', listingPrice: 59, status: 'active' },
  { id: 'lst-5', productId: 'p-5', variantId: 'v-6', clientId: 'client-atlas', marketplaceId: 'mp-amazon', listingPrice: 29.99, status: 'active', externalId: 'B0AMZ0005' },
  { id: 'lst-6', productId: 'p-6', variantId: 'v-7', clientId: 'client-atlas', marketplaceId: 'mp-amazon', listingPrice: 89.99, status: 'active', externalId: 'B0AMZ0006' },
  { id: 'lst-7', productId: 'p-7', variantId: 'v-8', clientId: 'client-blueharbor', marketplaceId: 'mp-walmart', listingPrice: 18.75, status: 'draft' },
  { id: 'lst-8', productId: 'p-8', variantId: 'v-9', clientId: 'client-blueharbor', marketplaceId: 'mp-walmart', listingPrice: 74, status: 'draft' },
  { id: 'lst-9', productId: 'p-9', variantId: 'v-10', clientId: 'client-northstar', marketplaceId: 'mp-amazon', listingPrice: 45, status: 'active', externalId: 'B0AMZ0009' },
];