import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, ChevronRight, Play, Clock, Search, Filter,
    Terminal, AlertCircle, Check, RotateCcw, Zap, GitBranch,
    Cpu, Bell, X, ArrowRight, Layers
} from 'lucide-react';
import TopBar from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── HELPERS ───────────────────────────────────────────────────────────────────

const statusConfig = {
    success: { label: 'Success', color: '#6EE7B7', bg: 'rgba(110,231,183,0.08)', border: 'rgba(110,231,183,0.2)', Icon: CheckCircle2 },
    running: { label: 'Running', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', Icon: Play },
    failed: { label: 'Failed', color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', Icon: AlertCircle },
};

const getStatusConfig = (status) => statusConfig[status?.toLowerCase()] || statusConfig.success;

const nodeIconMap = { 'git-branch': GitBranch, zap: Zap, sparkles: Zap, bell: Bell, code: Terminal, database: Layers, mail: Bell, trigger: GitBranch, action: Zap, ai: Cpu, notification: Bell };
const getNodeIcon = (icon) => nodeIconMap[icon] || Zap;

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const StatusBadge = ({ status }) => {
    const cfg = getStatusConfig(status);
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold"
            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <cfg.Icon className={`w-3 h-3 ${status?.toLowerCase() === 'running' ? 'animate-pulse' : ''}`} />
            {cfg.label}
        </span>
    );
};

// ── REPLAY MODAL ──────────────────────────────────────────────────────────────

const ReplayModal = ({ run, onClose, onReplay }) => {
    if (!run) return null;
    const snapshot = run.snapshot;
    const hasSnapshot = snapshot && snapshot.nodes?.length > 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-lg bg-[#0D0D0D] border border-[#222] rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 flex items-center justify-center">
                            <RotateCcw className="w-4 h-4 text-[#6EE7B7]" />
                        </div>
                        <div>
                            <h3 className="font-mono text-sm font-bold text-[#F1F5F9]">Replay Run</h3>
                            <p className="font-mono text-[10px] text-[#64748B]">Load this snapshot into the builder</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#64748B] hover:text-[#F1F5F9] transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-[#64748B]">Workflow</span>
                            <span className="font-mono text-xs text-[#F1F5F9] font-semibold">{run.workflow_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-[#64748B]">Run time</span>
                            <span className="font-mono text-xs text-[#F1F5F9]">{timeAgo(run.started_at)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-[#64748B]">Status</span>
                            <StatusBadge status={run.status} />
                        </div>
                        {hasSnapshot && (
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-[#64748B]">Nodes</span>
                                <span className="font-mono text-xs text-[#F1F5F9]">{snapshot.nodes.length} steps</span>
                            </div>
                        )}
                    </div>

                    {/* Node preview */}
                    {hasSnapshot && (
                        <div className="space-y-2">
                            <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest">Pipeline Preview</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {snapshot.nodes.map((node, i) => {
                                    const Icon = getNodeIcon(node.data?.icon || node.icon);
                                    return (
                                        <div key={i} className="flex items-center gap-1">
                                            <div className="flex items-center gap-1.5 bg-[#111] border border-[#1A1A1A] rounded-lg px-2.5 py-1.5">
                                                <Icon className="w-3 h-3 text-[#6EE7B7]" />
                                                <span className="font-mono text-[10px] text-[#F1F5F9]">{node.data?.label || node.label}</span>
                                            </div>
                                            {i < snapshot.nodes.length - 1 && <ArrowRight className="w-3 h-3 text-[#333] shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!hasSnapshot && (
                        <div className="bg-[#111] border border-dashed border-[#222] rounded-xl p-4 text-center">
                            <p className="font-mono text-xs text-[#64748B]">No snapshot saved for this run</p>
                            <p className="font-mono text-[10px] text-[#444] mt-1">Only runs after the backend update have snapshots</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 font-mono text-xs text-[#64748B] hover:text-[#F1F5F9] border border-[#222] hover:border-[#333] py-2.5 rounded-xl transition-all">
                        Cancel
                    </button>
                    <button onClick={() => onReplay(run)} disabled={!hasSnapshot}
                        className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Load in Builder
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── LOG DETAIL (EXPANDED) ──────────────────────────────────────────────────────

const LogDetail = ({ log, onReplayClick }) => {
    const logs = log.logs || [];
    const snapshot = log.snapshot;
    const hasSnapshot = snapshot?.nodes?.length > 0;

    return (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-[#080808] border-t border-[#1A1A1A] overflow-hidden">
            <div className="p-5 md:p-6 pl-[52px] md:pl-[64px] space-y-5">

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-1.5">
                        <Terminal className="w-3.5 h-3.5 text-[#64748B]" />
                        <span className="font-mono text-[10px] text-[#64748B]">Trace:</span>
                        <span className="font-mono text-[10px] text-[#F1F5F9] select-all">{log.id.slice(0, 16)}...</span>
                    </div>
                    {log.snapshot?.prompt && (
                        <div className="flex items-center gap-2 bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-1.5 max-w-xs">
                            <Cpu className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                            <span className="font-mono text-[10px] text-[#64748B] truncate">{log.snapshot.prompt}</span>
                        </div>
                    )}
                    <button onClick={() => onReplayClick(log)}
                        className="ml-auto flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#6EE7B7] bg-[#6EE7B7]/8 hover:bg-[#6EE7B7]/15 border border-[#6EE7B7]/25 px-3 py-1.5 rounded-lg transition-all">
                        <RotateCcw className="w-3 h-3" />
                        Replay
                    </button>
                </div>

                {/* Step trace */}
                {logs.length > 0 ? (
                    <div className="space-y-2 relative">
                        <div className="absolute left-[13px] top-3 bottom-3 w-px bg-[#1A1A1A]" />
                        {logs.map((step, idx) => {
                            const cfg = getStatusConfig(step.status);
                            return (
                                <div key={idx} className="flex items-start gap-3 relative z-10">
                                    <div className="mt-0.5 shrink-0 w-[28px] h-[28px] rounded-full bg-[#080808] border flex items-center justify-center"
                                        style={{ borderColor: cfg.border }}>
                                        <cfg.Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                                    </div>
                                    <div className="flex-1 bg-[#0D0D0D] border border-[#1A1A1A] hover:border-[#222] rounded-xl px-4 py-3 flex items-center justify-between gap-3 transition-colors">
                                        <div>
                                            <p className="font-mono text-xs font-semibold text-[#F1F5F9]">{step.node_label || step.node_id}</p>
                                            {step.message && <p className="font-mono text-[10px] text-[#64748B] mt-0.5">{step.message}</p>}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {step.duration && (
                                                <span className="font-mono text-[10px] text-[#64748B] bg-[#111] border border-[#1A1A1A] px-2 py-1 rounded-md">
                                                    {step.duration}
                                                </span>
                                            )}
                                            <StatusBadge status={step.status} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Fallback steps if no backend logs */
                    <div className="space-y-2 relative">
                        <div className="absolute left-[13px] top-3 bottom-3 w-px bg-[#1A1A1A]" />
                        {[
                            { name: 'Pipeline Initiated', status: log.status },
                            { name: 'Execution Completed', status: log.status },
                        ].map((step, idx) => {
                            const cfg = getStatusConfig(step.status);
                            return (
                                <div key={idx} className="flex items-start gap-3 relative z-10">
                                    <div className="mt-0.5 shrink-0 w-[28px] h-[28px] rounded-full bg-[#080808] border flex items-center justify-center"
                                        style={{ borderColor: cfg.border }}>
                                        <cfg.Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                                    </div>
                                    <div className="flex-1 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl px-4 py-3">
                                        <p className="font-mono text-xs font-semibold text-[#F1F5F9]">{step.name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Node snapshot preview */}
                {hasSnapshot && (
                    <div className="border border-[#1A1A1A] rounded-xl p-4 space-y-2">
                        <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest">Snapshot — {snapshot.nodes.length} nodes</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {snapshot.nodes.map((node, i) => {
                                const Icon = getNodeIcon(node.data?.icon || node.icon);
                                return (
                                    <div key={i} className="flex items-center gap-1">
                                        <div className="flex items-center gap-1.5 bg-[#111] border border-[#1A1A1A] rounded-lg px-2.5 py-1.5">
                                            <Icon className="w-3 h-3 text-[#6EE7B7]" />
                                            <span className="font-mono text-[10px] text-[#F1F5F9]">{node.data?.label || node.label}</span>
                                        </div>
                                        {i < snapshot.nodes.length - 1 && <ArrowRight className="w-3 h-3 text-[#333] shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────

const Logs = () => {
    const [expandedRow, setExpandedRow] = useState(null);
    const [replayRun, setReplayRun] = useState(null);
    const [logsData, setLogsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const filterRef = useRef(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // Fetch from backend API (has snapshots + logs)
    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            if (!user) { setIsLoading(false); return; }
            try {
                const { data: session } = await supabase.auth.getSession();
                const token = session?.session?.access_token;

                const res = await fetch(`${API_URL}/runs/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setLogsData(data);
                } else {
                    // Fallback to Supabase direct
                    const { data, error } = await supabase
                        .from('workflow_runs').select('*')
                        .eq('user_id', user.id)
                        .order('started_at', { ascending: false });
                    if (data && !error) setLogsData(data);
                }
            } catch {
                // Fallback to Supabase direct
                const { data, error } = await supabase
                    .from('workflow_runs').select('*')
                    .eq('user_id', user.id)
                    .order('started_at', { ascending: false });
                if (data && !error) setLogsData(data);
            }
            setIsLoading(false);
        };
        fetchLogs();
    }, [user]);

    const handleReplay = (run) => {
        setReplayRun(null);
        // Pass snapshot via router state to WorkflowBuilder
        navigate('/workflows/new', { state: { replaySnapshot: run.snapshot } });
    };

    const displayed = logsData.filter(log => {
        const matchFilter = activeFilter === 'All' || log.status?.toLowerCase() === activeFilter.toLowerCase();
        const matchSearch = !search || (log.workflow_name || '').toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const stats = {
        total: logsData.length,
        success: logsData.filter(l => l.status?.toLowerCase() === 'success').length,
        failed: logsData.filter(l => l.status?.toLowerCase() === 'failed').length,
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-[#080808] overflow-hidden">
            <TopBar title={<span className="font-mono text-xs md:text-sm font-bold text-[#F1F5F9]">Logs</span>} />

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1A1A1A] scrollbar-track-transparent">
                <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 pb-12">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl md:text-3xl font-mono font-bold text-[#F1F5F9] tracking-tight">Execution Logs</h2>
                            <p className="text-[#64748B] font-mono text-xs md:text-sm">Step-by-step traces of all workflow runs. Click any row to expand.</p>
                        </div>

                        {/* Stat pills */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-[#111] border border-[#1A1A1A] rounded-xl px-3 py-1.5">
                                <span className="font-mono text-[10px] text-[#64748B]">Total</span>
                                <span className="font-mono text-xs font-bold text-[#F1F5F9]">{stats.total}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#6EE7B7]/8 border border-[#6EE7B7]/20 rounded-xl px-3 py-1.5">
                                <CheckCircle2 className="w-3 h-3 text-[#6EE7B7]" />
                                <span className="font-mono text-xs font-bold text-[#6EE7B7]">{stats.success}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#F87171]/8 border border-[#F87171]/20 rounded-xl px-3 py-1.5">
                                <AlertCircle className="w-3 h-3 text-[#F87171]" />
                                <span className="font-mono text-xs font-bold text-[#F87171]">{stats.failed}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Search + Filter */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
                        className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                            <input type="text" placeholder="Search workflows..." value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 h-10 bg-[#111] border border-[#1A1A1A] hover:border-[#222] focus:border-[#6EE7B7]/40 rounded-xl font-mono text-xs text-[#F1F5F9] outline-none transition-all placeholder:text-[#444]" />
                        </div>
                        <div className="relative w-full sm:w-auto" ref={filterRef}>
                            <button onClick={() => setFilterOpen(!filterOpen)}
                                className={`h-10 px-4 border rounded-xl font-mono text-xs transition-all flex items-center gap-2 w-full sm:w-[130px] ${activeFilter !== 'All' ? 'bg-[#6EE7B7]/8 border-[#6EE7B7]/25 text-[#6EE7B7]' : 'bg-[#111] border-[#1A1A1A] text-[#64748B] hover:text-[#F1F5F9] hover:border-[#222]'}`}>
                                <Filter className="w-3.5 h-3.5" />
                                {activeFilter === 'All' ? 'Filter' : activeFilter}
                            </button>
                            <AnimatePresence>
                                {filterOpen && (
                                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                                        className="absolute right-0 top-[calc(100%+6px)] w-[150px] bg-[#0D0D0D] border border-[#222] rounded-xl shadow-2xl z-50 p-1">
                                        {['All', 'Success', 'Running', 'Failed'].map(s => (
                                            <button key={s} onClick={() => { setActiveFilter(s); setFilterOpen(false); }}
                                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1A1A1A] font-mono text-xs text-[#F1F5F9] transition-colors">
                                                {s}
                                                {activeFilter === s && <Check className="w-3.5 h-3.5 text-[#6EE7B7]" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Table */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }}
                        className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl overflow-hidden">
                        {/* Table header */}
                        <div className="hidden md:grid border-b border-[#1A1A1A] px-4 py-3 bg-[#111]"
                            style={{ gridTemplateColumns: '40px 2fr 110px 1.2fr 90px 100px 80px' }}>
                            {['', 'Workflow', 'Status', 'Started', 'Duration', 'Trigger', ''].map((h, i) => (
                                <div key={i} className="font-mono text-[9px] font-semibold tracking-widest uppercase text-[#3A3A4A]">{h}</div>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <div className="w-5 h-5 border-2 border-[#333] border-t-[#6EE7B7] rounded-full animate-spin" />
                                <span className="font-mono text-xs text-[#444]">Fetching logs...</span>
                            </div>
                        ) : displayed.length === 0 ? (
                            <div className="py-20 text-center space-y-2">
                                <Terminal className="w-8 h-8 text-[#222] mx-auto" />
                                <p className="font-mono text-sm text-[#333]">&gt;_ No logs found</p>
                                <p className="font-mono text-xs text-[#2A2A2A]">Run a workflow to see execution history here</p>
                            </div>
                        ) : (
                            <div>
                                {displayed.map((log, idx) => (
                                    <div key={log.id} className="border-b border-[#111] last:border-0">
                                        {/* Row */}
                                        <div
                                            className={`group cursor-pointer transition-colors ${expandedRow === log.id ? 'bg-[#111]' : 'hover:bg-[#111]/60'}`}
                                            onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}>

                                            {/* Desktop row */}
                                            <div className="hidden md:grid items-center px-4 py-3.5"
                                                style={{ gridTemplateColumns: '40px 2fr 110px 1.2fr 90px 100px 80px' }}>
                                                <ChevronRight className={`w-4 h-4 text-[#333] group-hover:text-[#555] transition-all duration-200 ${expandedRow === log.id ? 'rotate-90 !text-[#6EE7B7]' : ''}`} />
                                                <div className="font-mono text-xs font-semibold text-[#E2E8F0] truncate pr-4">{log.workflow_name || 'Unknown Workflow'}</div>
                                                <StatusBadge status={log.status} />
                                                <div className="font-mono text-xs text-[#64748B]">{timeAgo(log.started_at)}</div>
                                                <div className="font-mono text-xs text-[#64748B]">{log.duration || '—'}</div>
                                                <div className="font-mono text-xs text-[#64748B] flex items-center gap-1.5">
                                                    <span className="w-4 h-4 rounded-full bg-[#1A1A1A] border border-[#222] flex items-center justify-center text-[8px]">🤖</span>
                                                    <span className="truncate">{log.triggered_by || 'manual'}</span>
                                                </div>
                                                <button
                                                    onClick={e => { e.stopPropagation(); setReplayRun(log); }}
                                                    className="flex items-center gap-1 font-mono text-[10px] text-[#6EE7B7] opacity-0 group-hover:opacity-100 hover:underline transition-opacity">
                                                    <RotateCcw className="w-3 h-3" /> Replay
                                                </button>
                                            </div>

                                            {/* Mobile row */}
                                            <div className="md:hidden flex items-center gap-3 px-4 py-3.5">
                                                <ChevronRight className={`w-4 h-4 text-[#333] shrink-0 transition-transform duration-200 ${expandedRow === log.id ? 'rotate-90 text-[#6EE7B7]' : ''}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-mono text-xs font-semibold text-[#E2E8F0] truncate">{log.workflow_name}</div>
                                                    <div className="font-mono text-[10px] text-[#64748B] mt-0.5">{timeAgo(log.started_at)} · {log.duration || '—'}</div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <StatusBadge status={log.status} />
                                                    <button onClick={e => { e.stopPropagation(); setReplayRun(log); }}
                                                        className="text-[#6EE7B7]"><RotateCcw className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded detail */}
                                        <AnimatePresence>
                                            {expandedRow === log.id && (
                                                <LogDetail log={log} onReplayClick={setReplayRun} />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                </div>
            </div>

            {/* Replay Modal */}
            <AnimatePresence>
                {replayRun && <ReplayModal run={replayRun} onClose={() => setReplayRun(null)} onReplay={handleReplay} />}
            </AnimatePresence>
        </div>
    );
};

export default Logs;