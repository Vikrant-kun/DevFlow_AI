import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Settings as SettingsIcon, Shield,
    Fingerprint, Activity, GitBranch,
    Lock, Share2, ShieldCheck, UserPlus, Search,
    CheckSquare, Zap, MessageSquare, FileText,
    ArrowUpRight, MoreHorizontal, Hash,
    Plus, X, Check, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import { UpgradeBanner } from '../components/UpgradeBanner';
import { cn } from '../lib/utils';

// ── GHOST DATA ─────────────────────────────────────────────────────────────
const GHOST_MEMBERS = [
    { id: '1', email: 'v.vinchurkar@devflow.ai', role: 'owner', status: 'active', joined: '2026-01-10', avatar: 'V' },
    { id: '2', email: 'engineer_alpha@acme.co', role: 'editor', status: 'active', joined: '2026-02-15', avatar: 'E' },
    { id: '3', email: 'security_lead@acme.co', role: 'viewer', status: 'active', joined: '2026-03-01', avatar: 'S' },
    { id: '4', email: 'dev_ops_bot@acme.co', role: 'editor', status: 'pending', joined: null, avatar: 'D' },
];

const GHOST_STATS = [
    { label: 'Total_Syncs', value: '142', icon: Activity, color: '#6EE7B7' },
    { label: 'Shared_Flows', value: '12', icon: Share2, color: '#A78BFA' },
    { label: 'Org_Uptime', value: '99.9%', icon: ShieldCheck, color: '#6EE7B7' },
    { label: 'Active_Nodes', value: '48', icon: GitBranch, color: '#A78BFA' },
];

// ── INTEGRATION DATA ────────────────────────────────────────────────────────
const NOTION_PAGES = [
    { id: 'n1', title: 'DevFlow AI — Product Roadmap', type: 'database', lastEdit: '2h ago', icon: '📋', shared: true },
    { id: 'n2', title: 'API Architecture Notes', type: 'page', lastEdit: '1d ago', icon: '📄', shared: false },
    { id: 'n3', title: 'Team Onboarding Checklist', type: 'page', lastEdit: '3d ago', icon: '✅', shared: true },
    { id: 'n4', title: 'Sprint Planning — March 2026', type: 'database', lastEdit: '5h ago', icon: '📊', shared: true },
];

const LINEAR_ISSUES = [
    { id: 'DEV-142', title: 'Fix CORS misconfiguration on FastAPI backend', status: 'in_progress', priority: 'urgent', assignee: 'V', label: 'bug' },
    { id: 'DEV-139', title: 'Integrate Groq streaming for pipeline generation', status: 'todo', priority: 'high', assignee: 'E', label: 'feature' },
    { id: 'DEV-133', title: 'Supabase RLS policies for org workspace', status: 'done', priority: 'medium', assignee: 'V', label: 'security' },
    { id: 'DEV-128', title: 'Upgrade Vite config for production build', status: 'done', priority: 'low', assignee: 'D', label: 'infra' },
    { id: 'DEV-147', title: 'Team page UI redesign', status: 'in_progress', priority: 'high', assignee: 'V', label: 'design' },
];

const JIRA_TICKETS = [
    { id: 'DF-201', title: 'Deploy backend to Railway — production', type: 'task', status: 'in_review', sprint: 'Sprint 4', points: 5 },
    { id: 'DF-198', title: 'User auth flow edge case — OAuth redirect', type: 'bug', status: 'open', sprint: 'Sprint 4', points: 3 },
    { id: 'DF-195', title: 'Pipeline export to JSON/YAML', type: 'story', status: 'in_progress', sprint: 'Sprint 4', points: 8 },
    { id: 'DF-192', title: 'Email notification on pipeline run complete', type: 'story', status: 'done', sprint: 'Sprint 3', points: 5 },
];

const SLACK_CHANNELS = [
    { id: 's1', name: 'general', unread: 3, lastMsg: 'v.vinchurkar: pushed hotfix to main, CORS should be resolved now', time: '11m ago', pinned: true },
    { id: 's2', name: 'dev-alerts', unread: 12, lastMsg: '[BOT] Pipeline #142 completed in 3.2s — 5 nodes resolved', time: '1h ago', pinned: false },
    { id: 's3', name: 'design', unread: 0, lastMsg: 'security_lead: reviewed the new team page mockup, looks clean', time: '3h ago', pinned: false },
    { id: 's4', name: 'infra-ops', unread: 1, lastMsg: 'dev_ops_bot: Railway auto-deployment triggered — build passing', time: '6h ago', pinned: false },
];

const STATUS_COLORS = {
    in_progress: 'text-[#F59E0B]',
    todo: 'text-[#64748B]',
    done: 'text-[#6EE7B7]',
    in_review: 'text-[#60A5FA]',
    open: 'text-[#F87171]',
};

const PRIORITY_DOT = {
    urgent: '#F87171',
    high: '#F59E0B',
    medium: '#60A5FA',
    low: '#64748B',
};

const INTEGRATIONS = [
    { key: 'members', label: 'Members', icon: Users },
    { key: 'notion', label: 'Notion', icon: FileText },
    { key: 'linear', label: 'Linear', icon: Zap },
    { key: 'jira', label: 'Jira', icon: CheckSquare },
    { key: 'slack', label: 'Slack', icon: MessageSquare },
];

// ── NOTION PANEL ───────────────────────────────────────────────────────────
function NotionPanel() {
    const [selected, setSelected] = useState(null);
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-white flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-black">N</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#A78BFA] uppercase tracking-widest">notion_workspace</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] font-mono text-[9px] uppercase tracking-wider hover:bg-[#A78BFA]/20 transition-colors shrink-0">
                    <Plus size={10} /> Link
                </button>
            </div>
            {NOTION_PAGES.map((page, i) => (
                <motion.div
                    key={page.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setSelected(selected === page.id ? null : page.id)}
                    className={cn(
                        "bg-[#0D0D0D] border rounded-2xl p-4 cursor-pointer transition-all",
                        selected === page.id ? "border-[#A78BFA]/40" : "border-[#1A1A1A]"
                    )}
                >
                    <div className="flex items-start gap-3">
                        <span className="text-base leading-none mt-0.5 shrink-0">{page.icon}</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-mono text-[11px] font-bold text-[#F1F5F9] leading-snug">{page.title}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="font-mono text-[8px] text-[#333] uppercase tracking-wider">{page.type}</span>
                                <span className="font-mono text-[8px] text-[#2A2A2A]">edited {page.lastEdit}</span>
                                {page.shared && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#6EE7B7]/5 border border-[#6EE7B7]/15 font-mono text-[7px] text-[#6EE7B7] uppercase tracking-wider">shared</span>
                                )}
                            </div>
                        </div>
                        <ArrowUpRight size={12} className="text-[#333] shrink-0 mt-0.5" />
                    </div>
                    <AnimatePresence>
                        {selected === page.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 pt-3 border-t border-[#1A1A1A] grid grid-cols-3 gap-2">
                                    {['View', 'Share', 'Detach'].map(action => (
                                        <button key={action} className="py-2 rounded-xl bg-[#111] border border-[#1A1A1A] font-mono text-[8px] text-[#444] uppercase tracking-wider hover:border-[#2A2A2A] hover:text-[#777] transition-all">
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
}

// ── LINEAR PANEL ───────────────────────────────────────────────────────────
function LinearPanel() {
    const [filter, setFilter] = useState('all');
    const filters = ['all', 'in_progress', 'todo', 'done'];
    const filtered = filter === 'all' ? LINEAR_ISSUES : LINEAR_ISSUES.filter(i => i.status === filter);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#5E6AD2] flex items-center justify-center shrink-0">
                        <Zap size={10} className="text-white" fill="white" />
                    </div>
                    <span className="font-mono text-[10px] text-[#A78BFA] uppercase tracking-widest">linear</span>
                </div>
                {/* Mobile: scrollable pill row */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-2 py-1 rounded-lg font-mono text-[8px] uppercase tracking-wider transition-all whitespace-nowrap shrink-0",
                                filter === f ? "bg-[#A78BFA]/15 border border-[#A78BFA]/30 text-[#A78BFA]" : "text-[#333] hover:text-[#777]"
                            )}
                        >{f.replace('_', ' ')}</button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {filtered.map((issue, i) => (
                        <motion.div
                            key={issue.id}
                            layout
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ delay: i * 0.04 }}
                            className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl px-4 py-3 hover:border-[#2A2A2A] transition-all"
                        >
                            {/* Mobile: stacked layout */}
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: PRIORITY_DOT[issue.priority] }} />
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <p className="font-mono text-[11px] text-[#C4C4D4] leading-snug">{issue.title}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-[8px] text-[#2A2A2A]">{issue.id}</span>
                                        <span className={cn("font-mono text-[8px] uppercase tracking-wider", STATUS_COLORS[issue.status])}>
                                            {issue.status.replace('_', ' ')}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded bg-[#111] border border-[#1A1A1A] font-mono text-[7px] text-[#333] uppercase">{issue.label}</span>
                                    </div>
                                </div>
                                <div className="w-6 h-6 rounded-lg bg-[#111] border border-[#1A1A1A] flex items-center justify-center font-mono text-[8px] text-[#555] shrink-0">
                                    {issue.assignee}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-6 pt-2">
                {[
                    { label: 'open', count: LINEAR_ISSUES.filter(i => i.status !== 'done').length, color: '#F59E0B' },
                    { label: 'done', count: LINEAR_ISSUES.filter(i => i.status === 'done').length, color: '#6EE7B7' },
                    { label: 'total', count: LINEAR_ISSUES.length, color: '#444' },
                ].map(s => (
                    <div key={s.label} className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xl font-bold" style={{ color: s.color }}>{s.count}</span>
                        <span className="font-mono text-[8px] text-[#333] uppercase tracking-wider">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── JIRA PANEL ─────────────────────────────────────────────────────────────
function JiraPanel() {
    const [view, setView] = useState('list');
    const JIRA_COLUMNS = ['open', 'in_progress', 'in_review', 'done'];
    const byStatus = (s) => JIRA_TICKETS.filter(t => t.status === s);
    const TYPE_ICONS = { task: '■', bug: '◆', story: '▲' };
    const TYPE_COLORS = { task: '#60A5FA', bug: '#F87171', story: '#6EE7B7' };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-[#0052CC] flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-white">J</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#A78BFA] uppercase tracking-widest">jira</span>
                </div>
                <div className="flex items-center gap-1">
                    {['list', 'board'].map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={cn(
                                "px-2.5 py-1 rounded-lg font-mono text-[8px] uppercase tracking-wider transition-all",
                                view === v ? "bg-[#60A5FA]/15 border border-[#60A5FA]/30 text-[#60A5FA]" : "text-[#333] hover:text-[#777]"
                            )}
                        >{v}</button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                        {JIRA_TICKETS.map((ticket, i) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl px-4 py-3 hover:border-[#2A2A2A] transition-all"
                            >
                                {/* Mobile: stacked */}
                                <div className="flex items-start gap-3">
                                    <span className="font-mono text-[9px] shrink-0 mt-0.5" style={{ color: TYPE_COLORS[ticket.type] }}>{TYPE_ICONS[ticket.type]}</span>
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <p className="font-mono text-[11px] text-[#C4C4D4] leading-snug">{ticket.title}</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-[8px] text-[#2A2A2A]">{ticket.id}</span>
                                            <span className="font-mono text-[8px] text-[#333]">{ticket.sprint}</span>
                                            <span className={cn("font-mono text-[8px] uppercase", STATUS_COLORS[ticket.status])}>{ticket.status.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                    <span className="w-5 h-5 rounded-md bg-[#111] border border-[#1A1A1A] flex items-center justify-center font-mono text-[7px] text-[#333] shrink-0">{ticket.points}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    /* Board: vertical stacked columns on mobile */
                    <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        {JIRA_COLUMNS.map(col => (
                            <div key={col} className="space-y-2">
                                <div className="flex items-center gap-2 px-1">
                                    <span className={cn("font-mono text-[8px] uppercase tracking-widest", STATUS_COLORS[col])}>{col.replace('_', ' ')}</span>
                                    <span className="font-mono text-[7px] text-[#222]">({byStatus(col).length})</span>
                                </div>
                                {byStatus(col).length === 0 ? (
                                    <div className="border border-dashed border-[#111] rounded-xl p-3 flex items-center justify-center">
                                        <span className="font-mono text-[7px] text-[#1A1A1A]">empty</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {byStatus(col).map(ticket => (
                                            <div key={ticket.id} className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl px-4 py-3 flex items-start gap-3">
                                                <span className="text-[9px] font-mono mt-0.5 shrink-0" style={{ color: TYPE_COLORS[ticket.type] }}>{TYPE_ICONS[ticket.type]}</span>
                                                <p className="font-mono text-[10px] text-[#888] leading-relaxed flex-1 min-w-0">{ticket.title}</p>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span className="font-mono text-[7px] text-[#2A2A2A]">{ticket.id}</span>
                                                    <span className="font-mono text-[7px] text-[#2A2A2A]">{ticket.points}pt</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── SLACK PANEL ────────────────────────────────────────────────────────────
function SlackPanel() {
    const [active, setActive] = useState('s1');
    const [showChannels, setShowChannels] = useState(false);
    const activeChannel = SLACK_CHANNELS.find(c => c.id === active);
    const MOCK_MSGS = [
        { from: 'v.vinchurkar', time: '11:02', msg: 'pushed the hotfix — CORS headers now include the Vite dev origin', self: true },
        { from: 'engineer_alpha', time: '11:05', msg: 'testing now... yeah pipeline fetch works, the TypeError is gone ✅', self: false },
        { from: 'dev_ops_bot', time: '11:06', msg: '[BOT] Railway deployment triggered — build #48 in progress', self: false },
        { from: 'v.vinchurkar', time: '11:09', msg: 'nice. closing DEV-142 on linear', self: true },
    ];

    return (
        <div className="space-y-3">
            {/* Mobile: channel switcher as a dropdown-style row */}
            <div
                className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {SLACK_CHANNELS.map(ch => (
                    <button
                        key={ch.id}
                        onClick={() => setActive(ch.id)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl border font-mono text-[9px] transition-all whitespace-nowrap shrink-0",
                            active === ch.id
                                ? "bg-[#A78BFA]/10 border-[#A78BFA]/20 text-[#F1F5F9]"
                                : "border-[#111] text-[#444] hover:text-[#777] hover:border-[#1A1A1A]"
                        )}
                    >
                        <Hash size={9} className={active === ch.id ? "text-[#A78BFA]" : "text-[#2A2A2A]"} />
                        {ch.name}
                        {ch.unread > 0 && (
                            <span className="w-4 h-4 rounded-full bg-[#A78BFA] flex items-center justify-center font-mono text-[7px] text-white font-bold ml-0.5">
                                {ch.unread > 9 ? '9+' : ch.unread}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Chat window */}
            <div className="bg-[#080808] border border-[#1A1A1A] rounded-2xl flex flex-col" style={{ minHeight: 340 }}>
                <div className="px-4 py-3 border-b border-[#111] flex items-center gap-2 shrink-0">
                    <Hash size={11} className="text-[#A78BFA]" />
                    <span className="font-mono text-xs font-bold text-[#F1F5F9]">{activeChannel?.name}</span>
                    {activeChannel && activeChannel.unread > 0 && (
                        <span className="ml-auto font-mono text-[8px] text-[#A78BFA]/50">{activeChannel.unread} unread</span>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    {active === 's1' ? MOCK_MSGS.map((msg, i) => (
                        <div key={i} className={cn("flex gap-2.5", msg.self ? "flex-row-reverse" : "")}>
                            <div className={cn(
                                "w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-[9px] shrink-0",
                                msg.self ? "bg-[#A78BFA]/10 border-[#A78BFA]/20 text-[#A78BFA]" : "bg-[#111] border-[#1A1A1A] text-[#444]"
                            )}>
                                {msg.from[0].toUpperCase()}
                            </div>
                            <div className={cn("flex flex-col gap-1 max-w-[75%]", msg.self ? "items-end" : "")}>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[8px] text-[#2A2A2A]">{msg.from}</span>
                                    <span className="font-mono text-[7px] text-[#1A1A1A]">{msg.time}</span>
                                </div>
                                <div className={cn(
                                    "px-3 py-2 rounded-xl font-mono text-[10px] leading-relaxed",
                                    msg.self
                                        ? "bg-[#A78BFA]/10 border border-[#A78BFA]/15 text-[#C4B5FD]"
                                        : "bg-[#111] border border-[#1A1A1A] text-[#777]"
                                )}>
                                    {msg.msg}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="flex items-center justify-center h-32">
                            <p className="font-mono text-[9px] text-[#1A1A1A]">no messages in preview</p>
                        </div>
                    )}
                </div>
                <div className="p-3 border-t border-[#0F0F0F] shrink-0">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl">
                        <span className="font-mono text-[9px] text-[#1A1A1A] flex-1">message #{activeChannel?.name}...</span>
                        <span className="font-mono text-[8px] text-[#111]">⌘↵</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── ROLE SELECTOR ──────────────────────────────────────────────────────────
function RoleSelector({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111] border border-[#1A1A1A] font-mono text-[8px] text-[#444] uppercase tracking-wider hover:border-[#2A2A2A] hover:text-[#777] transition-all"
            >
                {value}
                <ChevronDown size={9} className={cn("transition-transform duration-200", open && "rotate-180")} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 bottom-full mb-1.5 w-28 bg-[#0D0D0D] border border-[#222] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-[200] overflow-hidden p-1"
                    >
                        {['editor', 'viewer'].map(role => (
                            <button
                                key={role}
                                onClick={() => { onChange(role); setOpen(false); }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg font-mono text-[8px] uppercase tracking-wider transition-all",
                                    value === role
                                        ? "bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA]"
                                        : "text-[#444] hover:bg-[#111] hover:text-[#777] border border-transparent"
                                )}
                            >
                                {role}
                                {value === role && <Check size={9} className="text-[#A78BFA]" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── MEMBERS PANEL ──────────────────────────────────────────────────────────
function MembersPanel() {
    const [members, setMembers] = useState(GHOST_MEMBERS);
    const [inviteEmail, setInviteEmail] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = members.filter(m => m.email.toLowerCase().includes(search.toLowerCase()));

    const handleRoleChange = (id, role) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    };

    const handleInvite = () => {
        if (!inviteEmail.trim()) return;
        setMembers(prev => [...prev, {
            id: String(Date.now()),
            email: inviteEmail.trim(),
            role: 'viewer',
            status: 'pending',
            joined: null,
            avatar: inviteEmail[0].toUpperCase(),
        }]);
        setInviteEmail('');
        setShowInvite(false);
    };

    const handleRemove = (id) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="space-y-4">
            {/* Search + invite row */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl">
                    <Search size={12} className="text-[#2A2A2A] shrink-0" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="search members..."
                        className="flex-1 bg-transparent font-mono text-[10px] text-[#C4C4D4] placeholder-[#2A2A2A] outline-none min-w-0"
                    />
                </div>
                <button
                    onClick={() => setShowInvite(!showInvite)}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border font-mono text-[9px] uppercase tracking-wider transition-all shrink-0",
                        showInvite
                            ? "bg-[#A78BFA]/20 border-[#A78BFA]/40 text-[#A78BFA]"
                            : "bg-[#A78BFA]/10 border-[#A78BFA]/20 text-[#A78BFA] hover:bg-[#A78BFA]/20"
                    )}
                >
                    <UserPlus size={12} />
                </button>
            </div>

            <AnimatePresence>
                {showInvite && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center gap-3 p-4 bg-[#0D0D0D] border border-[#A78BFA]/20 rounded-2xl">
                            <input
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                                placeholder="colleague@company.com"
                                className="flex-1 bg-transparent font-mono text-xs text-[#F1F5F9] placeholder-[#2A2A2A] outline-none min-w-0"
                                autoFocus
                            />
                            <button onClick={handleInvite} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 font-mono text-[9px] text-[#6EE7B7] uppercase hover:bg-[#6EE7B7]/15 transition-colors shrink-0">
                                <Check size={10} /> Send
                            </button>
                            <button onClick={() => setShowInvite(false)} className="p-1.5 rounded-lg hover:bg-[#111] transition-colors shrink-0">
                                <X size={12} className="text-[#2A2A2A]" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile: card list instead of table */}
            <div className="space-y-2">
                <AnimatePresence>
                    {filtered.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl px-4 py-3 hover:border-[#222] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-xl bg-[#111] border border-[#1A1A1A] flex items-center justify-center font-mono text-[10px] text-[#A78BFA] shrink-0">
                                    {m.avatar}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <p className="font-mono text-[10px] font-bold text-[#F1F5F9] truncate">{m.email}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Status dot */}
                                        <div className="flex items-center gap-1.5">
                                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", m.status === 'active' ? "bg-[#6EE7B7]" : "bg-[#F59E0B]")} />
                                            <span className="font-mono text-[8px] text-[#333]">{m.status}</span>
                                        </div>
                                        {/* Joined */}
                                        {m.joined && (
                                            <span className="font-mono text-[8px] text-[#1E1E2E]">{m.joined}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Role + remove */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {m.role === 'owner' ? (
                                        <span className="font-mono text-[8px] uppercase tracking-widest px-2 py-1 rounded-lg bg-[#A78BFA]/5 border border-[#A78BFA]/20 text-[#A78BFA]">
                                            owner
                                        </span>
                                    ) : (
                                        <RoleSelector
                                            value={m.role}
                                            onChange={(role) => handleRoleChange(m.id, role)}
                                        />
                                    )}
                                    {m.role !== 'owner' && (
                                        <button
                                            onClick={() => handleRemove(m.id)}
                                            className="p-1.5 rounded-lg hover:bg-[#F87171]/10 transition-colors"
                                        >
                                            <X size={11} className="text-[#2A2A2A] hover:text-[#F87171] transition-colors" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <p className="font-mono text-[8px] text-[#111] px-1">{filtered.length} member{filtered.length !== 1 ? 's' : ''} in workspace</p>
        </div>
    );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function Team() {
    const { user } = useAuth();
    const [showBanner, setShowBanner] = useState(false);
    const [activeTab, setActiveTab] = useState('members');

    useEffect(() => {
        const timer = setTimeout(() => setShowBanner(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    const PANEL_MAP = {
        members: <MembersPanel />,
        notion: <NotionPanel />,
        linear: <LinearPanel />,
        jira: <JiraPanel />,
        slack: <SlackPanel />,
    };

    return (
        <div className="flex flex-col h-screen bg-[#080808] text-[#F1F5F9] overflow-hidden relative">
            <TopBar title={<span className="font-mono text-xs text-[#6EE7B7] tracking-widest uppercase">/ org_control</span>} />

            <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10">
                <div className="max-w-6xl mx-auto space-y-10 pb-32">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#A78BFA] rounded-full shadow-[0_0_15px_#A78BFA]" />
                                <h2 className="text-3xl font-mono font-bold lowercase tracking-tighter">Organization_HQ</h2>
                            </div>
                            <p className="text-[#64748B] font-mono text-xs leading-relaxed max-w-lg">
                                Centralized command for teams. Manage permissions, sync with your tools, and collaborate on production pipelines.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {[
                                { label: 'Notion', color: '#fff', border: '#333' },
                                { label: 'Linear', color: '#A78BFA', border: '#A78BFA30' },
                                { label: 'Jira', color: '#60A5FA', border: '#60A5FA30' },
                                { label: 'Slack', color: '#F59E0B', border: '#F59E0B30' },
                            ].map(b => (
                                <div
                                    key={b.label}
                                    className="px-3 py-1.5 rounded-lg bg-[#0D0D0D] font-mono text-[8px] uppercase tracking-wider"
                                    style={{ border: `1px solid ${b.border}`, color: b.color }}
                                >
                                    {b.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {GHOST_STATS.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className="bg-[#0D0D0D] border border-[#1A1A1A] p-5 rounded-2xl space-y-3 hover:border-[#2A2A2A] transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-mono text-[#2A2A2A] uppercase tracking-[0.2em]">{stat.label}</span>
                                    <stat.icon size={12} style={{ color: stat.color, opacity: 0.25 }} />
                                </div>
                                <p className="text-2xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Integration Tabs + Panels */}
                    <div className="space-y-6">
                        {/* Integration Tabs */}
                        <div className="relative">
                            {/* Right fade hint */}
                            <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#080808] to-transparent z-10 pointer-events-none rounded-r-2xl" />
                            {/* Left fade hint */}
                            <div className="absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none rounded-l-2xl" />

                            <div
                                className="flex items-center gap-1.5 p-1.5 bg-[#0A0A0A] border border-[#111] rounded-2xl w-full overflow-x-auto no-scrollbar"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {INTEGRATIONS.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={cn(
                                                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[9px] uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0",
                                                isActive
                                                    ? "bg-[#A78BFA] text-[#0D0D0D] shadow-[0_0_20px_rgba(167,139,250,0.3)]"
                                                    : "text-[#2A2A2A] hover:text-[#888] hover:bg-[#111]"
                                            )}
                                        >
                                            <Icon
                                                size={11}
                                                className={isActive ? "text-[#0D0D0D]" : "text-[#2A2A2A]"}
                                            />
                                            <span className={cn(
                                                "font-bold tracking-widest",
                                                isActive ? "text-[#0D0D0D]" : ""
                                            )}>
                                                {tab.label}
                                            </span>
                                            {/* Active glow underline */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabIndicator"
                                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#0D0D0D]/30 rounded-full"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.16 }}
                            >
                                {PANEL_MAP[activeTab]}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {showBanner && <UpgradeBanner onClose={() => setShowBanner(false)} />}
            </AnimatePresence>
        </div>
    );
}