import type { Marketplace } from '../types/marketplace';

/**
 * Mock marketplace registry.
 * To add a future marketplace (e.g. eBay, TikTok Shop), add it HERE
 * (later: in the backend database) — no UI or logic changes needed.
 */
export const mockMarketplaces: Marketplace[] = [
  {
    id: 'mp-amazon',
    name: 'Amazon',
    slug: 'amazon',
    color: '#FF9900',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mp-walmart',
    name: 'Walmart',
    slug: 'walmart',
    color: '#0071CE',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];