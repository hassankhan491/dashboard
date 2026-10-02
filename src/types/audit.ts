export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'reject' 
  | 'login' 
  | 'export';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  module: string; // e.g., 'orders', 'purchasing', 'finance'
  targetId?: string; // e.g., Order ID, PO ID
  targetName?: string; // e.g., "AMZ-1001"
  details: string; // Human-readable description of what happened
  ipAddress?: string;
}