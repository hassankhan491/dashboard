export type NotificationType = 'approval_required' | 'alert' | 'info' | 'success' | 'warning';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  targetRole: string; 
  isRead: boolean;
  createdAt: string;
  actionUrl: string;
  module: string;
}