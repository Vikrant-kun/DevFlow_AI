import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, Play, FileEdit, Trash2,
    Activity, Clock, MoreVertical, Zap, Layers,
    Fingerprint, Terminal, AlertCircle, X, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../lib/apiRoutes';
import { cn } from '../lib/utils';

// ── STATUS BADGE (UPGRADED) ──────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const s = (status || 'draft').toLowerCase();

    const configs = {
        active: { color: '#6EE7B7', bg: 'bg-[#6EE7B7]/5', border: 'border-[#6EE7B7]/10', label: 'LIVE' },
        success: { color: '#6EE7B7', bg: 'bg-[#6EE7B7]/5', border: 'border-[#6EE7B7]/10', label: 'LIVE' },
        paused: { color: '#F59E0B', bg: 'bg-[#F59E0B]/5', border: 'border-[#F59E0B]/10', label: 'PAUSED' },
        draft: { color: '#64748B', bg: 'bg-[#1A1A1A]', border: 'border-[#222]', label: 'DRAFT' }
    };

    const cfg = configs[s] || configs.draft;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[9px] font-bold uppercase tracking-widest",
            cfg.bg, cfg.border
        )} style={{ color: cfg.color }}>
            {s === 'active' || s === 'success' ? (
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6EE7B7] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#6EE7B7]"></span>
                </span>
            ) : (
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: cfg.color }} />
            )}
            {cfg.label}
        </span>
    );
};

// ── MAIN VIEW ──
const Workflows = () => {
    const navigate = useNavigate();
    const { user, getAuthToken } = useAuth();
    const { showToast } = useToast();
    const [workflows, setWorkflows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [workflowToDelete, setWorkflowToDelete] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // Fixed layout proportions
    const gridLayout = "64px minmax(200px, 3fr) 120px 140px 140px 100px";

    useEffect(() => {
        const fetchWorkflows = async () => {
            if (!user) return;
            try {
                const dataObj = await apiFetch(API_ROUTES.workflows, {}, getAuthToken);
                const data = dataObj.workflows || [];
                const formatted = data.map(w => ({
                    id: w.id,
                    name: w.name,
                    status: w.status || 'draft',
                    nodesCount: w.nodes ? w.nodes.length : 0,
                    updatedAt: new Date(w.updated_at || w.created_at).toLocaleDateString()
                }));
                setWorkflows(formatted);
            } catch (err) {
                showToast("Failed to sync registry", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchWorkflows();
    }, [user?.id]);

    const confirmDelete = async () => {
        if (!workflowToDelete) return;
        try {
            await apiFetch(`${API_ROUTES.workflows}${workflowToDelete.id}/`, { method: 'DELETE' }, getAuthToken);
            setWorkflows(prev => prev.filter(w => w.id !== workflowToDelete.id));
            showToast("Workflow purged", "success");
        } catch (err) {
            showToast("Failed to delete", "error");
        } finally {
            setWorkflowToDelete(null);
        }
    };

    const filteredWorkflows = workflows.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="h-screen flex flex-col bg-[#080808] text-[#F1F5F9] overflow-hidden">
            <TopBar title={<span className="font-mono text-xs text-[#6EE7B7] tracking-widest uppercase">/ pipeline_registry</span>} />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 pb-20">

                    {/* ── HEADER ── */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#6EE7B7] rounded-full shadow-[0_0_15px_#6EE7B7]" />
                                <h2 className="text-3xl font-mono font-bold lowercase tracking-tighter">Your Pipelines</h2>
                            </div>
                            <p className="text-[#64748B] font-mono text-xs leading-relaxed max-w-lg">
                                Manage and monitor your active automation sequences. Click a pipeline to enter the development environment.
                            </p>
                        </div>

                        {/* Summary Pills */}
                        <div className="flex gap-2 p-1 bg-[#111]/50 border border-[#1A1A1A] rounded-2xl">
                            <div className="px-4 py-2 border-r border-[#1A1A1A] text-center">
                                <p className="text-[8px] font-mono text-[#444] uppercase tracking-widest mb-1">Total</p>
                                <p className="text-sm font-mono font-bold">{workflows.length}</p>
                            </div>
                            <div className="px-4 py-2 text-center">
                                <Activity className="w-3 h-3 text-[#6EE7B7] mx-auto mb-1" />
                                <p className="text-sm font-mono font-bold text-[#6EE7B7]">
                                    {workflows.filter(w => w.status === 'active' || w.status === 'success').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── TOOLBAR ── */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
                            <input
                                type="text"
                                placeholder="filter_by_name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#0D0D0D] border border-[#1A1A1A] hover:border-[#6EE7B7]/20 rounded-2xl font-mono text-xs focus:outline-none transition-all placeholder:text-[#222]"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/workflows/new')}
                            className="flex items-center gap-3 px-6 py-3 bg-[#6EE7B7] text-[#080808] rounded-2xl font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-[#34D399] transition-all shadow-[0_0_20px_rgba(110,231,183,0.1)]"
                        >
                            <Plus className="w-4 h-4" />
                            Create_Sequence
                        </button>
                    </div>

                    {/* ── REGISTRY TABLE ── */}
                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-[32px] overflow-hidden shadow-2xl">
                        {/* Table Header */}
                        <div className="hidden md:grid border-b border-[#1A1A1A] px-6 py-4 bg-[#111]/30" style={{ gridTemplateColumns: gridLayout }}>
                            {['', 'Sequence_Name', 'Status', 'Architecture', 'Last_Sync', ''].map((h, i) => (
                                <div key={i} className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[#3A3A4A]">{h}</div>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className="py-32 flex flex-col items-center gap-4">
                                <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-[#6EE7B7] rounded-full animate-spin" />
                                <span className="font-mono text-[9px] text-[#444] uppercase tracking-widest">Querying database...</span>
                            </div>
                        ) : filteredWorkflows.length === 0 ? (
                            <div className="py-32 text-center space-y-6">
                                <Terminal className="w-10 h-10 text-[#1A1A1A] mx-auto" />
                                <div className="space-y-1">
                                    <p className="font-mono text-sm font-bold text-[#333] uppercase">Registry_Empty</p>
                                    <p className="font-mono text-[10px] text-[#222]">Start by building a custom sequence or use a template.</p>
                                </div>
                                <div className="flex justify-center gap-3">
                                    <button onClick={() => navigate('/workflows/new')} className="px-5 py-2 rounded-xl bg-[#111] border border-[#222] font-mono text-[10px] font-bold hover:text-[#6EE7B7] transition-all">New Flow</button>
                                    <button onClick={() => navigate('/templates')} className="px-5 py-2 rounded-xl border border-[#1A1A1A] font-mono text-[10px] text-[#444] hover:text-[#F1F5F9] transition-all">Templates</button>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#111]">
                                {filteredWorkflows.map((workflow) => (
                                    <div
                                        key={workflow.id}
                                        className="grid md:grid items-center px-6 py-5 cursor-pointer transition-all duration-300 hover:bg-[#111]/30 relative group"
                                        style={{ gridTemplateColumns: gridLayout }}
                                        onClick={() => navigate(`/workflows/new?id=${workflow.id}`)}
                                    >
                                        {/* Sub-grid texture */}
                                        <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                                        <div className="relative z-10 flex justify-center">
                                            <div className="w-9 h-9 rounded-xl bg-[#080808] border border-[#1A1A1A] flex items-center justify-center group-hover:border-[#6EE7B7]/30 transition-all">
                                                <Zap className="w-4 h-4 text-[#333] group-hover:text-[#6EE7B7]" />
                                            </div>
                                        </div>

                                        <div className="relative z-10 min-w-0 pr-4">
                                            <p className="font-mono text-sm font-bold text-[#E2E8F0] group-hover:text-white transition-colors truncate">
                                                {workflow.name}
                                            </p>
                                            <p className="font-mono text-[9px] text-[#333] uppercase tracking-tighter mt-0.5">UID_{workflow.id.slice(0, 8)}</p>
                                        </div>

                                        <div className="relative z-10"><StatusBadge status={workflow.status} /></div>

                                        <div className="relative z-10 flex items-center gap-2 font-mono text-[10px] text-[#444]">
                                            <Layers size={12} />
                                            <span>{workflow.nodesCount} segments</span>
                                        </div>

                                        <div className="relative z-10 flex items-center gap-2 font-mono text-[10px] text-[#444]">
                                            <Clock size={12} />
                                            <span>{workflow.updatedAt}</span>
                                        </div>

                                        <div className="relative z-10 flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); showToast('Deployment initiated', 'info'); }}
                                                className="p-2 hover:bg-[#6EE7B7]/10 rounded-lg text-[#444] hover:text-[#6EE7B7] transition-all"
                                                title="Run Now"
                                            >
                                                <Play size={14} className="fill-current" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setWorkflowToDelete({ id: workflow.id, name: workflow.name }); }}
                                                className="p-2 hover:bg-[#F87171]/10 rounded-lg text-[#444] hover:text-[#F87171] transition-all"
                                                title="Purge"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Purge Confirmation Modal */}
            <AnimatePresence>
                {workflowToDelete && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-sm bg-[#0D0D0D] border border-[#222] rounded-[24px] p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#F87171]" />

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-[#F87171]/10 border border-[#F87171]/20 rounded-2xl flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-6 h-6 text-[#F87171]" />
                                </div>
                                <div>
                                    <h2 className="font-mono text-sm font-bold text-[#F1F5F9] uppercase tracking-widest">Confirm_Purge</h2>
                                    <p className="font-mono text-[10px] text-[#64748B] mt-1 uppercase">Destructive action required</p>
                                </div>
                            </div>

                            <div className="bg-[#080808] border border-[#1A1A1A] p-4 rounded-xl mb-8">
                                <span className="font-mono text-xs text-[#64748B] uppercase tracking-tighter block mb-1">Sequence:</span>
                                <span className="font-mono text-xs text-[#F1F5F9] font-bold truncate block">{workflowToDelete.name}</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setWorkflowToDelete(null)}
                                    className="flex-1 border border-[#1A1A1A] text-[#444] font-mono text-[10px] font-bold py-3 rounded-xl hover:bg-[#111] transition-all uppercase tracking-widest"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 bg-[#F87171] text-[#080808] font-mono text-[10px] font-bold py-3 rounded-xl hover:bg-[#EF4444] transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(248,113,113,0.15)]"
                                >
                                    Purge
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Workflows;