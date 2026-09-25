import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useFixedNavOffsetClass } from '../hooks/useFixedNavOffsetClass';
import {
    Navigation2,
    MapPin,
    AlertTriangle,
    ChevronRight,
    ClipboardList
} from 'lucide-react';

const RANGER_STATUSES = [
    'ASSIGNED',
    'ACCEPTED',
    'DECLINED',
    'EN_ROUTE',
    'ON_SITE',
    'ACTION_TAKEN',
    'CLOSED'
];

const statusStyle = (s) => {
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

const OfficerDashboard = () => {
    const { user } = useAuth();
    const navPt = useFixedNavOffsetClass();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get('/ranger/cases?page=1&limit=100');
                setMissions(res.data.cases || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Could not load your missions');
                setMissions([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const counts = useMemo(() => {
        const c = Object.fromEntries(RANGER_STATUSES.map((k) => [k, 0]));
        for (const m of missions) {
            if (m.rangerStatus && c[m.rangerStatus] !== undefined) {
                c[m.rangerStatus] += 1;
            }
        }
        const active =
            (c.ASSIGNED || 0) +
            (c.ACCEPTED || 0) +
            (c.EN_ROUTE || 0) +
            (c.ON_SITE || 0) +
            (c.ACTION_TAKEN || 0);
        return { ...c, active, total: missions.length };
    }, [missions]);

    const recent = useMemo(() => missions.slice(0, 6), [missions]);

    return (
        <div className="min-h-screen pb-16">
            <Navbar />
            <main className={`max-w-6xl mx-auto px-6 animate-fade-in ${navPt}`}>
                <header className="mb-10">
                    <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Field officer</p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        Welcome back{user?.name ? `, ${user.name}` : ''}
                    </h1>
                    <p className="text-text-muted max-w-2xl">
                        Your home base for ranger missions—assigned cases, mission status, and suggested field
                        actions.
                    </p>
                </header>

                <div className="flex flex-wrap gap-3 mb-8">
                    <Link
                        to="/ranger-missions"
                        className="inline-flex items-center gap-2 btn-primary rounded-xl px-5 py-3 shadow-lg"
                    >
                        <Navigation2 size={20} />
                        Ranger missions
                        <ChevronRight size={18} />
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl border border-danger/40 bg-danger/10 text-danger text-sm">
                        {error}
                    </div>
                )}

                <section className="mb-10">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ClipboardList className="text-primary" size={22} />
                        Mission overview
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="glass-morphism rounded-2xl p-4 border border-border/80">
                            <div className="text-text-muted text-xs font-semibold uppercase">Active missions</div>
                            <div className="text-3xl font-black text-white mt-1">{counts.active}</div>
                        </div>
                        <div className="glass-morphism rounded-2xl p-4 border border-border/80">
                            <div className="text-text-muted text-xs font-semibold uppercase">Needs response</div>
                            <div className="text-3xl font-black text-amber-300 mt-1">{counts.ASSIGNED}</div>
                            <div className="text-xs text-text-muted mt-1">Assigned / pending accept</div>
                        </div>
                        <div className="glass-morphism rounded-2xl p-4 border border-border/80">
                            <div className="text-text-muted text-xs font-semibold uppercase">In the field</div>
                            <div className="text-3xl font-black text-violet-300 mt-1">
                                {(counts.EN_ROUTE || 0) + (counts.ON_SITE || 0) + (counts.ACTION_TAKEN || 0)}
                            </div>
                            <div className="text-xs text-text-muted mt-1">En route, on site, action taken</div>
                        </div>
                        <div className="glass-morphism rounded-2xl p-4 border border-border/80">
                            <div className="text-text-muted text-xs font-semibold uppercase">Closed</div>
                            <div className="text-3xl font-black text-slate-300 mt-1">{counts.CLOSED}</div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <h2 className="text-lg font-bold text-white">Recent assignments</h2>
                        <Link to="/ranger-missions" className="text-sm font-semibold text-primary hover:underline">
                            View all
                        </Link>
                    </div>
                    {loading ? (
                        <div className="glass-morphism rounded-2xl p-12 text-center text-text-muted">
                            Loading missions…
                        </div>
                    ) : recent.length === 0 ? (
                        <div className="glass-morphism rounded-2xl p-12 text-center text-text-muted">
                            No assigned cases yet. When a case is assigned to you, it will appear here and under{' '}
                            <Link to="/ranger-missions" className="text-primary font-semibold">
                                Ranger missions
                            </Link>
                            .
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {recent.map((m) => (
                                <li key={m.caseId}>
                                    <Link
                                        to={`/ranger-missions/${encodeURIComponent(m.caseId)}`}
                                        className="flex flex-wrap items-center justify-between gap-3 glass-morphism rounded-2xl p-4 border border-border/60 hover:border-primary/40 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <div className="font-mono text-sm text-primary font-semibold">{m.caseId}</div>
                                            <div className="flex items-center gap-2 text-white font-medium mt-1">
                                                <AlertTriangle size={16} className="text-accent shrink-0" />
                                                <span className="truncate">{m.threatType || 'Case'}</span>
                                            </div>
                                            {m.location?.address && (
                                                <div className="text-text-muted text-sm mt-1 flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    <span className="truncate">{m.location.address}</span>
                                                </div>
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border shrink-0 ${statusStyle(
                                                m.rangerStatus
                                            )}`}
                                        >
                                            {(m.rangerStatus || '—').replace(/_/g, ' ')}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
};

export default OfficerDashboard;
