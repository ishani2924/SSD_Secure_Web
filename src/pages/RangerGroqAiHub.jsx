import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useFixedNavOffsetClass } from '../hooks/useFixedNavOffsetClass';
import api from '../utils/api';
import { Sparkles, ListChecks, MapPin, AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

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

/**
 * Case list first; expand to load & show Groq / rule-based suggested field steps per case.
 */
const RangerGroqAiHub = () => {
    const navPt = useFixedNavOffsetClass();
    const [cases, setCases] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null);

    const [expandedCaseId, setExpandedCaseId] = useState(null);
    const [stepCache, setStepCache] = useState(
        /** @type {Record<string, { loading: boolean; steps: string[]; error: string | null }>} */ ({})
    );

    const loadCaseList = useCallback(async () => {
        setListLoading(true);
        setListError(null);
        setExpandedCaseId(null);
        setStepCache({});
        try {
            const res = await api.get('/ranger/cases?page=1&limit=100');
            setCases(res.data.cases || []);
        } catch (err) {
            setListError(err.response?.data?.message || 'Could not load your missions');
            setCases([]);
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCaseList();
    }, [loadCaseList]);

    const loadStepsForCase = useCallback(async (caseId) => {
        setStepCache((prev) => ({
            ...prev,
            [caseId]: { loading: true, steps: prev[caseId]?.steps ?? [], error: null }
        }));
        try {
            const res = await api.get(`/ranger/cases/${encodeURIComponent(caseId)}/suggested-actions`);
            const steps = Array.isArray(res.data.suggestedActions) ? res.data.suggestedActions : [];
            setStepCache((prev) => ({
                ...prev,
                [caseId]: { loading: false, steps, error: null }
            }));
        } catch (e) {
            setStepCache((prev) => ({
                ...prev,
                [caseId]: {
                    loading: false,
                    steps: [],
                    error: e.response?.data?.message || 'Could not load suggestions'
                }
            }));
        }
    }, []);

    const handleToggleSteps = (caseId) => {
        if (expandedCaseId === caseId) {
            setExpandedCaseId(null);
            return;
        }
        setExpandedCaseId(caseId);
        const cached = stepCache[caseId];
        if (cached?.steps?.length > 0) {
            return;
        }
        void loadStepsForCase(caseId);
    };

    return (
        <div className="min-h-screen pb-16">
            <Navbar />
            <div className={`max-w-6xl mx-auto px-4 sm:px-6 ${navPt || 'pt-8'}`}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                            <Sparkles className="text-primary shrink-0" size={28} />
                            AI step suggestions
                        </h1>
                        <p className="text-text-muted text-sm mt-1 max-w-2xl">
                            Review your assigned cases below. Open{' '}
                            <strong className="text-white">AI step suggestions</strong> for Groq-powered or rule-based
                            field actions—tailored to work efficiently on site.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={loadCaseList}
                        disabled={listLoading}
                        className="inline-flex items-center justify-center gap-2 btn-primary disabled:opacity-50 shrink-0"
                    >
                        <RefreshCw size={18} className={listLoading ? 'animate-spin' : ''} />
                        Refresh list
                    </button>
                </div>

                {listError && (
                    <div className="mb-6 p-4 rounded-xl border border-danger/40 bg-danger/10 text-danger text-sm">
                        {listError}
                    </div>
                )}

                {listLoading && !listError && (
                    <div className="text-text-muted text-center py-20">Loading your cases…</div>
                )}

                {!listLoading && !listError && cases.length === 0 && (
                    <div className="glass-morphism rounded-2xl p-10 sm:p-12 text-center text-text-muted">
                        No assigned cases yet.
                    </div>
                )}

                {!listLoading && cases.length > 0 && (
                    <ul className="space-y-4">
                        {cases.map((c) => {
                            const open = expandedCaseId === c.caseId;
                            const st = stepCache[c.caseId];
                            return (
                                <li key={c.caseId}>
                                    <div
                                        className={`
                                            glass-morphism rounded-2xl overflow-hidden transition-colors
                                            border
                                            ${open ? 'border-primary/50 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]' : 'border-transparent hover:border-primary/30'}
                                        `}
                                    >
                                        <div className="p-5 sm:p-6">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-mono text-sm text-primary font-semibold">
                                                        {c.caseId}
                                                    </div>
                                                    <div className="text-white font-semibold mt-1 flex items-center gap-2">
                                                        <AlertTriangle size={16} className="text-accent shrink-0" />
                                                        <span>{c.threatType || '—'}</span>
                                                    </div>
                                                    {c.location?.address && (
                                                        <div className="text-text-muted text-sm mt-2 flex items-center gap-1.5">
                                                            <MapPin size={14} />
                                                            <span className="break-words">{c.location.address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    {c.rangerStatus && (
                                                        <span
                                                            className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border ${statusBadgeClass(
                                                                c.rangerStatus
                                                            )}`}
                                                        >
                                                            {c.rangerStatus.replace(/_/g, ' ')}
                                                        </span>
                                                    )}
                                                    {c.priority && (
                                                        <span className="text-xs text-text-muted">
                                                            Priority:{' '}
                                                            <span className="text-white font-medium">{c.priority}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleToggleSteps(c.caseId)}
                                                className="mt-5 w-full sm:w-auto min-w-[240px] inline-flex items-center justify-center gap-2 btn-primary"
                                            >
                                                <ListChecks size={18} />
                                                {open ? 'Hide AI step suggestions' : 'View AI step suggestions'}
                                                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            <p className="text-text-muted text-sm mt-3 max-w-xl">
                                                Tailored steps for this case — save time and stay consistent in the
                                                field.
                                            </p>
                                        </div>

                                        {open && (
                                            <div className="border-t border-white/10 bg-surface/50 px-5 sm:px-6 py-5 sm:py-6">
                                                {!st || st.loading ? (
                                                    <div className="flex items-center gap-3 text-text-muted text-sm">
                                                        <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                                        Loading suggestions…
                                                    </div>
                                                ) : st.error ? (
                                                    <p className="text-danger text-sm">{st.error}</p>
                                                ) : st.steps.length === 0 ? (
                                                    <p className="text-text-muted text-sm">No steps returned.</p>
                                                ) : (
                                                    <div className="rounded-xl border border-border/80 bg-background/50 p-5 sm:p-6">
                                                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                                            <ListChecks size={16} />
                                                            Suggested field steps
                                                        </h3>
                                                        <ol className="list-decimal list-inside space-y-3 text-sm sm:text-base text-slate-200 leading-relaxed">
                                                            {st.steps.map((line, i) => (
                                                                <li key={i} className="pl-1">
                                                                    {line}
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RangerGroqAiHub;
