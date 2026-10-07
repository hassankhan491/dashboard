export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

/** A sellable variation of a product (pack size, color, etc.) */
export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  /** What we pay the supplier per unit (COGS) */
  costPrice: number;
  /** Base selling price before marketplace-specific pricing */
  sellingPrice: number;
  isActive: boolean;
}

/**
 * The client–product relationship: where (which client's store, on which
 * marketplace) a variant is listed for sale — and at what price.
 */
export interface MarketplaceListing {
  id: string;
  productId: string;
  variantId: string;
  clientId: string;
  marketplaceId: string;
  listingPrice: number;
  status: 'active' | 'inactive' | 'draft';
  /** ASIN / Walmart Item ID once real integrations exist */
  externalId?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  brandId: string;
  description?: string;
  variants: ProductVariant[];
  createdAt: string;
}

export interface ProductInput {
  name: string;
  categoryId: string;
  brandId: string;
  description?: string;
  // Variants can have optional IDs (new variants won't have them yet)
  variants: Array<{
    id?: string;
    name: string;
    sku: string;
    costPrice: number;
    sellingPrice: number;
    isActive: boolean;
  }>;
}

export interface ListingInput {
  productId: string;
  variantId: string;
  clientId: string;
  marketplaceId: string;
  listingPrice: number;
  status: MarketplaceListing['status'];
}

// ---------- Phase 14: SKU COGS Master (AUT-04 / 6.2) ----------

/** A cost rule for one SKU, valid between effective dates */
export interface SKUCost {
  id: string;
  sku: string;
  unitCost: number;
  currency: string;
  effectiveFrom: string;   // ISO date the cost starts applying
  effectiveTo?: string;    // ISO date it stops (undefined = currently active)
  source: 'manual' | 'import' | 'purchasing';
  note?: string;
  createdBy: string;
  createdAt: string;
}