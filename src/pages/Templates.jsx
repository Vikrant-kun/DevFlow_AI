import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Sparkles, Code, GitBranch, Bug, RefreshCcw, Bell,
    ArrowRight, Zap, Database, Mail, X, Cpu, Clock, Users,
    Layers, Fingerprint, Activity, Terminal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { cn } from '../lib/utils';

// ── CONFIG & DATA (LOGIC PRESERVED) ──────────────────────────────────────────

const iconMap = {
    'git-branch': GitBranch, 'zap': Zap, 'sparkles': Sparkles,
    'bell': Bell, 'code': Code, 'database': Database, 'mail': Mail,
    'play': Play, 'trigger': GitBranch, 'action': Zap, 'ai': Cpu, 'notification': Bell
};

const typeColors = {
    trigger: { color: '#6EE7B7', bg: 'rgba(110,231,183,0.05)', border: 'rgba(110,231,183,0.1)' },
    action: { color: '#94A3B8', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.1)' },
    ai: { color: '#A78BFA', bg: 'rgba(167,139,250,0.05)', border: 'rgba(167,139,250,0.1)' },
    notification: { color: '#F59E0B', bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.1)' },
};

const templates = [
    { title: 'Deploy Pipeline', slug: 'deploy-pipeline', desc: 'Auto-deploy to AWS ECS on every merge to main. Runs tests, builds a Docker image, deploys, and notifies your team.', icon: Play, category: 'DevOps', tags: ['GitHub', 'Docker', 'AWS', 'Slack'], steps: 5, uses: '2.4k' },
    { title: 'Code Review Bot', slug: 'code-review-automation', desc: 'AI-powered PR reviews. Fetches the diff, runs Claude analysis, and posts line-by-line comments automatically.', icon: Sparkles, category: 'AI', tags: ['GitHub', 'Claude', 'PRs'], steps: 4, uses: '1.8k' },
    { title: 'Release Notes Generator', slug: 'release-notes-generator', desc: 'Draft polished GitHub releases from your commit history. AI categorizes features, fixes, and breaking changes.', icon: Code, category: 'AI', tags: ['GitHub', 'Claude', 'Releases'], steps: 4, uses: '980' },
    { title: 'Bug Report Handler', slug: 'bug-report-handler', desc: 'Triage incoming bug reports with AI severity scoring, mirror to Jira, and page the on-call engineer if critical.', icon: Bug, category: 'Triage', tags: ['Jira', 'PagerDuty', 'AI'], steps: 4, uses: '1.2k' },
    { title: 'PR Review Reminder', slug: 'pr-review-reminder', desc: 'Daily check for PRs stagnant over 48 hours. Automatically pings assigned reviewers on Slack to unblock the team.', icon: Bell, category: 'Automation', tags: ['GitHub', 'Slack', 'Scheduled'], steps: 3, uses: '3.1k' },
    { title: 'Staging Env Sync', slug: 'staging-environment-sync', desc: 'Nightly production → staging sync with AI-powered PII scrubbing. Keeps your QA environment fresh and safe.', icon: RefreshCcw, category: 'DevOps', tags: ['Database', 'AI', 'Scheduled'], steps: 5, uses: '760' },
];

const templateNodes = {
    'deploy-pipeline': {
        nodes: [
            { id: '1', data: { type: 'trigger', label: 'Push to Main', icon: 'git-branch' } },
            { id: '2', data: { type: 'action', label: 'Run Unit Tests', icon: 'zap' } },
            { id: '3', data: { type: 'action', label: 'Build Docker Image', icon: 'database' } },
            { id: '4', data: { type: 'action', label: 'Deploy to ECS', icon: 'play' } },
            { id: '5', data: { type: 'notification', label: 'Notify Engineering', icon: 'mail' } },
        ]
    },
    'code-review-automation': {
        nodes: [
            { id: '1', data: { type: 'trigger', label: 'PR Opened', icon: 'git-branch' } },
            { id: '2', data: { type: 'action', label: 'Fetch PR Diff', icon: 'code' } },
            { id: '3', data: { type: 'ai', label: 'Claude Review', icon: 'sparkles' } },
            { id: '4', data: { type: 'action', label: 'Post Comments', icon: 'mail' } },
        ]
    },
    'release-notes-generator': {
        nodes: [
            { id: '1', data: { type: 'trigger', label: 'Release Tagged', icon: 'play' } },
            { id: '2', data: { type: 'action', label: 'Get Commits', icon: 'code' } },
            { id: '3', data: { type: 'ai', label: 'Draft Release Notes', icon: 'sparkles' } },
            { id: '4', data: { type: 'action', label: 'Publish Release', icon: 'database' } },
        ]
    },
    'bug-report-handler': {
        nodes: [
            { id: '1', data: { type: 'trigger', label: 'Bug Created', icon: 'code' } },
            { id: '2', data: { type: 'ai', label: 'Triage Priority', icon: 'sparkles' } },
            { id: '3', data: { type: 'action', label: 'Create Jira Ticket', icon: 'database' } },
            { id: '4', data: { type: 'notification', label: 'Alert On-Call', icon: 'mail' } },
        ]
    },
    'pr-review-reminder': {
        nodes: [
            { id: '1', data: { type: 'trigger', label: 'Schedule: Daily', icon: 'zap' } },
            { id: '2', data: { type: 'action', label: 'Find Stale PRs', icon: 'database' } },
            { id: '3', data: { type: 'notification', label: 'DM Reviewers', icon: 'mail' } },
        ]
    },
    'staging-environment-sync': {
        nodes: [
            { id: '1', data: { type: 'trigger', label: 'Schedule: Nightly', icon: 'zap' } },
            { id: '2', data: { type: 'action', label: 'Snapshot Production', icon: 'database' } },
            { id: '3', data: { type: 'ai', label: 'Scrub PII', icon: 'sparkles' } },
            { id: '4', data: { type: 'action', label: 'Restore to Staging', icon: 'play' } },
            { id: '5', data: { type: 'notification', label: 'Slack Alert', icon: 'mail' } },
        ]
    }
};

const CATEGORIES = ['All', 'DevOps', 'AI', 'Automation', 'Triage'];

// ── REFINED PIPELINE PREVIEW ─────────────────────────────────────────────────

const PipelinePreview = ({ slug }) => {
    const data = templateNodes[slug];
    if (!data) return null;
    return (
        <div className="flex items-center gap-1.5 flex-wrap opacity-60 group-hover:opacity-100 transition-opacity duration-500">
            {data.nodes.map((node, i) => {
                const cfg = typeColors[node.data.type] || typeColors.action;
                const Icon = iconMap[node.data.icon] || iconMap[node.data.type] || Zap;
                return (
                    <div key={i} className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center border"
                            style={{ background: cfg.bg, borderColor: cfg.border }}>
                            <Icon className="w-2.5 h-2.5" style={{ color: cfg.color }} />
                        </div>
                        {i < data.nodes.length - 1 && (
                            <div className="w-2 h-px bg-[#1A1A1A] shrink-0" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ── UPGRADED DETAIL MODAL ─────────────────────────────────────────────────────

const TemplateModal = ({ tpl, onClose, onUse }) => {
    if (!tpl) return null;
    const Icon = tpl.icon;
    const data = templateNodes[tpl.slug];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25 }}
                className="w-full max-w-2xl bg-[#0D0D0D] border border-[#222] rounded-[32px] shadow-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()}>

                <div className="absolute top-0 left-0 w-full h-1 bg-[#6EE7B7]" />

                <div className="flex items-start justify-between px-8 py-6 border-b border-[#1A1A1A] bg-[#111]/20">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center shadow-inner group">
                            <Icon className="w-6 h-6 text-[#6EE7B7] group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h3 className="font-mono text-lg font-bold text-[#F1F5F9] lowercase tracking-tighter">{tpl.title}</h3>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="font-mono text-[10px] font-bold text-[#6EE7B7] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#6EE7B7]/5 border border-[#6EE7B7]/10">
                                    {tpl.category}
                                </span>
                                <div className="flex items-center gap-1.5 text-[#444] font-mono text-[10px]">
                                    <Fingerprint size={12} />
                                    <span>V_0.1.2</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[#444]" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="space-y-4">
                        <p className="font-mono text-xs text-[#64748B] leading-relaxed max-w-xl">
                            {tpl.desc}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {tpl.tags.map(tag => (
                                <span key={tag} className="font-mono text-[9px] text-[#333] border border-[#1A1A1A] px-2.5 py-1 rounded-lg lowercase tracking-tighter">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="font-mono text-[10px] text-[#333] uppercase tracking-[0.25em]">Workflow_Architecture</p>
                            <span className="font-mono text-[10px] text-[#444]">{data?.nodes.length} segments</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {data?.nodes.map((node, i) => {
                                const cfg = typeColors[node.data.type] || typeColors.action;
                                const NodeIcon = iconMap[node.data.icon] || iconMap[node.data.type] || Zap;
                                return (
                                    <div key={i} className="flex items-center gap-4 bg-[#080808] border border-[#1A1A1A] rounded-2xl px-4 py-3 hover:border-[#333] transition-colors group">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all"
                                            style={{ background: cfg.bg, borderColor: cfg.border }}>
                                            <NodeIcon className="w-4 h-4" style={{ color: cfg.color }} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-mono text-[11px] font-bold text-[#F1F5F9] truncate">{node.data.label}</p>
                                            <p className="font-mono text-[9px] text-[#333] uppercase tracking-tighter mt-0.5">{node.data.type}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8 flex gap-4">
                    <button onClick={onClose}
                        className="flex-1 font-mono text-[11px] font-bold text-[#444] border border-[#1A1A1A] py-4 rounded-2xl hover:bg-[#111] transition-all uppercase tracking-widest">
                        Decline
                    </button>
                    <button onClick={() => onUse(tpl.slug)}
                        className="flex-1 font-mono text-[11px] font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(110,231,183,0.15)] flex items-center justify-center gap-2 uppercase tracking-widest">
                        Initialize
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── UPGRADED TEMPLATE CARD ───────────────────────────────────────────────────

const TemplateCard = forwardRef(({ tpl, onPreview, onUse, index }, ref) => {
    const Icon = tpl.icon;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
            className="group relative bg-[#0D0D0D] border border-[#1A1A1A] hover:border-[#6EE7B7]/20 rounded-3xl p-6 flex flex-col gap-6 cursor-pointer transition-all duration-500 overflow-hidden"
            onClick={() => onPreview(tpl)}
        >

            {/* Texture background */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#1A1A1A] group-hover:border-[#6EE7B7]/30 group-hover:shadow-[0_0_15px_rgba(110,231,183,0.1)] flex items-center justify-center transition-all">
                    <Icon className="w-5 h-5 text-[#444] group-hover:text-[#6EE7B7] transition-colors" />
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    <span className="font-mono text-[9px] text-[#6EE7B7] px-2 py-0.5 rounded-full bg-[#6EE7B7]/5 border border-[#6EE7B7]/10 uppercase font-bold tracking-widest">
                        {tpl.category}
                    </span>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#333]">
                        <Activity size={10} />
                        {tpl.uses} uses
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-2">
                <h3 className="font-mono text-sm font-bold text-[#E2E8F0] group-hover:text-white transition-colors leading-tight">
                    {tpl.title}
                </h3>
                <p className="font-mono text-[11px] text-[#555] leading-relaxed line-clamp-2">
                    {tpl.desc}
                </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#111] mt-auto">
                <PipelinePreview slug={tpl.slug} />
            </div>

            <div className="relative z-10 flex items-center justify-between pt-1">
                <span className="font-mono text-[9px] text-[#333] uppercase tracking-widest">
                    {tpl.steps} segments
                </span>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onUse(tpl.slug);
                    }}
                    className="font-mono text-[10px] font-bold text-[#6EE7B7] flex items-center gap-2 hover:translate-x-1 transition-transform uppercase tracking-tighter"
                >
                    Init_Draft <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>

        </motion.div>
    );
});

// ── MAIN ARCHIVE VIEW ─────────────────────────────────────────────────────────

const Templates = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All');
    const [previewTpl, setPreviewTpl] = useState(null);

    const handleUse = (slug) => {
        navigate(`/workflows/new?template=${slug}`);
    };

    const displayed = templates.filter(t =>
        activeCategory === 'All' || t.category === activeCategory
    );

    return (
        <div className="flex flex-col h-screen bg-[#080808] text-[#F1F5F9] overflow-hidden">
            <TopBar title={<span className="font-mono text-xs text-[#6EE7B7] tracking-widest uppercase">/ template_archive</span>} />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 pb-24">

                    {/* Header Ribbon */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#6EE7B7] rounded-full shadow-[0_0_15px_#6EE7B7]" />
                                <h2 className="text-3xl font-mono font-bold lowercase tracking-tighter">Blueprint Library</h2>
                            </div>
                            <p className="font-mono text-xs text-[#64748B] leading-relaxed max-w-lg">
                                Industrial-grade automation archetypes. Hydrate a blueprint into the builder to begin customization.
                            </p>
                        </div>
                    </div>

                    {/* Filter Array */}
                    <div className="flex items-center gap-2 flex-wrap border-b border-[#111] pb-6">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "font-mono text-[10px] font-bold px-4 py-2 rounded-xl border transition-all uppercase tracking-widest",
                                    activeCategory === cat
                                        ? 'bg-[#6EE7B7]/5 border-[#6EE7B7]/20 text-[#6EE7B7]'
                                        : 'bg-[#0D0D0D] border-[#1A1A1A] text-[#444] hover:text-[#F1F5F9] hover:border-[#333]'
                                )}>
                                {cat}
                                {cat !== 'All' && (
                                    <span className="ml-2 text-[9px] opacity-40">
                                        [{templates.filter(t => t.category === cat).length}]
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Grid Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence mode="popLayout">
                            {displayed.map((tpl, i) => (
                                <TemplateCard key={tpl.slug} tpl={tpl} index={i} onPreview={setPreviewTpl} onUse={handleUse} />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Generative CTA */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="relative group border border-dashed border-[#1A1A1A] hover:border-[#6EE7B7]/30 rounded-[32px] p-12 text-center space-y-6 transition-all bg-gradient-to-b from-transparent to-[#0A0A0A]">
                        <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#1A1A1A] flex items-center justify-center mx-auto group-hover:shadow-[0_0_20px_rgba(110,231,183,0.05)] transition-all">
                            <Terminal className="w-6 h-6 text-[#333] group-hover:text-[#6EE7B7] transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <p className="font-mono text-sm font-bold text-[#F1F5F9] uppercase tracking-widest">Custom Sequence Protocol</p>
                            <p className="font-mono text-xs text-[#444] max-w-md mx-auto">None of these blueprints fit? Define a unique workflow using natural language processing.</p>
                        </div>
                        <button onClick={() => navigate('/workflows/new')}
                            className="inline-flex items-center gap-3 font-mono text-[11px] font-bold bg-[#111] text-[#6EE7B7] border border-[#6EE7B7]/20 hover:bg-[#6EE7B7]/5 px-8 py-3 rounded-2xl transition-all uppercase tracking-[0.2em]">
                            <Zap className="w-4 h-4" />
                            Launch Compiler
                        </button>
                    </motion.div>

                </div>
            </div>

            <AnimatePresence>
                {previewTpl && <TemplateModal tpl={previewTpl} onClose={() => setPreviewTpl(null)} onUse={handleUse} />}
            </AnimatePresence>
        </div>
    );
};

export default Templates;