import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useFixedNavOffsetClass } from '../hooks/useFixedNavOffsetClass';
import api from '../utils/api';
import {
  Bell,
  BellRing,
  Check,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter
} from 'lucide-react';

const TAB_ALL = 'ALL';
const TAB_EMERGENCY = 'EMERGENCY';
const TAB_THREAT_STATUS = 'THREAT_STATUS';
const STATUS_UNREAD = 'UNREAD';
const STATUS_READ = 'READ';

const emergencyTypes = new Set(['NEW_INCIDENT', 'geo-alert', 'URGENT_ALERT']);
const incidentStatusTypes = new Set(['INCIDENT_UPDATE', 'CASE_UPDATE']);

const NotificationCenter = () => {
  const navigate = useNavigate();
  const navPt = useFixedNavOffsetClass();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_ALL);
  const [statusTab, setStatusTab] = useState(STATUS_UNREAD);

  const isReadNotification = (notification) =>
    notification?.isRead === true || notification?.isRead === 'true';

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('limit', '500');

      const response = await api.get(`/notifications?${params.toString()}`);
      setNotifications(response.data.notifications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handleNotificationsUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener('notifications:updated', handleNotificationsUpdated);
    return () => {
      window.removeEventListener('notifications:updated', handleNotificationsUpdated);
    };
  }, [fetchNotifications]);

  const isEmergency = (notification) => {
    if (emergencyTypes.has(notification.type)) return true;
    return notification.priority === 'URGENT';
  };

  const isThreatStatus = (notification) => {
    const source = notification?.metadata?.source;
    if (source === 'THREAT_REPORT_STATUS' || source === 'THREAT_REPORT' || source === 'INCIDENT_STATUS') return true;

    if (incidentStatusTypes.has(notification?.type)) return true;

    const title = String(notification?.title || '').toLowerCase();
    const message = String(notification?.message || '').toLowerCase();
    return (
      title.includes('threat') ||
      message.includes('threat report') ||
      title.includes('incident status') ||
      message.includes('incident status') ||
      title.includes('case status') ||
      message.includes('case status')
    );
  };

  const extractCaseId = (notification) => {
    if (notification.caseId) return notification.caseId;
    if (notification.metadata?.caseId) return notification.metadata.caseId;
    if (notification.relatedIncident?._id) return notification.relatedIncident._id;
    if (notification.relatedIncident) return notification.relatedIncident;
    return null;
  };

  const filteredNotifications = useMemo(() => {
    const statusFiltered = notifications.filter((notification) =>
      statusTab === STATUS_UNREAD ? !isReadNotification(notification) : isReadNotification(notification)
    );

    if (activeTab === TAB_EMERGENCY) {
      return statusFiltered.filter(isEmergency);
    }
    if (activeTab === TAB_THREAT_STATUS) {
      return statusFiltered.filter(isThreatStatus);
    }
    return statusFiltered;
  }, [activeTab, notifications, statusTab]);

  const emergencyCount = useMemo(
    () => notifications.filter((n) => !isReadNotification(n) && isEmergency(n)).length,
    [notifications]
  );

  const threatStatusCount = useMemo(
    () => notifications.filter((n) => !isReadNotification(n) && isThreatStatus(n)).length,
    [notifications]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !isReadNotification(n)).length,
    [notifications]
  );

  const readCount = useMemo(
    () => notifications.filter((n) => isReadNotification(n)).length,
    [notifications]
  );

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      window.dispatchEvent(new Event('notifications:updated'));
    } catch {
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      window.dispatchEvent(new Event('notifications:updated'));
    } catch {
      setError('Failed to mark all notifications as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!isReadNotification(notification)) {
      await markAsRead(notification._id);
    }

    const caseId = extractCaseId(notification);
    if (caseId) {
      navigate(`/cases/${caseId}`);
    }
  };

  const getNotificationIcon = (notification) => {
    if (isEmergency(notification)) {
      return <AlertTriangle size={16} className="text-red-500" />;
    }
    if (isThreatStatus(notification)) {
      return <BellRing size={16} className="text-blue-500" />;
    }
    return <Bell size={16} className="text-gray-500" />;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${Math.max(diffInMinutes, 1)} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    if (diffInHours < 24) {
      const roundedHours = Math.floor(diffInHours);
      return `${roundedHours} hour${roundedHours !== 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-16">
        <Navbar />
        <div className={`max-w-4xl mx-auto px-6 ${navPt || 'mt-12'}`}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className={`max-w-4xl mx-auto px-6 animate-fade-in ${navPt || 'mt-12'}`}>
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
              <p className="text-text-muted">Switch between unread and read notifications using tabs.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 glass-morphism">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">All New</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <Bell size={24} className="text-gray-500" />
            </div>
          </div>

          <div className="p-6 glass-morphism">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Read</p>
                <p className="text-2xl font-bold text-emerald-500">{readCount}</p>
              </div>
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
          </div>

          <div className="p-6 glass-morphism">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Unread Emergency</p>
                <p className="text-2xl font-bold text-red-600">{emergencyCount}</p>
              </div>
              <AlertTriangle size={24} className="text-red-500" />
            </div>
          </div>

          <div className="p-6 glass-morphism">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Threat Status</p>
                <p className="text-2xl font-bold text-blue-600">{threatStatusCount}</p>
              </div>
              <BellRing size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="p-6 glass-morphism mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={20} className="text-primary" />
            <h3 className="text-lg font-semibold">Status Tabs</h3>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setStatusTab(STATUS_UNREAD)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusTab === STATUS_UNREAD
                  ? 'bg-primary text-white'
                  : 'border border-border hover:bg-surface-light'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setStatusTab(STATUS_READ)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusTab === STATUS_READ
                  ? 'bg-primary text-white'
                  : 'border border-border hover:bg-surface-light'
              }`}
            >
              Read ({readCount})
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold">Type Tabs</h3>
            <button
              onClick={() => {
                setStatusTab(STATUS_UNREAD);
                setActiveTab(TAB_ALL);
              }}
              className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-surface-light transition-colors"
            >
              Clear filters
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab(TAB_ALL)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === TAB_ALL
                  ? 'bg-primary text-white'
                  : 'border border-border hover:bg-surface-light'
              }`}
            >
              All ({statusTab === STATUS_UNREAD ? unreadCount : readCount})
            </button>
            <button
              onClick={() => setActiveTab(TAB_EMERGENCY)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === TAB_EMERGENCY
                  ? 'bg-primary text-white'
                  : 'border border-border hover:bg-surface-light'
              }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setActiveTab(TAB_THREAT_STATUS)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === TAB_THREAT_STATUS
                  ? 'bg-primary text-white'
                  : 'border border-border hover:bg-surface-light'
              }`}
            >
              Threat Status
            </button>
          </div>
        </div>

        <div className="glass-morphism">
          {error && (
            <div className="p-4 bg-red-500/10 border border-danger text-danger text-center">
              {error}
            </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-70 text-green-500" />
              <p>
                {statusTab === STATUS_UNREAD
                  ? 'No unread notifications in this tab'
                  : 'No read notifications in this tab'}
              </p>
              <p className="text-sm mt-2">
                {statusTab === STATUS_UNREAD
                  ? 'New incoming notifications will appear here automatically.'
                  : 'Read notifications will show here after you open or mark them as read.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-6 hover:bg-surface-light transition-colors cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{notification.message}</p>
                          <p className="text-xs text-text-muted mt-1">{notification.title}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          disabled={isReadNotification(notification)}
                          className="p-1 text-blue-500 hover:bg-blue-500/10 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(notification.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={12} />
                          {isReadNotification(notification) ? 'Read' : 'Unread'}
                        </div>
                        <span className="px-2 py-0.5 border border-border rounded-full uppercase text-[10px] tracking-wide">
                          {notification.type}
                        </span>
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
