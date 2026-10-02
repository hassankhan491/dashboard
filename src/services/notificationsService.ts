import { mockNotifications } from '../mock/notifications';
import type { AppNotification } from '../types/notification';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory DB
let notificationsDb: AppNotification[] = mockNotifications.map((n) => ({ ...n }));

export const notificationsService = {
  async getNotifications(userRole: string): Promise<AppNotification[]> {
    await delay(200);
    
    return notificationsDb
      .filter((n) => n.targetRole.toLowerCase() === userRole.toLowerCase() || n.targetRole === 'all')
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
      (n.targetRole.toLowerCase() === userRole.toLowerCase() || n.targetRole === 'all') ? { ...n, isRead: true } : n
    );
  },

  async triggerNotification(notification: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): Promise<AppNotification> {
    await delay(100);
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notificationsDb = [newNotif, ...notificationsDb];
    return newNotif;
  },
};