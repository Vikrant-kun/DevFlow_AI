import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Sparkles, Code, GitBranch, Bug, RefreshCcw, Bell,
    ArrowRight, Zap, Database, Mail, X, Cpu, Clock, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

// ── DATA ──────────────────────────────────────────────────────────────────────

const iconMap = {
    'git-branch': GitBranch, 'zap': Zap, 'sparkles': Sparkles,
    'bell': Bell, 'code': Code, 'database': Database, 'mail': Mail,
    'play': Play, 'trigger': GitBranch, 'action': Zap, 'ai': Cpu, 'notification': Bell
};

const typeColors = {
    trigger: { color: '#6EE7B7', bg: 'rgba(110,231,183,0.08)', border: 'rgba(110,231,183,0.2)' },
    action: { color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' },
    ai: { color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
    notification: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
};

const templates = [
    {
        title: 'Deploy Pipeline',
        slug: 'deploy-pipeline',
        desc: 'Auto-deploy to AWS ECS on every merge to main. Runs tests, builds a Docker image, deploys, and notifies your team.',
        icon: Play,
        category: 'DevOps',
        tags: ['GitHub', 'Docker', 'AWS', 'Slack'],
        steps: 5,
        uses: '2.4k',
    },
    {
        title: 'Code Review Bot',
        slug: 'code-review-automation',
        desc: 'AI-powered PR reviews. Fetches the diff, runs Claude analysis, and posts line-by-line comments automatically.',
        icon: Sparkles,
        category: 'AI',
        tags: ['GitHub', 'Claude', 'PRs'],
        steps: 4,
        uses: '1.8k',
    },
    {
        title: 'Release Notes Generator',
        slug: 'release-notes-generator',
        desc: 'Draft polished GitHub releases from your commit history. AI categorizes features, fixes, and breaking changes.',
        icon: Code,
        category: 'AI',
        tags: ['GitHub', 'Claude', 'Releases'],
        steps: 4,
        uses: '980',
    },
    {
        title: 'Bug Report Handler',
        slug: 'bug-report-handler',
        desc: 'Triage incoming bug reports with AI severity scoring, mirror to Jira, and page the on-call engineer if critical.',
        icon: Bug,
        category: 'Triage',
        tags: ['Jira', 'PagerDuty', 'AI'],
        steps: 4,
        uses: '1.2k',
    },
    {
        title: 'PR Review Reminder',
        slug: 'pr-review-reminder',
        desc: 'Daily check for PRs stagnant over 48 hours. Automatically pings assigned reviewers on Slack to unblock the team.',
        icon: Bell,
        category: 'Automation',
        tags: ['GitHub', 'Slack', 'Scheduled'],
        steps: 3,
        uses: '3.1k',
    },
    {
        title: 'Staging Env Sync',
        slug: 'staging-environment-sync',
        desc: 'Nightly production → staging sync with AI-powered PII scrubbing. Keeps your QA environment fresh and safe.',
        icon: RefreshCcw,
        category: 'DevOps',
        tags: ['Database', 'AI', 'Scheduled'],
        steps: 5,
        uses: '760',
    },
];

const CATEGORIES = ['All', 'DevOps', 'AI', 'Automation', 'Triage'];

const templateNodes = {
    'deploy-pipeline': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'Push to Main', description: 'Triggers on merge to main branch', icon: 'git-branch' } },
            { id: '2', type: 'custom', position: { x: 480, y: 250 }, data: { type: 'action', label: 'Run Unit Tests', description: 'Execute Jest test suite', icon: 'zap' } },
            { id: '3', type: 'custom', position: { x: 860, y: 250 }, data: { type: 'action', label: 'Build Docker Image', description: 'Build and tag container image', icon: 'database' } },
            { id: '4', type: 'custom', position: { x: 1240, y: 250 }, data: { type: 'action', label: 'Deploy to ECS', description: 'Update ECS service with new image', icon: 'play' } },
            { id: '5', type: 'custom', position: { x: 1620, y: 250 }, data: { type: 'notification', label: 'Notify Engineering', description: 'Alert #engineering on success/fail', icon: 'mail' } },
        ],
        edges: [{ source: '1', target: '2' }, { source: '2', target: '3' }, { source: '3', target: '4' }, { source: '4', target: '5' }],
    },
    'code-review-automation': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'PR Opened', description: 'Triggers when a new PR is opened', icon: 'git-branch' } },
            { id: '2', type: 'custom', position: { x: 480, y: 250 }, data: { type: 'action', label: 'Fetch PR Diff', description: 'Get changed files and lines', icon: 'code' } },
            { id: '3', type: 'custom', position: { x: 860, y: 250 }, data: { type: 'ai', label: 'Claude Review', description: 'Analyze code for bugs and style issues', icon: 'sparkles' } },
            { id: '4', type: 'custom', position: { x: 1240, y: 250 }, data: { type: 'action', label: 'Post Comments', description: 'Add line-by-line review comments', icon: 'mail' } },
        ],
        edges: [{ source: '1', target: '2' }, { source: '2', target: '3' }, { source: '3', target: '4' }],
    },
    'release-notes-generator': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'Release Tagged', description: 'Triggers on new semantic version tag', icon: 'play' } },
            { id: '2', type: 'custom', position: { x: 480, y: 250 }, data: { type: 'action', label: 'Get Commits', description: 'Fetch commits since last release tag', icon: 'code' } },
            { id: '3', type: 'custom', position: { x: 860, y: 250 }, data: { type: 'ai', label: 'Draft Release Notes', description: 'Categorize features and fixes', icon: 'sparkles' } },
            { id: '4', type: 'custom', position: { x: 1240, y: 250 }, data: { type: 'action', label: 'Publish Release', description: 'Create GitHub release draft', icon: 'database' } },
        ],
        edges: [{ source: '1', target: '2' }, { source: '2', target: '3' }, { source: '3', target: '4' }],
    },
    'bug-report-handler': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'Bug Created', description: 'Triggers on issue labeled "bug"', icon: 'code' } },
            { id: '2', type: 'custom', position: { x: 480, y: 250 }, data: { type: 'ai', label: 'Triage Priority', description: 'Determine severity from description', icon: 'sparkles' } },
            { id: '3', type: 'custom', position: { x: 860, y: 250 }, data: { type: 'action', label: 'Create Jira Ticket', description: 'Mirror bug to internal tracker', icon: 'database' } },
            { id: '4', type: 'custom', position: { x: 1240, y: 250 }, data: { type: 'notification', label: 'Alert On-Call', description: 'Page PagerDuty if critical', icon: 'mail' } },
        ],
        edges: [{ source: '1', target: '2' }, { source: '2', target: '3' }, { source: '3', target: '4' }],
    },
    'pr-review-reminder': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'Schedule: Daily', description: 'Runs every day at 9:00 AM', icon: 'zap' } },
            { id: '2', type: 'custom', position: { x: 480, y: 250 }, data: { type: 'action', label: 'Find Stale PRs', description: 'Query PRs open >48hrs without review', icon: 'database' } },
            { id: '3', type: 'custom', position: { x: 860, y: 250 }, data: { type: 'notification', label: 'DM Reviewers', description: 'Send Slack DMs to assigned reviewers', icon: 'mail' } },
        ],
        edges: [{ source: '1', target: '2' }, { source: '2', target: '3' }],
    },
    'staging-environment-sync': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'Schedule: Nightly', description: 'Runs every night at 2:00 AM', icon: 'zap' } },
            { id: '2', type: 'custom', position: { x: 480, y: 250 }, data: { type: 'action', label: 'Snapshot Production', description: 'Create database backup', icon: 'database' } },
            { id: '3', type: 'custom', position: { x: 860, y: 250 }, data: { type: 'ai', label: 'Scrub PII', description: 'Detect & anonymize sensitive user data', icon: 'sparkles' } },
            { id: '4', type: 'custom', position: { x: 1240, y: 250 }, data: { type: 'action', label: 'Restore to Staging', description: 'Load anonymized db to staging', icon: 'play' } },
            { id: '5', type: 'custom', position: { x: 1620, y: 250 }, data: { type: 'notification', label: 'Slack Alert', description: 'Notify QA team data is fresh', icon: 'mail' } },
        ],
        edges: [{ source: '1', target: '2' }, { source: '2', target: '3' }, { source: '3', target: '4' }, { source: '4', target: '5' }],
    },
};

// ── PIPELINE PREVIEW ─────────────────────────────────────────────────────────

const PipelinePreview = ({ slug }) => {
    const data = templateNodes[slug];
    if (!data) return null;
    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {data.nodes.map((node, i) => {
                const cfg = typeColors[node.data.type] || typeColors.action;
                const Icon = iconMap[node.data.icon] || iconMap[node.data.type] || Zap;
                return (
                    <div key={i} className="flex items-center gap-1">
                        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 border"
                            style={{ background: cfg.bg, borderColor: cfg.border }}>
                            <Icon className="w-2.5 h-2.5" style={{ color: cfg.color }} />
                            <span className="font-mono text-[9px] font-semibold" style={{ color: cfg.color }}>
                                {node.data.label}
                            </span>
                        </div>
                        {i < data.nodes.length - 1 && (
                            <ArrowRight className="w-2.5 h-2.5 text-[#2A2A2A] shrink-0" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ── DETAIL MODAL ──────────────────────────────────────────────────────────────

const TemplateModal = ({ tpl, onClose, onUse }) => {
    if (!tpl) return null;
    const Icon = tpl.icon;
    const data = templateNodes[tpl.slug];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(16px)' }}
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ type: 'spring', damping: 24, stiffness: 200 }}
                className="w-full max-w-xl bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="relative px-6 py-5 border-b border-[#111]"
                    style={{ background: 'linear-gradient(135deg, rgba(110,231,183,0.04) 0%, transparent 60%)' }}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-[#6EE7B7]" />
                            </div>
                            <div>
                                <h3 className="font-mono text-base font-bold text-[#F1F5F9]">{tpl.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-mono text-[10px] text-[#6EE7B7] bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 px-2 py-0.5 rounded-md">
                                        {tpl.category}
                                    </span>
                                    <span className="font-mono text-[10px] text-[#64748B] flex items-center gap-1">
                                        <Users className="w-2.5 h-2.5" />{tpl.uses} uses
                                    </span>
                                    <span className="font-mono text-[10px] text-[#64748B] flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />{tpl.steps} steps
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-[#444] hover:text-[#F1F5F9] transition-colors mt-1 shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    <p className="font-mono text-xs text-[#94A3B8] leading-relaxed">{tpl.desc}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {tpl.tags.map(tag => (
                            <span key={tag} className="font-mono text-[9px] text-[#64748B] bg-[#111] border border-[#1A1A1A] px-2 py-1 rounded-lg">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Pipeline steps */}
                    <div className="space-y-2">
                        <p className="font-mono text-[9px] text-[#3A3A4A] uppercase tracking-widest">Pipeline — {data?.nodes.length} steps</p>
                        <div className="space-y-1.5">
                            {data?.nodes.map((node, i) => {
                                const cfg = typeColors[node.data.type] || typeColors.action;
                                const Icon = iconMap[node.data.icon] || iconMap[node.data.type] || Zap;
                                return (
                                    <div key={i} className="flex items-center gap-3 bg-[#111] border border-[#111] hover:border-[#1A1A1A] rounded-xl px-3.5 py-2.5 transition-colors">
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                            <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-mono text-xs font-semibold text-[#E2E8F0]">{node.data.label}</div>
                                            <div className="font-mono text-[10px] text-[#64748B] truncate">{node.data.description}</div>
                                        </div>
                                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-md shrink-0"
                                            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                            {node.data.type}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 font-mono text-xs text-[#64748B] hover:text-[#F1F5F9] border border-[#1A1A1A] hover:border-[#222] py-2.5 rounded-xl transition-all">
                        Cancel
                    </button>
                    <button onClick={() => onUse(tpl.slug)}
                        className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                        <Zap className="w-3.5 h-3.5" />
                        Use Template
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── TEMPLATE CARD ─────────────────────────────────────────────────────────────

const TemplateCard = ({ tpl, onPreview, onUse, index }) => {
    const Icon = tpl.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
            className="group bg-[#0D0D0D] border border-[#1A1A1A] hover:border-[#2A2A2A] rounded-2xl p-5 flex flex-col gap-4 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(110,231,183,0.04)]"
            onClick={() => onPreview(tpl)}>

            {/* Top row */}
            <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#1A1A1A] group-hover:border-[#6EE7B7]/25 group-hover:bg-[#6EE7B7]/8 flex items-center justify-center transition-all shrink-0">
                    <Icon className="w-4.5 h-4.5 text-[#64748B] group-hover:text-[#6EE7B7] transition-colors w-[18px] h-[18px]" />
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-[#6EE7B7] bg-[#6EE7B7]/8 border border-[#6EE7B7]/15 px-2 py-0.5 rounded-md">
                        {tpl.category}
                    </span>
                    <span className="font-mono text-[9px] text-[#3A3A4A] bg-[#111] border border-[#1A1A1A] px-2 py-0.5 rounded-md">
                        {tpl.steps} steps
                    </span>
                </div>
            </div>

            {/* Title + desc */}
            <div className="space-y-1.5">
                <h3 className="font-mono text-sm font-bold text-[#E2E8F0] group-hover:text-[#F1F5F9] transition-colors leading-snug">
                    {tpl.title}
                </h3>
                <p className="font-mono text-[11px] text-[#64748B] leading-relaxed line-clamp-2">{tpl.desc}</p>
            </div>

            {/* Pipeline mini-preview */}
            <div className="overflow-hidden">
                <PipelinePreview slug={tpl.slug} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-[#111] mt-auto">
                <div className="flex items-center gap-1.5 text-[#3A3A4A]">
                    <Users className="w-3 h-3" />
                    <span className="font-mono text-[9px]">{tpl.uses} uses</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={e => { e.stopPropagation(); onPreview(tpl); }}
                        className="font-mono text-[10px] text-[#64748B] hover:text-[#F1F5F9] transition-colors">
                        Preview
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onUse(tpl.slug); }}
                        className="font-mono text-[10px] font-bold text-[#6EE7B7] flex items-center gap-1 hover:gap-1.5 transition-all">
                        Use <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────

const Templates = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All');
    const [previewTpl, setPreviewTpl] = useState(null);

    const handleUse = (slug) => {
        setPreviewTpl(null);
        navigate(`/workflows/new?template=${slug}`);
    };

    const displayed = templates.filter(t =>
        activeCategory === 'All' || t.category === activeCategory
    );

    return (
        <div className="flex flex-col h-[100dvh] bg-[#080808] overflow-hidden">
            <TopBar title={<span className="font-mono text-xs md:text-sm font-bold text-[#F1F5F9]">Templates</span>} />

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1A1A1A] scrollbar-track-transparent">
                <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 pb-12">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        className="space-y-1">
                        <h2 className="text-2xl md:text-3xl font-mono font-bold text-[#F1F5F9] tracking-tight">Templates</h2>
                        <p className="font-mono text-xs md:text-sm text-[#64748B]">
                            Pre-built pipelines to get you running in seconds. Click any card to preview, then load into the builder.
                        </p>
                    </motion.div>

                    {/* Category filter */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.06 }}
                        className="flex items-center gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                className={`font-mono text-xs px-3.5 py-1.5 rounded-xl border transition-all ${activeCategory === cat
                                        ? 'bg-[#6EE7B7]/10 border-[#6EE7B7]/30 text-[#6EE7B7]'
                                        : 'bg-[#111] border-[#1A1A1A] text-[#64748B] hover:text-[#F1F5F9] hover:border-[#222]'
                                    }`}>
                                {cat}
                                {cat !== 'All' && (
                                    <span className="ml-1.5 text-[9px] opacity-60">
                                        {templates.filter(t => t.category === cat).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </motion.div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {displayed.map((tpl, i) => (
                                <TemplateCard
                                    key={tpl.slug}
                                    tpl={tpl}
                                    index={i}
                                    onPreview={setPreviewTpl}
                                    onUse={handleUse}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Bottom CTA */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="border border-dashed border-[#1A1A1A] rounded-2xl p-8 text-center space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#1A1A1A] flex items-center justify-center mx-auto">
                            <Sparkles className="w-5 h-5 text-[#444]" />
                        </div>
                        <div>
                            <p className="font-mono text-sm font-semibold text-[#F1F5F9]">Build your own</p>
                            <p className="font-mono text-xs text-[#64748B] mt-1">Describe your workflow in plain English and let AI generate it for you.</p>
                        </div>
                        <button onClick={() => navigate('/workflows/new')}
                            className="inline-flex items-center gap-2 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] px-5 py-2.5 rounded-xl transition-all">
                            <Zap className="w-3.5 h-3.5" />
                            Open Builder
                        </button>
                    </motion.div>

                </div>
            </div>

            {/* Preview modal */}
            <AnimatePresence>
                {previewTpl && (
                    <TemplateModal
                        tpl={previewTpl}
                        onClose={() => setPreviewTpl(null)}
                        onUse={handleUse}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Templates;