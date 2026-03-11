import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Github,
    Hash,
    CheckCircle2,
    Trello,
    X,
    ExternalLink,
    ShieldCheck,
    Activity,
    Settings2,
    Plus,
    Zap,
    Lock,
    EyeOff
} from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../lib/apiRoutes';
import { cn } from '../lib/utils';

// ── ANIMATION VARIANTS ──────────────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
    },
};

const Integrations = () => {
    const {
        user,
        isGithubConnected,
        repos,
        selectedRepo,
        setSelectedRepo,
        githubLoading,
        connectGithubPat,
        fetchRepos,
        getAuthToken,
    } = useAuth();

    const { showToast } = useToast();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // ── STATE MANAGEMENT (LOGIC PRESERVED) ──────────────────────────────────
    const [showGithubInput, setShowGithubInput] = useState(false);
    const [githubPAT, setGithubPAT] = useState('');
    const [isSavingGithub, setIsSavingGithub] = useState(false);

    const [slackWebhook, setSlackWebhook] = useState('');
    const [isSlackConnected, setIsSlackConnected] = useState(false);
    const [showSlackInput, setShowSlackInput] = useState(false);
    const [isSavingSlack, setIsSavingSlack] = useState(false);

    const [notionToken, setNotionToken] = useState('');
    const [isNotionConnected, setIsNotionConnected] = useState(false);
    const [showNotionInput, setShowNotionInput] = useState(false);
    const [isSavingNotion, setIsSavingNotion] = useState(false);

    const [linearToken, setLinearToken] = useState('');
    const [isLinearConnected, setIsLinearConnected] = useState(false);
    const [showLinearInput, setShowLinearInput] = useState(false);
    const [isSavingLinear, setIsSavingLinear] = useState(false);

    const [jiraToken, setJiraToken] = useState('');
    const [jiraDomain, setJiraDomain] = useState('');
    const [isJiraConnected, setIsJiraConnected] = useState(false);
    const [showJiraInput, setShowJiraInput] = useState(false);
    const [isSavingJira, setIsSavingJira] = useState(false);

    // ── DATA LOADING (LOGIC PRESERVED) ──────────────────────────────────────
    useEffect(() => {
        const loadIntegrations = async () => {
            if (!user) return;
            try {
                const settings = await apiFetch(API_ROUTES.githubSettings, {}, getAuthToken);
                if (settings?.slack_webhook_url) {
                    setSlackWebhook(settings.slack_webhook_url);
                    setIsSlackConnected(true);
                }
                if (settings?.notion_token) {
                    setNotionToken(settings.notion_token);
                    setIsNotionConnected(true);
                }
                if (settings?.linear_token) {
                    setLinearToken(settings.linear_token);
                    setIsLinearConnected(true);
                }
                if (settings?.jira_token) {
                    setJiraToken(settings.jira_token);
                    setIsJiraConnected(true);
                }
                if (settings?.jira_domain) setJiraDomain(settings.jira_domain);
            } catch (err) {
                console.error('Failed to load settings:', err);
            }
        };
        loadIntegrations();
    }, [user, getAuthToken]);

    const saveIntegrationSettings = async (body) => {
        await apiFetch(API_ROUTES.githubSettings, {
            method: 'POST',
            body: JSON.stringify(body),
        }, getAuthToken);
    };

    // ── HANDLERS (LOGIC PRESERVED) ──────────────────────────────────────────
    const handleSaveGithubPAT = async () => {
        if (!githubPAT.trim()) return;
        setIsSavingGithub(true);
        try {
            await connectGithubPat(githubPAT.trim());
            setShowGithubInput(false);
            setGithubPAT('');
            showToast('GitHub connected!', 'success');
        } catch (err) {
            showToast(err.message || 'Error connecting GitHub', 'error');
        } finally {
            setIsSavingGithub(false);
        }
    };

    const handleSaveSlack = async () => {
        if (!slackWebhook.trim()) return;
        setIsSavingSlack(true);
        try {
            await saveIntegrationSettings({ slack_webhook_url: slackWebhook.trim() });
            setIsSlackConnected(true);
            setShowSlackInput(false);
            showToast('Slack connected!', 'success');
        } catch (err) {
            showToast('Failed to save Slack', 'error');
        } finally {
            setIsSavingSlack(false);
        }
    };

    const handleSaveNotion = async () => {
        if (!notionToken.trim()) return;
        setIsSavingNotion(true);
        try {
            await saveIntegrationSettings({ notion_token: notionToken.trim() });
            setIsNotionConnected(true);
            setShowNotionInput(false);
            showToast('Notion connected!', 'success');
        } catch (err) {
            showToast('Failed to save Notion', 'error');
        } finally {
            setIsSavingNotion(false);
        }
    };

    const handleSaveLinear = async () => {
        if (!linearToken.trim()) return;
        setIsSavingLinear(true);
        try {
            await saveIntegrationSettings({ linear_token: linearToken.trim() });
            setIsLinearConnected(true);
            setShowLinearInput(false);
            showToast('Linear connected!', 'success');
        } catch (err) {
            showToast('Failed to save Linear', 'error');
        } finally {
            setIsSavingLinear(false);
        }
    };

    const handleSaveJira = async () => {
        if (!jiraToken.trim() || !jiraDomain.trim()) return;
        setIsSavingJira(true);
        try {
            await saveIntegrationSettings({
                jira_token: jiraToken.trim(),
                jira_domain: jiraDomain.trim(),
            });
            setIsJiraConnected(true);
            setShowJiraInput(false);
            showToast('Jira connected!', 'success');
        } catch (err) {
            showToast('Failed to save Jira', 'error');
        } finally {
            setIsSavingJira(false);
        }
    };

    const disconnectGithub = async () => {
        try {
            await apiFetch(API_ROUTES.githubDisconnect, { method: 'POST' }, getAuthToken);
            window.location.reload();
        } catch (err) {
            showToast('Disconnect failed', 'error');
        }
    };

    const integrations = [
        {
            id: 'github',
            name: 'GitHub',
            desc: 'Source control & PR automation.',
            icon: Github,
            connected: isGithubConnected,
            color: '#F1F5F9',
            isComingSoon: false
        },
        {
            id: 'slack',
            name: 'Slack',
            desc: 'Real-time channel alerts.',
            icon: Hash,
            connected: isSlackConnected,
            color: '#E01E5A',
            isComingSoon: true
        },
        {
            id: 'notion',
            name: 'Notion',
            desc: 'Database & documentation sync.',
            icon: CheckCircle2,
            connected: isNotionConnected,
            color: '#F1F5F9',
            isComingSoon: true
        },
        {
            id: 'linear',
            name: 'Linear',
            desc: 'Issue tracking & cycle updates.',
            icon: Zap,
            connected: isLinearConnected,
            color: '#5E6AD2',
            isComingSoon: true
        },
        {
            id: 'jira',
            name: 'Jira',
            desc: 'Enterprise ticket management.',
            icon: Trello,
            connected: isJiraConnected,
            color: '#0052CC',
            isComingSoon: true
        },
    ];

    return (
        <div className="min-h-screen bg-[#080808] text-[#F1F5F9]">
            <TopBar title={<span className="font-mono text-xs text-[#6EE7B7] tracking-widest uppercase">/ integrations</span>} />

            <main className="p-6 md:p-10">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* ── HEADER ── */}
                    <motion.header
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-[#6EE7B7] rounded-full shadow-[0_0_15px_#6EE7B7]" />
                            <h2 className="text-3xl font-mono font-bold lowercase tracking-tighter">
                                Service Hub
                            </h2>
                        </div>
                        <p className="text-[#64748B] text-sm font-mono max-w-xl leading-relaxed">
                            Establish persistent connections between DevFlow AI and your development stack.
                        </p>
                    </motion.header>

                    {/* ── GRID ── */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                        {integrations.map((integration) => {
                            const Icon = integration.icon;

                            return (
                                <motion.div
                                    key={integration.id}
                                    variants={itemVariants}
                                    className={cn(
                                        "relative group overflow-hidden bg-[#0D0D0D] border rounded-2xl p-6 transition-all duration-300",
                                        integration.connected ? "border-[#6EE7B7]/20 shadow-[0_0_30px_rgba(110,231,183,0.03)]" : "border-[#1A1A1A] hover:border-[#333]"
                                    )}
                                >
                                    {/* Sub-grid pattern background */}
                                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                                    {/* Coming Soon Barrier Overlay */}
                                    {integration.isComingSoon && (
                                        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center border border-dashed border-[#222] rounded-2xl group-hover:bg-black/40 transition-colors">
                                            <div className="w-10 h-10 bg-[#111] border border-[#222] rounded-xl flex items-center justify-center mb-3">
                                                <Lock size={18} className="text-[#444] group-hover:text-[#6EE7B7] transition-colors" />
                                            </div>
                                            <p className="font-mono text-[10px] font-bold text-[#F1F5F9] uppercase tracking-widest">Protocol_Pending</p>
                                            <p className="font-mono text-[8px] text-[#444] mt-1 uppercase tracking-tighter">Connector in validation phase</p>
                                        </div>
                                    )}

                                    <div className={cn("relative z-10 space-y-6", integration.isComingSoon && "grayscale opacity-50")}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#111] border border-[#222] flex items-center justify-center rounded-xl shadow-inner group-hover:border-[#6EE7B7]/40 transition-colors">
                                                    <Icon className="w-6 h-6" style={{ color: integration.color }} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-mono font-bold tracking-tight">
                                                        {integration.name}
                                                    </h3>
                                                    <p className="text-[#444] text-[10px] font-mono uppercase tracking-widest mt-1">
                                                        API v1.0
                                                    </p>
                                                </div>
                                            </div>

                                            {integration.connected && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#6EE7B7]/10 border border-[#6EE7B7]/20">
                                                    <div className="w-1 h-1 rounded-full bg-[#6EE7B7] animate-pulse" />
                                                    <span className="text-[9px] font-mono font-bold text-[#6EE7B7] uppercase tracking-tighter">Live</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-[#64748B] text-xs font-mono leading-relaxed min-h-[40px]">
                                            {integration.desc}
                                        </p>

                                        <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-between">
                                            {integration.connected ? (
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-[#6EE7B7]" />
                                                    <span className="text-[10px] font-mono text-[#F1F5F9] opacity-60">Verified</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-3.5 h-3.5 text-[#333]" />
                                                    <span className="text-[10px] font-mono text-[#444]">Idle</span>
                                                </div>
                                            )}

                                            <div className="relative group/popover">
                                                <button
                                                    disabled={integration.isComingSoon}
                                                    onClick={() => {
                                                        if (!integration.connected) {
                                                            const setters = {
                                                                github: setShowGithubInput,
                                                                slack: setShowSlackInput,
                                                                notion: setShowNotionInput,
                                                                linear: setShowLinearInput,
                                                                jira: setShowJiraInput
                                                            };
                                                            setters[integration.id](true);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all",
                                                        integration.connected
                                                            ? "bg-[#111] border border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:border-[#444]"
                                                            : "bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399]",
                                                        integration.isComingSoon && "opacity-0 pointer-events-none"
                                                    )}
                                                >
                                                    {integration.connected ? (
                                                        <> <Settings2 className="w-3 h-3" /> Manage </>
                                                    ) : (
                                                        <> <Plus className="w-3 h-3" /> Connect </>
                                                    )}
                                                </button>

                                                {/* Popover (Preserved Logic) */}
                                                {integration.connected && !integration.isComingSoon && (
                                                    <div className="absolute right-0 bottom-full mb-2 w-40 bg-[#0D0D0D] border border-[#222] rounded-xl shadow-2xl opacity-0 invisible group-hover/popover:opacity-100 group-hover/popover:visible transition-all z-20 overflow-hidden">
                                                        <div className="p-1">
                                                            <div className="px-3 py-2 text-[9px] font-mono text-[#444] border-b border-[#1A1A1A] truncate">
                                                                {integration.id === 'github' ? `@${user?.user_metadata?.user_name || 'Active'}` : 'System Linked'}
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    if (integration.id === 'github') disconnectGithub();
                                                                    else {
                                                                        const setters = {
                                                                            slack: [setSlackWebhook, setShowSlackInput],
                                                                            notion: [setNotionToken, setShowNotionInput],
                                                                            linear: [setLinearToken, setShowLinearInput],
                                                                            jira: [setJiraToken, setShowJiraInput]
                                                                        };
                                                                        if (setters[integration.id]) {
                                                                            setters[integration.id][0]('');
                                                                            setters[integration.id][1](true);
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-[10px] font-mono text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
                                                            >
                                                                Disconnect
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ── IN-CARD FORMS ── */}
                                        <AnimatePresence>
                                            {/* (Logic preserved for Slack/Notion/Linear/Jira inputs - won't trigger due to isComingSoon disabled button) */}
                                            {!integration.isComingSoon && ((integration.id === 'slack' && showSlackInput) ||
                                                (integration.id === 'notion' && showNotionInput) ||
                                                (integration.id === 'linear' && showLinearInput) ||
                                                (integration.id === 'jira' && showJiraInput)) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="pt-4 space-y-3"
                                                    >
                                                        <div className="bg-[#080808] border border-[#1A1A1A] rounded-xl p-3 space-y-4">
                                                            {integration.id === 'jira' ? (
                                                                <>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-mono text-[#444] uppercase tracking-widest">Domain</label>
                                                                        <input
                                                                            type="text" value={jiraDomain} onChange={(e) => setJiraDomain(e.target.value)}
                                                                            className="w-full bg-[#0D0D0D] border border-[#222] rounded-lg px-3 py-2 text-[11px] font-mono text-[#F1F5F9] focus:border-[#6EE7B7]/40 outline-none"
                                                                            placeholder="company.atlassian.net"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-mono text-[#444] uppercase tracking-widest">Token</label>
                                                                        <input
                                                                            type="password" value={jiraToken} onChange={(e) => setJiraToken(e.target.value)}
                                                                            className="w-full bg-[#0D0D0D] border border-[#222] rounded-lg px-3 py-2 text-[11px] font-mono text-[#F1F5F9] focus:border-[#6EE7B7]/40 outline-none"
                                                                        />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-mono text-[#444] uppercase tracking-widest">Access Key</label>
                                                                    <input
                                                                        type="text"
                                                                        value={integration.id === 'slack' ? slackWebhook : integration.id === 'notion' ? notionToken : linearToken}
                                                                        onChange={(e) => {
                                                                            if (integration.id === 'slack') setSlackWebhook(e.target.value);
                                                                            if (integration.id === 'notion') setNotionToken(e.target.value);
                                                                            if (integration.id === 'linear') setLinearToken(e.target.value);
                                                                        }}
                                                                        className="w-full bg-[#0D0D0D] border border-[#222] rounded-lg px-3 py-2 text-[11px] font-mono text-[#F1F5F9] focus:border-[#6EE7B7]/40 outline-none"
                                                                        placeholder="Paste credentials here..."
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        if (integration.id === 'slack') setShowSlackInput(false);
                                                                        if (integration.id === 'notion') setShowNotionInput(false);
                                                                        if (integration.id === 'linear') setShowLinearInput(false);
                                                                        if (integration.id === 'jira') setShowJiraInput(false);
                                                                    }}
                                                                    className="flex-1 py-2 rounded-lg border border-[#222] text-[10px] font-mono hover:bg-[#111]"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (integration.id === 'slack') handleSaveSlack();
                                                                        if (integration.id === 'notion') handleSaveNotion();
                                                                        if (integration.id === 'linear') handleSaveLinear();
                                                                        if (integration.id === 'jira') handleSaveJira();
                                                                    }}
                                                                    className="flex-1 py-2 rounded-lg bg-[#6EE7B7] text-[#080808] text-[10px] font-mono font-bold hover:bg-[#34D399]"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* ── COMING SOON PLACEHOLDER (Extra Card) ── */}
                        <motion.div variants={itemVariants} className="border border-dashed border-[#1A1A1A] rounded-2xl flex flex-col items-center justify-center p-6 min-h-[220px] opacity-40">
                            <Plus className="w-8 h-8 text-[#222] mb-2" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-[#333]">New Connectors Planned</span>
                        </motion.div>
                    </motion.div>
                </div>
            </main>

            {/* ── GITHUB MODAL (UPGRADED) ── */}
            <AnimatePresence>
                {showGithubInput && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#0D0D0D] border border-[#222] rounded-3xl p-8 w-full max-w-lg shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#6EE7B7]" />

                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-mono font-bold lowercase tracking-tighter text-[#F1F5F9]">Authorize GitHub</h3>
                                    <p className="text-[#64748B] text-xs font-mono lowercase">Secure repository access via PAT</p>
                                </div>
                                <button onClick={() => setShowGithubInput(false)} className="p-2 hover:bg-[#1A1A1A] rounded-full transition-colors">
                                    <X size={20} className="text-[#444]" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-[#080808] border border-[#1A1A1A] rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center gap-3 text-[#64748B]">
                                        <ExternalLink size={14} />
                                        <span className="text-[11px] font-mono">
                                            Generate token at <a href="https://github.com/settings/tokens/new?scopes=repo,read:user" target="_blank" rel="noreferrer" className="text-[#6EE7B7] hover:underline">github.com/settings/tokens</a>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[#64748B]">
                                        <ShieldCheck size={14} />
                                        <span className="text-[11px] font-mono">Required Scopes: <code className="text-[#F1F5F9]">repo</code>, <code className="text-[#F1F5F9]">read:user</code></span>
                                    </div>
                                </div>

                                <input
                                    type="password" value={githubPAT} onChange={(e) => setGithubPAT(e.target.value)}
                                    placeholder="ghp_************************************"
                                    className="w-full bg-[#080808] border border-[#222] rounded-xl px-4 py-4 text-sm font-mono text-[#F1F5F9] placeholder-[#222] focus:border-[#6EE7B7]/40 outline-none transition-all"
                                />

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowGithubInput(false)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-[#222] text-xs font-mono font-bold hover:bg-[#111] transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleSaveGithubPAT}
                                        disabled={isSavingGithub || !githubPAT.trim()}
                                        className="flex-1 px-4 py-3 rounded-xl bg-[#6EE7B7] text-[#080808] text-xs font-mono font-bold hover:bg-[#34D399] transition-all shadow-[0_0_20px_rgba(110,231,183,0.2)]"
                                    >
                                        {isSavingGithub ? 'Authenticating...' : 'Establish Link'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Integrations;