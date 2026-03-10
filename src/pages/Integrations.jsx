import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Hash, CheckCircle2, Trello, X } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../lib/apiRoutes';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
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

    // GitHub PAT + Repo Creation
    const [showGithubInput, setShowGithubInput] = useState(false);
    const [githubPAT, setGithubPAT] = useState('');
    const [isSavingGithub, setIsSavingGithub] = useState(false);

    const [showCreateRepo, setShowCreateRepo] = useState(false);
    const [newRepoName, setNewRepoName] = useState('');
    const [newRepoPrivate, setNewRepoPrivate] = useState(false);
    const [isCreatingRepo, setIsCreatingRepo] = useState(false);

    // Slack
    const [slackWebhook, setSlackWebhook] = useState('');
    const [isSlackConnected, setIsSlackConnected] = useState(false);
    const [showSlackInput, setShowSlackInput] = useState(false);
    const [isSavingSlack, setIsSavingSlack] = useState(false);

    // Notion
    const [notionToken, setNotionToken] = useState('');
    const [isNotionConnected, setIsNotionConnected] = useState(false);
    const [showNotionInput, setShowNotionInput] = useState(false);
    const [isSavingNotion, setIsSavingNotion] = useState(false);

    // Linear
    const [linearToken, setLinearToken] = useState('');
    const [isLinearConnected, setIsLinearConnected] = useState(false);
    const [showLinearInput, setShowLinearInput] = useState(false);
    const [isSavingLinear, setIsSavingLinear] = useState(false);

    // Jira
    const [jiraToken, setJiraToken] = useState('');
    const [jiraDomain, setJiraDomain] = useState('');
    const [isJiraConnected, setIsJiraConnected] = useState(false);
    const [showJiraInput, setShowJiraInput] = useState(false);
    const [isSavingJira, setIsSavingJira] = useState(false);

    // Load integration settings
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
                if (settings?.jira_domain) {
                    setJiraDomain(settings.jira_domain);
                }
            } catch (err) {
                console.error('Failed to load integration settings:', err);
            }
        };

        loadIntegrations();
    }, [user, getAuthToken, API_URL]);

    // Save helper
    const saveIntegrationSettings = async (body) => {
        await apiFetch(API_ROUTES.githubSettings, {
            method: 'POST',
            body: JSON.stringify(body),
        }, getAuthToken);
    };

    // GitHub PAT Save
    const handleSaveGithubPAT = async () => {
        if (!githubPAT.trim()) return;
        setIsSavingGithub(true);
        try {
            await connectGithubPat(githubPAT.trim());
            setShowGithubInput(false);
            setGithubPAT('');
            showToast('GitHub connected!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to save GitHub token', 'error');
        } finally {
            setIsSavingGithub(false);
        }
    };

    // Create new repo (you can add UI for this later if needed)
    const handleCreateRepo = async () => {
        if (!newRepoName.trim()) return;
        setIsCreatingRepo(true);
        try {
            const data = await apiFetch(API_ROUTES.githubRepos, {
                method: 'POST',
                body: JSON.stringify({
                    name: newRepoName.trim(),
                    private: newRepoPrivate,
                }),
            }, getAuthToken);
            await fetchRepos();
            setSelectedRepo({
                name: data.repo.name,
                full_name: data.repo.full_name,
            });
            setShowCreateRepo(false);
            setNewRepoName('');
            showToast(`Repo "${data.repo.name}" created!`, 'success');
        } catch (err) {
            showToast(err.message || 'Failed to create repo', 'error');
        } finally {
            setIsCreatingRepo(false);
        }
    };

    // Select repo
    const handleRepoSelect = async (fullName) => {
        const repoObj = { name: fullName.split('/')[1], full_name: fullName };
        setSelectedRepo(repoObj);
        try {
            await apiFetch(API_ROUTES.githubSelectRepo, {
                method: 'POST',
                body: JSON.stringify({ repo_full_name: fullName }),
            }, getAuthToken);
            showToast(`Active repo set to ${fullName}`, 'success');
        } catch {
            showToast('Failed to save repo selection', 'error');
        }
    };

    // Slack Save
    const handleSaveSlack = async () => {
        if (!slackWebhook.trim()) return;
        setIsSavingSlack(true);
        try {
            await saveIntegrationSettings({ slack_webhook_url: slackWebhook.trim() });
            setIsSlackConnected(true);
            setShowSlackInput(false);
            showToast('Slack connected!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to save Slack webhook', 'error');
        } finally {
            setIsSavingSlack(false);
        }
    };

    // Notion Save
    const handleSaveNotion = async () => {
        if (!notionToken.trim()) return;
        setIsSavingNotion(true);
        try {
            await saveIntegrationSettings({ notion_token: notionToken.trim() });
            setIsNotionConnected(true);
            setShowNotionInput(false);
            showToast('Notion connected!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to save Notion token', 'error');
        } finally {
            setIsSavingNotion(false);
        }
    };

    // Linear Save
    const handleSaveLinear = async () => {
        if (!linearToken.trim()) return;
        setIsSavingLinear(true);
        try {
            await saveIntegrationSettings({ linear_token: linearToken.trim() });
            setIsLinearConnected(true);
            setShowLinearInput(false);
            showToast('Linear connected!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to save Linear token', 'error');
        } finally {
            setIsSavingLinear(false);
        }
    };

    // Jira Save
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
            showToast(err.message || 'Failed to save Jira credentials', 'error');
        } finally {
            setIsSavingJira(false);
        }
    };

    // GitHub Disconnect
    const disconnectGithub = async () => {
        try {
            await apiFetch(API_ROUTES.githubDisconnect, {
                method: 'POST'
            }, getAuthToken);
            window.location.reload();
        } catch (err) {
            showToast(err.message || 'Failed to disconnect GitHub', 'error');
        }
    };

    const integrations = [
        {
            id: 'github',
            name: 'GitHub',
            desc: 'Trigger workflows from PRs, merges, and issues.',
            icon: Github,
            connected: isGithubConnected,
        },
        {
            id: 'slack',
            name: 'Slack',
            desc: 'Send notifications and alerts to channels.',
            icon: Hash,
            connected: isSlackConnected,
        },
        {
            id: 'notion',
            name: 'Notion',
            desc: 'Create pages and update databases automatically.',
            icon: CheckCircle2,
            connected: isNotionConnected,
        },
        {
            id: 'linear',
            name: 'Linear',
            desc: 'Create issues and manage cycles automatically.',
            icon: Trello,
            connected: isLinearConnected,
        },
        {
            id: 'jira',
            name: 'Jira',
            desc: 'Sync issues, epic status, and bug reports.',
            icon: Trello,
            connected: isJiraConnected,
        },
    ];

    return (
        <>
            <TopBar title={<span className="font-mono text-sm text-[#6EE7B7]">~ / integrations</span>} />

            <div className="p-6">
                <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
                    {/* Header */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-mono text-[#F1F5F9] lowercase tracking-tight">
                                integrations
                            </h2>
                            <p className="text-[#64748B] text-sm font-mono mt-1">
                                connect_your_external_services
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Cards Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
                    >
                        {integrations.map((integration) => {
                            const Icon = integration.icon;

                            return (
                                <motion.div
                                    key={integration.id}
                                    variants={itemVariants}
                                    className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col justify-between min-h-[220px]"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#0D0D0D] border border-[#222] flex items-center justify-center shrink-0 rounded-xl">
                                                <Icon className="w-6 h-6 text-[#F1F5F9]" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-mono font-semibold text-[#F1F5F9]">
                                                    {integration.name}
                                                </h3>
                                                <p className="text-[#64748B] text-xs font-mono mt-1 max-w-[200px]">
                                                    {integration.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 border-t border-[#1A1A1A] pt-4">
                                        <div className="flex items-center justify-between w-full">
                                            {integration.connected ? (
                                                <>
                                                    <span className="flex items-center gap-2 text-xs font-mono text-[#6EE7B7]">
                                                        <span className="w-2 h-2 rounded-full bg-[#6EE7B7]"></span> connected
                                                    </span>

                                                    <div className="relative group">
                                                        <button className="text-xs font-mono text-[#64748B] px-4 py-2 border border-[#222] hover:text-[#F1F5F9] hover:border-[#444] transition-colors rounded-xl">
                                                            Manage
                                                        </button>

                                                        <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-[#222] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                            <div className="p-1">
                                                                <div className="px-4 py-2 text-xs text-[#64748B] border-b border-[#222] mb-1 truncate">
                                                                    {integration.id === 'github'
                                                                        ? user?.user_metadata?.user_name
                                                                            ? `@${user.user_metadata.user_name}`
                                                                            : 'GitHub User'
                                                                        : 'Connected'}
                                                                </div>

                                                                <button
                                                                    onClick={() => {
                                                                        if (integration.id === 'github') {
                                                                            disconnectGithub();
                                                                        } else {
                                                                            // Re-open form for editing / re-connect
                                                                            if (integration.id === 'slack') {
                                                                                setSlackWebhook('');
                                                                                setShowSlackInput(true);
                                                                            }
                                                                            if (integration.id === 'notion') {
                                                                                setNotionToken('');
                                                                                setShowNotionInput(true);
                                                                            }
                                                                            if (integration.id === 'linear') {
                                                                                setLinearToken('');
                                                                                setShowLinearInput(true);
                                                                            }
                                                                            if (integration.id === 'jira') {
                                                                                setJiraToken('');
                                                                                setJiraDomain('');
                                                                                setShowJiraInput(true);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#222] rounded-xl transition-colors"
                                                                >
                                                                    Disconnect
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
                                                        <span className="w-2 h-2 rounded-full bg-[#333]"></span> disconnected
                                                    </span>

                                                    <button
                                                        onClick={() => {
                                                            if (integration.id === 'github') setShowGithubInput(true);
                                                            if (integration.id === 'slack') setShowSlackInput(true);
                                                            if (integration.id === 'notion') setShowNotionInput(true);
                                                            if (integration.id === 'linear') setShowLinearInput(true);
                                                            if (integration.id === 'jira') setShowJiraInput(true);
                                                        }}
                                                        className="text-xs font-mono text-[#080808] bg-[#6EE7B7] hover:bg-[#34D399] px-4 py-2 transition-colors rounded-xl font-bold"
                                                    >
                                                        Connect
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Slack Form */}
                                        {integration.id === 'slack' && (
                                            <AnimatePresence>
                                                {showSlackInput && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-4 space-y-3 bg-[#0D0D0D] border border-[#222] rounded-xl p-3"
                                                    >
                                                        <div>
                                                            <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-2">
                                                                Webhook URL
                                                            </p>
                                                            <input
                                                                type="text"
                                                                value={slackWebhook}
                                                                onChange={(e) => setSlackWebhook(e.target.value)}
                                                                placeholder="https://hooks.slack.com/services/..."
                                                                className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]"
                                                            />
                                                            <p className="font-mono text-[10px] text-[#444] mt-1.5">
                                                                Get this from Slack → Apps → Incoming Webhooks
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setShowSlackInput(false)}
                                                                className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2 rounded-xl hover:border-[#333] transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleSaveSlack}
                                                                disabled={!slackWebhook.trim() || isSavingSlack}
                                                                className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                {isSavingSlack && (
                                                                    <div className="w-3 h-3 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" />
                                                                )}
                                                                Save Webhook
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}

                                        {/* Notion Form */}
                                        {integration.id === 'notion' && (
                                            <AnimatePresence>
                                                {showNotionInput && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-4 space-y-3 bg-[#0D0D0D] border border-[#222] rounded-xl p-3"
                                                    >
                                                        <div>
                                                            <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-2">
                                                                Integration Token
                                                            </p>
                                                            <input
                                                                type="text"
                                                                value={notionToken}
                                                                onChange={(e) => setNotionToken(e.target.value)}
                                                                placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                                className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]"
                                                            />
                                                            <p className="font-mono text-[10px] text-[#444] mt-1.5">
                                                                Get from notion.so/my-integrations → New Integration
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setShowNotionInput(false)}
                                                                className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2 rounded-xl hover:border-[#333] transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleSaveNotion}
                                                                disabled={!notionToken.trim() || isSavingNotion}
                                                                className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                {isSavingNotion && (
                                                                    <div className="w-3 h-3 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" />
                                                                )}
                                                                Save Token
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}

                                        {/* Linear Form */}
                                        {integration.id === 'linear' && (
                                            <AnimatePresence>
                                                {showLinearInput && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-4 space-y-3 bg-[#0D0D0D] border border-[#222] rounded-xl p-3"
                                                    >
                                                        <div>
                                                            <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-2">
                                                                API Key
                                                            </p>
                                                            <input
                                                                type="text"
                                                                value={linearToken}
                                                                onChange={(e) => setLinearToken(e.target.value)}
                                                                placeholder="lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                                className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]"
                                                            />
                                                            <p className="font-mono text-[10px] text-[#444] mt-1.5">
                                                                Get from linear.app/settings/api → Personal API keys
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setShowLinearInput(false)}
                                                                className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2 rounded-xl hover:border-[#333] transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleSaveLinear}
                                                                disabled={!linearToken.trim() || isSavingLinear}
                                                                className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                {isSavingLinear && (
                                                                    <div className="w-3 h-3 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" />
                                                                )}
                                                                Save API Key
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}

                                        {/* Jira Form */}
                                        {integration.id === 'jira' && (
                                            <AnimatePresence>
                                                {showJiraInput && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-4 space-y-3 bg-[#0D0D0D] border border-[#222] rounded-xl p-3"
                                                    >
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-2">
                                                                    Jira Domain
                                                                </p>
                                                                <input
                                                                    type="text"
                                                                    value={jiraDomain}
                                                                    onChange={(e) => setJiraDomain(e.target.value)}
                                                                    placeholder="yourcompany.atlassian.net"
                                                                    className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-2">
                                                                    API Token
                                                                </p>
                                                                <input
                                                                    type="password"
                                                                    value={jiraToken}
                                                                    onChange={(e) => setJiraToken(e.target.value)}
                                                                    placeholder="ATATxxxxxxxxxxxxxxxxxxxxxxxx"
                                                                    className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]"
                                                                />
                                                                <p className="font-mono text-[10px] text-[#444] mt-1.5">
                                                                    Get from id.atlassian.com/manage-profile/security/api-tokens
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setShowJiraInput(false)}
                                                                className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2 rounded-xl hover:border-[#333] transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleSaveJira}
                                                                disabled={!jiraToken.trim() || !jiraDomain.trim() || isSavingJira}
                                                                className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                {isSavingJira && (
                                                                    <div className="w-3 h-3 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" />
                                                                )}
                                                                Save Credentials
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}

                                        {/* Slack Test Button */}
                                        {integration.id === 'slack' && isSlackConnected && !showSlackInput && (
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(slackWebhook, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ text: '✅ DevFlow connection test successful!' }),
                                                            });
                                                            if (res.ok) showToast('Slack test message sent!', 'success');
                                                            else showToast('Slack test failed', 'error');
                                                        } catch {
                                                            showToast('Slack test failed', 'error');
                                                        }
                                                    }}
                                                    className="flex-1 font-mono text-[10px] text-[#64748B] border border-[#222] py-2 rounded-xl hover:border-[#333] transition-all"
                                                >
                                                    Test Connection
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            {/* ── GitHub PAT Modal (now outside the cards) ──────────────────────── */}
            <AnimatePresence>
                {showGithubInput && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-md relative"
                        >
                            <button
                                onClick={() => {
                                    setShowGithubInput(false);
                                    setGithubPAT('');
                                }}
                                className="absolute top-4 right-4 text-[#64748B] hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-base font-mono font-semibold text-[#F1F5F9] mb-1">
                                Connect GitHub
                            </h3>
                            <p className="text-[#64748B] text-xs font-mono mb-4">
                                Create a Personal Access Token at{' '}
                                <a
                                    href="https://github.com/settings/tokens/new?scopes=repo,read:user"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#6EE7B7] hover:underline"
                                >
                                    github.com/settings/tokens
                                </a>{' '}
                                with <span className="text-[#F1F5F9]">repo</span> and{' '}
                                <span className="text-[#F1F5F9]">read:user</span> scopes.
                            </p>

                            <input
                                type="password"
                                value={githubPAT}
                                onChange={(e) => setGithubPAT(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && !isSavingGithub && githubPAT.trim() && handleSaveGithubPAT()
                                }
                                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                className="w-full bg-[#0D0D0D] border border-[#333] rounded-xl px-4 py-3 text-sm font-mono text-[#F1F5F9] placeholder-[#444] focus:outline-none focus:border-[#6EE7B7] mb-4"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowGithubInput(false);
                                        setGithubPAT('');
                                    }}
                                    className="flex-1 px-4 py-2 text-sm font-mono text-[#64748B] border border-[#222] rounded-xl hover:border-[#444] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveGithubPAT}
                                    disabled={isSavingGithub || !githubPAT.trim()}
                                    className="flex-1 px-4 py-2 text-sm font-mono text-[#080808] bg-[#6EE7B7] hover:bg-[#34D399] rounded-xl font-bold transition-colors disabled:opacity-50"
                                >
                                    {isSavingGithub ? 'Verifying...' : 'Connect'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Integrations;