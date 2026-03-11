import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Crown, Settings as SettingsIcon, Shield,
    Fingerprint, Activity, GitBranch, Terminal,
    Lock, Share2, ShieldCheck, UserPlus, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import { UpgradeBanner } from '../components/UpgradeBanner';
import { cn } from '../lib/utils';

// ── GHOST DATA (THE CASTLE INTERIOR) ────────────────────────────────────────
const GHOST_MEMBERS = [
    { id: '1', email: 'v.vinchurkar@devflow.ai', role: 'owner', status: 'active', joined: '2026-01-10' },
    { id: '2', email: 'engineer_alpha@acme.co', role: 'editor', status: 'active', joined: '2026-02-15' },
    { id: '3', email: 'security_lead@acme.co', role: 'viewer', status: 'active', joined: '2026-03-01' },
    { id: '4', email: 'dev_ops_bot@acme.co', role: 'editor', status: 'pending', joined: null },
];

const GHOST_STATS = [
    { label: 'Total_Syncs', value: '142', icon: Activity },
    { label: 'Shared_Flows', value: '12', icon: Share2 },
    { label: 'Org_Uptime', value: '99.9%', icon: ShieldCheck },
    { label: 'Active_Nodes', value: '48', icon: GitBranch },
];

export default function Team() {
    const { user } = useAuth();
    const [showBanner, setShowBanner] = useState(false);

    // Trigger the upgrade banner after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowBanner(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-[#080808] text-[#F1F5F9] overflow-hidden relative">
            <TopBar title={<span className="font-mono text-xs text-[#6EE7B7] tracking-widest uppercase">/ org_control</span>} />

            {/* ── THE "LOCK" OVERLAY ── */}
            <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
                <div className="w-full h-full backdrop-blur-[2px] bg-[#080808]/10 flex items-center justify-center overflow-hidden">
                    {/* SVG Scanning Pattern */}
                    <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(110,231,183,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,183,0.1)_1px,transparent_1px)] [background-size:40px_40px]" />
                </div>
            </div>

            <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 pointer-events-none select-none grayscale-[0.5] opacity-40">
                <div className="max-w-7xl mx-auto space-y-12 pb-32">

                    {/* Header Ribbon */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#A78BFA] rounded-full shadow-[0_0_15px_#A78BFA]" />
                                <h2 className="text-3xl font-mono font-bold lowercase tracking-tighter">Organization_HQ</h2>
                            </div>
                            <p className="text-[#64748B] font-mono text-xs leading-relaxed max-w-lg">
                                Centralized command for teams. Manage permissions, audit activity, and collaborate on production pipelines.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-[#111] border border-[#222] rounded-xl flex items-center gap-3">
                                <Search size={14} className="text-[#333]" />
                                <span className="text-[10px] font-mono text-[#333]">search_members...</span>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-center">
                                <UserPlus size={18} className="text-[#A78BFA]" />
                            </div>
                        </div>
                    </div>

                    {/* Industrial Stats Matrix */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {GHOST_STATS.map((stat, i) => (
                            <div key={i} className="bg-[#0D0D0D] border border-[#1A1A1A] p-6 rounded-3xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-mono text-[#444] uppercase tracking-[0.2em]">{stat.label}</span>
                                    <stat.icon size={14} className="text-[#222]" />
                                </div>
                                <p className="text-3xl font-mono font-bold text-[#F1F5F9]">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Members Workbench */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Fingerprint size={14} className="text-[#A78BFA]" />
                            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F1F5F9]">Certified_Personnel</h3>
                        </div>

                        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-[32px] overflow-hidden shadow-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-[#111]/50 border-b border-[#1A1A1A]">
                                    <tr>
                                        {['identity', 'clearance', 'status', 'joined', 'options'].map(h => (
                                            <th key={h} className="px-8 py-4 font-mono text-[9px] font-bold text-[#3A3A4A] uppercase tracking-[0.2em]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#111]">
                                    {GHOST_MEMBERS.map((m) => (
                                        <tr key={m.id} className="group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center font-mono text-xs text-[#A78BFA] shadow-inner">
                                                        {m.email[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-xs font-bold text-[#F1F5F9]">{m.email}</span>
                                                        <span className="font-mono text-[9px] text-[#333]">UID_{m.id}8472</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                                                    m.role === 'owner' ? "bg-[#A78BFA]/5 border-[#A78BFA]/20 text-[#A78BFA]" : "bg-[#111] border-[#222] text-[#444]"
                                                )}>
                                                    {m.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", m.status === 'active' ? "bg-[#6EE7B7]" : "bg-[#F59E0B]")} />
                                                    <span className="font-mono text-[10px] text-[#444]">{m.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 font-mono text-[10px] text-[#333]">
                                                {m.joined || '—'}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <SettingsIcon size={14} className="text-[#1A1A1A]" />
                                                    <Lock size={14} className="text-[#1A1A1A]" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── INTERACTIVE UPGRADE BANNER ── */}
            <AnimatePresence>
                {showBanner && <UpgradeBanner onClose={() => setShowBanner(false)} />}
            </AnimatePresence>
        </div>
    );
}