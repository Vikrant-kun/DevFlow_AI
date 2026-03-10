import { useState, useCallback, useEffect, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Panel,
    useReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    useParams
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import Joyride, { STATUS } from 'react-joyride';
import {
    Play,
    X,
    Save,
    BookOpen,
    Check,
    ArrowUp,
    Lightbulb,
    Plus,
    Minus,
    Maximize,
    Lock,
    Unlock,
    Terminal,
    Undo2,
    Redo2,
    GitBranch,
    ChevronDown,
    RefreshCw,
    Github,
    HelpCircle,
} from 'lucide-react';
import CustomNode from '../components/CustomNode';
import TopBar from '../components/TopBar';
import { useLocation, useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { templateNodesData } from '../lib/templateNodes';

const nodeTypes = { custom: CustomNode };
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── TOUR STEPS ────────────────────────────────────────────────────────────────
const TOUR_STEPS = [
    {
        target: '.tour-prompt',
        title: '💬 Describe your workflow',
        content: 'Type what you want to automate in plain English. DevFlow AI builds the pipeline for you.',
        placement: 'top',
        disableBeacon: true,
    },
    {
        target: '.tour-agent',
        title: '🤖 Choose your AI model',
        content: 'Select which AI powers pipeline generation — Groq is fastest, GPT-4o and Gemini also available.',
        placement: 'top',
    },
    {
        target: '.tour-recipes',
        title: '📖 Recipe Library',
        content: 'Browse pre-built workflow templates. Click any recipe to auto-fill the prompt.',
        placement: 'top',
    },
    {
        target: '.tour-suggestions',
        title: '💡 Suggestions',
        content: 'Not sure what to build? Get quick prompt ideas for common automation patterns.',
        placement: 'top',
    },
    {
        target: '.tour-run',
        title: '▶️ Run your pipeline',
        content: 'Once your pipeline is built, hit Run to execute it live against your GitHub repo.',
        placement: 'bottom',
    },
    {
        target: '.tour-save',
        title: '💾 Save your work',
        content: 'Save your pipeline as a draft. Auto-save also kicks in after 1.5s of inactivity.',
        placement: 'bottom',
    },
    {
        target: '.tour-repo',
        title: '🔗 Active repo & branch',
        content: 'Shows which GitHub repo and branch your pipeline will run against. Click branch to switch.',
        placement: 'bottom',
    },
    {
        target: '.tour-add-node',
        title: '➕ Add nodes manually',
        content: 'Click + to add any node type — Trigger, AI, Action, or Notify — and connect them manually.',
        placement: 'left',
    },
    {
        target: '.tour-controls',
        title: '🎮 Canvas controls',
        content: 'Undo, redo, zoom in/out, fit view, and lock the canvas to prevent accidental edits.',
        placement: 'right',
    },
    {
        target: '.tour-legend',
        title: '🎨 Node legend',
        content: 'Green = Trigger, Grey = Action, Purple = AI, Amber = Notify. Click any edge to set conditions.',
        placement: 'left',
    },
];

// ── TOUR STYLES ───────────────────────────────────────────────────────────────
const joyrideStyles = {
    options: {
        arrowColor: '#111',
        backgroundColor: '#111',
        overlayColor: 'rgba(0,0,0,0.72)',
        primaryColor: '#6EE7B7',
        textColor: '#F1F5F9',
        zIndex: 10000,
    },
    tooltip: {
        backgroundColor: '#111',
        borderRadius: '16px',
        border: '1px solid #222',
        boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
        padding: '0',
        fontFamily: 'monospace',
    },
    tooltipContainer: { padding: '20px', textAlign: 'left' },
    tooltipTitle: {
        color: '#F1F5F9',
        fontSize: '13px',
        fontWeight: '700',
        marginBottom: '8px',
        fontFamily: 'monospace',
    },
    tooltipContent: {
        color: '#94A3B8',
        fontSize: '11px',
        lineHeight: '1.6',
        fontFamily: 'monospace',
        padding: '0',
    },
    tooltipFooter: {
        padding: '12px 20px',
        borderTop: '1px solid #1A1A1A',
        marginTop: '4px',
        gap: '8px',
    },
    buttonNext: {
        backgroundColor: '#6EE7B7',
        color: '#080808',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: '700',
        fontFamily: 'monospace',
        padding: '8px 16px',
        border: 'none',
    },
    buttonBack: {
        color: '#64748B',
        fontSize: '11px',
        fontFamily: 'monospace',
        marginRight: '4px',
        background: 'transparent',
        border: '1px solid #222',
        borderRadius: '10px',
        padding: '8px 16px',
    },
    buttonSkip: {
        color: '#444',
        fontSize: '10px',
        fontFamily: 'monospace',
        background: 'transparent',
        border: 'none',
    },
    spotlight: { borderRadius: '12px' },
};

const NODE_TYPES_CONFIG = [
    { type: 'trigger', label: 'Trigger', desc: 'Starts the pipeline', icon: 'zap', color: '#6EE7B7', defaultLabel: 'Start Trigger', defaultDesc: 'Pipeline entry point' },
    { type: 'ai', label: 'AI Step', desc: 'Run AI analysis or generation', icon: 'sparkles', color: '#F1F5F9', defaultLabel: 'AI Analysis', defaultDesc: 'Analyze and process with AI' },
    { type: 'action', label: 'Action', desc: 'GitHub, commit, push, fix', icon: 'git-branch', color: '#64748B', defaultLabel: 'Run Action', defaultDesc: 'Execute an action step' },
    { type: 'notification', label: 'Notify', desc: 'Send email or alert', icon: 'mail', color: '#F59E0B', defaultLabel: 'Send Notification', defaultDesc: 'Notify via email or Slack' },
];

const RECIPES = [
    { title: 'PR Changelog', desc: 'When a PR is merged to main, generate a changelog using AI and post it to Slack.', tag: 'GitHub + AI + Slack' },
    { title: 'Vercel Log Analysis', desc: 'If a Vercel deploy fails, analyze logs with AI and email the fix to the team.', tag: 'Vercel + AI + Email' },
    { title: 'Secret Scanner', desc: 'Scan new commits for leaked secrets; if found, notify #security and lock the branch.', tag: 'GitHub + Security' },
    { title: 'Stale Issue Labeler', desc: "Find GitHub issues with no activity for 14 days and label them as 'stale' automatically.", tag: 'GitHub + Automation' },
];

const SUGGESTIONS = [
    { label: 'Automate PRs', prompt: 'When a PR is merged to main, run tests and notify the team on Slack.' },
    { label: 'Rollback deploys', prompt: 'When a deployment fails, auto-rollback and alert the on-call engineer.' },
    { label: 'Assign issues', prompt: 'When a new GitHub issue is created, auto-assign it and send an email.' },
    { label: 'Daily backups', prompt: 'Every night at 2am, backup the database and upload it to S3.' },
];

const AGENTS = [
    { id: 'groq', name: 'Groq', desc: 'Llama 3.3 70B', icon: '⚡️' },
    { id: 'gpt4', name: 'GPT-4o', desc: 'OpenAI', icon: '🤖' },
    { id: 'gemini', name: 'Gemini', desc: 'Flash 2.0', icon: '✨' },
    { id: 'claude', name: 'Claude', desc: 'via Groq', icon: '🧠' },
];

const NODE_LEGEND = [
    { type: 'trigger', color: '#6EE7B7', label: 'Trigger' },
    { type: 'action', color: '#94A3B8', label: 'Action' },
    { type: 'ai', color: '#A78BFA', label: 'AI' },
    { type: 'notification', color: '#F59E0B', label: 'Notify' },
];

const CONDITION_OPTIONS = [
    { value: 'always', label: '⚡ Always', color: '#64748B' },
    { value: 'errors_found', label: '🔴 If Errors Found', color: '#F87171' },
    { value: 'no_errors', label: '🟢 If No Errors', color: '#6EE7B7' },
];

// ── ADD NODE PANEL ────────────────────────────────────────────────────────────
const AddNodePanel = ({ setNodes, setIsDirty, showToast }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { getViewport } = useReactFlow();

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleAdd = (cfg) => {
        const viewport = getViewport();
        const x = (-viewport.x + window.innerWidth / 2) / viewport.zoom - 140;
        const y = (-viewport.y + window.innerHeight / 2) / viewport.zoom - 50;
        const id = `node-${Date.now()}`;
        const newNode = {
            id,
            type: 'custom',
            position: { x, y },
            data: { type: cfg.type, label: cfg.defaultLabel, description: cfg.defaultDesc, icon: cfg.icon, model: 'groq' },
        };
        setNodes((nds) => [...nds, newNode]);
        setIsDirty(true);
        showToast(`${cfg.label} node added — connect it to the pipeline`, 'success');
        setOpen(false);
    };

    return (
        <Panel position="bottom-right" className="mb-[100px] mr-4 tour-add-node">
            <div ref={ref} className="relative flex flex-col items-end gap-2">
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="bg-[#0D0D0D] border border-[#222] rounded-xl shadow-2xl overflow-hidden w-[200px]"
                        >
                            <div className="px-3 py-2 border-b border-[#1A1A1A]">
                                <p className="font-mono text-[9px] text-[#444] uppercase tracking-widest">Add Node</p>
                            </div>
                            <div className="p-1">
                                {NODE_TYPES_CONFIG.map((cfg) => (
                                    <button
                                        key={cfg.type}
                                        onClick={() => handleAdd(cfg)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#111] transition-colors text-left group"
                                    >
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
                                        >
                                            <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className="font-mono text-xs text-[#F1F5F9] group-hover:text-white font-semibold">
                                                {cfg.label}
                                            </span>
                                            <span className="font-mono text-[9px] text-[#444] mt-0.5">{cfg.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setOpen(!open)}
                    className={`w-10 h-10 rounded-xl border shadow-xl flex items-center justify-center transition-all duration-200 ${open
                        ? 'bg-[#6EE7B7] border-[#6EE7B7] text-[#080808] rotate-45'
                        : 'bg-[#111] border-[#222] text-[#64748B] hover:border-[#6EE7B7] hover:text-[#6EE7B7]'
                        }`}
                    title="Add node"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </Panel>
    );
};

// ── CUSTOM CANVAS CONTROLS ────────────────────────────────────────────────────
const CustomCanvasControls = ({ isLocked, setIsLocked, onUndo, onRedo, hasNodes }) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <>
            <Panel position="bottom-left" className="hidden md:flex flex-col bg-[#111] border border-[#222] rounded-xl shadow-xl overflow-hidden mb-[100px] ml-4 tour-controls">
                <button onClick={onUndo} className="p-2 border-b border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors" title="Undo">
                    <Undo2 className="w-4 h-4" />
                </button>
                <button onClick={onRedo} className="p-2 border-b border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors" title="Redo">
                    <Redo2 className="w-4 h-4" />
                </button>
                <button onClick={() => zoomIn({ duration: 300 })} className="p-2 border-b border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors" title="Zoom In">
                    <Plus className="w-4 h-4" />
                </button>
                <button onClick={() => zoomOut({ duration: 300 })} className="p-2 border-b border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors" title="Zoom Out">
                    <Minus className="w-4 h-4" />
                </button>
                <button onClick={() => fitView({ duration: 800, padding: 0.3 })} className="p-2 border-b border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors" title="Fit View">
                    <Maximize className="w-4 h-4" />
                </button>
                <button onClick={() => setIsLocked(!isLocked)} className="p-2 text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors" title={isLocked ? 'Unlock' : 'Lock'}>
                    {isLocked ? <Lock className="w-4 h-4 text-[#F87171]" /> : <Unlock className="w-4 h-4" />}
                </button>
            </Panel>

            {hasNodes && (
                <>
                    <Panel position="top-right" className="hidden md:flex flex-col gap-1.5 bg-[#111]/90 backdrop-blur-sm border border-[#222] rounded-xl p-3 shadow-xl mr-2 mt-2 tour-legend">
                        <p className="font-mono text-[8px] text-[#3A3A4A] uppercase tracking-widest mb-0.5">Node Types</p>
                        {NODE_LEGEND.map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                                <span className="font-mono text-[10px] text-[#64748B]">{label}</span>
                            </div>
                        ))}
                    </Panel>

                    <Panel position="top-center" className="md:hidden flex items-center gap-3 bg-[#111]/90 backdrop-blur-sm border border-[#222] rounded-xl px-3 py-1.5 shadow-lg mt-2">
                        {NODE_LEGEND.map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                                <span className="font-mono text-[9px] text-[#64748B]">{label}</span>
                            </div>
                        ))}
                    </Panel>
                </>
            )}
        </>
    );
};

// ── REPO + BRANCH PANEL ───────────────────────────────────────────────────────
const RepoBranchPanel = ({ user }) => {
    const [repo, setRepo] = useState(null);
    const [branches, setBranches] = useState([]);
    const [defaultBranch, setDefaultBranch] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showBranches, setShowBranches] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                const token = await user.getToken();
                const res = await fetch(`${API_URL}/github/selected-repo`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) return;
                const { repo: repoData } = await res.json();
                if (!repoData) return;
                setRepo(repoData.full_name);
                await fetchBranches();
            } catch (e) {
                console.error('RepoBranchPanel load error:', e);
            }
        };
        load();
    }, [user]);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const token = await user.getToken();
            const res = await fetch(`${API_URL}/github/branches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch branches');
            const data = await res.json();
            setRepo(data.repo);
            setBranches(data.branches || []);
            setDefaultBranch(data.default_branch);
            if (!selectedBranch && data.default_branch) setSelectedBranch(data.default_branch);
        } catch (e) {
            console.error('Failed to fetch branches:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setShowBranches(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!repo) return null;

    const repoName = repo.split('/')[1];
    const repoOwner = repo.split('/')[0];

    return (
        <Panel position="top-left" className="ml-3 mt-3 z-10 tour-repo">
            <div ref={panelRef} className="relative">
                <div className="flex items-center bg-[#0D0D0D] border border-[#222] rounded-xl overflow-hidden shadow-xl">
                    <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1A1A1A]">
                        <Github className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                        <div className="flex flex-col leading-none">
                            <span className="font-mono text-[9px] text-[#444] uppercase tracking-widest">repo</span>
                            <span className="font-mono text-[11px] text-[#F1F5F9] font-semibold">{repoName}</span>
                        </div>
                    </div>
                    <button onClick={() => setShowBranches(!showBranches)} className="flex items-center gap-2 px-3 py-2 hover:bg-[#111] transition-colors group">
                        <GitBranch className="w-3.5 h-3.5 text-[#6EE7B7] shrink-0" />
                        <div className="flex flex-col leading-none text-left">
                            <span className="font-mono text-[9px] text-[#444] uppercase tracking-widest">branch</span>
                            <span className="font-mono text-[11px] text-[#6EE7B7] font-semibold">{selectedBranch || '—'}</span>
                        </div>
                        <ChevronDown className={`w-3 h-3 text-[#444] transition-transform duration-200 ${showBranches ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={fetchBranches} disabled={loading} className="px-2 py-2 border-l border-[#1A1A1A] text-[#444] hover:text-[#6EE7B7] transition-colors" title="Refresh branches">
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-[#6EE7B7]' : ''}`} />
                    </button>
                </div>

                <AnimatePresence>
                    {showBranches && (
                        <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute left-0 top-[calc(100%+6px)] w-[220px] bg-[#0D0D0D] border border-[#222] rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                            <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
                                <span className="font-mono text-[9px] text-[#444] uppercase tracking-widest">{repoOwner}/{repoName}</span>
                                <span className="font-mono text-[9px] text-[#444]">{branches.length} branches</span>
                            </div>
                            <div className="max-h-48 overflow-y-auto p-1">
                                {loading ? (
                                    <div className="flex items-center gap-2 px-3 py-3">
                                        <div className="w-3 h-3 border-2 border-[#333] border-t-[#6EE7B7] rounded-full animate-spin" />
                                        <span className="font-mono text-[10px] text-[#64748B]">Loading...</span>
                                    </div>
                                ) : branches.length === 0 ? (
                                    <div className="px-3 py-3 font-mono text-[10px] text-[#444]">No branches found</div>
                                ) : (
                                    branches.map((branch) => (
                                        <button
                                            key={branch.name}
                                            onClick={() => {
                                                setSelectedBranch(branch.name);
                                                setShowBranches(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${selectedBranch === branch.name ? 'bg-[#6EE7B7]/10 border border-[#6EE7B7]/20' : 'hover:bg-[#111] border border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <GitBranch className="w-3 h-3 text-[#444] shrink-0" />
                                                <span className={`font-mono text-[11px] truncate ${selectedBranch === branch.name ? 'text-[#6EE7B7]' : 'text-[#94A3B8]'}`}>
                                                    {branch.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                {branch.is_default && <span className="font-mono text-[8px] text-[#6EE7B7] bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 px-1.5 py-0.5 rounded-full">default</span>}
                                                {branch.protected && <span className="font-mono text-[8px] text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-1.5 py-0.5 rounded-full">protected</span>}
                                                {selectedBranch === branch.name && <Check className="w-3 h-3 text-[#6EE7B7]" />}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Panel>
    );
};

// ── AGENT SELECTOR ────────────────────────────────────────────────────────────
const AgentSelector = ({ value, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const selected = AGENTS.find((a) => a.id === value) || AGENTS[0];
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div className="relative shrink-0 tour-agent" ref={ref}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#222] bg-[#0D0D0D] hover:bg-[#1A1A1A] disabled:opacity-50 transition-all"
            >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111] border border-[#222] text-[10px]">{selected.icon}</div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-[calc(100%+8px)] left-0 w-[180px] bg-[#0D0D0D] border border-[#222] rounded-xl shadow-2xl overflow-hidden z-[100]"
                    >
                        <div className="p-1">
                            {AGENTS.map((agent) => (
                                <button
                                    key={agent.id}
                                    onClick={() => {
                                        onChange(agent.id);
                                        setOpen(false);
                                    }}
                                    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#111] border border-[#222] text-xs">{agent.icon}</div>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs text-[#F1F5F9] group-hover:text-[#6EE7B7] transition-colors">{agent.name}</span>
                                            <span className="font-mono text-[9px] text-[#64748B]">{agent.desc}</span>
                                        </div>
                                    </div>
                                    {value === agent.id && <Check className="w-4 h-4 text-[#6EE7B7]" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── UNIFIED PROMPT BOX ────────────────────────────────────────────────────────
const UnifiedPromptBox = ({ prompt, setPrompt, model, setModel, isGenerating, handleGenerate, onToggleRecipes, isRecipeOpen, onToggleSuggestions, isSuggestionsOpen, hasStarted }) => {
    const textareaRef = useRef(null);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const placeholders = [
        'When a PR is merged, run tests and notify Slack...',
        'Every night at 2am, sync staging with production...',
        'When a deploy fails, rollback and page on-call...',
    ];

    useEffect(() => {
        const id = setInterval(() => setPlaceholderIndex((p) => (p + 1) % placeholders.length), 3000);
        return () => clearInterval(id);
    }, []);

    const resizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    const activePlaceholder = hasStarted ? 'Describe your workflow...' : `>_ ${placeholders[placeholderIndex]}`;

    return (
        <div className="w-full max-w-2xl mx-auto rounded-[24px] border border-[#333] bg-[#111]/95 backdrop-blur-xl p-2 shadow-[0_8px_40px_rgba(0,0,0,0.8)] flex flex-col pointer-events-auto tour-prompt">
            <textarea
                ref={textareaRef}
                placeholder={activePlaceholder}
                className="w-full resize-none bg-transparent px-3 pt-2 pb-3 text-sm md:text-base text-[#F1F5F9] placeholder:text-[#555] focus:outline-none disabled:opacity-50 font-mono scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent leading-normal"
                style={{ minHeight: '48px', overflowY: 'auto' }}
                rows={1}
                value={prompt}
                onChange={(e) => {
                    setPrompt(e.target.value);
                    resizeTextarea();
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                    }
                }}
                disabled={isGenerating}
            />
            <div className="flex items-center justify-between px-1 pt-1.5 border-t border-[#222]/80 mt-1 shrink-0">
                <div className="flex items-center gap-2">
                    <AgentSelector value={model} onChange={setModel} disabled={isGenerating} />
                    <button
                        onClick={onToggleRecipes}
                        className={`tour-recipes flex h-8 w-8 items-center justify-center rounded-full border transition-all ${isRecipeOpen ? 'bg-[#6EE7B7]/10 border-[#6EE7B7]/30 text-[#6EE7B7]' : 'border-transparent bg-[#0D0D0D] border-[#222] text-[#64748B] hover:bg-[#1A1A1A] hover:text-[#F1F5F9]'
                            }`}
                    >
                        <BookOpen className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={onToggleSuggestions}
                        className={`tour-suggestions flex h-8 w-8 items-center justify-center rounded-full border transition-all ${isSuggestionsOpen ? 'bg-[#6EE7B7]/10 border-[#6EE7B7]/30 text-[#6EE7B7]' : 'border-transparent bg-[#0D0D0D] border-[#222] text-[#64748B] hover:bg-[#1A1A1A] hover:text-[#F1F5F9]'
                            }`}
                    >
                        <Lightbulb className="h-3.5 w-3.5" />
                    </button>
                </div>
                <button
                    disabled={!prompt.trim() || isGenerating}
                    onClick={handleGenerate}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                >
                    {isGenerating ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#080808]/40 border-t-[#080808]" /> : <ArrowUp className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
};

// ── EDGE CONDITION MENU ───────────────────────────────────────────────────────
const EdgeConditionMenu = ({ edge, position, onSelect, onClose }) => {
    if (!edge) return null;
    return (
        <div className="fixed z-50 bg-[#111] border border-[#222] rounded-xl shadow-2xl overflow-hidden" style={{ left: position.x, top: position.y, minWidth: 180 }}>
            <div className="px-3 py-2 border-b border-[#222]">
                <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest">Edge condition</p>
            </div>
            {CONDITION_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => {
                        onSelect(edge.id, opt.value);
                        onClose();
                    }}
                    className="w-full text-left px-3 py-2.5 font-mono text-xs hover:bg-[#1A1A1A] transition-colors flex items-center gap-2"
                    style={{ color: opt.color }}
                >
                    {opt.label}
                    {edge.data?.condition === opt.value && <span className="ml-auto text-[#6EE7B7]">✓</span>}
                </button>
            ))}
        </div>
    );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function WorkflowBuilder() {
    const [title, setTitle] = useState('Untitled Workflow');
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('groq');
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isRecipeOpen, setIsRecipeOpen] = useState(false);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
    const [isCanvasLocked, setIsCanvasLocked] = useState(false);
    const [lastPrompt, setLastPrompt] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [unsupportedFeature, setUnsupportedFeature] = useState(null);
    const [showRerunModal, setShowRerunModal] = useState(false);
    const [edgeMenu, setEdgeMenu] = useState({ edge: null, position: { x: 0, y: 0 } });

    // Tour
    const [tourRunning, setTourRunning] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('devflow_tour_seen')) {
            setTimeout(() => setTourRunning(true), 800);
        }
    }, []);

    const handleTourCallback = ({ status }) => {
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setTourRunning(false);
            localStorage.setItem('devflow_tour_seen', 'true');
        }
    };

    const historyRef = useRef([]);
    const historyIndexRef = useRef(-1);
    const autoSaveTimer = useRef(null);

    const { showToast } = useToast();
    const location = useLocation();
    const { id: routeId } = useParams();
    const { user, getAuthToken } = useAuth();

    const pushHistory = useCallback((n, e) => {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        historyRef.current.push({ nodes: n, edges: e });
        historyIndexRef.current = historyRef.current.length - 1;
    }, []);

    useEffect(() => {
        if (nodes.length === 0 && edges.length === 0) return;
        setIsDirty(true);

        const snapshot = { nodes, edges };
        const history = historyRef.current;
        historyRef.current = history.slice(0, historyIndexRef.current + 1);
        historyRef.current.push(snapshot);
        historyIndexRef.current = historyRef.current.length - 1;
    }, [nodes, edges]);

    useEffect(() => {
        if (!isDirty || !currentWorkflowId) return;
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
            handleSaveDraft();
        }, 1500);
        return () => clearTimeout(autoSaveTimer.current);
    }, [nodes, isDirty, currentWorkflowId]);

    const handleUndo = useCallback(() => {
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current -= 1;
        const snap = historyRef.current[historyIndexRef.current];
        setNodes(snap.nodes);
        setEdges(snap.edges);
    }, [setNodes, setEdges]);

    const handleRedo = useCallback(() => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current += 1;
        const snap = historyRef.current[historyIndexRef.current];
        setNodes(snap.nodes);
        setEdges(snap.edges);
    }, [setNodes, setEdges]);

    // ── Load replay / template ────────────────────────────────────────────────
    useEffect(() => {
        if (location.state?.replaySnapshot) {
            const snap = location.state.replaySnapshot;
            if (snap.title) setTitle(snap.title);
            setNodes([]);
            setEdges([]);
            setHasStarted(true);

            snap.nodes?.forEach((node, idx) => {
                setTimeout(() => {
                    setNodes((nds) => [...nds, node]);
                    if (idx > 0 && snap.edges?.[idx - 1]) {
                        setEdges((eds) => [
                            ...eds,
                            { ...snap.edges[idx - 1], animated: false, style: { stroke: '#444', strokeWidth: 2 }, type: 'smoothstep' },
                        ]);
                    }
                }, idx * 150);
            });
            showToast('Snapshot loaded from run history', 'success');
            window.history.replaceState({}, '');
        }
    }, [location.state, setNodes, setEdges, showToast]);

    // ── Load workflow by ID ──────────────────────────────────────────────────
    useEffect(() => {
        const workflowId = routeId || new URLSearchParams(location.search).get('id');
        if (!workflowId || workflowId === 'new') return;

        const loadWorkflow = async () => {
            try {
                const token = await getAuthToken();
                const res = await fetch(`${API_URL}/workflows/${workflowId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Workflow not found");
                const w = await res.json();

                setTitle(w.name);
                setNodes(w.nodes || []);
                setEdges(w.edges || []);
                setCurrentWorkflowId(workflowId);
                setHasStarted(true);
                setIsDirty(false);

                showToast(`Workflow "${w.name}" loaded`, 'info');
            } catch (err) {
                console.error(err);
                showToast("Failed to load workflow", "error");
            }
        };
        loadWorkflow();
    }, [routeId, location.search, getAuthToken, API_URL]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const templateSlug = params.get('template');
        if (templateSlug && templateNodesData[templateSlug]) {
            const tpl = templateNodesData[templateSlug];
            setTitle(templateSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
            setNodes([]);
            setEdges([]);
            setHasStarted(true);

            tpl.nodes.forEach((node, idx) => {
                setTimeout(() => {
                    setNodes((nds) => [...nds, node]);
                    if (idx > 0 && tpl.edges?.[idx - 1]) {
                        setEdges((eds) => [
                            ...eds,
                            { ...tpl.edges[idx - 1], animated: false, style: { stroke: '#444', strokeWidth: 2 }, type: 'smoothstep' },
                        ]);
                    }
                }, idx * 150);
            });
        }
    }, [location, setNodes, setEdges]);

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        animated: false,
                        style: { stroke: '#444', strokeWidth: 2 },
                        type: 'smoothstep',
                        data: { condition: 'always' },
                    },
                    eds
                )
            ),
        [setEdges]
    );

    const handleEdgeClick = (event, edge) => {
        event.stopPropagation();
        setEdgeMenu({ edge, position: { x: event.clientX, y: event.clientY } });
    };

    const handleEdgeConditionSelect = (edgeId, condition) => {
        setEdges((eds) =>
            eds.map((e) =>
                e.id === edgeId
                    ? {
                        ...e,
                        data: { ...e.data, condition },
                        label: condition === 'always' ? '' : condition === 'errors_found' ? 'if errors' : 'if clean',
                        style: {
                            stroke: condition === 'errors_found' ? '#F87171' : condition === 'no_errors' ? '#6EE7B7' : '#444',
                            strokeWidth: 2,
                        },
                    }
                    : e
            )
        );
    };

    const handleSaveDraft = async () => {
        if (!user) {
            showToast('Log in to save.', 'error');
            return null;
        }
        try {
            const token = await getAuthToken();
            const body = { name: title, nodes, edges, status: 'draft' };
            let res;
            if (currentWorkflowId) {
                res = await fetch(`${API_URL}/workflows/${currentWorkflowId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(body),
                });
            } else {
                res = await fetch(`${API_URL}/workflows/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(body),
                });
            }
            if (!res.ok) throw new Error(`${res.status}`);
            const data = await res.json();

            // Handle different ID formats (UUID vs serial)
            const newId = data.id || data.workflow_id;
            setCurrentWorkflowId(newId);

            localStorage.setItem('devflow_has_workflow', 'true');
            setIsDirty(false);
            return newId;
        } catch (err) {
            showToast('Failed to save: ' + err.message, 'error');
            return null;
        }
    };

    const UNSUPPORTED_FEATURES = [
        { keywords: ['schedule', 'cron', 'every day', 'every night', 'every hour', 'at 2am', 'daily', 'weekly', 'interval'], feature: 'Scheduled Triggers' },
        { keywords: ['webhook', 'http trigger', 'api trigger'], feature: 'Webhook Triggers' },
        { keywords: ['discord'], feature: 'Discord Integration' },
        { keywords: ['twitter', 'tweet', 'x.com'], feature: 'Twitter/X Integration' },
        { keywords: ['whatsapp', 'telegram', 'sms'], feature: 'Messaging Apps' },
        { keywords: ['s3', 'aws', 'lambda', 'ec2'], feature: 'AWS Integration' },
        { keywords: ['stripe', 'payment', 'invoice'], feature: 'Stripe/Payments' },
    ];

    const checkUnsupportedFeatures = (promptText) => {
        const lower = promptText.toLowerCase();
        for (const { keywords, feature } of UNSUPPORTED_FEATURES) {
            if (keywords.some((k) => lower.includes(k))) return feature;
        }
        return null;
    };

    const handleRunPipeline = async (force = false) => {
        if (!user) {
            showToast('Log in to run.', 'error');
            return;
        }
        if (nodes.length === 0) {
            showToast('Build a pipeline first', 'error');
            return;
        }
        if (isRunning) {
            showToast('Pipeline is already running', 'info');
            return;
        }
        if (!force && currentWorkflowId && !isDirty) {
            setShowRerunModal(true);
            return;
        }

        const notifNodes = nodes.filter((n) => n.data?.type === 'notification' || n.type === 'notification');
        const missingContact = notifNodes.find((n) => !n.data?.email && !n.data?.slack_webhook && !n.data?.description?.includes('@'));
        if (missingContact) {
            showToast(`"${missingContact.data?.label || 'Notification'}" node needs an email or webhook — open it in the config panel.`, 'error');
            setNodes((nds) => nds.map((n) => (n.id === missingContact.id ? { ...n, data: { ...n.data, status: 'failed' } } : n)));
            setTimeout(() => setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: undefined } }))), 3000);
            return;
        }

        setIsRunning(true);

        const hasGithubNodes = nodes.some((n) => {
            const label = (n.data?.label || '').toLowerCase();
            const icon = n.data?.icon || '';
            return icon === 'git-branch' || ['github', 'commit', 'push', 'pr', 'branch'].some((k) => label.includes(k));
        });

        // Use Clerk user and backend settings
        const githubConnected = user?.externalAccounts?.some(acc => acc.provider === 'github');

        // If it's a manual PAT connection, we'll check via the backend
        let hasPAT = false;
        try {
            const token = await getAuthToken();
            const res = await fetch(`${API_URL}/github/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const settings = await res.json();
                hasPAT = !!settings.github_token;
            }
        } catch (e) {
            console.warn("Failed to check PAT settings", e);
        }

        if (hasGithubNodes && !githubConnected && !hasPAT) {
            showToast('This pipeline has GitHub nodes — connect GitHub in Integrations first', 'error');
            setIsRunning(false);
            return;
        }

        let workflowId = currentWorkflowId;
        if (!workflowId) {
            workflowId = await handleSaveDraft();
            if (!workflowId) {
                setIsRunning(false);
                return;
            }
        }

        try {
            const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
            const socket = new WebSocket(`${wsUrl}/ws/run/${user.id}`);

            socket.onopen = () => {
                showToast('Pipeline started...', 'info');
                const edgesWithCondition = edges.map((e) => ({ ...e, condition: e.data?.condition || 'always' }));
                socket.send(JSON.stringify({ workflow_id: workflowId, workflow_name: title, nodes, edges: edgesWithCondition, snapshot: { title, nodes, edges, prompt: lastPrompt } }));
            };

            socket.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === 'node_update') {
                    const log = msg.data;
                    setNodes((nds) => nds.map((n) => (n.id === log.node_id ? { ...n, data: { ...n.data, status: log.status } } : n)));
                    if (log.status === 'success') showToast(`✓ ${log.node_label}`, 'success');
                    if (log.status === 'failed') showToast(`✗ ${log.node_label}: ${log.message}`, 'error');
                } else if (msg.type === 'complete') {
                    const result = msg.data;
                    setIsDirty(false);
                    localStorage.setItem('devflow_has_run', 'true');
                    setTimeout(() => {
                        setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: undefined } })));
                    }, 3000);
                    showToast(`Pipeline ${result.status} — ${result.duration}`, result.status === 'success' ? 'success' : 'error');
                    setIsRunning(false);
                } else if (msg.type === 'error') {
                    showToast('Pipeline error: ' + msg.message, 'error');
                    setIsRunning(false);
                }
            };

            socket.onerror = () => {
                showToast('WebSocket error — falling back to HTTP', 'error');
                setIsRunning(false);
            };

            socket.onclose = () => {
                if (isRunning) setIsRunning(false);
            };
        } catch (err) {
            showToast('Failed to run: ' + err.message, 'error');
            setIsRunning(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        const unsupported = checkUnsupportedFeatures(prompt);
        if (unsupported) {
            setUnsupportedFeature(unsupported);
            return;
        }

        setHasStarted(true);
        setIsGenerating(true);
        setIsRecipeOpen(false);
        setIsSuggestionsOpen(false);
        setSelectedNode(null);
        setLastPrompt(prompt);

        let repoContext = '';
        try {
            const token = await getAuthToken();
            const res = await fetch(`${API_URL}/github/selected-repo`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const { repo: selectedRepo } = await res.json();
                if (selectedRepo?.full_name) {
                    const treeRes = await fetch(`${API_URL}/github/tree`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (treeRes.ok) {
                        const treeData = await treeRes.json();
                        repoContext = `\nThe user's GitHub repo is "${selectedRepo.full_name}" and contains these files: ${treeData.files.slice(0, 30).join(', ')}`;
                    }
                }
            }
        } catch (e) {
            console.warn('Could not fetch repo context', e);
        }

        const systemPrompt = `You are a workflow automation expert. Convert the user's description into a structured pipeline. Return ONLY valid JSON, no markdown:
{"name":"Short workflow name","nodes":[{"id":"1","type":"trigger|action|ai|notification","label":"Short Name","description":"What this step does","icon":"git-branch|zap|sparkles|bell|code|database|mail"}],"edges":[{"source":"1","target":"2","condition":"always|errors_found|no_errors"}]}
Rules: first node always trigger, max 8 nodes, labels 2-4 words.
For github/fix/commit nodes, always include the specific file path in the node description field based on what the user mentioned.${repoContext}
IMPORTANT: Use REAL file paths from the repo in description fields, not placeholder paths.
IMPORTANT: For email/notification nodes — success/no-error emails: label must be "All Clear" or "No Issues Found" or "Pipeline Succeeded". Error/failure emails: label must be "Error Alert" or "Fix Needed" or "Issues Detected".
IMPORTANT: For edges leading to email/notification nodes — if the email is for errors/failures, set condition="errors_found". If the email is for success/no-errors, set condition="no_errors". All other edges use condition="always".`;

        try {
            let raw;
            if (model === 'groq') {
                const apiKey = import.meta.env.VITE_GROQ_API_KEY;
                const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
                        max_tokens: 1024,
                        temperature: 0.7,
                    }),
                });
                const data = await res.json();
                raw = data.choices[0].message.content;
            } else {
                showToast(`${model.toUpperCase()} not available — using Groq instead`, 'info');
                const apiKey = import.meta.env.VITE_GROQ_API_KEY;
                const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
                        max_tokens: 1024,
                        temperature: 0.7,
                    }),
                });
                const data = await res.json();
                raw = data.choices[0].message.content;
            }

            const cleaned = raw.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            if (parsed.name) setTitle(parsed.name);

            setNodes([]);
            setEdges([]);

            const isMobile = window.innerWidth < 768;
            const nodeSpacingX = isMobile ? 220 : 300;
            const nodeSpacingY = isMobile ? 160 : 200;

            const childrenMap = {};
            const parentMap = {};

            (parsed.edges || []).forEach((e) => {
                if (!childrenMap[e.source]) childrenMap[e.source] = [];
                childrenMap[e.source].push(e.target);
                if (!parentMap[e.target]) parentMap[e.target] = [];
                parentMap[e.target].push(e.source);
            });

            const positions = {};

            const assignPosition = (nodeId, depth, branchIndex, totalSiblings) => {
                if (positions[nodeId]) return;
                const parentId = parentMap[nodeId]?.[0];
                const parentPos = positions[parentId];
                const yOffset = totalSiblings > 1 ? (branchIndex - (totalSiblings - 1) / 2) * nodeSpacingY : 0;
                const baseY = parentPos ? parentPos.y + yOffset : 200 + yOffset;
                positions[nodeId] = { x: 60 + depth * nodeSpacingX, y: baseY };

                const children = childrenMap[nodeId] || [];
                children.forEach((childId, idx) => assignPosition(childId, depth + 1, idx, children.length));
            };

            const rootNodes = parsed.nodes.filter((n) => !parentMap[n.id]);
            rootNodes.forEach((n, idx) => assignPosition(n.id, 0, idx, rootNodes.length));

            parsed.nodes.forEach((n, i) => {
                if (!positions[n.id]) positions[n.id] = { x: 60 + i * nodeSpacingX, y: 200 };
            });

            const spacedNodes = parsed.nodes.map((n) => ({
                id: n.id,
                type: 'custom',
                position: positions[n.id],
                data: { ...(n.data || n), model },
            }));

            const formattedEdges = (parsed.edges || []).map((e) => ({
                id: `e${e.source}-${e.target}-${Math.random().toString(36).slice(2, 7)}`,
                source: e.source,
                target: e.target,
                condition: e.condition || 'always',
                animated: false,
                style: { stroke: '#444', strokeWidth: 2 },
                type: 'smoothstep',
            }));

            spacedNodes.forEach((node, idx) => {
                setTimeout(() => {
                    setNodes((nds) => [...nds, node]);
                    if (idx > 0 && formattedEdges[idx - 1]) {
                        const edge = formattedEdges[idx - 1];
                        const condition = edge.condition || 'always';
                        setEdges((eds) => [
                            ...eds,
                            {
                                ...edge,
                                data: { ...edge.data, condition },
                                label: condition === 'always' ? '' : condition === 'errors_found' ? 'if errors' : 'if clean',
                                style: {
                                    stroke: condition === 'errors_found' ? '#F87171' : condition === 'no_errors' ? '#6EE7B7' : '#444',
                                    strokeWidth: 2,
                                },
                            },
                        ]);
                    }
                }, idx * 150);
            });

            showToast(`Pipeline generated — ${spacedNodes.length} steps`, 'success');
            setIsGenerating(false);

            setTimeout(() => pushHistory(spacedNodes, formattedEdges), spacedNodes.length * 150 + 100);
        } catch (err) {
            console.error(err);
            setIsGenerating(false);
            showToast('Generation failed — check prompt or API key', 'error');
        }
    };

    return (
        <div className="h-[100dvh] flex flex-col w-full overflow-hidden bg-[#080808]">
            <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none;}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
        @media(max-width:767px){.react-flow__controls{display:none!important;}}
      `}</style>

            {/* ── JOYRIDE TOUR ─────────────────────────────────────────────── */}
            <Joyride
                steps={TOUR_STEPS}
                run={tourRunning}
                continuous
                showSkipButton
                showProgress
                scrollToFirstStep={false}
                disableScrolling
                callback={handleTourCallback}
                styles={joyrideStyles}
                locale={{ back: '← Back', close: 'Close', last: 'Done ✓', next: 'Next →', skip: 'Skip tour' }}
            />

            <TopBar title={title}>
                <div className="flex items-center gap-2">
                    {/* Help / restart tour */}
                    <button
                        onClick={() => {
                            localStorage.removeItem('devflow_tour_seen');
                            setTourRunning(true);
                        }}
                        className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] text-[#444] hover:text-[#6EE7B7] hover:border-[#6EE7B7]/30 transition-colors"
                        title="Restart tour"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={handleSaveDraft}
                        className="tour-save flex items-center gap-1.5 font-mono text-[10px] md:text-xs text-[#64748B] hover:text-[#F1F5F9] border border-[#222] px-2.5 md:px-3 py-1.5 transition-colors rounded-xl bg-[#111]"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save</span>
                    </button>

                    <button
                        onClick={handleRunPipeline}
                        disabled={isRunning}
                        className="tour-run flex items-center gap-1.5 font-mono text-[10px] md:text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] px-3.5 md:px-4 py-1.5 transition-colors rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isRunning ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" />
                        ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
                    </button>
                </div>
            </TopBar>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Recipe Drawer */}
                <AnimatePresence>
                    {isRecipeOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" onClick={() => setIsRecipeOpen(false)} />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                                className="absolute left-0 top-0 bottom-0 w-[280px] md:w-[320px] bg-[#0D0D0D] border-r border-[#222] z-[101] overflow-hidden shadow-2xl flex flex-col"
                            >
                                <div className="h-14 flex items-center justify-between px-5 border-b border-[#222] shrink-0">
                                    <span className="font-mono text-xs text-[#6EE7B7] uppercase font-bold tracking-widest">Recipe_Library</span>
                                    <button onClick={() => setIsRecipeOpen(false)} className="text-[#64748B] hover:text-[#F1F5F9]">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {RECIPES.map((r) => (
                                        <button
                                            key={r.title}
                                            onClick={() => {
                                                setPrompt(r.desc);
                                                setIsRecipeOpen(false);
                                            }}
                                            className="w-full text-left bg-[#111] border border-[#1A1A1A] hover:border-[#6EE7B7]/40 rounded-xl p-4 transition-all group"
                                        >
                                            <div className="font-mono text-xs text-[#F1F5F9] group-hover:text-[#6EE7B7] mb-1 font-bold">{r.title}</div>
                                            <div className="font-mono text-[10px] text-[#64748B] leading-relaxed mb-2">{r.desc}</div>
                                            <span className="font-mono text-[9px] text-[#64748B] bg-[#0D0D0D] border border-[#222] px-2 py-0.5 rounded-full">{r.tag}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Suggestions Drawer */}
                <AnimatePresence>
                    {isSuggestionsOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" onClick={() => setIsSuggestionsOpen(false)} />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                                className="absolute right-0 top-0 bottom-0 w-[280px] md:w-[320px] bg-[#0D0D0D] border-l border-[#222] z-[101] overflow-hidden shadow-2xl flex flex-col"
                            >
                                <div className="h-14 flex items-center justify-between px-5 border-b border-[#222] shrink-0">
                                    <span className="font-mono text-xs text-[#6EE7B7] uppercase font-bold tracking-widest">Suggestions</span>
                                    <button onClick={() => setIsSuggestionsOpen(false)} className="text-[#64748B] hover:text-[#F1F5F9]">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s.label}
                                            onClick={() => {
                                                setPrompt(s.prompt);
                                                setIsSuggestionsOpen(false);
                                            }}
                                            className="w-full text-left bg-[#111] border border-[#1A1A1A] hover:border-[#6EE7B7]/40 rounded-xl p-4 transition-all group"
                                        >
                                            <div className="font-mono text-xs text-[#F1F5F9] group-hover:text-[#6EE7B7] mb-1 font-bold">{s.label}</div>
                                            <div className="font-mono text-[10px] text-[#64748B] leading-relaxed">{s.prompt}</div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Node Edit Panel */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-[280px] md:w-[320px] bg-[#0D0D0D] border-l border-[#222] z-20 flex flex-col shadow-2xl"
                        >
                            <div className="h-14 border-b border-[#222] flex items-center justify-between px-5 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                            background:
                                                selectedNode.data.type === 'trigger'
                                                    ? '#6EE7B7'
                                                    : selectedNode.data.type === 'ai'
                                                        ? '#A78BFA'
                                                        : selectedNode.data.type === 'notification'
                                                            ? '#F59E0B'
                                                            : '#64748B',
                                        }}
                                    />
                                    <h3 className="font-mono text-xs font-semibold text-[#F1F5F9] uppercase tracking-widest">
                                        {selectedNode.data.type || 'action'}_config
                                    </h3>
                                </div>
                                <button onClick={() => setSelectedNode(null)} className="text-[#64748B] hover:text-[#F1F5F9]">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5 flex-1 overflow-y-auto space-y-4">
                                <div>
                                    <label className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider mb-2 block">Step Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-xs font-mono text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 transition-colors"
                                        value={selectedNode.data.label || ''}
                                        onChange={(e) => {
                                            const updated = { ...selectedNode, data: { ...selectedNode.data, label: e.target.value } };
                                            setSelectedNode(updated);
                                            setNodes((nds) => nds.map((n) => (n.id === selectedNode.id ? updated : n)));
                                            setIsDirty(true);
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider mb-2 block">Description / Instructions</label>
                                    <textarea
                                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-xs font-mono text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 transition-colors min-h-[80px] resize-none"
                                        value={selectedNode.data.description || ''}
                                        onChange={(e) => {
                                            const updated = { ...selectedNode, data: { ...selectedNode.data, description: e.target.value } };
                                            setSelectedNode(updated);
                                            setNodes((nds) => nds.map((n) => (n.id === selectedNode.id ? updated : n)));
                                            setIsDirty(true);
                                        }}
                                        placeholder="Describe what this step should do..."
                                    />
                                </div>

                                {(selectedNode.data.type === 'notification' || selectedNode.data.type === 'action') && (
                                    <div>
                                        <label className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider mb-2 block">Recipient Email (optional)</label>
                                        <input
                                            type="email"
                                            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-xs font-mono text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 transition-colors"
                                            value={selectedNode.data.email || ''}
                                            onChange={(e) => {
                                                const updated = { ...selectedNode, data: { ...selectedNode.data, email: e.target.value } };
                                                setSelectedNode(updated);
                                                setNodes((nds) => nds.map((n) => (n.id === selectedNode.id ? updated : n)));
                                                setIsDirty(true);
                                            }}
                                            placeholder="notify@yourteam.com"
                                        />
                                        <p className="font-mono text-[10px] text-[#444] mt-1.5">If set, this step will send an email when executed</p>
                                    </div>
                                )}

                                {selectedNode.data.type === 'ai' && (
                                    <div>
                                        <label className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider mb-2 block">AI Model</label>
                                        <select
                                            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-xs font-mono text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 transition-colors cursor-pointer"
                                            value={selectedNode.data.model || 'groq'}
                                            onChange={(e) => {
                                                const updated = { ...selectedNode, data: { ...selectedNode.data, model: e.target.value } };
                                                setSelectedNode(updated);
                                                setNodes((nds) => nds.map((n) => (n.id === selectedNode.id ? updated : n)));
                                                setIsDirty(true);
                                            }}
                                        >
                                            <option value="groq">⚡ Groq — Llama 3.3 70B</option>
                                            <option value="gpt4">🤖 GPT-4o — OpenAI</option>
                                            <option value="gemini">✨ Gemini 2.0 Flash</option>
                                        </select>
                                    </div>
                                )}

                                {selectedNode.data.type === 'trigger' && (
                                    <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-4 space-y-2">
                                        <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest">Trigger Info</p>
                                        <p className="font-mono text-[10px] text-[#444] leading-relaxed">
                                            This node starts the pipeline. Connect GitHub webhooks in Integrations to auto-trigger on push, PR, or issue events.
                                        </p>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-[#1A1A1A]">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] text-[#444]">Node ID</span>
                                        <span className="font-mono text-[10px] text-[#333]">{selectedNode.id}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="font-mono text-[10px] text-[#444]">Type</span>
                                        <span
                                            className="font-mono text-[10px]"
                                            style={{
                                                color:
                                                    selectedNode.data.type === 'trigger'
                                                        ? '#6EE7B7'
                                                        : selectedNode.data.type === 'ai'
                                                            ? '#A78BFA'
                                                            : selectedNode.data.type === 'notification'
                                                                ? '#F59E0B'
                                                                : '#94A3B8',
                                            }}
                                        >
                                            {selectedNode.data.type || 'action'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-[#222] shrink-0 bg-[#080808] space-y-2">
                                <button
                                    onClick={() => {
                                        setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                                        setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
                                        setSelectedNode(null);
                                        setIsDirty(true);
                                        showToast('Step removed', 'info');
                                    }}
                                    className="w-full font-mono text-xs font-bold text-[#F87171] bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/30 py-2.5 transition-colors rounded-xl"
                                >
                                    Remove Step
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Canvas */}
                <div className="flex-1 relative overflow-hidden" style={{ width: selectedNode ? 'calc(100% - 320px)' : '100%', transition: 'width 0.3s ease' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={(_, node) => setSelectedNode(node)}
                        onEdgeClick={handleEdgeClick}
                        onPaneClick={() => {
                            setSelectedNode(null);
                            setEdgeMenu({ edge: null, position: { x: 0, y: 0 } });
                        }}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.3, minZoom: 0.4, maxZoom: 1.2 }}
                        defaultEdgeOptions={{ animated: false, style: { stroke: '#444', strokeWidth: 2 }, type: 'smoothstep' }}
                        className="bg-[#080808] w-full h-full"
                        nodesDraggable={!isCanvasLocked}
                        nodesConnectable={!isCanvasLocked}
                        elementsSelectable={!isCanvasLocked}
                        panOnDrag={!isCanvasLocked}
                        zoomOnScroll={!isCanvasLocked}
                        zoomOnPinch={!isCanvasLocked}
                    >
                        <Background color="#1A1A1A" gap={25} size={1} />
                        <CustomCanvasControls isLocked={isCanvasLocked} setIsLocked={setIsCanvasLocked} onUndo={handleUndo} onRedo={handleRedo} hasNodes={nodes.length > 0} />
                        <RepoBranchPanel user={user} />
                        <AddNodePanel setNodes={setNodes} setIsDirty={setIsDirty} showToast={showToast} />

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-6">
                            <span className="font-mono font-extrabold uppercase text-center leading-none tracking-tighter text-[#111] opacity-50" style={{ fontSize: 'clamp(32px, 10vw, 120px)' }}>
                                describe your<br />workflow below
                            </span>
                        </div>
                    </ReactFlow>
                </div>

                <EdgeConditionMenu edge={edgeMenu.edge} position={edgeMenu.position} onSelect={handleEdgeConditionSelect} onClose={() => setEdgeMenu({ edge: null, position: { x: 0, y: 0 } })} />
            </div>

            {/* Prompt Input Bar */}
            <div
                className={`fixed left-0 right-0 z-[50] px-4 md:px-8 flex justify-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${hasStarted ? 'bottom-6 md:bottom-10 pb-[env(safe-area-inset-bottom,0px)]' : 'top-1/2 -translate-y-1/2'
                    }`}
            >
                <div className="w-full max-w-2xl pointer-events-auto">
                    <AnimatePresence>
                        {!hasStarted && (
                            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, y: 10 }} className="w-full flex flex-wrap justify-center gap-2 mb-3 px-2">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s.label}
                                        onClick={() => setPrompt(s.prompt)}
                                        className="bg-[#111]/80 backdrop-blur-md hover:bg-[#1A1A1A] border border-[#222] text-[#64748B] hover:text-[#F1F5F9] font-mono text-[10px] md:text-[11px] px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all shadow-lg"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <UnifiedPromptBox
                        prompt={prompt}
                        setPrompt={setPrompt}
                        model={model}
                        setModel={setModel}
                        isGenerating={isGenerating}
                        handleGenerate={handleGenerate}
                        onToggleRecipes={() => setIsRecipeOpen(!isRecipeOpen)}
                        isRecipeOpen={isRecipeOpen}
                        onToggleSuggestions={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
                        isSuggestionsOpen={isSuggestionsOpen}
                        hasStarted={hasStarted}
                    />
                </div>
            </div>

            {/* Unsupported Feature Modal */}
            <AnimatePresence>
                {unsupportedFeature && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)' }}
                        onClick={() => setUnsupportedFeature(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0D0D0D] border border-[#222] rounded-2xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mx-auto">
                                    <span className="text-2xl">🚧</span>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="font-mono text-sm font-bold text-[#F1F5F9]">Not Integrated Yet</h3>
                                    <p className="font-mono text-xs text-[#64748B] leading-relaxed">
                                        <span className="text-[#F59E0B] font-semibold">{unsupportedFeature}</span> is on our roadmap but hasn't been integrated yet. We're working on it!
                                    </p>
                                    <p className="font-mono text-[10px] text-[#444]">Try a workflow using GitHub, Slack, Notion, Linear, Jira, or email instead.</p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setUnsupportedFeature(null)}
                                        className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2.5 rounded-xl hover:border-[#333] transition-all"
                                    >
                                        Got it
                                    </button>
                                    <button
                                        onClick={() => setUnsupportedFeature(null)}
                                        className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2.5 rounded-xl transition-all"
                                    >
                                        Try Anyway
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Re-run confirm modal */}
            <AnimatePresence>
                {showRerunModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
                        style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 flex items-center justify-center">
                                    <Play className="w-4 h-4 text-[#6EE7B7]" />
                                </div>
                                <h3 className="font-mono text-sm font-bold text-[#F1F5F9]">Run same pipeline?</h3>
                            </div>
                            <p className="font-mono text-xs text-[#64748B] mb-5">This pipeline hasn't changed since the last run. Run it again anyway?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRerunModal(false)}
                                    className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2.5 rounded-xl hover:border-[#444] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRerunModal(false);
                                        handleRunPipeline(true);
                                    }}
                                    className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2.5 rounded-xl transition-colors"
                                >
                                    Run Anyway
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}// force redeploy
