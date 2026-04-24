"use client";

import { useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";

export function NotificationBell() {
  const { unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mark all as read
              </button>
            )}
          </div>
          <NotificationPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}

import { Notification } from "@/contexts/NotificationContext";
import { VirtualizedList } from "@/components/ui/VirtualizedList";

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markAsRead, deleteNotification, isLoading } = useNotifications();

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No notifications
      </div>
    );
  }

  return (
    <VirtualizedList
      data={notifications}
      renderItem={(notification) => (
        <div
          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer ${
            !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
          }`}
          onClick={() => {
            if (!notification.read) {
              markAsRead(notification.id);
            }
          }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {notification.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                {notification.message}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      estimateSize={() => 120}
      height="400px"
      emptyMessage="No notifications"
    />
  );
}
