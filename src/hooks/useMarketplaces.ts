import { useQuery } from '@tanstack/react-query';
import { marketplaceService } from '../services/marketplaceService';

/**
 * Fetches the configurable marketplace list via TanStack Query.
 * staleTime: Infinity because marketplaces rarely change during a session.
 */
export function useMarketplaces() {
  return useQuery({
    queryKey: ['marketplaces'],
    queryFn: () => marketplaceService.getAll(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}