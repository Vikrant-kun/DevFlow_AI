import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FileEdit, Plus, Layers, X, Github, CheckCircle2, ChevronRight, Upload, FileCode, GitCommit, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';

const getStatusBadge = (status) => {
    switch (status) {
        case 'Active':
            return <span className="flex items-center gap-2 text-xs md:text-sm font-mono text-text-secondary"><span className="w-2 h-2 rounded-xl bg-[#6EE7B7]"></span> Active</span>;
        case 'Paused':
            return <span className="flex items-center gap-2 text-xs md:text-sm font-mono text-text-secondary"><span className="w-2 h-2 rounded-xl bg-[#F59E0B]"></span> Paused</span>;
        case 'Failed':
            return <span className="flex items-center gap-2 text-xs md:text-sm font-mono text-text-secondary"><span className="w-2 h-2 rounded-xl bg-[#F87171]"></span> Failed</span>;
        default:
            return null;
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [recentWorkflows, setRecentWorkflows] = useState([]);
    const [stats, setStats] = useState([
        { label: "Total Workflows", value: "0" },
        { label: "Runs Today", value: "0" },
        { label: "Success Rate", value: "—" },
        { label: "Time Saved", value: "0h" }
    ]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [repos, setRepos] = useState([]);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [isGithubConnected, setIsGithubConnected] = useState(false);
    const [showRepoSelector, setShowRepoSelector] = useState(false);
    const { showToast } = useToast();
    const { user } = useAuth();
    const [checklistDismissed, setChecklistDismissed] = useState(true);

    // ── NEW STATE ────────────────────────────────────────────────────────────
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const [uploadFiles, setUploadFiles] = useState([]);
    const [commitMessage, setCommitMessage] = useState('');
    const [isCommitting, setIsCommitting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    // ─────────────────────────────────────────────────────────────────────────

    const [checklistItems, setChecklistItems] = useState([
        { id: 'create_account', label: 'create_account', done: true, route: null },
        { id: 'connect_github', label: 'connect_github', done: false, route: '/integrations' },
        { id: 'create_workflow', label: 'create_first_workflow', done: false, route: '/workflows/new' },
        { id: 'run_pipeline', label: 'run_first_pipeline', done: false, route: null, locked: true }
    ]);

    useEffect(() => {
        const isDismissed = localStorage.getItem('devflow_checklist_dismissed') === 'true';
        setChecklistDismissed(isDismissed);

        const checkStates = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: { session } } = await supabase.auth.getSession();
            const isGithubConnected = user?.app_metadata?.provider === 'github' ||
                user?.app_metadata?.providers?.includes('github');
            setIsGithubConnected(!!isGithubConnected);

            if (user && isGithubConnected) {
                const { data: settings } = await supabase
                    .from('user_settings')
                    .select('selected_repo_full_name, selected_repo')
                    .eq('user_id', user.id)
                    .single();

                if (settings && (settings.selected_repo_full_name || settings.selected_repo)) {
                    setSelectedRepo({
                        name: settings.selected_repo || settings.selected_repo_full_name.split('/')[1],
                        full_name: settings.selected_repo_full_name || settings.selected_repo
                    });
                }

                const token = session?.provider_token;
                if (token) {
                    setIsLoadingRepos(true);
                    try {
                        const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const reposData = await res.json();
                            setRepos(reposData);
                        }
                    } catch (err) {
                        console.error("Failed to fetch repos", err);
                    } finally {
                        setIsLoadingRepos(false);
                    }
                }
            }

            const hasWorkflow = localStorage.getItem('devflow_has_workflow') === 'true';
            const hasRun = localStorage.getItem('devflow_has_run') === 'true';

            setChecklistItems([
                { id: 'create_account', label: 'create_account', done: true, route: null },
                { id: 'connect_github', label: 'connect_github', done: !!isGithubConnected, route: '/integrations' },
                { id: 'create_workflow', label: 'create_first_workflow', done: hasWorkflow, route: '/workflows/new' },
                { id: 'run_pipeline', label: 'run_first_pipeline', done: hasRun, route: null, locked: true }
            ]);

            if (user) {
                const { data: workflowsData } = await supabase
                    .from('workflows')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (workflowsData) {
                    setStats([
                        { label: 'Total Workflows', value: workflowsData.length.toString() },
                        { label: 'Runs Today', value: '0' },
                        { label: 'Success Rate', value: '—' },
                        { label: 'Time Saved', value: '0h' }
                    ]);

                    const recent = workflowsData.slice(0, 4).map(w => ({
                        id: w.id,
                        name: w.name,
                        status: w.status.charAt(0).toUpperCase() + w.status.slice(1),
                        lastRun: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : 'Never'
                    }));
                    setRecentWorkflows(recent);
                }
            }
        };
        checkStates();
    }, []);

    const handleDismissChecklist = () => {
        localStorage.setItem('devflow_checklist_dismissed', 'true');
        setChecklistDismissed(true);
    };

    const handleChecklistClick = (item) => {
        if (item.locked) return;
        if (item.route) {
            navigate(item.route);
        } else {
            const updated = checklistItems.map(i => i.id === item.id ? { ...i, done: true } : i);
            setChecklistItems(updated);
            if (updated.every(i => i.done || i.locked === false)) {
                handleDismissChecklist();
                showToast("You're all set. Welcome to DevFlow. 🚀", "success");
            }
        }
    };

    const handleRepoSelect = async (e) => {
        const repoFullName = e.target.value;
        const repo = repos.find(r => r.full_name === repoFullName);
        if (!repo) return;

        setSelectedRepo({ name: repo.name, full_name: repo.full_name });
        setShowRepoSelector(false);

        if (user) {
            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    selected_repo: repo.name,
                    selected_repo_full_name: repo.full_name,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) showToast("Failed to save repository", "error");
            else showToast("Repository updated", "success");
        }
    };

    // ── NEW HANDLERS ─────────────────────────────────────────────────────────
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const dropped = Array.from(e.dataTransfer?.files || e.target?.files || []);
        setUploadFiles(prev => [...prev, ...dropped]);
    }, []);

    const handleCommitFiles = async () => {
        if (!selectedRepo || uploadFiles.length === 0) return;
        setIsCommitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            for (const file of uploadFiles) {
                const content = await file.text();
                const res = await fetch(`${API_URL}/github/commit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                    body: JSON.stringify({ repo_full_name: selectedRepo.full_name, path: file.name, content, message: commitMessage || `Add ${file.name} via DevFlow` })
                });
                if (!res.ok) throw new Error((await res.json()).detail);
            }
            showToast(`${uploadFiles.length} file(s) pushed to ${selectedRepo.full_name}`, 'success');
            setUploadFiles([]);
            setCommitMessage('');
        } catch (err) {
            showToast('Commit failed: ' + err.message, 'error');
        } finally {
            setIsCommitting(false);
        }
    };

    const handleRunWorkflow = async (workflow) => {
        if (!user) { showToast('Log in to run.', 'error'); return; }
        try {
            const { data: { session } } = await supabase.auth.getSession();
            showToast(`Running ${workflow.name}...`, 'info');
            const res = await fetch(`${API_URL}/workflows/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ workflow_id: workflow.id, workflow_name: workflow.name, snapshot: {} })
            });
            if (!res.ok) throw new Error(`${res.status}`);
            const result = await res.json();
            if (result.status === 'success') showToast(`${workflow.name} executed!`, 'success');
            else showToast(`${workflow.name} failed — check Logs`, 'error');
        } catch (err) {
            showToast('Run failed: ' + err.message, 'error');
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="flex h-[100dvh] bg-[#080808] overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopBar title="Dashboard" />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
                        {/* Header & Actions */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <motion.div variants={itemVariants}>
                                <h2 className="text-lg md:text-xl font-mono text-text-primary lowercase tracking-tight">dashboard</h2>
                                <p className="text-text-secondary text-xs md:text-sm font-mono mt-1">overview_of_active_pipelines</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex flex-row gap-2 w-full md:w-auto">
                                <Button variant="ghost" className="gap-2 flex-1 md:flex-none justify-center rounded-xl text-xs md:text-sm border border-[#1A1A1A] hover:border-[#333]" onClick={() => navigate('/templates')}>
                                    <Layers className="w-4 h-4" /> <span className="hidden sm:inline">Browse</span> Templates
                                </Button>
                                <Button variant="primary" className="gap-2 flex-1 md:flex-none justify-center rounded-xl shadow-glow-primary text-xs md:text-sm" onClick={() => navigate('/workflows/new')}>
                                    <Plus className="w-4 h-4" /> New Workflow
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* ── REPLACED CHECKLIST ─────────────────────────────────── */}
                        <AnimatePresence>
                            {!checklistDismissed && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="w-full">
                                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl overflow-hidden">
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 flex items-center justify-center">
                                                    <Zap className="w-3.5 h-3.5 text-[#6EE7B7]" />
                                                </div>
                                                <div>
                                                    <p className="font-mono text-xs font-bold text-[#F1F5F9]">Getting Started</p>
                                                    <p className="font-mono text-[10px] text-[#64748B]">{checklistItems.filter(i => i.done).length} of {checklistItems.length} completed</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {/* Progress bar */}
                                                <div className="hidden sm:flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                                                        <motion.div className="h-full bg-[#6EE7B7] rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(checklistItems.filter(i => i.done).length / checklistItems.length) * 100}%` }}
                                                            transition={{ duration: 0.5, ease: 'easeOut' }} />
                                                    </div>
                                                    <span className="font-mono text-[10px] text-[#64748B]">
                                                        {Math.round((checklistItems.filter(i => i.done).length / checklistItems.length) * 100)}%
                                                    </span>
                                                </div>
                                                <button onClick={handleDismissChecklist} className="text-[#64748B] hover:text-[#F1F5F9] transition-colors p-1">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Steps */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1A1A1A]">
                                            {checklistItems.map((item, idx) => {
                                                const stepLabels = {
                                                    create_account: { title: 'Create Account', desc: 'Sign up and get access' },
                                                    connect_github: { title: 'Connect GitHub', desc: 'Link your repositories' },
                                                    create_first_workflow: { title: 'Build Workflow', desc: 'Design your first pipeline' },
                                                    run_first_pipeline: { title: 'Run Pipeline', desc: 'Execute and see results' },
                                                };
                                                const meta = stepLabels[item.id] || { title: item.label, desc: '' };
                                                return (
                                                    <div key={item.id} onClick={() => handleChecklistClick(item)}
                                                        className={`p-4 flex items-start gap-3 transition-colors ${item.locked ? 'opacity-40 cursor-not-allowed' :
                                                                item.done ? 'cursor-default' :
                                                                    'cursor-pointer hover:bg-[#111]'
                                                            }`}>
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${item.done ? 'bg-[#6EE7B7]/15 border-[#6EE7B7]/40' : 'bg-[#111] border-[#333]'
                                                            }`}>
                                                            {item.done
                                                                ? <CheckCircle2 className="w-3 h-3 text-[#6EE7B7]" />
                                                                : <span className="font-mono text-[9px] text-[#444]">{idx + 1}</span>
                                                            }
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`font-mono text-xs font-semibold truncate ${item.done ? 'text-[#6EE7B7]' : 'text-[#F1F5F9]'}`}>{meta.title}</p>
                                                            <p className="font-mono text-[10px] text-[#64748B] mt-0.5">{meta.desc}</p>
                                                        </div>
                                                        {!item.done && !item.locked && <ChevronRight className="w-3.5 h-3.5 text-[#333] shrink-0 mt-0.5" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Stats Grid - Fixed for mobile (2x2) */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                            {stats.map((stat, i) => (
                                <motion.div key={i} variants={itemVariants} className="bg-[#111] rounded-xl p-4 md:p-5 border-l-2 border-[#6EE7B7] hover:bg-[#151515] transition-colors">
                                    <p className="text-[#64748B] text-[10px] md:text-xs font-mono lowercase tracking-wider mb-1 md:mb-2 truncate">{stat.label}</p>
                                    <h3 className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-[#6EE7B7]">{stat.value}</h3>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Active Repository Card */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="pt-2 md:pt-4">
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <h3 className="text-[10px] md:text-sm font-mono text-[#64748B] lowercase tracking-wider">active_repository</h3>
                            </div>

                            {/* ── REPLACED REPO CARD & FILE UPLOAD ────────────────── */}
                            <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                                {/* Top row */}
                                <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0D0D0D] border border-[#222] flex items-center justify-center shrink-0 rounded-xl">
                                            <Github className="w-5 h-5 md:w-6 md:h-6 text-[#F1F5F9]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            {selectedRepo ? (
                                                <>
                                                    <h3 className="text-sm md:text-base font-mono font-semibold text-[#F1F5F9] mb-0.5 truncate">{selectedRepo.full_name}</h3>
                                                    <span className="flex items-center gap-2 text-[10px] font-mono text-[#6EE7B7]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] animate-pulse"></span> connected
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <h3 className="text-sm md:text-base font-mono font-semibold text-[#F1F5F9] mb-0.5">No repository connected</h3>
                                                    <span className="text-[10px] font-mono text-[#64748B]">Select a GitHub repository to get started.</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto relative">
                                        {selectedRepo ? (
                                            <>
                                                <Button variant="ghost" onClick={() => setShowRepoSelector(!showRepoSelector)} className="font-mono text-xs border border-[#222] text-[#F1F5F9] rounded-xl w-full sm:w-auto justify-center">
                                                    Change Repo
                                                </Button>
                                                <Button variant="primary" className="gap-2 bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] border-none font-bold rounded-xl text-xs w-full sm:w-auto justify-center" onClick={() => navigate(`/workflows/new`)}>
                                                    New Workflow →
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="primary" className="gap-2 bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] border-none font-bold rounded-xl w-full sm:w-auto justify-center text-xs" onClick={() => setShowRepoSelector(!showRepoSelector)}>
                                                Select Repository →
                                            </Button>
                                        )}
                                        <AnimatePresence>
                                            {showRepoSelector && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                    className="absolute right-0 left-0 md:left-auto top-full mt-2 w-full md:w-64 bg-[#111] border border-[#222] shadow-xl z-50 p-3 flex flex-col gap-2 rounded-xl">
                                                    {!isGithubConnected ? (
                                                        <div className="text-xs font-mono text-[#F59E0B] p-2 text-center">
                                                            Connect GitHub in Integrations first.
                                                            <Button variant="ghost" className="mt-2 text-xs w-full justify-center rounded-xl border border-[#333]" onClick={() => navigate('/integrations')}>Go to Integrations</Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="text-[10px] font-mono text-[#64748B] px-1">Select repository</div>
                                                            <select className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl text-xs font-mono text-[#F1F5F9] outline-none px-3 py-2 cursor-pointer hover:border-[#333]" value={selectedRepo?.full_name || ''} onChange={handleRepoSelect}>
                                                                <option value="" disabled>Choose a repo...</option>
                                                                {repos.map(r => <option key={r.id} value={r.full_name}>{r.full_name}</option>)}
                                                            </select>
                                                            {isLoadingRepos && <span className="text-[10px] font-mono text-[#64748B]">Loading...</span>}
                                                        </>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* File upload zone — only when repo connected */}
                                {selectedRepo && (
                                    <div className="border-t border-[#1A1A1A] p-4 md:p-6 space-y-3">
                                        <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest">Push Files to Repo</p>
                                        <div
                                            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                                            onDragLeave={() => setIsDragOver(false)}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('dash-file-input').click()}
                                            className={`cursor-pointer border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all ${isDragOver ? 'border-[#6EE7B7]/50 bg-[#6EE7B7]/5' : 'border-[#222] hover:border-[#6EE7B7]/25 bg-[#0A0A0A]'
                                                }`}>
                                            <input id="dash-file-input" type="file" multiple className="hidden" onChange={handleDrop} />
                                            <Upload className={`w-4 h-4 transition-colors ${isDragOver ? 'text-[#6EE7B7]' : 'text-[#333]'}`} />
                                            <p className="font-mono text-xs text-[#64748B]">{isDragOver ? 'Drop files to add' : 'Drag files or click to browse'}</p>
                                        </div>
                                        <AnimatePresence>
                                            {uploadFiles.length > 0 && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                                                    {uploadFiles.map((file, i) => (
                                                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                                            className="flex items-center gap-3 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl px-3 py-2">
                                                            <FileCode className="w-3.5 h-3.5 text-[#6EE7B7] shrink-0" />
                                                            <span className="font-mono text-xs text-[#F1F5F9] flex-1 truncate">{file.name}</span>
                                                            <span className="font-mono text-[10px] text-[#444]">{(file.size / 1024).toFixed(1)}kb</span>
                                                            <button onClick={() => setUploadFiles(p => p.filter((_, idx) => idx !== i))} className="text-[#333] hover:text-[#F87171] transition-colors">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                    <input type="text" value={commitMessage} onChange={e => setCommitMessage(e.target.value)}
                                                        placeholder={`Add ${uploadFiles.length} file(s) via DevFlow`}
                                                        className="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl px-3 py-2 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]" />
                                                    <button onClick={handleCommitFiles} disabled={isCommitting}
                                                        className="w-full flex items-center justify-center gap-2 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2.5 rounded-xl disabled:opacity-50 transition-all">
                                                        {isCommitting ? <div className="w-3.5 h-3.5 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" /> : <GitCommit className="w-3.5 h-3.5" />}
                                                        {isCommitting ? 'Pushing...' : `Push ${uploadFiles.length} file(s) → ${selectedRepo.full_name}`}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Start Section */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="pt-6 md:pt-8 mt-2 border-t border-[#1A1A1A]">
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <h3 className="text-[10px] md:text-sm font-mono text-[#6EE7B7] lowercase tracking-widest">quick_start</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                <div onClick={() => navigate('/workflows/new?prompt=When a PR is merged to main, run tests and deploy')} className="bg-[#111] border border-[#1A1A1A] rounded-xl p-3 md:p-4 cursor-pointer hover:border-[#6EE7B7] transition-all group">
                                    <div className="text-xl md:text-2xl mb-1.5 md:mb-2">🔀</div>
                                    <h4 className="font-mono text-xs md:text-sm text-[#F1F5F9] mb-0.5 md:mb-1 group-hover:text-[#6EE7B7] transition-colors">PR Pipeline</h4>
                                    <p className="font-mono text-[10px] md:text-xs text-[#64748B]">Auto-test and deploy</p>
                                </div>
                                <div onClick={() => navigate('/workflows/new?prompt=When a deployment fails, rollback and alert the team')} className="bg-[#111] border border-[#1A1A1A] rounded-xl p-3 md:p-4 cursor-pointer hover:border-[#6EE7B7] transition-all group">
                                    <div className="text-xl md:text-2xl mb-1.5 md:mb-2">🔔</div>
                                    <h4 className="font-mono text-xs md:text-sm text-[#F1F5F9] mb-0.5 md:mb-1 group-hover:text-[#6EE7B7] transition-colors">Alert System</h4>
                                    <p className="font-mono text-[10px] md:text-xs text-[#64748B]">Notify when things break</p>
                                </div>
                                <div onClick={() => navigate('/workflows/new?prompt=When a new issue is created, assign it and send email')} className="bg-[#111] border border-[#1A1A1A] rounded-xl p-3 md:p-4 cursor-pointer hover:border-[#6EE7B7] transition-all group">
                                    <div className="text-xl md:text-2xl mb-1.5 md:mb-2">📋</div>
                                    <h4 className="font-mono text-xs md:text-sm text-[#F1F5F9] mb-0.5 md:mb-1 group-hover:text-[#6EE7B7] transition-colors">Issue Tracker</h4>
                                    <p className="font-mono text-[10px] md:text-xs text-[#64748B]">Auto-assign new issues</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Workflows */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="pt-6 md:pt-8 mt-2 border-t border-[#1A1A1A]">
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <h3 className="text-[10px] md:text-sm font-mono text-[#64748B] lowercase tracking-wider">recent workflows</h3>
                            </div>
                            {recentWorkflows.length > 0 ? (
                                <div className="w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                    <div className="min-w-[600px]">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-[#1A1A1A]">
                                                    <th className="py-2 pr-4 md:py-3 md:pr-6 text-[10px] md:text-xs font-mono font-semibold text-[#64748B] lowercase tracking-wider">name</th>
                                                    <th className="px-4 py-2 md:px-6 md:py-3 text-[10px] md:text-xs font-mono font-semibold text-[#64748B] lowercase tracking-wider">status</th>
                                                    <th className="px-4 py-2 md:px-6 md:py-3 text-[10px] md:text-xs font-mono font-semibold text-[#64748B] lowercase tracking-wider">last_run</th>
                                                    <th className="pl-4 py-2 md:pl-6 md:py-3 text-[10px] md:text-xs font-mono font-semibold text-[#64748B] lowercase tracking-wider text-right">actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#1A1A1A]">
                                                {recentWorkflows.map((workflow) => (
                                                    <motion.tr key={workflow.id} variants={itemVariants} className="hover:bg-[#111] transition-colors group">
                                                        <td className="py-3 pr-4 md:py-4 md:pr-6 whitespace-nowrap">
                                                            <span className="text-xs md:text-sm font-mono text-text-primary group-hover:text-primary transition-colors cursor-pointer">{workflow.name}</span>
                                                        </td>
                                                        <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                                                            {getStatusBadge(workflow.status)}
                                                        </td>
                                                        <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-mono text-[#64748B]">
                                                            {workflow.lastRun}
                                                        </td>
                                                        <td className="pl-4 py-3 md:pl-6 md:py-4 whitespace-nowrap text-right">
                                                            <div className="flex justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                                {/* ── REPLACED ACTION BUTTONS ────────────────────────────── */}
                                                                <Link to={`/workflows/${workflow.id}`} className="text-[#64748B] hover:text-[#6EE7B7] transition-colors p-1" title="Edit">
                                                                    <FileEdit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                </Link>
                                                                <button onClick={() => handleRunWorkflow(workflow)} className="text-[#64748B] hover:text-[#6EE7B7] transition-colors p-1" title="Run">
                                                                    <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full py-16 md:py-24 flex flex-col items-center justify-center border border-[#1A1A1A] border-dashed rounded-xl bg-[#0A0A0A]/50 gap-4 md:gap-6 px-4">
                                    <div className="font-mono text-[#64748B] text-xs md:text-sm text-center">&gt;_ no workflows yet</div>
                                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                        <Button variant="primary" className="bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] font-mono rounded-xl px-4 md:px-6 shadow-none border-none font-bold text-xs md:text-sm w-full sm:w-auto justify-center" onClick={() => navigate('/workflows/new')}>
                                            Create from scratch
                                        </Button>
                                        <Button variant="ghost" className="font-mono rounded-xl px-4 md:px-6 text-xs md:text-sm w-full sm:w-auto justify-center border border-[#1A1A1A]" onClick={() => navigate('/templates')}>
                                            Browse templates
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;