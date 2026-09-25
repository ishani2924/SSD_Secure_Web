import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useFixedNavOffsetClass } from '../hooks/useFixedNavOffsetClass';
import api from '../utils/api';
import {
    ArrowLeft,
    ListChecks,
    RefreshCw,
    MapPin,
    Shield,
    Camera,
    Trash2,
    CheckCircle2
} from 'lucide-react';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(
    /\/api\/?$/,
    ''
);

function resolveMediaUrl(url) {
    if (!url || url === 'text-report') return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

const RangerMissionDetail = () => {
    const { caseId: rawCaseId } = useParams();
    const location = useLocation();
    const caseId = rawCaseId ? decodeURIComponent(rawCaseId) : '';
    const navPt = useFixedNavOffsetClass();

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyKey, setBusyKey] = useState(null);

    const [suggestedActions, setSuggestedActions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [suggestionError, setSuggestionError] = useState(null);

    const [declineReason, setDeclineReason] = useState('');
    const [arriveNotes, setArriveNotes] = useState('');
    const [closeForm, setCloseForm] = useState({
        actionTaken: '',
        solutionProvided: '',
        proofUrls: '',
        dateTime: ''
    });

    const [evidenceForm, setEvidenceForm] = useState({
        files: [],
        description: '',
        notes: '',
        conditionSummary: ''
    });

    const fetchDetail = useCallback(async () => {
        if (!caseId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/ranger/cases/${encodeURIComponent(caseId)}`);
            setDetail(res.data);
        } catch (err) {
            setDetail(null);
            setError(err.response?.data?.message || 'Could not load mission');
        } finally {
            setLoading(false);
        }
    }, [caseId]);

    const fetchSuggestions = useCallback(async () => {
        if (!caseId) return;
        setLoadingSuggestions(true);
        setSuggestionError(null);
        try {
            const res = await api.get(`/ranger/cases/${encodeURIComponent(caseId)}/suggested-actions`);
            setSuggestedActions(res.data.suggestedActions || []);
        } catch (err) {
            setSuggestedActions([]);
            setSuggestionError(err.response?.data?.message || 'Could not load suggested actions');
        } finally {
            setLoadingSuggestions(false);
        }
    }, [caseId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    useEffect(() => {
        if (!caseId) return;
        fetchSuggestions();
    }, [caseId, fetchSuggestions]);

    useEffect(() => {
        if (location.hash !== '#groq-suggested-steps') return;
        if (loading || !detail) return;
        const timer = window.setTimeout(() => {
            document.getElementById('groq-suggested-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
    }, [location.hash, loading, detail]);

    const runAction = async (key, fn) => {
        setBusyKey(key);
        setError(null);
        try {
            await fn();
            await fetchDetail();
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                (typeof err.message === 'string' ? err.message : null) ||
                'Request failed';
            setError(msg);
        } finally {
            setBusyKey(null);
        }
    };

    const postEvidenceMultipart = async () => {
        const form = new FormData();
        evidenceForm.files.forEach((f) => form.append('photos', f));
        if (evidenceForm.description) form.append('description', evidenceForm.description);
        if (evidenceForm.notes) form.append('notes', evidenceForm.notes);
        if (evidenceForm.conditionSummary) form.append('conditionSummary', evidenceForm.conditionSummary);

        const token = localStorage.getItem('token');
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const url = `${base.replace(/\/$/, '')}/ranger/cases/${encodeURIComponent(caseId)}/evidence`;
        const res = await fetch(url, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        setEvidenceForm({
            files: [],
            description: '',
            notes: '',
            conditionSummary: ''
        });
    };

    const parseProofUrls = (text) =>
        text
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean);

    const rangerStatus = detail?.rangerStatus;

    const missionActions = (
        <div className="space-y-3">
            {rangerStatus === 'ASSIGNED' && (
                <>
                    <button
                        type="button"
                        disabled={busyKey !== null}
                        onClick={() =>
                            runAction('accept', () =>
                                api.post(`/ranger/cases/${encodeURIComponent(caseId)}/accept`)
                            )
                        }
                        className="btn-primary w-full sm:w-auto"
                    >
                        {busyKey === 'accept' ? 'Working…' : 'Accept mission'}
                    </button>
                    <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-2">
                        <label className="text-xs font-semibold text-text-muted uppercase">Decline reason</label>
                        <textarea
                            className="w-full rounded-lg bg-surface border border-border text-white px-3 py-2 text-sm min-h-[80px]"
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="Optional — helps dispatch reassign"
                        />
                        <button
                            type="button"
                            disabled={busyKey !== null}
                            onClick={() =>
                                runAction('decline', () =>
                                    api.post(`/ranger/cases/${encodeURIComponent(caseId)}/decline`, {
                                        declineReason
                                    })
                                )
                            }
                            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-danger/50 text-danger font-semibold hover:bg-danger/10 transition-colors"
                        >
                            {busyKey === 'decline' ? 'Working…' : 'Decline mission'}
                        </button>
                    </div>
                </>
            )}
            {rangerStatus === 'ACCEPTED' && (
                <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={() =>
                        runAction('start', () =>
                            api.post(`/ranger/cases/${encodeURIComponent(caseId)}/start-mission`)
                        )
                    }
                    className="btn-primary"
                >
                    {busyKey === 'start' ? 'Working…' : 'Start mission (en route)'}
                </button>
            )}
            {rangerStatus === 'EN_ROUTE' && (
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-muted uppercase">Arrival notes</label>
                    <textarea
                        className="w-full rounded-lg bg-surface border border-border text-white px-3 py-2 text-sm min-h-[72px]"
                        value={arriveNotes}
                        onChange={(e) => setArriveNotes(e.target.value)}
                    />
                    <button
                        type="button"
                        disabled={busyKey !== null}
                        onClick={() =>
                            runAction('arrive', () =>
                                api.post(`/ranger/cases/${encodeURIComponent(caseId)}/arrive-on-site`, {
                                    notes: arriveNotes
                                })
                            )
                        }
                        className="btn-primary"
                    >
                        {busyKey === 'arrive' ? 'Working…' : 'Arrive on site'}
                    </button>
                </div>
            )}
            {rangerStatus === 'ON_SITE' && (
                <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={() =>
                        runAction('action', () =>
                            api.post(`/ranger/cases/${encodeURIComponent(caseId)}/action-taken`)
                        )
                    }
                    className="btn-primary"
                >
                    {busyKey === 'action' ? 'Working…' : 'Record action taken'}
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <div className={`max-w-4xl mx-auto px-4 ${navPt || 'pt-8'}`}>
                <Link
                    to="/ranger-missions"
                    className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm font-medium mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to ranger missions
                </Link>

                {loading && <div className="text-text-muted py-16 text-center">Loading…</div>}

                {!loading && error && !detail && (
                    <div className="p-4 rounded-xl border border-danger/40 bg-danger/10 text-danger">{error}</div>
                )}

                {!loading && detail && (
                    <>
                        {error && (
                            <div className="mb-4 p-4 rounded-xl border border-danger/40 bg-danger/10 text-danger text-sm">
                                {error}
                            </div>
                        )}

                        <div className="glass-morphism rounded-2xl p-6 mb-6 border border-border/80">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="font-mono text-primary font-semibold">{detail.caseId}</div>
                                    <h1 className="text-xl font-bold text-white mt-1">{detail.threatType}</h1>
                                    <div className="text-text-muted text-sm mt-2 space-y-1">
                                        {detail.location?.address && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={14} />
                                                {detail.location.address}
                                            </div>
                                        )}
                                        <div>
                                            Case status:{' '}
                                            <span className="text-white font-medium">{detail.status}</span>
                                        </div>
                                        <div>
                                            Ranger status:{' '}
                                            <span className="text-white font-medium">
                                                {detail.rangerStatus?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-primary">
                                    <Shield size={22} />
                                    <span className="text-sm font-bold uppercase tracking-wide">Field mission</span>
                                </div>
                            </div>
                            {detail.description && (
                                <p className="text-text-muted text-sm mt-4 border-t border-border pt-4 leading-relaxed">
                                    {detail.description}
                                </p>
                            )}
                        </div>

                        <div
                            id="groq-suggested-steps"
                            className="glass-morphism rounded-2xl p-6 mb-6 border border-border/80 scroll-mt-28"
                        >
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ListChecks className="text-primary" size={22} />
                                    Suggested actions
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary/90 ml-1">
                                        Groq AI
                                    </span>
                                </h2>
                                <button
                                    type="button"
                                    onClick={fetchSuggestions}
                                    disabled={loadingSuggestions}
                                    className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline disabled:opacity-50"
                                >
                                    <RefreshCw size={16} className={loadingSuggestions ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                            </div>
                            {suggestionError && (
                                <p className="text-danger text-sm mb-3">{suggestionError}</p>
                            )}
                            {loadingSuggestions && suggestedActions.length === 0 ? (
                                <p className="text-text-muted text-sm">Loading suggestions…</p>
                            ) : suggestedActions.length === 0 ? (
                                <p className="text-text-muted text-sm">No suggestions returned.</p>
                            ) : (
                                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-200">
                                    {suggestedActions.map((line, i) => (
                                        <li key={i} className="leading-relaxed">
                                            {line}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>

                        <div className="glass-morphism rounded-2xl p-6 mb-6 border border-border/80">
                            <h2 className="text-lg font-bold text-white mb-4">Mission workflow</h2>
                            {missionActions}
                            {['DECLINED', 'CLOSED'].includes(rangerStatus) && (
                                <p className="text-text-muted text-sm">
                                    This mission is {rangerStatus.toLowerCase().replace(/_/g, ' ')}. No further
                                    workflow steps apply here.
                                </p>
                            )}
                        </div>

                        {['ON_SITE', 'ACTION_TAKEN'].includes(rangerStatus) && (
                            <div className="glass-morphism rounded-2xl p-6 mb-6 border border-border/80">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Camera size={22} className="text-primary" />
                                    Evidence
                                </h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="form-group sm:col-span-2">
                                        <label className="text-xs text-text-muted">Photos / videos</label>
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            multiple
                                            className="text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:px-3 file:py-2"
                                            onChange={(e) =>
                                                setEvidenceForm((f) => ({
                                                    ...f,
                                                    files: e.target.files ? Array.from(e.target.files) : []
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs text-text-muted">Description</label>
                                        <input
                                            className="w-full rounded-lg bg-surface border border-border text-white px-3 py-2 text-sm"
                                            value={evidenceForm.description}
                                            onChange={(e) =>
                                                setEvidenceForm((f) => ({ ...f, description: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs text-text-muted">Notes</label>
                                        <input
                                            className="w-full rounded-lg bg-surface border border-border text-white px-3 py-2 text-sm"
                                            value={evidenceForm.notes}
                                            onChange={(e) =>
                                                setEvidenceForm((f) => ({ ...f, notes: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="form-group sm:col-span-2">
                                        <label className="text-xs text-text-muted">Condition summary</label>
                                        <input
                                            className="w-full rounded-lg bg-surface border border-border text-white px-3 py-2 text-sm"
                                            value={evidenceForm.conditionSummary}
                                            onChange={(e) =>
                                                setEvidenceForm((f) => ({ ...f, conditionSummary: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={busyKey !== null}
                                    onClick={() => runAction('evidence', postEvidenceMultipart)}
                                    className="btn-primary mt-4"
                                >
                                    {busyKey === 'evidence' ? 'Uploading…' : 'Upload evidence'}
                                </button>
                                <p className="text-text-muted text-xs mt-2">
                                    You can also submit text-only notes if you leave files empty but fill description
                                    or notes (per API).
                                </p>

                                {detail.evidence?.length > 0 && (
                                    <ul className="mt-6 space-y-3">
                                        {detail.evidence.map((ev) => {
                                            const href = resolveMediaUrl(ev.url);
                                            return (
                                                <li
                                                    key={ev._id}
                                                    className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-surface/40 p-3"
                                                >
                                                    <div className="text-sm min-w-0">
                                                        <div className="text-white font-medium">
                                                            {ev.evidenceType}{' '}
                                                            <span className="text-text-muted font-normal">
                                                                {ev.url === 'text-report' ? '(text)' : ''}
                                                            </span>
                                                        </div>
                                                        {ev.description && (
                                                            <div className="text-text-muted mt-1">{ev.description}</div>
                                                        )}
                                                        {href && (
                                                            <a
                                                                href={href}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-primary text-xs font-semibold mt-2 inline-block"
                                                            >
                                                                Open file
                                                            </a>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={busyKey !== null}
                                                        onClick={() =>
                                                            runAction(`del-${ev._id}`, () =>
                                                                api.delete(
                                                                    `/ranger/cases/${encodeURIComponent(
                                                                        caseId
                                                                    )}/evidence/${ev._id}`
                                                                )
                                                            )
                                                        }
                                                        className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors shrink-0"
                                                        title="Remove evidence"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )}

                        {['ON_SITE', 'ACTION_TAKEN'].includes(rangerStatus) && (
                            <div className="glass-morphism rounded-2xl p-6 mb-6 border border-border/80">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="text-primary" size={22} />
                                    Close case
                                </h2>
                                <div className="grid gap-3">
                                    <div className="form-group">
                                        <label className="text-xs text-text-muted">Action taken *</label>
                                        <textarea
                                            required
                                            className="w-full rounded-lg bg-surface border border-border text-white px-3 py-2 text-sm min-h-[80px]"
                                            value={closeForm.actionTaken}
                                            onChange={(e) =>
                                                setCloseForm((f) => ({ ...f, actionTaken: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs text-text-muted">Solution provided *</label>
                                        <textarea
                                            required
                                            className="w-full rounded-lg bg-surface border border-border text-white px-3 py-2 text-sm min-h-[80px]"
                                            value={closeForm.solutionProvided}
                                            onChange={(e) =>
                                                setCloseForm((f) => ({ ...f, solutionProvided: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs text-text-muted">
                                            Proof URLs (comma or newline separated)
                                        </label>
                                        <textarea
                                            className="w-full rounded-lg bg-surface border border-border text-white px-3 py-2 text-sm min-h-[64px]"
                                            value={closeForm.proofUrls}
                                            onChange={(e) =>
                                                setCloseForm((f) => ({ ...f, proofUrls: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs text-text-muted">Resolution date/time (optional)</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full rounded-lg bg-surface border border-border text-white px-3 py-2 text-sm"
                                            value={closeForm.dateTime}
                                            onChange={(e) =>
                                                setCloseForm((f) => ({ ...f, dateTime: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={busyKey !== null}
                                    onClick={() =>
                                        runAction('close', async () => {
                                            const body = {
                                                actionTaken: closeForm.actionTaken.trim(),
                                                solutionProvided: closeForm.solutionProvided.trim(),
                                                proofUrls: parseProofUrls(closeForm.proofUrls)
                                            };
                                            if (closeForm.dateTime) {
                                                body.dateTime = new Date(closeForm.dateTime).toISOString();
                                            }
                                            await api.post(`/ranger/cases/${encodeURIComponent(caseId)}/close`, body);
                                        })
                                    }
                                    className="btn-primary mt-4"
                                >
                                    {busyKey === 'close' ? 'Closing…' : 'Close mission'}
                                </button>
                            </div>
                        )}

                        {detail.rangerStatusHistory?.length > 0 && (
                            <div className="glass-morphism rounded-2xl p-6 border border-border/80">
                                <h2 className="text-lg font-bold text-white mb-4">Status history</h2>
                                <ul className="space-y-3 text-sm">
                                    {[...detail.rangerStatusHistory]
                                        .slice()
                                        .reverse()
                                        .map((h, idx) => (
                                            <li
                                                key={`${h.changedAt}-${idx}`}
                                                className="flex justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                                            >
                                                <span className="text-white font-medium">
                                                    {h.status?.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-text-muted shrink-0">
                                                    {h.changedAt
                                                        ? new Date(h.changedAt).toLocaleString()
                                                        : '—'}
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RangerMissionDetail;
