import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { MARKETPLACE_FILTER_ALL, type MarketplaceFilter } from '../types/marketplace';

interface MarketplaceFilterContextValue {
  /** Currently selected global filter: 'all' or a marketplace id */
  filter: MarketplaceFilter;
  setFilter: (filter: MarketplaceFilter) => void;
}

const MarketplaceFilterContext = createContext<MarketplaceFilterContextValue | null>(null);

export function MarketplaceFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<MarketplaceFilter>(MARKETPLACE_FILTER_ALL);
  const value = useMemo(() => ({ filter, setFilter }), [filter]);

  return (
    <MarketplaceFilterContext.Provider value={value}>
      {children}
    </MarketplaceFilterContext.Provider>
  );
}

export function useMarketplaceFilter(): MarketplaceFilterContextValue {
  const ctx = useContext(MarketplaceFilterContext);
  if (!ctx) {
    throw new Error('useMarketplaceFilter must be used inside <MarketplaceFilterProvider>');
  }
  return ctx;
}