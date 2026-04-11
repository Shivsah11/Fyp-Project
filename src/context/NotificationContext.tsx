import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error' | 'booking_approved';
  bookingId?: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode; userType: 'tenant' | 'landlord' }> = ({ children, userType }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const storageKey = userType === 'tenant' ? 'tenantNotifications' : 'landlordNotifications';

  // Load notifications from local storage
  const loadNotifications = useCallback(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        } else {
          setNotifications([]);
        }
      } catch (e) {
        console.error('Failed to parse notifications', e);
        setNotifications([]);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    loadNotifications();
    
    // Listen for changes in other tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadNotifications();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadNotifications, storageKey]);

  const saveNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem(storageKey, JSON.stringify(newNotifications));
    // Manually trigger storage event for the same window to pick up changes
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: JSON.stringify(newNotifications) }));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNoti: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    saveNotifications([newNoti, ...notifications]);
  };

  const markAsRead = (id: string) => {
    saveNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
