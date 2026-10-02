import { Bell, CheckCheck, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../utils/format';
import type { AppNotification, NotificationType } from '../types/notification';

// Map notification types to icons and colors
const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  approval_required: { icon: <AlertCircle size={16} />, color: 'text-purple-600', bg: 'bg-purple-100' },
  alert: { icon: <AlertTriangle size={16} />, color: 'text-red-600', bg: 'bg-red-100' },
  warning: { icon: <AlertTriangle size={16} />, color: 'text-amber-600', bg: 'bg-amber-100' },
  success: { icon: <CheckCircle2 size={16} />, color: 'text-green-600', bg: 'bg-green-100' },
  info: { icon: <Info size={16} />, color: 'text-blue-600', bg: 'bg-blue-100' },
};

export function NotificationsDropdown() {
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.isRead) {
      markAsRead.mutate(notif.id);
    }
    setIsOpen(false);
    navigate(notif.actionUrl);
  };

  // ... (keep the rest of the JSX exactly the same)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-card">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-card shadow-lg z-50 overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-3 bg-muted/30">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Loading...</p>
            ) : notifications && notifications.length > 0 ? (
              notifications.map((notif) => {
                const config = typeConfig[notif.type];
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left p-3 border-b last:border-0 hover:bg-accent/50 transition-colors flex gap-3 ${
                      !notif.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 rounded-full p-1.5 ${config.bg} ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary mt-1.5" />}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{formatDate(notif.createdAt)}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <Bell className="mx-auto mb-2 text-muted-foreground opacity-50" size={24} />
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}