import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Eye,
  Trash2,
  Filter
} from 'lucide-react';

const NotificationCenter = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [stats, setStats] = useState({});

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter === 'unread') params.append('unreadOnly', 'true');

            const response = await api.get(`/notifications?${params.toString()}`);
            setNotifications(response.data.notifications || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadCount(response.data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/notifications/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
        fetchStats();
    }, [fetchNotifications, fetchUnreadCount, fetchStats]);

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(notifications.map(notif => 
                notif._id === notificationId ? { ...notif, read: true } : notif
            ));
            fetchUnreadCount();
            fetchStats();
        } catch {
            setError('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(notif => ({ ...notif, read: true })));
            setUnreadCount(0);
            fetchStats();
        } catch {
            setError('Failed to mark all notifications as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(notifications.filter(notif => notif._id !== notificationId));
            fetchUnreadCount();
            fetchStats();
        } catch {
            setError('Failed to delete notification');
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }
        
        // Navigate to relevant page based on notification type
        if (notification.caseId) {
            navigate(`/cases/${notification.caseId}`);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'CASE_ASSIGNED': <Bell size={16} className="text-blue-500" />,
            'STATUS_UPDATE': <Info size={16} className="text-yellow-500" />,
            'RESOLUTION': <CheckCircle size={16} className="text-green-500" />,
            'URGENT_ALERT': <AlertTriangle size={16} className="text-red-500" />
        };
        return icons[type] || <Bell size={16} className="text-gray-500" />;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pb-16">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16">
            <div className="max-w-4xl mx-auto px-6 mt-12 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <BellRing size={32} className="text-primary" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Notifications</h1>
                            <p className="text-text-muted">Stay updated with your case activities</p>
                        </div>
                    </div>
                    
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface-light transition-colors"
                        >
                            <Check size={16} />
                            Mark All as Read
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="p-6 glass-morphism">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted">Total</p>
                                <p className="text-2xl font-bold">{stats.totalNotifications || 0}</p>
                            </div>
                            <Bell size={24} className="text-gray-500" />
                        </div>
                    </div>

                    <div className="p-6 glass-morphism">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted">Unread</p>
                                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                            </div>
                            <BellRing size={24} className="text-blue-500" />
                        </div>
                    </div>

                    <div className="p-6 glass-morphism">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted">Read</p>
                                <p className="text-2xl font-bold text-green-600">{stats.readNotifications || 0}</p>
                            </div>
                            <CheckCircle size={24} className="text-green-500" />
                        </div>
                    </div>

                    <div className="p-6 glass-morphism">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted">Urgent</p>
                                <p className="text-2xl font-bold text-red-600">{stats.typeBreakdown?.URGENT_ALERT || 0}</p>
                            </div>
                            <AlertTriangle size={24} className="text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-6 glass-morphism mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Filter size={20} className="text-primary" />
                        <h3 className="text-lg font-semibold">Filter Notifications</h3>
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === 'all' 
                                    ? 'bg-primary text-white' 
                                    : 'border border-border hover:bg-surface-light'
                            }`}
                        >
                            All ({stats.totalNotifications || 0})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === 'unread' 
                                    ? 'bg-primary text-white' 
                                    : 'border border-border hover:bg-surface-light'
                            }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === 'read' 
                                    ? 'bg-primary text-white' 
                                    : 'border border-border hover:bg-surface-light'
                            }`}
                        >
                            Read ({stats.readNotifications || 0})
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="glass-morphism">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-danger text-danger text-center">
                            {error}
                        </div>
                    )}
                    
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-text-muted">
                            <Bell size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No notifications found</p>
                            {filter !== 'all' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className="mt-4 text-primary hover:underline"
                                >
                                    View all notifications
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleNotificationClick(notification)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleNotificationClick(notification);
                                        }
                                    }}
                                    className={`p-6 hover:bg-surface-light transition-colors cursor-pointer ${
                                        !notification.read ? 'bg-blue-500/5' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                                                        {notification.message}
                                                    </p>
                                                    {notification.caseId && (
                                                        <p className="text-xs text-text-muted mt-1">
                                                            Case: {notification.caseId}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(notification._id);
                                                            }}
                                                            className="p-1 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification._id);
                                                        }}
                                                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                        title="Delete notification"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-xs text-text-muted">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatTime(notification.sentAt)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {notification.read ? (
                                                        <>
                                                            <CheckCircle size={12} />
                                                            Read
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye size={12} />
                                                            Unread
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
