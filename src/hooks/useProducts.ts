import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services/productsService';
import type { ListingInput, MarketplaceListing, ProductInput } from '../types/product';
import { useAuth } from './AuthContext';

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: () => productsService.getAll() });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsService.getCategories(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => productsService.getBrands(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Listings respect client-level access (restricted users see only their clients' listings) */
export function useListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['listings', user?.id],
    queryFn: async () => {
      const all = await productsService.getListings();
      if (!user || user.clientIds.length === 0) return all;
      return all.filter((listing) => user.clientIds.includes(listing.clientId));
    },
  });
}

export function useProductListings(productId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['listings', 'product', productId, user?.id],
    queryFn: async () => {
      const all = await productsService.getListingsByProduct(productId!);
      if (!user || user.clientIds.length === 0) return all;
      return all.filter((listing) => user.clientIds.includes(listing.clientId));
    },
    enabled: Boolean(productId),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => productsService.create(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      productsService.update(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ListingInput) => productsService.createListing(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<MarketplaceListing, 'id'>> }) =>
      productsService.updateListing(id, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}

export function useRemoveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsService.removeListing(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}