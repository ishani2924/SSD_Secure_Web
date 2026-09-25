import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Bot, CheckCircle2, Loader2, Package, Search, Sparkles, UserCog, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useFixedNavOffsetClass } from '../hooks/useFixedNavOffsetClass';
import api from '../utils/api';
import aiService from '../services/aiService';

function AiInsights() {
  const navPt = useFixedNavOffsetClass();
  const [tab, setTab] = useState('semantic');

  const [semanticQuery, setSemanticQuery] = useState('');
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticResults, setSemanticResults] = useState([]);

  const [resources, setResources] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [suggestingId, setSuggestingId] = useState(null);

  const [kycStatus, setKycStatus] = useState('');
  const [assetDetails, setAssetDetails] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuggestion, setActionSuggestion] = useState('');
  const [staff, setStaff] = useState([]);

  const formatAiSuggestion = (text) => {
    if (!text) return null;
    let cleanText = text.replace(/\*\*/g, '');
    const lines = cleanText.split(/\d+\./).filter(l => l.trim());

    const renderLine = (line, index) => {
      const foundStaff = staff.find(s => s._id && line.includes(s._id));
      let lineContent = line;
      if (foundStaff) {
        lineContent = line.split(foundStaff._id).join(foundStaff.userId?.name || 'Staff Member');
      }

      return (
        <li key={index} className="flex gap-3 items-start">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
            {index + 1}
          </span>
          <p className="text-text-muted leading-relaxed">{lineContent.trim()}</p>
        </li>
      );
    };

    if (lines.length > 1) {
      return (
        <ul className="space-y-4 mt-3">
          {lines.map((line, i) => renderLine(line, i))}
        </ul>
      );
    }
    return <div className="mt-2">{renderLine(cleanText, 0)}</div>;
  };

  const loadResources = useCallback(async () => {
    try {
      const [{ data: resData }, { data: staffData }] = await Promise.all([
        api.get('/resources'),
        api.get('/staff')
      ]);
      setResources(Array.isArray(resData) ? resData.filter((r) => r.status !== 'ARCHIVED') : []);
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch {
      setResources([]);
      setStaff([]);
    }
  }, []);

  useEffect(() => {
    if (tab === 'assignment' && resources.length === 0) {
      loadResources();
    }
  }, [tab, resources.length, loadResources]);

  const runSemanticSearch = async (event) => {
    event.preventDefault();
    if (!semanticQuery.trim()) return;
    setSemanticLoading(true);
    try {
      const result = await aiService.searchResources(semanticQuery.trim());
      setSemanticResults(Array.isArray(result) ? result : []);
    } finally {
      setSemanticLoading(false);
    }
  };

  const getSuggestionForResource = async (resourceId) => {
    setSuggestingId(resourceId);
    try {
      const result = await aiService.suggestStaffForResource(resourceId);
      setSuggestions((prev) => ({ ...prev, [resourceId]: result?.suggestion || 'No suggestion returned' }));
    } catch {
      setSuggestions((prev) => ({ ...prev, [resourceId]: 'Suggestion unavailable right now' }));
    } finally {
      setSuggestingId(null);
    }
  };

  const getActionSuggestion = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    try {
      const result = await aiService.suggestUserAction(kycStatus, assetDetails);
      setActionSuggestion(result?.suggestion || 'No action suggestion returned');
    } catch {
      setActionSuggestion('Unable to generate action suggestion at this time');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      <main className={`mx-auto max-w-7xl px-6 ${navPt || 'mt-12'}`}>
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
            <Bot size={42} className="text-purple-300" />
          </div>
          <div>
            <h1 className="text-4xl font-black">Cohere AI Insights</h1>
            <p className="text-text-muted">Dedicated AI page for semantic search, smart staff assignment, and action suggestion.</p>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { id: 'semantic', label: 'Semantic Search', icon: Search },
            { id: 'assignment', label: 'Staff Suggestion', icon: UserCog },
            { id: 'action', label: 'Action Suggestion', icon: Activity }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${tab === item.id ? 'bg-purple-600 text-white' : 'border border-white/10 bg-surface/30 text-text-muted hover:text-white'}`}
            >
              <span className="inline-flex items-center gap-2"><item.icon size={15} /> {item.label}</span>
            </button>
          ))}
        </div>

        <section className="glass-morphism rounded-2xl border border-white/10 p-6">
          {tab === 'semantic' && (
            <div>
              <form onSubmit={runSemanticSearch} className="mb-6 flex items-center gap-2 rounded-xl border border-white/10 bg-surface/40 p-3">
                <Sparkles size={16} className="text-purple-300" />
                <input
                  className="w-full bg-transparent outline-none"
                  placeholder="Describe resource you need"
                  value={semanticQuery}
                  onChange={(e) => setSemanticQuery(e.target.value)}
                />
                <button type="submit" disabled={semanticLoading} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {semanticLoading ? 'Searching...' : 'Search'}
                </button>
              </form>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {semanticResults.map((r) => (
                  <article key={r._id} className="rounded-xl border border-white/10 bg-surface/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-text-muted">{(r.type || '').replace(/_/g, ' ')}</p>
                    <h3 className="mt-1 text-lg font-bold">{r.metadata?.serialNumber || r.description || 'Resource'}</h3>
                    <p className="mt-2 text-sm text-text-muted">{r.description || 'No description'}</p>
                    <p className="mt-3 text-xs text-purple-300">Location: {r.metadata?.location || 'Unknown'}</p>
                  </article>
                ))}
                {!semanticLoading && semanticQuery && semanticResults.length === 0 && (
                  <p className="col-span-full text-sm text-text-muted">No semantic matches found.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'assignment' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {resources.map((r) => (
                <article key={r._id} className="rounded-xl border border-white/10 bg-surface/30 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-text-muted">{(r.type || '').replace(/_/g, ' ')}</p>
                      <h3 className="text-lg font-bold">{r.description || 'Resource'}</h3>
                    </div>
                    <Package size={18} className="text-primary" />
                  </div>
                  <p className="mb-3 text-xs text-text-muted">Serial: {r.metadata?.serialNumber || 'N/A'}</p>

                  <button
                    onClick={() => getSuggestionForResource(r._id)}
                    disabled={suggestingId !== null}
                    className="mb-3 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-300 disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-1">
                      {suggestingId === r._id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                      Suggest Staff
                    </span>
                  </button>

                  {suggestions[r._id] && (
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm text-text-muted shadow-inner">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-indigo-300" />
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">AI Intelligence</p>
                      </div>
                      {formatAiSuggestion(typeof suggestions[r._id] === 'string' ? suggestions[r._id] : suggestions[r._id]?.reasoning || 'Suggestion generated')}
                    </div>
                  )}
                </article>
              ))}
              {resources.length === 0 && <p className="text-sm text-text-muted">No active resources available.</p>}
            </div>
          )}

          {tab === 'action' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <form onSubmit={getActionSuggestion} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-muted">KYC Status</label>
                  <input className="input-field" value={kycStatus} onChange={(e) => setKycStatus(e.target.value)} placeholder="e.g. VERIFIED" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-muted">Asset Details</label>
                  <textarea className="input-field resize-none" rows={4} value={assetDetails} onChange={(e) => setAssetDetails(e.target.value)} placeholder="Current conditions and constraints" required />
                </div>
                <button type="submit" disabled={actionLoading} className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  {actionLoading ? 'Generating...' : 'Generate Action'}
                </button>
              </form>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Suggested Output</p>
                {!actionSuggestion && <p className="text-sm text-text-muted">Awaiting input.</p>}
                {actionSuggestion && (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-white/90">
                    <p>{typeof actionSuggestion === 'string' ? actionSuggestion : JSON.stringify(actionSuggestion)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AiInsights;
