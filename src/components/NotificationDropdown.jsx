import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Bell, 
  BellRing, 
  X, 
    Check
} from 'lucide-react';

const NotificationDropdown = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUnreadCount();
        
        // Set up polling for new notifications
        const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds

        const handleNotificationsUpdated = () => {
            fetchUnreadCount();
            if (isOpen) {
                fetchNotifications();
            }
        };

        window.addEventListener('notifications:updated', handleNotificationsUpdated);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('notifications:updated', handleNotificationsUpdated);
        };
    }, [isOpen]);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/stats');
            setUnreadCount(response.data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications?limit=5&isRead=false');
            setNotifications(response.data.notifications || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
            setUnreadCount((prev) => Math.max(0, prev - 1));
            window.dispatchEvent(new Event('notifications:updated'));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const extractCaseId = (notification) => {
        if (notification.caseId) return notification.caseId;
        if (notification.metadata?.caseId) return notification.metadata.caseId;
        if (notification.relatedIncident?._id) return notification.relatedIncident._id;
        if (notification.relatedIncident) return notification.relatedIncident;
        return null;
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        
        // Close dropdown and navigate
        setIsOpen(false);
        
        const caseId = extractCaseId(notification);
        if (caseId) {
            navigate(`/cases/${caseId}`);
            return;
        }

        navigate('/notifications');
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications([]);
            setUnreadCount(0);
            window.dispatchEvent(new Event('notifications:updated'));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'INCIDENT_UPDATE': '📝',
            'ASSIGNMENT': '📋',
            'SYSTEM': '📢',
            'CASE_UPDATE': '🗂️',
            'NEW_INCIDENT': '🚨',
            'geo-alert': '📍',
            'awareness': '📘'
        };
        return icons[type] || '📢';
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={handleToggle}
                className="relative p-2 text-text-muted hover:text-primary transition-colors"
                title="Notifications"
            >
                {unreadCount > 0 ? (
                    <BellRing size={20} />
                ) : (
                    <Bell size={20} />
                )}
                
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown Content */}
                    <div className="absolute right-0 mt-2 w-96 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-surface-light rounded transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-text-muted">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-text-muted">
                                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 hover:bg-surface-light transition-colors cursor-pointer ${
                                                !notification.isRead ? 'bg-blue-500/5' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 text-lg">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''} line-clamp-2`}>
                                                        {notification.message}
                                                    </p>
                                                    
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-text-muted">
                                                            {formatTime(notification.createdAt)}
                                                        </span>
                                                        
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markAsRead(notification._id);
                                                                }}
                                                                className="p-1 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <Check size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-border bg-surface-light/40">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notifications');
                                }}
                                className="w-full rounded-md border border-primary/40 px-3 py-2 text-center text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                            >
                                See all notifications
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
