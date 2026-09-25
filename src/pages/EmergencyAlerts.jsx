import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Send, Users, Clock, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const ROLE_OPTIONS = ['CITIZEN', 'OFFICER', 'ADMIN'];
const ALERT_TYPE_OPTIONS = ['fire', 'poaching', 'illegal-logging', 'weather', 'general'];

const dedupeAwarenessItems = (items = []) => {
    const seen = new Set();
    return items.filter((item) => {
        const id = item?._id || item?.id;
        const contentKey = `${(item?.title || '').trim().toLowerCase()}|${(item?.content || '').trim().toLowerCase()}`;
        const key = id || contentKey;

        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const defaultMarkerIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = defaultMarkerIcon;

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const EmergencyAlerts = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        alertType: 'fire',
        targetRoles: ['CITIZEN', 'OFFICER'],
        expiresAt: ''
    });
    const [position, setPosition] = useState(null);
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState(null);
    const [error, setError] = useState('');
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingAlerts, setLoadingAlerts] = useState(true);
    const [relevantAwareness, setRelevantAwareness] = useState([]);
    const [loadingAwareness, setLoadingAwareness] = useState(false);
    const [selectedAwarenessIds, setSelectedAwarenessIds] = useState([]);

    const sortByNewest = (items) => {
        return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const fetchAlerts = useCallback(async () => {
        try {
            setLoadingAlerts(true);
            const endpoint = user?.role === 'ADMIN' ? '/alerts/all?limit=20&page=1' : '/alerts?limit=20&page=1';
            const res = await api.get(endpoint);
            setAlerts(sortByNewest(res.data.alerts || []));
        } catch (err) {
            console.error('Failed to fetch alerts', err);
        } finally {
            setLoadingAlerts(false);
        }
    }, [user?.role]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/alerts/stats');
            setStats(res.data || null);
        } catch (err) {
            console.error('Failed to fetch alert stats', err);
        }
    }, []);

    const fetchRelevantAwareness = useCallback(async (alertType) => {
        try {
            setLoadingAwareness(true);
            const res = await api.get(`/awareness/relevant/${alertType}`);
            const items = dedupeAwarenessItems(res.data?.awareness || []);
            setRelevantAwareness(items);
            setSelectedAwarenessIds(items.map((item) => item._id || item.id));
        } catch (err) {
            console.error('Failed to fetch relevant awareness guidelines', err);
            setRelevantAwareness([]);
            setSelectedAwarenessIds([]);
        } finally {
            setLoadingAwareness(false);
        }
    }, []);

    useEffect(() => {
        if (!user?.role) return;
        fetchAlerts();
        fetchStats();
    }, [user?.role, fetchAlerts, fetchStats]);

    useEffect(() => {
        fetchRelevantAwareness(formData.alertType);
    }, [formData.alertType, fetchRelevantAwareness]);

    const toggleTargetRole = (role) => {
        const hasRole = formData.targetRoles.includes(role);
        if (hasRole) {
            setFormData({
                ...formData,
                targetRoles: formData.targetRoles.filter((r) => r !== role)
            });
        } else {
            setFormData({
                ...formData,
                targetRoles: [...formData.targetRoles, role]
            });
        }
    };

    const toggleAwarenessSelection = (awarenessId) => {
        setSelectedAwarenessIds((prev) => {
            if (prev.includes(awarenessId)) {
                return prev.filter((id) => id !== awarenessId);
            }
            return [...prev, awarenessId];
        });
    };

    const handleSendEmergency = async (e) => {
        e.preventDefault();
        setError('');
        setSendResult(null);

        if (!formData.title.trim() || !formData.message.trim()) {
            setError('Title and message are required.');
            return;
        }

        if (!formData.targetRoles.length) {
            setError('Select at least one target role.');
            return;
        }

        if (!position) {
            setError('Please select a location on the map.');
            return;
        }

        const payload = {
            title: formData.title.trim(),
            message: formData.message.trim(),
            alertType: formData.alertType,
            awarenessIds: selectedAwarenessIds,
            targetRoles: formData.targetRoles,
            location: {
                type: 'Point',
                coordinates: [position.lng, position.lat]
            }
        };

        if (formData.expiresAt) {
            payload.expiresAt = new Date(formData.expiresAt).toISOString();
        }

        try {
            setSending(true);
            const res = await api.post('/alerts/emergency', payload);
            setSendResult(res.data);

            // Show the newly created alert at the top immediately.
            if (res.data?.alert) {
                setAlerts((prev) => sortByNewest([res.data.alert, ...prev]));
            }

            setFormData({
                title: '',
                message: '',
                alertType: 'fire',
                targetRoles: ['CITIZEN', 'OFFICER'],
                expiresAt: ''
            });
            setPosition(null);
            fetchAlerts();
            fetchStats();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send emergency alert.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen pb-16">
            <Navbar />
            <main className="max-w-6xl mx-auto px-6 mt-12 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <AlertTriangle className="text-red-400" size={32} />
                        Emergency Alerts
                    </h1>
                    <p className="text-text-muted">Create and send emergency alerts to officers, admins, and nearby citizens.</p>
                    {user && <p className="text-xs text-text-muted mt-2">Logged in as {user.name} ({user.role})</p>}
                </div>

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 glass-morphism">
                            <p className="text-sm text-text-muted">Total Alerts</p>
                            <p className="text-2xl font-bold">{stats.totalAlerts || 0}</p>
                        </div>
                        <div className="p-6 glass-morphism">
                            <p className="text-sm text-text-muted">Active Alerts</p>
                            <p className="text-2xl font-bold text-amber-300">{stats.activeAlerts || 0}</p>
                        </div>
                        <div className="p-6 glass-morphism">
                            <p className="text-sm text-text-muted">Urgent Alerts</p>
                            <p className="text-2xl font-bold text-red-300">{stats.urgentAlerts || 0}</p>
                        </div>
                    </div>
                )}

                <section className="glass-morphism p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Send Emergency Alert</h2>
                    <form onSubmit={handleSendEmergency} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-sm text-text-muted">Title</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Forest fire near northern boundary"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm text-text-muted">Message</label>
                            <textarea
                                rows="4"
                                className="input-field"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Describe the emergency and immediate guidance"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-text-muted">Emergency Type</label>
                            <select
                                className="input-field"
                                value={formData.alertType}
                                onChange={(e) => setFormData({ ...formData, alertType: e.target.value })}
                            >
                                {ALERT_TYPE_OPTIONS.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-text-muted mt-2">
                                This links the emergency alert to matching awareness guidelines.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm text-text-muted mb-2 block">Awareness Guidelines Set</label>
                            <p className="text-xs text-text-muted mb-3">
                                Guidelines are auto-loaded from this emergency type. You can unselect/select items before sending.
                            </p>
                            {loadingAwareness ? (
                                <div className="p-3 rounded-lg border border-border bg-surface-light text-sm text-text-muted">Loading awareness guidelines...</div>
                            ) : relevantAwareness.length === 0 ? (
                                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-sm text-amber-300">
                                    No awareness guidelines are configured for type: {formData.alertType}. Create awareness content with this trigger first.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {relevantAwareness.map((item) => {
                                        const id = item._id || item.id;
                                        const checked = selectedAwarenessIds.includes(id);
                                        return (
                                            <label key={id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-light cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleAwarenessSelection(id)}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{item.title}</p>
                                                    <p className="text-xs text-amber-300 uppercase mt-1">{item.category}</p>
                                                    <p className="text-xs text-text-muted mt-2">{item.content}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm text-text-muted mb-2 block">Target Roles</label>
                            <div className="flex gap-3 flex-wrap">
                                {ROLE_OPTIONS.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => toggleTargetRole(role)}
                                        className={`px-3 py-1.5 rounded-lg border transition-colors ${
                                            formData.targetRoles.includes(role)
                                                ? 'bg-primary/20 text-primary border-primary/40'
                                                : 'border-border text-text-muted hover:bg-surface-light'
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm text-text-muted mb-2 block">Emergency Location (required)</label>
                            <p className="text-xs text-text-muted mb-3">Click on the map to select the alert location. Nearby citizens and officers will be targeted based on these coordinates.</p>
                            <div className="rounded-2xl overflow-hidden border border-border">
                                <MapContainer center={[7.8731, 80.7718]} zoom={7} scrollWheelZoom={true} style={{ height: '320px', width: '100%' }}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationPicker position={position} setPosition={setPosition} />
                                </MapContainer>
                            </div>
                            {position ? (
                                <div className="mt-3 p-3 bg-surface-light rounded-lg text-sm flex items-center gap-2">
                                    <MapPin size={14} className="text-primary" />
                                    Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                                </div>
                            ) : (
                                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-300">
                                    Select a location point before sending.
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-text-muted">Expires At (optional)</label>
                            <input
                                type="datetime-local"
                                className="input-field"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            {error && <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">{error}</div>}
                            <button type="submit" className="btn-primary flex items-center gap-2" disabled={sending}>
                                <Send size={16} />
                                {sending ? 'Sending...' : 'Send Emergency Alert'}
                            </button>
                        </div>
                    </form>
                </section>

                {sendResult && (
                    <section className="glass-morphism p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">Delivery Summary</h2>
                        <p className="text-sm text-text-muted mb-3">{sendResult.message}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-surface rounded-lg">
                                <div className="flex items-center gap-2 text-text-muted mb-1"><Users size={14} /> Recipients</div>
                                <div className="text-xl font-semibold">{sendResult.recipientsCount || 0}</div>
                            </div>
                            <div className="p-4 bg-surface rounded-lg">
                                <div className="flex items-center gap-2 text-emerald-300 mb-1"><CheckCircle2 size={14} /> WhatsApp Sent</div>
                                <div className="text-xl font-semibold">{sendResult.whatsappDelivery?.sent || 0}</div>
                            </div>
                            <div className="p-4 bg-surface rounded-lg">
                                <div className="flex items-center gap-2 text-red-300 mb-1"><XCircle size={14} /> WhatsApp Failed</div>
                                <div className="text-xl font-semibold">{sendResult.whatsappDelivery?.failed || 0}</div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <h3 className="text-sm font-semibold mb-2">Linked Awareness Guidelines</h3>
                            {sendResult.awarenessGuidelines?.length ? (
                                <div className="space-y-2">
                                    {sendResult.awarenessGuidelines.map((item) => (
                                        <div key={item._id || item.id} className="p-3 rounded-lg border border-border bg-surface-light">
                                            <div className="text-sm font-medium">{item.title}</div>
                                            <div className="text-xs text-amber-300 uppercase mt-1">{item.category}</div>
                                            <p className="text-xs text-text-muted mt-2 line-clamp-3">{item.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-text-muted">No awareness guidelines matched this emergency type.</p>
                            )}
                        </div>
                    </section>
                )}

                <section className="glass-morphism p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <h2 className="text-xl font-semibold">Recent Alerts</h2>
                        <button
                            type="button"
                            onClick={fetchAlerts}
                            className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-surface-light transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                    {loadingAlerts ? (
                        <p className="text-text-muted">Loading alerts...</p>
                    ) : alerts.length === 0 ? (
                        <p className="text-text-muted">No alerts yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div key={alert._id || alert.id} className="p-4 bg-surface rounded-lg border border-border">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="font-semibold">{alert.title}</h3>
                                        <span className="badge">{alert.priority || 'MEDIUM'}</span>
                                    </div>
                                    <p className="text-sm text-text-muted mt-2">{alert.message}</p>
                                    {(alert.alertType || alert.relatedAwareness?.length > 0) && (
                                        <div className="mt-3 p-3 rounded-lg bg-surface-light border border-border">
                                            <p className="text-xs text-text-muted mb-2">
                                                Type: <span className="text-amber-300 uppercase">{alert.alertType || 'general'}</span>
                                            </p>
                                            {alert.relatedAwareness?.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {dedupeAwarenessItems(alert.relatedAwareness).map((item) => (
                                                        <span key={item._id || item.id} className="px-2 py-1 text-xs rounded-md bg-primary/20 text-primary border border-primary/30">
                                                            {item.title}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-text-muted">No linked guidelines</p>
                                            )}
                                        </div>
                                    )}
                                    <div className="text-xs text-text-muted mt-3 flex items-center gap-2">
                                        <Clock size={12} />
                                        {new Date(alert.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default EmergencyAlerts;