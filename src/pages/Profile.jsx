import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { API_ROUTES } from '../lib/apiRoutes';
import { useToast } from '../contexts/ToastContext';
import {
    Fingerprint, Shield, Zap, Calendar, Activity,
    Layers, Github, ExternalLink, MapPin, Globe,
    User, Mail, Terminal, ShieldCheck, Loader2,
    CheckCircle2, XCircle, Check, AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
};

// ── FIELD COMPONENT ────────────────────────────────────────────────────────
const Field = ({ label, children, hint, error }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
            <label className="text-[9px] font-bold text-[#333] uppercase tracking-widest">{label}</label>
            {hint && <span className="text-[8px] text-[#222] uppercase tracking-wider">{hint}</span>}
        </div>
        {children}
        {error && <p className="text-[9px] text-[#F87171] ml-1 mt-1">{error}</p>}
    </div>
);

// ── SAVE BUTTON ────────────────────────────────────────────────────────────
const SaveButton = ({ status, onClick, dirty }) => {
    const states = {
        idle: { label: 'Sync_Registry', icon: <Zap size={13} />, cls: 'bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399]' },
        loading: { label: 'Syncing...', icon: <Loader2 size={13} className="animate-spin" />, cls: 'bg-[#6EE7B7]/40 text-[#080808] cursor-not-allowed' },
        success: { label: 'Synced', icon: <Check size={13} />, cls: 'bg-[#6EE7B7]/20 text-[#6EE7B7] border border-[#6EE7B7]/30 cursor-default' },
        error: { label: 'Retry', icon: <AlertTriangle size={13} />, cls: 'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20 hover:bg-[#F87171]/20' },
    };
    const s = states[status] || states.idle;
    return (
        <button
            onClick={onClick}
            disabled={status === 'loading' || status === 'success'}
            className={cn(
                'px-7 py-3 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all flex items-center gap-2.5',
                s.cls,
                !dirty && status === 'idle' && 'opacity-40 cursor-not-allowed'
            )}
        >
            {s.icon} {s.label}
        </button>
    );
};

const Profile = () => {
    const { user, getAuthToken } = useAuth();
    const { showToast } = useToast();

    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errors, setErrors] = useState({});

    // Form state
    const [fullName, setFullName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');

    // Track whether form has unsaved changes
    const [savedSnapshot, setSavedSnapshot] = useState(null);
    const [dirty, setDirty] = useState(false);

    // Stats
    const [workflowsCount, setWorkflowsCount] = useState(0);
    const [runsCount, setRunsCount] = useState(0);
    const [selectedRepo, setSelectedRepo] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // ── INIT ──
    useEffect(() => {
        if (!user) return;

        const fn = user.fullName || '';
        const dn = user.username || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || '';
        const meta = user.publicMetadata || {};
        const b = meta.bio || '';
        const loc = meta.location || '';
        const web = meta.website || '';

        setFullName(fn);
        setDisplayName(dn);
        setBio(b);
        setLocation(loc);
        setWebsite(web);
        setSavedSnapshot({ fn, dn, b, loc, web });
        setDirty(false);

        const fetchStats = async () => {
            try {
                const token = await getAuthToken();
                const headers = { Authorization: `Bearer ${token}` };
                const [wr, rr, sr] = await Promise.all([
                    fetch(`${API_URL}${API_ROUTES.workflows}`, { headers }),
                    fetch(`${API_URL}${API_ROUTES.runs}`, { headers }),
                    fetch(`${API_URL}${API_ROUTES.githubSelectedRepo}`, { headers }),
                ]);
                if (wr.ok) { const d = await wr.json(); setWorkflowsCount((d?.workflows || d || []).length); }
                if (rr.ok) { const d = await rr.json(); setRunsCount((d?.runs || d || []).length); }
                if (sr.ok) { const { repo } = await sr.json(); if (repo) setSelectedRepo(repo.full_name); }
            } catch (err) { console.error('Profile stats fetch failed:', err); }
        };
        fetchStats();
    }, [user]);

    // ── DIRTY CHECK — only fullName ──
    useEffect(() => {
        if (!savedSnapshot) return;
        setDirty(fullName !== savedSnapshot.fn);
    }, [fullName, savedSnapshot]);

    // ── VALIDATION ──
    const validate = () => {
        const e = {};
        if (!fullName.trim()) e.fullName = 'Name cannot be empty';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── SAVE — only firstName + lastName via Clerk ──
    const handleSave = async () => {
        if (!dirty || !validate()) return;

        setStatus('loading');
        setErrors({});

        const parts = fullName.trim().split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';

        try {
            await user.update({ firstName, lastName });

            setSavedSnapshot(s => ({ ...s, fn: fullName }));
            setDirty(false);
            showToast('Name synced successfully.', 'success');
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2500);
        } catch (err) {
            console.error('Profile save error:', err);
            const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Sync failed';
            setErrors({ fullName: msg });
            showToast(msg, 'error');
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    // ── DERIVED ──
    const userEmail = user?.primaryEmailAddress?.emailAddress || '';
    const avatarUrl = user?.imageUrl;
    const initials = (user?.firstName || userEmail).substring(0, 1).toUpperCase() || 'V';
    const providerBadge = user?.externalAccounts?.[0]?.provider?.replace('oauth_', '') || 'identity';
    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Unknown';
    const lastLoginDate = user?.lastSignInAt
        ? new Date(user.lastSignInAt).toLocaleString()
        : 'Unknown';

    return (
        <div className="h-screen flex flex-col bg-[#080808] text-[#F1F5F9] overflow-hidden font-mono relative">
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

            <TopBar title={<span className="text-xs text-[#6EE7B7] tracking-widest uppercase">/ identity</span>} />

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-12 relative z-10">
                <div className="max-w-7xl mx-auto space-y-12 pb-24">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-[#6EE7B7] rounded-full shadow-[0_0_15px_#6EE7B7]" />
                            <h2 className="text-3xl font-bold lowercase tracking-tighter">Profile</h2>
                        </div>
                        <p className="text-[#64748B] text-xs lowercase leading-relaxed max-w-lg">
                            Manage user identity, clearance levels, and provider synchronicity across the DevFlow AI network.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* ── LEFT: IDENTITY CARD ── */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="lg:col-span-4 space-y-6">
                            <motion.div variants={itemVariants} className="relative group bg-[#0D0D0D] border border-[#1A1A1A] rounded-[32px] p-8 text-center flex flex-col items-center overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                                {/* Avatar */}
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-[32px] bg-[#111] border-2 border-[#1A1A1A] flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-[#6EE7B7]/40 transition-colors duration-500">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                        ) : (
                                            <span className="text-4xl font-bold text-[#6EE7B7]">{initials}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-[#080808] border border-[#1A1A1A] p-2 rounded-xl shadow-xl">
                                        <ShieldCheck className="w-4 h-4 text-[#6EE7B7]" />
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold tracking-tighter text-[#F1F5F9] lowercase">{displayName || 'Anonymous_User'}</h2>
                                <p className="text-[10px] text-[#444] uppercase tracking-[0.2em] mt-1">UID_{user?.id?.substring(0, 8)}</p>

                                <div className="mt-6 px-4 py-1.5 rounded-full bg-[#6EE7B7]/5 border border-[#6EE7B7]/10 text-[#6EE7B7] text-[9px] font-bold uppercase tracking-widest">
                                    {providerBadge}_Link
                                </div>

                                <div className="w-full grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-[#111]">
                                    <div className="text-center space-y-1">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Layers className="w-3 h-3 text-[#333]" />
                                            <span className="text-lg font-bold text-[#F1F5F9]">{workflowsCount}</span>
                                        </div>
                                        <p className="text-[9px] text-[#444] uppercase tracking-tighter">Sequences</p>
                                    </div>
                                    <div className="text-center space-y-1 border-l border-[#111]">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Activity className="w-3 h-3 text-[#333]" />
                                            <span className="text-lg font-bold text-[#F1F5F9]">{runsCount}</span>
                                        </div>
                                        <p className="text-[9px] text-[#444] uppercase tracking-tighter">Deployments</p>
                                    </div>
                                </div>

                                <div className="mt-10 flex items-center gap-2 text-[10px] text-[#333] font-bold uppercase tracking-widest">
                                    <Calendar className="w-3 h-3" />
                                    <span>Initialized: {memberSince}</span>
                                </div>

                                {/* Unsaved changes indicator */}
                                <AnimatePresence>
                                    {dirty && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 6 }}
                                            className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/15"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                                            <span className="font-mono text-[8px] text-[#F59E0B] uppercase tracking-wider">unsaved changes</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>

                        {/* ── RIGHT: SYSTEM CONFIG ── */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="lg:col-span-8 space-y-10">

                            {/* Core Identity */}
                            <motion.div variants={itemVariants} className="space-y-6">
                                <div className="flex items-center gap-2 px-2">
                                    <Fingerprint size={14} className="text-[#6EE7B7]" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Core_Identity_Parameters</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="full_name_string" hint="synced to clerk" error={errors.fullName}>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            className={cn(
                                                "w-full bg-[#0D0D0D] border rounded-2xl px-4 py-3.5 text-xs font-bold text-[#F1F5F9] focus:outline-none transition-all placeholder:text-[#222]",
                                                errors.fullName ? "border-[#F87171]/40 focus:border-[#F87171]/60" : "border-[#1A1A1A] focus:border-[#6EE7B7]/40"
                                            )}
                                        />
                                    </Field>
                                    <Field label="display_handle" hint="read only">
                                        <input
                                            type="text"
                                            value={displayName}
                                            disabled
                                            className="w-full bg-[#0A0A0A] border border-[#111] rounded-2xl px-4 py-3.5 text-xs font-bold text-[#2A2A2A] cursor-not-allowed"
                                        />
                                    </Field>
                                </div>

                                <Field label="bio_manifest">
                                    <textarea
                                        rows={3}
                                        value={bio}
                                        disabled
                                        className="w-full bg-[#0A0A0A] border border-[#111] rounded-2xl px-4 py-4 text-xs font-bold text-[#2A2A2A] cursor-not-allowed resize-none"
                                    />
                                </Field>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="geospatial_location">
                                        <div className="relative">
                                            <MapPin size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]" />
                                            <input
                                                type="text"
                                                value={location}
                                                disabled
                                                className="w-full bg-[#0A0A0A] border border-[#111] rounded-2xl pl-10 pr-4 py-3.5 text-xs font-bold text-[#2A2A2A] cursor-not-allowed"
                                            />
                                        </div>
                                    </Field>
                                    <Field label="external_resource_link" error={errors.website}>
                                        <div className="relative">
                                            <Globe size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]" />
                                            <input
                                                type="text"
                                                value={website}
                                                disabled
                                                className="w-full bg-[#0A0A0A] border border-[#111] rounded-2xl pl-10 pr-4 py-3.5 text-xs font-bold text-[#2A2A2A] cursor-not-allowed"
                                            />
                                        </div>
                                    </Field>
                                </div>

                                <div className="flex items-center gap-4">
                                    <SaveButton status={status} onClick={handleSave} dirty={dirty} />
                                    {dirty && status === 'idle' && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[9px] text-[#333] uppercase tracking-wider">
                                            you have unsaved changes
                                        </motion.p>
                                    )}
                                </div>
                            </motion.div>

                            {/* Auth Metadata */}
                            <motion.div variants={itemVariants} className="space-y-6 pt-4 border-t border-[#111]">
                                <div className="flex items-center gap-2 px-2">
                                    <Terminal size={14} className="text-[#333]" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Authentication_Metadata</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-5 space-y-1">
                                        <p className="text-[9px] font-bold text-[#333] uppercase tracking-widest">Primary_Email</p>
                                        <p className="text-xs font-bold text-[#64748B] lowercase">{userEmail}</p>
                                    </div>
                                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-5 space-y-1">
                                        <p className="text-[9px] font-bold text-[#333] uppercase tracking-widest">Clearance_Tier</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-[#F1F5F9] lowercase">Free Plan</p>
                                            <a href="/upgrade" className="text-[9px] font-bold text-[#6EE7B7] uppercase hover:underline">Elevate →</a>
                                        </div>
                                    </div>
                                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-5 space-y-1">
                                        <p className="text-[9px] font-bold text-[#333] uppercase tracking-widest">Last_Access_Log</p>
                                        <p className="text-xs font-bold text-[#444] lowercase">{lastLoginDate}</p>
                                    </div>
                                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-5 space-y-1">
                                        <p className="text-[9px] font-bold text-[#333] uppercase tracking-widest">Infrastructure_ID</p>
                                        <p className="text-xs font-bold text-[#222] truncate">{user?.id}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* GitHub Provider */}
                            {providerBadge === 'github' && (
                                <motion.div variants={itemVariants} className="space-y-6 pt-4 border-t border-[#111]">
                                    <div className="flex items-center gap-2 px-2">
                                        <Github size={14} className="text-[#333]" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Provider_Synchronicity</h3>
                                    </div>
                                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-[24px] p-6 flex items-center justify-between group/github">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center transition-all group-hover/github:border-[#6EE7B7]/40">
                                                <Github size={20} className="text-[#F1F5F9]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[#333] uppercase tracking-widest">Authenticated_Handle</p>
                                                <p className="text-sm font-bold text-[#F1F5F9]">@{user.externalAccounts?.find(a => a.provider === 'github')?.username || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[9px] font-bold text-[#6EE7B7] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#6EE7B7]/5 border border-[#6EE7B7]/10">Active</span>
                                            <a
                                                href={`https://github.com/${user.externalAccounts?.find(a => a.provider === 'github')?.username}`}
                                                target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1.5 text-[10px] text-[#444] hover:text-[#F1F5F9] transition-all"
                                            >
                                                Registry <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;