import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
    Github, Users, Crown, LogOut, Trash2, Shield,
    Bell, Monitor, Database, Terminal, Cpu, Zap,
    Fingerprint, Globe, Key, AlertTriangle, Settings2,
    Palette, Lock, X, Menu, ChevronDown, Check, Sparkles,
    Coins, FileCode, Power, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { cn } from '../lib/utils';

// ── CUSTOM UI COMPONENTS ─────────────────────────────────────────────────────

const ToggleSwitch = ({ checked, onChange }) => (
    <div
        className={cn(
            "w-9 h-5 rounded-full flex items-center p-1 cursor-pointer transition-all duration-300 shrink-0 border",
            checked ? "bg-[#6EE7B7]/10 border-[#6EE7B7]/40" : "bg-[#111] border-[#333]"
        )}
        onClick={() => onChange(!checked)}
    >
        <motion.div
            animate={{ x: checked ? 16 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
                "w-3 h-3 rounded-full shadow-lg",
                checked ? "bg-[#6EE7B7]" : "bg-[#444]"
            )}
        />
    </div>
);

const SettingItem = ({ icon: Icon, label, desc, children }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0D0D0D] border border-[#1A1A1A] p-5 rounded-2xl gap-4 hover:border-[#333] transition-all group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#1A1A1A] flex items-center justify-center shrink-0 group-hover:border-[#6EE7B7]/30 transition-colors">
                <Icon size={18} className="text-[#333] group-hover:text-[#6EE7B7] transition-colors" />
            </div>
            <div className="space-y-1">
                <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#F1F5F9]">{label}</p>
                <p className="font-mono text-[10px] text-[#444] leading-relaxed max-w-sm lowercase">{desc}</p>
            </div>
        </div>
        <div className="w-full sm:w-auto flex justify-end">
            {children}
        </div>
    </div>
);

const CustomSelect = ({ value, onChange, options, icon: Icon, onRestriction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-[#111] border border-[#222] rounded-xl hover:border-[#6EE7B7]/40 transition-all min-w-[180px] justify-between group"
            >
                <div className="flex items-center gap-2">
                    {selectedOption?.icon ? <selectedOption.icon size={14} className="text-[#6EE7B7]" /> : <Icon size={14} className="text-[#444]" />}
                    <span className="font-mono text-[10px] font-bold text-[#F1F5F9] uppercase tracking-tighter">
                        {selectedOption?.label}
                    </span>
                </div>
                <ChevronDown size={14} className={cn("text-[#333] transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-full min-w-[220px] bg-[#0D0D0D] border border-[#222] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] overflow-hidden p-1.5"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    if (opt.restricted) {
                                        onRestriction(opt.label);
                                    } else {
                                        onChange(opt.id);
                                    }
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group/opt",
                                    value === opt.id ? "bg-[#6EE7B7]/5 border border-[#6EE7B7]/20" : "hover:bg-[#111] border border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-1.5 rounded-lg border", value === opt.id ? "bg-[#6EE7B7]/10 border-[#6EE7B7]/20" : "bg-[#080808] border-[#1A1A1A]")}>
                                        <opt.icon size={12} className={value === opt.id ? "text-[#6EE7B7]" : "text-[#444]"} />
                                    </div>
                                    <div className="text-left">
                                        <p className={cn("font-mono text-[10px] font-bold uppercase", value === opt.id ? "text-[#F1F5F9]" : "text-[#64748B]")}>{opt.label}</p>
                                        {opt.desc && <p className="text-[8px] font-mono text-[#333] uppercase leading-none mt-0.5">{opt.desc}</p>}
                                    </div>
                                </div>
                                {opt.restricted && <Coins size={12} className="text-[#F87171] opacity-40" />}
                                {value === opt.id && !opt.restricted && <Check size={12} className="text-[#6EE7B7]" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

const Settings = () => {
    const { user, getAuthToken, handleLogout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('general');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [prefs, setPrefs] = useState({
        email_notifications: true,
        pipeline_alerts: true,
        auto_save_canvas: true,
        default_model: 'groq',
        code_font: 'JetBrains Mono',
    });

    useEffect(() => {
        const saved = localStorage.getItem('devflow_system_prefs');
        if (saved) setPrefs(JSON.parse(saved));
    }, []);

    const handleSavePrefs = () => {
        localStorage.setItem('devflow_system_prefs', JSON.stringify(prefs));
        showToast('System configuration synchronized', 'success');
    };

    const handleModelRestriction = () => {
        showToast(`Access Denied: i dont have billing money to get API.`, 'error');
    };

    const modelOptions = [
        { id: 'groq', label: 'Groq / Llama 3', desc: 'Active_Infrastructure', icon: Zap },
        { id: 'gpt4', label: 'GPT-4o', desc: 'Insufficient_Credits', icon: Cpu, restricted: true },
        { id: 'gemini', label: 'Gemini 2.0', desc: 'API_Vault_Locked', icon: Sparkles, restricted: true },
    ];

    const fontOptions = [
        { id: 'JetBrains Mono', label: 'JetBrains Mono', desc: 'Industry_Standard', icon: Terminal },
        { id: 'Fira Code', label: 'Fira Code', desc: 'Ligature_Optimized', icon: FileCode },
        { id: 'IBM Plex Mono', label: 'IBM Plex Mono', desc: 'Corporate_Vibe', icon: Monitor },
    ];

    const tabs = [
        { id: 'general', label: 'General', icon: Settings2 },
        { id: 'notifications', label: 'Alerts', icon: Bell },
        { id: 'security', label: 'Protocol', icon: Shield },
        { id: 'organization', label: 'Teams', icon: Users },
        { id: 'danger_zone', label: 'Danger', icon: AlertTriangle }
    ];

    // ── RENDERERS ──

    const renderGeneral = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Monitor size={14} className="text-[#6EE7B7]" />
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F1F5F9]">System_Preferences</h3>
                </div>

                <div className="grid gap-3">
                    <SettingItem icon={Zap} label="Auto_Save_Protocol" desc="Automatically commit canvas state after 1.5s of inactivity.">
                        <ToggleSwitch checked={prefs.auto_save_canvas} onChange={(val) => setPrefs(p => ({ ...p, auto_save_canvas: val }))} />
                    </SettingItem>

                    <SettingItem icon={Cpu} label="Default_AI_Engine" desc="The primary model used for generative pipeline architecture.">
                        <CustomSelect
                            value={prefs.default_model}
                            options={modelOptions}
                            onChange={(val) => setPrefs(p => ({ ...p, default_model: val }))}
                            onRestriction={handleModelRestriction}
                            icon={Cpu}
                        />
                    </SettingItem>

                    <SettingItem icon={Palette} label="Terminal_Font" desc="Interface typography for logs and code previews.">
                        <CustomSelect
                            value={prefs.code_font}
                            options={fontOptions}
                            onChange={(val) => setPrefs(p => ({ ...p, code_font: val }))}
                            icon={Terminal}
                        />
                    </SettingItem>
                </div>
            </div>
            <button onClick={handleSavePrefs} className="px-8 py-3 bg-[#6EE7B7] text-[#080808] font-mono text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#34D399] transition-all rounded-xl shadow-[0_0_20px_rgba(110,231,183,0.15)]">
                Sync_Config
            </button>
        </motion.div>
    );

    const renderNotifications = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-2 px-2">
                <Bell size={14} className="text-[#6EE7B7]" />
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F1F5F9]">Alert_Manifest</h3>
            </div>
            <div className="grid gap-3">
                <SettingItem icon={Monitor} label="Pipeline_Success" desc="Instant alert when a deployment cycle completes successfully."><ToggleSwitch checked={prefs.email_notifications} onChange={(val) => setPrefs(p => ({ ...p, email_notifications: val }))} /></SettingItem>
                <SettingItem icon={AlertTriangle} label="Critical_Failures" desc="Immediate escalation when a production pipeline crashes."><ToggleSwitch checked={prefs.pipeline_alerts} onChange={(val) => setPrefs(p => ({ ...p, pipeline_alerts: val }))} /></SettingItem>
            </div>
        </motion.div>
    );

    const renderSecurity = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Fingerprint size={14} className="text-[#6EE7B7]" />
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F1F5F9]">Identity_Lock</h3>
                </div>
                <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-[24px] overflow-hidden">
                    <div className="p-6 border-b border-[#1A1A1A] flex items-center justify-between bg-[#111]/30">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#080808] border border-[#222] flex items-center justify-center"><Github className="text-[#F1F5F9]" /></div>
                            <div>
                                <p className="font-mono text-xs font-bold text-[#F1F5F9]">Github_Integration</p>
                                <p className="font-mono text-[10px] text-[#64748B] lowercase mt-0.5">Primary repository provider</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#6EE7B7]/5 border border-[#6EE7B7]/20 text-[#6EE7B7] font-mono text-[9px] font-bold tracking-widest uppercase">Verified</span>
                    </div>
                    <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="space-y-1">
                            <p className="font-mono text-[10px] text-[#444] uppercase tracking-tighter leading-none">Last_Sync</p>
                            <p className="font-mono text-xs text-[#64748B]">{user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : 'Active_Session'}</p>
                        </div>
                        <button className="px-5 py-2 rounded-xl border border-[#222] font-mono text-[10px] font-bold text-[#444] hover:text-[#F1F5F9] transition-all uppercase tracking-widest">Rotate_Token</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderOrganization = () => (
        <div className="relative">
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 bg-[#080808]/40 backdrop-blur-[3px] rounded-[32px] border border-dashed border-[#A78BFA]/20">
                <div className="w-16 h-16 bg-[#111] rounded-2xl border border-[#A78BFA]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(167,139,250,0.1)]"><Lock size={28} className="text-[#A78BFA]" /></div>
                <h3 className="font-mono text-sm font-bold text-[#F1F5F9] uppercase tracking-widest mb-2 text-center">Protocol_Restricted</h3>
                <button onClick={() => navigate('/upgrade')} className="px-8 py-3 bg-[#A78BFA] text-[#080808] font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#8B5CF6] transition-all">sudo_upgrade</button>
            </div>
            <div className="opacity-20 grayscale blur-[1px] space-y-6">
                <div className="h-40 bg-[#0D0D0D] border border-[#1A1A1A] rounded-[32px]" />
                <div className="grid grid-cols-2 gap-4"><div className="h-24 bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl" /><div className="h-24 bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl" /></div>
            </div>
        </div>
    );

    const renderDangerZone = () => (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="bg-[#F87171]/5 border border-[#F87171]/20 rounded-[32px] p-8 space-y-8 overflow-hidden relative">
                {/* Background Warning Icon */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                    <ShieldAlert size={160} className="text-[#F87171]" />
                </div>

                <div className="relative z-10 space-y-2">
                    <h3 className="text-xl font-mono font-bold lowercase tracking-tighter text-[#F87171]">Terminal_Actions</h3>
                    <p className="text-[10px] font-mono text-[#64748B] uppercase tracking-widest">Warning: These operations are destructive and non-reversible.</p>
                </div>

                <div className="relative z-10 grid gap-4">
                    <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl gap-4">
                        <div className="space-y-1">
                            <p className="font-mono text-xs font-bold text-[#F1F5F9] lowercase">purge_workflow_registry</p>
                            <p className="font-mono text-[10px] text-[#444] leading-relaxed uppercase tracking-tighter">Permanently delete all pipeline logic and execution history.</p>
                        </div>
                        <button className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-[#F87171]/30 text-[#F87171] font-mono text-[10px] font-bold hover:bg-[#F87171]/10 transition-all uppercase">Execute_Wipe</button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-[#0D0D0D] border border-[#F87171]/10 rounded-2xl gap-4">
                        <div className="space-y-1">
                            <p className="font-mono text-xs font-bold text-[#F1F5F9] lowercase">terminate_identity</p>
                            <p className="font-mono text-[10px] text-[#444] leading-relaxed uppercase tracking-tighter">De-authorize account and delete all user metadata from the shard.</p>
                        </div>
                        <button onClick={() => navigate('/team')} className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#F87171] text-[#080808] font-mono text-[10px] font-bold hover:bg-[#EF4444] transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(248,113,113,0.15)]">Terminate</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#080808] text-[#F1F5F9] overflow-hidden font-mono relative">
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
            <TopBar title={<span className="text-xs text-[#6EE7B7] tracking-widest uppercase ml-14 md:ml-0">/ system_config</span>} />

            {/* --- MOBILE FLOATING MENU --- */}
            <div className="md:hidden fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div initial={{ scale: 0, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0, y: 20 }} className="flex flex-col gap-2 mb-2">
                            {tabs.map((tab) => (
                                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }} className={cn("flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all", activeTab === tab.id ? "bg-[#6EE7B7] text-[#080808] border-[#6EE7B7]" : "bg-[#0D0D0D]/90 text-[#F1F5F9] border-[#1A1A1A]")}>
                                    <tab.icon size={16} /> <span className="font-mono text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-14 h-14 rounded-2xl bg-[#6EE7B7] text-[#080808] flex items-center justify-center shadow-[0_10px_30px_rgba(110,231,183,0.3)] active:scale-95 transition-all"><motion.div animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}>{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</motion.div></button>
            </div>

            <div className="flex flex-1 overflow-hidden relative z-10">
                <aside className="w-64 bg-[#0D0D0D] border-r border-[#1A1A1A] hidden md:flex flex-col p-6 space-y-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-mono text-[10px] font-bold uppercase tracking-widest", activeTab === tab.id ? "bg-[#6EE7B7]/5 text-[#6EE7B7] border border-[#6EE7B7]/20 shadow-[0_0_15px_rgba(110,231,183,0.05)]" : "text-[#444] hover:text-[#F1F5F9] border border-transparent hover:bg-[#111]")}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </aside>

                <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-12 relative">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#6EE7B7] rounded-full shadow-[0_0_15px_#6EE7B7]" />
                                <h2 className="text-3xl font-bold lowercase tracking-tighter">Configuration</h2>
                            </div>
                            <p className="text-[#64748B] font-mono text-xs leading-relaxed max-w-lg">Advanced environment orchestration parameters.</p>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'general' && renderGeneral()}
                            {activeTab === 'notifications' && renderNotifications()}
                            {activeTab === 'security' && renderSecurity()}
                            {activeTab === 'organization' && renderOrganization()}
                            {activeTab === 'danger_zone' && renderDangerZone()}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;