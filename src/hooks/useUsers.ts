import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService, type UserInput } from '../services/usersService';

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: () => usersService.getAll() });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => usersService.getRoles(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => usersService.getDepartments(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useClientOptions() {
  return useQuery({
    queryKey: ['client-options'],
    queryFn: () => usersService.getClientOptions(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useWarehouseOptions() {
  return useQuery({
    queryKey: ['warehouse-options'],
    queryFn: () => usersService.getWarehouseOptions(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UserInput) => usersService.create(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserInput }) => usersService.update(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.setActive(id, isActive),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  });
}