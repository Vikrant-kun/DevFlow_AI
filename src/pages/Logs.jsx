import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, ChevronRight, Play, Clock, Search, Filter,
    Terminal, AlertCircle, Check, RotateCcw, Zap, GitBranch,
    Cpu, Bell, X, ArrowRight, Layers, Fingerprint, Activity
} from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { apiFetch } from '../lib/api';
import { cn } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── STATUS CONFIG (UPGRADED GLOW) ───────────────────────────────────────────
const statusConfig = {
    success: { label: 'Success', color: '#6EE7B7', bg: 'rgba(110,231,183,0.05)', border: 'rgba(110,231,183,0.15)', Icon: CheckCircle2 },
    running: { label: 'Running', color: '#F59E0B', bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.15)', Icon: Play },
    failed: { label: 'Failed', color: '#F87171', bg: 'rgba(248,113,113,0.05)', border: 'rgba(248,113,113,0.15)', Icon: AlertCircle },
    // NEW: Explicit skipped state for cleaner logic flow
    skipped: { label: 'Skipped', color: '#64748B', bg: 'rgba(100,116,139,0.05)', border: 'rgba(100,116,139,0.15)', Icon: ArrowRight },
};

const getStatusConfig = (status) => statusConfig[status?.toLowerCase()] || statusConfig.success;

const nodeIconMap = {
    'git-branch': GitBranch, zap: Zap, sparkles: Zap, bell: Bell,
    code: Terminal, database: Layers, mail: Bell, trigger: GitBranch,
    action: Zap, ai: Cpu, notification: Bell
};
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

// ── UPGRADED STATUS BADGE ────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = getStatusConfig(status);
    return (
        <span className="inline-flex items-center justify-center w-[84px] shrink-0 gap-1.5 px-2 py-1 rounded-lg font-mono text-[9px] font-bold uppercase tracking-tighter transition-all duration-300"
            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <cfg.Icon className={cn("w-3 h-3 shrink-0", status?.toLowerCase() === 'running' && "animate-pulse")} />
            {cfg.label}
        </span>
    );
};

// ── REPLAY MODAL (GLASSMORPHIC) ──────────────────────────────────────────────
const ReplayModal = ({ run, onClose, onReplay }) => {
    if (!run) return null;
    const snapshot = run.snapshot;
    const hasSnapshot = snapshot && snapshot.nodes?.length > 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25 }}
                className="w-full max-w-lg bg-[#0D0D0D] border border-[#222] rounded-[24px] shadow-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()}>

                <div className="absolute top-0 left-0 w-full h-1 bg-[#6EE7B7]" />

                <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A1A1A] bg-[#111]/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 flex items-center justify-center shadow-inner">
                            <RotateCcw className="w-5 h-5 text-[#6EE7B7]" />
                        </div>
                        <div>
                            <h3 className="font-mono text-xs font-bold text-[#F1F5F9] uppercase tracking-widest">Replay_Engine</h3>
                            <p className="font-mono text-[10px] text-[#444]">Hydrating snapshot to builder</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[#444]" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-[#080808] border border-[#1A1A1A] rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-[#444] uppercase">Workflow</span>
                            <span className="font-mono text-xs text-[#F1F5F9] font-bold">{run.workflow_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-[#444] uppercase">Timestamp</span>
                            <span className="font-mono text-xs text-[#64748B]">{new Date(run.started_at).toLocaleString()}</span>
                        </div>
                    </div>

                    {hasSnapshot && (
                        <div className="space-y-3">
                            <p className="font-mono text-[9px] text-[#444] uppercase tracking-[0.2em]">Pipeline_Nodes</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {snapshot.nodes.map((node, i) => {
                                    const Icon = getNodeIcon(node.data?.icon || node.icon);
                                    return (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-1.5 hover:border-[#6EE7B7]/30 transition-colors">
                                                <Icon className="w-3.5 h-3.5 text-[#6EE7B7]" />
                                                <span className="font-mono text-[10px] text-[#94A3B8]">{node.data?.label || node.label}</span>
                                            </div>
                                            {i < snapshot.nodes.length - 1 && <ChevronRight className="w-3 h-3 text-[#222]" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 font-mono text-[11px] font-bold text-[#64748B] border border-[#222] py-3 rounded-xl hover:bg-[#111] transition-all uppercase tracking-widest">
                        Abort
                    </button>
                    <button onClick={() => onReplay(run)} disabled={!hasSnapshot}
                        className="flex-1 font-mono text-[11px] font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(110,231,183,0.2)] flex items-center justify-center gap-2 uppercase tracking-widest">
                        <RotateCcw className="w-4 h-4" />
                        Execute Replay
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── SIMPLIFIED LOG DETAIL ────────────────────────────────────────────────
const LogDetail = ({ log, onReplayClick }) => {
    const logs = log.logs || [];
    const { showToast } = useToast();

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Error signature copied', 'info');
    };

    return (
        <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} 
            className="bg-[#0A0A0A] border-t border-[#1A1A1A]"
        >
            <div className="p-6 pl-[64px] space-y-6">
                {/* Meta Row: Simple Utility */}
                <div className="flex items-center gap-4 text-[10px] font-mono text-[#444]">
                    <div className="flex items-center gap-2">
                        <Fingerprint size={12} />
                        <span className="uppercase tracking-widest text-[#333]">ID:</span>
                        <span className="text-[#64748B] select-all">{log.id}</span>
                    </div>
                    <button 
                        onClick={() => onReplayClick(log)}
                        className="ml-auto flex items-center gap-2 text-[#6EE7B7] hover:underline"
                    >
                        <RotateCcw size={12} /> Restore Snapshot
                    </button>
                </div>

                {/* Execution Trace: Minimal Vertical Flow */}
                <div className="space-y-4 relative">
                    <div className="absolute left-[13px] top-2 bottom-2 w-px bg-[#1A1A1A]" />
                    
                    {logs.map((step, idx) => {
                        const isSkipped = step.message?.toLowerCase().includes('skipped') || step.status === 'skipped';
                        const displayStatus = isSkipped ? 'skipped' : step.status;
                        const cfg = getStatusConfig(displayStatus);

                        return (
                            <div key={idx} className="flex items-start gap-5 relative z-10">
                                <div className="mt-1 shrink-0 w-7 h-7 rounded-full bg-[#080808] border border-[#1A1A1A] flex items-center justify-center">
                                    <cfg.Icon size={12} style={{ color: cfg.color }} />
                                </div>

                                <div className="flex-1 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl px-5 py-3 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="font-mono text-xs font-bold text-[#F1F5F9]">{step.node_label || "Step"}</p>
                                        {step.message && (
                                            <div className="mt-1 text-[10px] font-mono text-[#64748B] leading-relaxed">
                                                {step.message}
                                                {step.status === 'failed' && (
                                                    <div className="mt-2 flex gap-3 text-[#F87171]/60">
                                                        <button onClick={() => copyToClipboard(step.message)} className="hover:text-[#F87171] underline underline-offset-2 flex items-center gap-1">
                                                            <Terminal size={10} /> Copy Error
                                                        </button>
                                                        <a href={`https://stackoverflow.com/search?q=${encodeURIComponent(step.message)}`} target="_blank" rel="noreferrer" className="hover:text-[#F87171] underline underline-offset-2 flex items-center gap-1">
                                                            <Search size={10} /> Search Solution
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <StatusBadge status={displayStatus} />
                                        {step.duration && <span className="text-[9px] font-mono text-[#333]">{step.duration}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

// ── MAIN VIEW ──
const Logs = () => {
    const [expandedRow, setExpandedRow] = useState(null);
    const [replayRun, setReplayRun] = useState(null);
    const [logsData, setLogsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const filterRef = useRef(null);

    const { user, getAuthToken } = useAuth();
    const navigate = useNavigate();

    const gridLayout = "48px minmax(200px, 3fr) 120px 140px 100px 1.5fr 80px";

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const data = await apiFetch('/runs/', {}, getAuthToken);
                setLogsData(data.runs || data || []);
            } catch (err) { console.error(err); }
            setIsLoading(false);
        };
        fetchLogs();
    }, [user?.id]);

    const handleReplay = (run) => {
        navigate('/workflows/new', { state: { replaySnapshot: run.snapshot } });
    };

    const displayed = logsData.filter(log => {
        const matchFilter = activeFilter === 'All' || log.status?.toLowerCase() === activeFilter.toLowerCase();
        const matchSearch = !search || (log.workflow_name || '').toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="h-screen flex flex-col bg-[#080808] text-[#F1F5F9] overflow-hidden">
            <TopBar title={<span className="font-mono text-xs text-[#6EE7B7] tracking-widest uppercase">/ run_history</span>} />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 pb-20">

                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#6EE7B7] rounded-full shadow-[0_0_15px_#6EE7B7]" />
                                <h2 className="text-3xl font-mono font-bold lowercase tracking-tighter">Event Logs</h2>
                            </div>
                            <p className="text-[#64748B] font-mono text-xs leading-relaxed max-w-lg">
                                Deep-trace execution history. Analyze node-level performance and restore historical snapshots to the canvas.
                            </p>
                        </div>

                        {/* Stats Panel */}
                        <div className="flex gap-2 p-1 bg-[#111]/50 border border-[#1A1A1A] rounded-2xl shadow-inner">
                            <div className="px-4 py-2 border-r border-[#1A1A1A] text-center">
                                <p className="text-[8px] font-mono text-[#444] uppercase tracking-widest mb-1">Total</p>
                                <p className="text-sm font-mono font-bold">{logsData.length}</p>
                            </div>
                            <div className="px-4 py-2 text-center">
                                <Activity className="w-3 h-3 text-[#6EE7B7] mx-auto mb-1" />
                                <p className="text-sm font-mono font-bold text-[#6EE7B7]">
                                    {logsData.filter(l => l.status?.toLowerCase() === 'success').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
                            <input type="text" placeholder="filter_by_name..." value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#0D0D0D] border border-[#1A1A1A] hover:border-[#6EE7B7]/20 rounded-2xl font-mono text-xs focus:outline-none transition-all placeholder:text-[#222]" />
                        </div>
                        <button onClick={() => setFilterOpen(!filterOpen)}
                            className="flex items-center gap-3 px-6 py-3 bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl font-mono text-[10px] font-bold uppercase tracking-widest hover:border-[#6EE7B7]/40 transition-all">
                            <Filter className="w-3.5 h-3.5 text-[#444]" />
                            {activeFilter}
                        </button>
                    </div>

                    {/* Table Container */}
                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-[32px] overflow-hidden shadow-2xl">
                        <div className="hidden md:grid border-b border-[#1A1A1A] px-6 py-4 bg-[#111]/30" style={{ gridTemplateColumns: gridLayout }}>
                            {['', 'Process', 'Status', 'Runtime', 'Latency', 'Origin', ''].map((h, i) => (
                                <div key={i} className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[#3A3A4A]">{h}</div>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className="py-32 flex flex-col items-center gap-4">
                                <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-[#6EE7B7] rounded-full animate-spin" />
                                <span className="font-mono text-[9px] text-[#444] uppercase tracking-widest">Hydrating events...</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#111]">
                                {displayed.map((log) => (
                                    <div key={log.id} className="relative group overflow-hidden">
                                        {/* Sub-grid pattern background */}
                                        <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                                        <div 
                                            className={cn(
                                                "grid md:grid items-center px-6 py-4 cursor-pointer transition-colors border-b border-[#111] last:border-0 relative z-10", 
                                                expandedRow === log.id ? 'bg-[#111]/40' : 'hover:bg-[#111]/20'
                                            )}
                                            style={{ gridTemplateColumns: gridLayout }}
                                            onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                        >
                                            <div className="flex justify-center">
                                                <ChevronRight className={cn(
                                                    "w-4 h-4 transition-transform", 
                                                    expandedRow === log.id ? 'rotate-90 text-[#6EE7B7]' : 'text-[#222]'
                                                )} />
                                            </div>
                                            <div className="font-mono text-xs font-bold text-[#F1F5F9]">{log.workflow_name || 'Anonymous_Run'}</div>
                                            <StatusBadge status={log.status} />
                                            <div className="font-mono text-[10px] text-[#444]">{timeAgo(log.started_at)}</div>
                                            <div className="font-mono text-[10px] text-[#444]">{log.duration || '—'}</div>
                                            <div className="font-mono text-[10px] text-[#444] uppercase tracking-tighter">
                                                {log.triggered_by || 'manual'}
                                            </div>
                                            <button 
                                                onClick={e => { e.stopPropagation(); setReplayRun(log); }}
                                                className="opacity-0 group-hover:opacity-100 font-mono text-[10px] text-[#6EE7B7] text-right"
                                            >
                                                Replay
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {expandedRow === log.id && <LogDetail log={log} onReplayClick={setReplayRun} />}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {replayRun && <ReplayModal run={replayRun} onClose={() => setReplayRun(null)} onReplay={handleReplay} />}
            </AnimatePresence>
        </div>
    );
};

export default Logs;