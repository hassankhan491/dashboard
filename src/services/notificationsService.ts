import { mockNotifications } from '../mock/notifications';
import type { Notification } from '../types/notification';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory DB
let notificationsDb: Notification[] = mockNotifications.map((n) => ({ ...n }));

export const notificationsService = {
  /** 
   * Fetches notifications relevant to the user's role.
   * In a real backend, this filtering happens on the server.
   */
  async getNotifications(userRole: string): Promise<Notification[]> {
    await delay(200);
    
    return notificationsDb
      .filter((n) => n.targetRole === userRole || n.targetRole === 'all')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((n) => ({ ...n }));
  },

  async markAsRead(id: string): Promise<void> {
    await delay(100);
    notificationsDb = notificationsDb.map((n) => 
      n.id === id ? { ...n, isRead: true } : n
    );
  },

  async markAllAsRead(userRole: string): Promise<void> {
    await delay(150);
    notificationsDb = notificationsDb.map((n) => 
      (n.targetRole === userRole || n.targetRole === 'all') ? { ...n, isRead: true } : n
    );
  },

  /** Used to simulate triggering a new notification from other parts of the app */
  async triggerNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> {
    await delay(100);
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notificationsDb = [newNotif, ...notificationsDb];
    return newNotif;
  },
};