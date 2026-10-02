import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../services/clientsService';
import type { ClientContact, ClientInput } from '../types/client';
import { useAuth } from './AuthContext';
import { useMarketplaceFilter } from './MarketplaceFilterContext';

/** Respects client-level access: restricted users only see their assigned clients */
export function useClients() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      const all = await clientsService.getAll();
      if (!user || user.clientIds.length === 0) return all;
      return all.filter((client) => user.clientIds.includes(client.id));
    },
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsService.getById(id!),
    enabled: Boolean(id),
  });
}

/** Reacts to the global marketplace filter (All | Amazon | Walmart) */
export function useClientPerformance() {
  const { filter } = useMarketplaceFilter();
  return useQuery({
    queryKey: ['client-performance', filter],
    queryFn: () => clientsService.getPerformance(filter),
  });
}

export function useClientPerformanceByClient(clientId: string | undefined) {
  const { filter } = useMarketplaceFilter();
  return useQuery({
    queryKey: ['client-performance', clientId, filter],
    queryFn: () => clientsService.getPerformanceByClient(clientId!, filter),
    enabled: Boolean(clientId),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) => clientsService.create(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClientInput }) =>
      clientsService.update(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useAddContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, contact }: { clientId: string; contact: Omit<ClientContact, 'id'> }) =>
      clientsService.addContact(clientId, contact),
    onSuccess: (_, variables) =>
      void qc.invalidateQueries({ queryKey: ['clients', variables.clientId] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, contact }: { clientId: string; contact: ClientContact }) =>
      clientsService.updateContact(clientId, contact),
    onSuccess: (_, variables) =>
      void qc.invalidateQueries({ queryKey: ['clients', variables.clientId] }),
  });
}

export function useRemoveContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, contactId }: { clientId: string; contactId: string }) =>
      clientsService.removeContact(clientId, contactId),
    onSuccess: (_, variables) =>
      void qc.invalidateQueries({ queryKey: ['clients', variables.clientId] }),
  });
}