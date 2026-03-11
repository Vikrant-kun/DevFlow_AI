import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, FileEdit, Plus, Layers, X, Github,
    CheckCircle2, ChevronRight, Upload, FileCode,
    GitCommit, Zap, Activity, Clock, Terminal,
    Fingerprint, GitFork, Bell, ArrowRight, ShieldCheck,
    Cpu, Database, Loader2, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../lib/apiRoutes';
import { cn } from '../lib/utils';

// ── STATUS BADGE ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const s = (status || 'draft').toLowerCase();
    const configs = {
        active: { color: '#6EE7B7', bg: 'bg-[#6EE7B7]/5', border: 'border-[#6EE7B7]/10', label: 'LIVE' },
        success: { color: '#6EE7B7', bg: 'bg-[#6EE7B7]/5', border: 'border-[#6EE7B7]/10', label: 'LIVE' },
        paused: { color: '#F59E0B', bg: 'bg-[#F59E0B]/5', border: 'border-[#F59E0B]/10', label: 'PAUSED' },
        failed: { color: '#F87171', bg: 'bg-[#F87171]/5', border: 'border-[#F87171]/10', label: 'FAILED' },
        draft: { color: '#64748B', bg: 'bg-[#1A1A1A]', border: 'border-[#222]', label: 'DRAFT' }
    };
    const cfg = configs[s] || configs.draft;
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[9px] font-bold uppercase tracking-widest",
            cfg.bg, cfg.border
        )} style={{ color: cfg.color }}>
            {(s === 'active' || s === 'success') ? (
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6EE7B7] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#6EE7B7]"></span>
                </span>
            ) : <div className="w-1 h-1 rounded-full" style={{ backgroundColor: cfg.color }} />}
            {cfg.label}
        </span>
    );
};

// ── ANIMATION VARIANTS ──────────────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isGithubConnected, repos, selectedRepo, saveSelectedRepo, githubLoading, fetchRepos, getAuthToken } = useAuth();
    const { showToast } = useToast();

    const [recentWorkflows, setRecentWorkflows] = useState([]);
    const [stats, setStats] = useState([
        { label: "Total_Pipelines", value: "0", icon: Layers },
        { label: "Daily_Triggers", value: "0", icon: Activity },
        { label: "Reliability_Index", value: "—", icon: ShieldCheck },
        { label: "Cycles_Optimized", value: "0h", icon: Cpu }
    ]);

    const [showRepoSelector, setShowRepoSelector] = useState(false);
    const [checklistDismissed, setChecklistDismissed] = useState(true);
    const [patBannerDismissed, setPatBannerDismissed] = useState(() => localStorage.getItem('devflow_pat_banner_dismissed') === 'true');

    const [uploadFiles, setUploadFiles] = useState([]);
    const [commitMessage, setCommitMessage] = useState('');
    const [isCommitting, setIsCommitting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const [checklistItems, setChecklistItems] = useState([
        { id: 'create_account', label: 'authenticate_user', done: true, route: null },
        { id: 'connect_github', label: 'link_repository_provider', done: false, route: '/integrations' },
        { id: 'create_workflow', label: 'define_first_sequence', done: false, route: '/workflows/new' },
        { id: 'run_pipeline', label: 'execute_production_run', done: false, route: null, locked: true }
    ]);

    // ── DATA LOADING ──
    useEffect(() => {
        const isDismissed = localStorage.getItem('devflow_checklist_dismissed') === 'true';
        setChecklistDismissed(isDismissed);

        const loadData = async () => {
            if (!user) return;
            try {
                const [workflowsResponse, runsResponse] = await Promise.all([
                    apiFetch(API_ROUTES.workflows, {}, getAuthToken),
                    apiFetch(API_ROUTES.runs, {}, getAuthToken)
                ]);
                const workflowsData = workflowsResponse?.workflows || workflowsResponse || [];
                const runsData = runsResponse?.runs || runsResponse || [];

                const hasWorkflow = !!workflowsData?.length;
                const hasRun = runsData?.some(r => r.status === 'success') || localStorage.getItem('devflow_has_run') === 'true';

                setChecklistItems([
                    { id: 'create_account', label: 'authenticate_user', done: true, route: null },
                    { id: 'connect_github', label: 'link_repository_provider', done: isGithubConnected, route: '/integrations' },
                    { id: 'create_first_workflow', label: 'define_first_sequence', done: hasWorkflow, route: '/workflows/new' },
                    { id: 'run_pipeline', label: 'execute_production_run', done: hasRun, route: null, locked: !hasWorkflow },
                ]);

                if (runsData && workflowsData) {
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const todayRuns = runsData.filter(r => new Date(r.started_at) >= today);
                    const successRuns = runsData.filter(r => r.status === 'success');
                    const successRate = runsData.length > 0 ? Math.round((successRuns.length / runsData.length) * 100) : 0;
                    const minutesSaved = successRuns.length * 5;
                    const timeSaved = minutesSaved >= 60 ? `${Math.floor(minutesSaved / 60)}h ${minutesSaved % 60}m` : `${minutesSaved}m`;

                    setStats([
                        { label: 'Total_Pipelines', value: workflowsData.length.toString(), icon: Layers },
                        { label: 'Daily_Triggers', value: todayRuns.length.toString(), icon: Activity },
                        { label: 'Reliability_Index', value: runsData.length > 0 ? `${successRate}%` : '—', icon: ShieldCheck },
                        { label: 'Cycles_Optimized', value: timeSaved || '0m', icon: Cpu }
                    ]);

                    setRecentWorkflows(workflowsData.slice(0, 4).map(w => ({
                        id: w.id, name: w.name, status: w.status || "draft",
                        lastRun: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : 'Never'
                    })));
                }
            } catch (err) { console.error(err); }
        };
        loadData();
        if (isGithubConnected && repos.length === 0) fetchRepos();
    }, [user, isGithubConnected, fetchRepos]);

    // ── HANDLERS ──
    const handleDismissChecklist = () => { localStorage.setItem('devflow_checklist_dismissed', 'true'); setChecklistDismissed(true); };
    const handleChecklistClick = (item) => {
        if (item.locked) return;
        if (item.route) navigate(item.route);
        else {
            const updated = checklistItems.map(i => i.id === item.id ? { ...i, done: true } : i);
            setChecklistItems(updated);
            if (updated.every(i => i.done || i.locked)) { handleDismissChecklist(); showToast("Onboarding complete.", "success"); }
        }
    };
    const handleDrop = useCallback((e) => {
        e.preventDefault(); setIsDragOver(false);
        const dropped = Array.from(e.dataTransfer?.files || e.target?.files || []);
        setUploadFiles(prev => [...prev, ...dropped]);
    }, []);

    const handleCommitFiles = async () => {
        if (!selectedRepo || uploadFiles.length === 0) return;
        setIsCommitting(true);
        try {
            for (const file of uploadFiles) {
                const content = await file.text();
                await apiFetch(API_ROUTES.githubSettings, {
                    method: 'POST', body: JSON.stringify({
                        repo_full_name: selectedRepo.full_name, path: file.name, content,
                        message: commitMessage || `Add ${file.name} via DevFlow`
                    })
                }, getAuthToken);
            }
            showToast(`${uploadFiles.length} file(s) indexed.`, 'success');
            setUploadFiles([]); setCommitMessage('');
        } catch (err) { showToast('Indexing failed.', 'error'); } finally { setIsCommitting(false); }
    };

    const handleRunWorkflow = async (workflow) => {
        try {
            showToast(`Initializing ${workflow.name}...`, 'info');
            const result = await apiFetch(API_ROUTES.workflowRun, {
                method: 'POST', body: JSON.stringify({ workflow_id: workflow.id, workflow_name: workflow.name, snapshot: {} })
            }, getAuthToken);
            if (result.status === 'success') showToast(`${workflow.name} deployed.`, 'success');
            else showToast(`Execution error.`, 'error');
        } catch (err) { showToast('Link failed.', 'error'); }
    };

    const handleDeleteWorkflow = async (workflow) => {
        if (!confirm(`Purge "${workflow.name}"?`)) return;
        try {
            await apiFetch(`${API_ROUTES.workflows}${workflow.id}/`, { method: 'DELETE' }, getAuthToken);
            setRecentWorkflows(prev => prev.filter(w => w.id !== workflow.id));
            showToast(`Registry purged.`, 'success');
        } catch (err) { showToast('Purge failed.', 'error'); }
    };

    return (
        <div className="flex h-screen bg-[#080808] text-[#F1F5F9] overflow-hidden relative font-mono">
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <TopBar title={<span className="text-[11px] tracking-[0.2em] uppercase font-bold text-[#64748B]">Dashboard</span>} />

                <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10">
                    <div className="max-w-7xl mx-auto space-y-10 pb-24">

                        {/* ── HEADER ── */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <motion.div variants={itemVariants} className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 bg-[#6EE7B7] rounded-full shadow-[0_0_15px_#6EE7B7]" />
                                    <h2 className="text-3xl font-bold lowercase tracking-tighter">Dashboard</h2>
                                </div>
                                <p className="text-[#64748B] text-xs lowercase tracking-wider">overview_of_production_environment</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex gap-3 w-full md:w-auto">
                                <button onClick={() => navigate('/templates')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#111] border border-[#1A1A1A] rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:border-[#333] transition-all">
                                    <Layers className="w-3.5 h-3.5" /> Library
                                </button>
                                <button onClick={() => navigate('/workflows/new')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6EE7B7] text-[#080808] rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#34D399] transition-all shadow-[0_0_20px_rgba(110,231,183,0.1)]">
                                    <Plus className="w-4 h-4" /> Initialize_Flow
                                </button>
                            </motion.div>
                        </motion.div>

                        {/* ── STATS MATRIX ── */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                            {stats.map((stat, i) => (
                                <motion.div key={i} variants={itemVariants} className="relative group bg-[#0D0D0D] border border-[#1A1A1A] hover:border-[#6EE7B7]/20 p-6 rounded-3xl transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#333] group-hover:text-[#444]">{stat.label}</span>
                                        <stat.icon className="w-4 h-4 text-[#1A1A1A] group-hover:text-[#6EE7B7]/20 transition-colors" />
                                    </div>
                                    <h3 className="text-3xl font-bold tracking-tighter text-[#F1F5F9]">{stat.value}</h3>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* ── ONBOARDING PROTOCOL ── */}
                        <AnimatePresence>
                            {!checklistDismissed && (
                                <motion.div variants={itemVariants} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, height: 0 }} className="w-full">
                                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-[32px] overflow-hidden shadow-2xl relative">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6EE7B7]/20 via-[#6EE7B7] to-[#6EE7B7]/20 opacity-50" />

                                        <div className="flex items-center justify-between px-8 py-5 border-b border-[#1A1A1A]">
                                            <div className="flex items-center gap-4">
                                                <Terminal className="w-4 h-4 text-[#6EE7B7]" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Onboarding_Sequence</span>
                                            </div>
                                            <button onClick={handleDismissChecklist} className="p-2 hover:bg-[#1A1A1A] rounded-full transition-colors">
                                                <X className="w-4 h-4 text-[#333]" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#1A1A1A]">
                                            {checklistItems.map((item, idx) => (
                                                <div key={item.id} onClick={() => handleChecklistClick(item)}
                                                    className={cn("p-6 flex flex-col gap-4 transition-all relative group/step",
                                                        item.locked ? 'opacity-20 cursor-not-allowed' : item.done ? 'bg-[#6EE7B7]/[0.02]' : 'cursor-pointer hover:bg-[#111]')}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-[#333] font-bold">0{idx + 1}</span>
                                                        {item.done ? <CheckCircle2 className="w-4 h-4 text-[#6EE7B7]" /> : <Fingerprint className="w-4 h-4 text-[#222]" />}
                                                    </div>
                                                    <p className={cn("text-[11px] font-bold uppercase tracking-widest leading-relaxed",
                                                        item.done ? 'text-[#6EE7B7]' : 'text-[#64748B] group-hover/step:text-[#F1F5F9]')}>{item.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── WORKSPACE ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                            <motion.div variants={itemVariants} className="lg:col-span-8 space-y-5">
                                <div className="flex items-center gap-2 px-2">
                                    <Database size={14} className="text-[#333]" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Active_Repository</h3>
                                </div>
                                <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-[32px] p-8 space-y-8 relative group/repo">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-[#111] border border-[#222] flex items-center justify-center rounded-[24px] shadow-inner group-hover/repo:border-[#6EE7B7]/40 transition-colors">
                                                <Github className="w-8 h-8 text-[#F1F5F9]" />
                                            </div>
                                            <div>
                                                {githubLoading ? (
                                                    <div className="flex items-center gap-3">
                                                        <Loader2 className="w-4 h-4 text-[#6EE7B7] animate-spin" />
                                                        <span className="text-xs uppercase tracking-widest text-[#444]">Syncing...</span>
                                                    </div>
                                                ) : selectedRepo ? (
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-bold tracking-tighter text-[#F1F5F9]">{selectedRepo.full_name}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] animate-pulse" />
                                                            <span className="text-[10px] uppercase font-bold text-[#6EE7B7] tracking-widest">Protocol_Established</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <h3 className="text-lg font-bold text-[#333] lowercase">offline_workspace</h3>
                                                        <p className="text-[10px] text-[#444] uppercase tracking-widest font-bold">Mount repository to begin</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 relative z-50">
                                            <button onClick={() => setShowRepoSelector(!showRepoSelector)}
                                                className="px-6 py-2.5 rounded-xl border border-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest hover:text-[#F1F5F9] hover:bg-[#111] transition-all">
                                                Mount_Repo
                                            </button>
                                            <AnimatePresence>
                                                {showRepoSelector && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                        className="absolute right-0 top-full mt-4 w-72 bg-[#0D0D0D] border border-[#222] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden p-2">
                                                        <div className="max-h-64 overflow-y-auto no-scrollbar space-y-1">
                                                            {repos.map(r => (
                                                                <button key={r.id} onClick={() => { saveSelectedRepo({ name: r.name, full_name: r.full_name }); setShowRepoSelector(false); }}
                                                                    className={cn("w-full text-left px-4 py-3 rounded-xl font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-between",
                                                                        selectedRepo?.full_name === r.full_name ? "bg-[#6EE7B7]/5 text-[#6EE7B7]" : "text-[#444] hover:bg-[#111] hover:text-[#64748B]")}>
                                                                    <span className="truncate">{r.name}</span>
                                                                    {selectedRepo?.full_name === r.full_name && <CheckCircle2 size={12} />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {isGithubConnected && selectedRepo && (
                                        <div className="pt-8 border-t border-[#1A1A1A] space-y-5">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-[#333] uppercase tracking-[0.25em]">Source_Indexer</p>
                                                {uploadFiles.length > 0 && <span className="text-[10px] text-[#6EE7B7] font-bold uppercase tracking-tighter">{uploadFiles.length}_objects_queued</span>}
                                            </div>
                                            <div onDragOver={e => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={handleDrop}
                                                onClick={() => document.getElementById('dash-file-input').click()}
                                                className={cn("cursor-pointer border border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center gap-4 transition-all duration-500",
                                                    isDragOver ? "border-[#6EE7B7] bg-[#6EE7B7]/5 scale-[0.99]" : "border-[#1A1A1A] hover:border-[#333] bg-[#080808]")}>
                                                <input id="dash-file-input" type="file" multiple className="hidden" onChange={handleDrop} />
                                                <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#1A1A1A] flex items-center justify-center">
                                                    <Upload size={20} className={isDragOver ? "text-[#6EE7B7]" : "text-[#222]"} />
                                                </div>
                                                <p className="text-[10px] font-bold text-[#333] uppercase tracking-[0.2em]">Drop_Payload_Here</p>
                                            </div>
                                            {uploadFiles.length > 0 && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                                    <div className="max-h-32 overflow-y-auto no-scrollbar space-y-2">
                                                        {uploadFiles.map((file, i) => (
                                                            <div key={i} className="flex items-center justify-between bg-[#080808] border border-[#1A1A1A] px-4 py-3 rounded-xl">
                                                                <div className="flex items-center gap-3">
                                                                    <FileCode size={14} className="text-[#444]" />
                                                                    <span className="text-[11px] font-bold text-[#64748B] truncate">{file.name}</span>
                                                                </div>
                                                                <button onClick={(e) => { e.stopPropagation(); setUploadFiles(p => p.filter((_, idx) => idx !== i)); }} className="text-[#222] hover:text-[#F87171] transition-colors"><X size={14} /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input type="text" value={commitMessage} onChange={e => setCommitMessage(e.target.value)}
                                                            placeholder="commit_message..." className="flex-1 bg-[#080808] border border-[#1A1A1A] rounded-xl px-4 py-3 text-[11px] font-bold text-[#F1F5F9] focus:border-[#6EE7B7]/30 outline-none placeholder:text-[#222]" />
                                                        <button onClick={handleCommitFiles} disabled={isCommitting} className="px-8 bg-[#6EE7B7] text-[#080808] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#34D399] transition-all flex items-center gap-2">
                                                            {isCommitting ? <div className="w-3 h-3 border-2 border-[#080808] border-t-transparent animate-spin rounded-full" /> : <GitCommit size={14} />}
                                                            Push
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="lg:col-span-4 space-y-5">
                                <div className="flex items-center gap-2 px-2">
                                    <Zap size={14} className="text-[#333]" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Archetype_Launch</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { title: 'CI_Deploy', desc: 'Auto-deploy on merge', icon: GitFork, prompt: 'When a PR is merged to main, run tests and deploy' },
                                        { title: 'Monitor_Log', desc: 'Alert on failures', icon: Bell, prompt: 'When a deployment fails, rollback and alert the team' },
                                        { title: 'Triage_Bot', desc: 'Auto-assign issues', icon: Terminal, prompt: 'When a new issue is created, assign it and send email' }
                                    ].map((box, i) => (
                                        <div key={i} onClick={() => navigate(`/workflows/new?prompt=${encodeURIComponent(box.prompt)}`)}
                                            className="group bg-[#0D0D0D] border border-[#1A1A1A] hover:border-[#6EE7B7]/20 p-5 rounded-[24px] cursor-pointer transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center group-hover:border-[#6EE7B7]/30 transition-colors">
                                                    <box.icon size={16} className="text-[#333] group-hover:text-[#6EE7B7] transition-colors" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#F1F5F9] group-hover:text-[#6EE7B7] transition-colors">{box.title}</p>
                                                    <p className="text-[10px] text-[#444] lowercase tracking-tighter mt-0.5">{box.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="space-y-5">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-[#333]" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Recent_Deployments</h3>
                                </div>
                                <button onClick={() => navigate('/workflows')} className="text-[10px] font-bold text-[#6EE7B7] uppercase tracking-tighter hover:underline">View_Registry →</button>
                            </div>
                            <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-[32px] overflow-hidden shadow-2xl">
                                <table className="w-full text-left">
                                    <thead className="bg-[#111]/50 border-b border-[#1A1A1A]">
                                        <tr>
                                            {['Sequence', 'Context', 'Timestamp', 'Control'].map((h, i) => (
                                                <th key={i} className="px-8 py-4 font-mono text-[9px] font-bold text-[#3A3A4A] uppercase tracking-[0.2em]">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#111]">
                                        {recentWorkflows.map((w) => (
                                            <tr key={w.id} className="group hover:bg-[#111]/30 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <Activity size={14} className="text-[#222] group-hover:text-[#6EE7B7] transition-colors" />
                                                        <span className="text-xs font-bold text-[#F1F5F9] truncate max-w-[200px]">{w.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5"><StatusBadge status={w.status} /></td>
                                                <td className="px-8 py-5 text-[10px] text-[#333] font-bold uppercase tracking-tighter">{w.lastRun}</td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => navigate(`/workflows/new?id=${w.id}`)} className="p-2 text-[#444] hover:text-[#6EE7B7] hover:bg-[#6EE7B7]/5 rounded-lg"><FileEdit size={14} /></button>
                                                        <button onClick={() => handleRunWorkflow(w)} className="p-2 text-[#444] hover:text-[#6EE7B7] hover:bg-[#6EE7B7]/5 rounded-lg"><Play size={14} className="fill-current" /></button>
                                                        <button onClick={() => handleDeleteWorkflow(w)} className="p-2 text-[#444] hover:text-[#F87171] hover:bg-[#F87171]/5 rounded-lg"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;