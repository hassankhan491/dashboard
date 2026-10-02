export type NotificationType = 'approval_required' | 'alert' | 'info' | 'success' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** Which role should see this notification (e.g., 'manager', 'finance', 'all') */
  targetRole: string; 
  isRead: boolean;
  createdAt: string;
  /** Where the user should go when they click the notification */
  actionUrl: string;
  module: string;
}