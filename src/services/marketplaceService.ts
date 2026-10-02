import { mockMarketplaces } from '../mock/marketplaces';
import type { Marketplace } from '../types/marketplace';

/** Simulates network latency so the UI is built ready for a real API */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Service layer — the ONLY place that talks to the "API".
 * Later: replace the mock import with fetch/axios calls to the NestJS backend.
 * Hooks and pages above it will NOT change.
 */
export const marketplaceService = {
  async getAll(): Promise<Marketplace[]> {
    await delay(200);
    return mockMarketplaces.filter((m) => m.isActive);
  },

  async getById(id: string): Promise<Marketplace | undefined> {
    await delay(100);
    return mockMarketplaces.find((m) => m.id === id);
  },
};