import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useFixedNavOffsetClass } from '../hooks/useFixedNavOffsetClass';
import api from '../utils/api';
import { Navigation2, ChevronLeft, ChevronRight, MapPin, AlertTriangle } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: '', label: 'All assigned' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'DECLINED', label: 'Declined' },
    { value: 'EN_ROUTE', label: 'En route' },
    { value: 'ON_SITE', label: 'On site' },
    { value: 'ACTION_TAKEN', label: 'Action taken' },
    { value: 'CLOSED', label: 'Closed' }
];

const statusBadgeClass = (s) => {
    const map = {
        ASSIGNED: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        ACCEPTED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        DECLINED: 'bg-red-500/15 text-red-300 border-red-500/30',
        EN_ROUTE: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        ON_SITE: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
        ACTION_TAKEN: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        CLOSED: 'bg-slate-500/20 text-slate-300 border-slate-500/35'
    };
    return map[s] || 'bg-slate-500/10 text-slate-300 border-slate-500/25';
};

const RangerMissions = () => {
    const navPt = useFixedNavOffsetClass();
    const [rangerStatus, setRangerStatus] = useState('');
    const [page, setPage] = useState(1);
    const [cases, setCases] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const limit = 10;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({ page: String(page), limit: String(limit) });
                if (rangerStatus) params.set('rangerStatus', rangerStatus);
                const res = await api.get(`/ranger/cases?${params.toString()}`);
                setCases(res.data.cases || []);
                setPagination(res.data.pagination || { current: page, pages: 1, total: 0 });
            } catch (err) {
                setError(err.response?.data?.message || 'Could not load ranger missions');
                setCases([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [rangerStatus, page]);

    useEffect(() => {
        setPage(1);
    }, [rangerStatus]);

    return (
        <div className="min-h-screen pb-16">
            <Navbar />
            <div className={`max-w-6xl mx-auto px-4 ${navPt || 'pt-8'}`}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Navigation2 className="text-primary" size={28} />
                            Ranger missions
                        </h1>
                        <p className="text-text-muted text-sm mt-1">
                            Cases assigned to you with mission status, evidence, and suggested field actions.
                        </p>
                    </div>
                    <div className="form-group max-w-xs w-full">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                            Filter by ranger status
                        </label>
                        <select
                            className="w-full rounded-lg bg-surface border border-border text-white px-3 py-2 text-sm"
                            value={rangerStatus}
                            onChange={(e) => setRangerStatus(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.value || 'all'} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl border border-danger/40 bg-danger/10 text-danger text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-text-muted text-center py-20">Loading missions…</div>
                ) : cases.length === 0 ? (
                    <div className="glass-morphism p-10 text-center text-text-muted">
                        No missions match this filter.
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {cases.map((c) => (
                            <li key={c.caseId}>
                                <Link
                                    to={`/ranger-missions/${encodeURIComponent(c.caseId)}`}
                                    className="block glass-morphism rounded-2xl p-5 hover:border-primary/40 border border-transparent transition-colors"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="font-mono text-sm text-primary font-semibold">{c.caseId}</div>
                                            <div className="text-white font-semibold mt-1 flex items-center gap-2">
                                                <AlertTriangle size={16} className="text-accent shrink-0" />
                                                {c.threatType || '—'}
                                            </div>
                                            {c.location?.address && (
                                                <div className="text-text-muted text-sm mt-2 flex items-center gap-1.5">
                                                    <MapPin size={14} />
                                                    {c.location.address}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span
                                                className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border ${statusBadgeClass(
                                                    c.rangerStatus
                                                )}`}
                                            >
                                                {c.rangerStatus?.replace(/_/g, ' ') || '—'}
                                            </span>
                                            {c.priority && (
                                                <span className="text-xs text-text-muted">
                                                    Priority: <span className="text-white">{c.priority}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                {!loading && pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="btn-primary inline-flex items-center gap-2 disabled:opacity-40"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>
                        <span className="text-text-muted text-sm">
                            Page {pagination.current} of {pagination.pages}
                        </span>
                        <button
                            type="button"
                            disabled={page >= pagination.pages}
                            onClick={() => setPage((p) => p + 1)}
                            className="btn-primary inline-flex items-center gap-2 disabled:opacity-40"
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RangerMissions;
