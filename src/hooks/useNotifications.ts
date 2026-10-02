import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notificationsService';
import { useAuth } from './AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notifications', user?.role.name],
    queryFn: () => notificationsService.getNotifications(user?.role.name || 'staff'),
    // Poll every 30 seconds to simulate real-time updates
    refetchInterval: 30000, 
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications', user?.role.name] }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(user?.role.name || 'staff'),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications', user?.role.name] }),
  });
}