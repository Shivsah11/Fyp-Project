import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import type { Notification } from '../../context/NotificationContext';
import { useDarkMode } from '../../context/DarkModeContext';

const NotificationDropdown: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
      case 'booking_approved':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all duration-300 relative ${
          isDarkMode 
            ? 'text-gray-400 hover:bg-gray-800 hover:text-emerald-400' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-emerald-600'
        }`}
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 mt-3 w-80 md:w-96 rounded-3xl shadow-2xl z-50 overflow-hidden border transition-all duration-300 transform origin-top-right ${
          isDarkMode 
            ? 'bg-gray-900/90 border-gray-700 backdrop-blur-xl' 
            : 'bg-white/90 border-gray-100 backdrop-blur-xl'
        }`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'
          }`}>
            <h3 className={`font-black text-sm uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                type="button"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto no-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`px-6 py-4 border-b cursor-pointer transition-all duration-300 hover:pl-8 ${
                    isDarkMode ? 'border-gray-800' : 'border-gray-50'
                  } ${!notification.read ? (isDarkMode ? 'bg-emerald-500/5' : 'bg-emerald-50/50') : ''}`}
                >
                  <div className="flex gap-4">
                    <div className="text-xl mt-1">
                      {getStatusIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        <span className={`text-[10px] font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatDate(notification.timestamp)}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-4xl mb-4 opacity-20">🔔</div>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No notifications yet
                </p>
                <p className="text-xs mt-1 text-gray-500">
                  Stay tuned for updates on your rentals!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`px-6 py-3 text-center border-t ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-100 bg-gray-50/30'}`}>
              <button 
                onClick={clearAll}
                className={`text-[10px] font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                } transition-colors`}
                type="button"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
