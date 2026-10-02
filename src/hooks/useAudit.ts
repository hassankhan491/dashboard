import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditService.getLogs(),
  });
}