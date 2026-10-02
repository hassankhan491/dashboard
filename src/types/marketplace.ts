/**
 * Marketplace is a CONFIGURABLE entity.
 * Never hard-code "Amazon" or "Walmart" in UI or logic —
 * always read marketplaces from this entity (mock API now, real backend later).
 */
export interface Marketplace {
  id: string;
  name: string;
  slug: string;
  /** Brand color used for badges/tabs in the UI */
  color: string;
  isActive: boolean;
  createdAt: string;
}

/** 'all' = show combined data of every marketplace; otherwise a Marketplace id */
export const MARKETPLACE_FILTER_ALL = 'all';
export type MarketplaceFilter = string;