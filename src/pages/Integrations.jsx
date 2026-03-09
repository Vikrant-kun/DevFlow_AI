import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Slack, Trello, Hash, CheckCircle2, X } from 'lucide-react';
import TopBar from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } }
};
const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

const Integrations = () => {
    const { user, isGithubConnected, repos, selectedRepo, setSelectedRepo, githubLoading, connectGithubPat, fetchRepos } = useAuth();
    const { showToast } = useToast();
    const [showGithubInput, setShowGithubInput] = useState(false);
    const [githubPAT, setGithubPAT] = useState('');
    const [isSavingGithub, setIsSavingGithub] = useState(false);

    // ── API & CREATE REPO STATE ──────────────────────────────────────────────
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const [showCreateRepo, setShowCreateRepo] = useState(false);
    const [newRepoName, setNewRepoName] = useState('');
    const [newRepoPrivate, setNewRepoPrivate] = useState(false);
    const [isCreatingRepo, setIsCreatingRepo] = useState(false);

    // ── SLACK STATE ──────────────────────────────────────────────────────────
    const [slackWebhook, setSlackWebhook] = useState('');
    const [isSlackConnected, setIsSlackConnected] = useState(false);
    const [showSlackInput, setShowSlackInput] = useState(false);
    const [isSavingSlack, setIsSavingSlack] = useState(false);

    // ── NOTION, LINEAR & JIRA STATE ──────────────────────────────────────────
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

    // Load Slack webhook, Notion, Linear & Jira
    useEffect(() => {
        const loadOtherIntegrations = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: slackSettings } = await supabase
                    .from('user_settings')
                    .select('slack_webhook_url')
                    .eq('user_id', authUser.id)
                    .maybeSingle();
                if (slackSettings?.slack_webhook_url) {
                    setSlackWebhook(slackSettings.slack_webhook_url);
                    setIsSlackConnected(true);
                }

                const { data: extraSettings } = await supabase
                    .from('user_settings')
                    .select('notion_token, linear_token, jira_token, jira_domain')
                    .eq('user_id', authUser.id)
                    .maybeSingle();

                if (extraSettings?.notion_token) { setNotionToken(extraSettings.notion_token); setIsNotionConnected(true); }
                if (extraSettings?.linear_token) { setLinearToken(extraSettings.linear_token); setIsLinearConnected(true); }
                if (extraSettings?.jira_token) { setJiraToken(extraSettings.jira_token); setIsJiraConnected(true); }
                if (extraSettings?.jira_domain) setJiraDomain(extraSettings.jira_domain);
            }
        };
        loadOtherIntegrations();
    }, []);

    const handleRepoSelect = async (fullName) => {
        const repoObj = { name: fullName.split('/')[1], full_name: fullName };
        setSelectedRepo(repoObj);
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.from('user_settings').upsert({
            user_id: session.user.id,
            selected_repo: repoObj.name,
            selected_repo_full_name: fullName,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        showToast(`Active repo set to ${fullName}`, 'success');
    };

    const handleCreateRepo = async () => {
        if (!newRepoName.trim()) return;
        setIsCreatingRepo(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/github/repos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ name: newRepoName.trim(), private: newRepoPrivate })
            });

            if (!res.ok) throw new Error((await res.json()).detail);

            const data = await res.json();
            // Refresh repos list from context
            await fetchRepos();
            setSelectedRepo({ name: data.repo.name, full_name: data.repo.full_name });
            setShowCreateRepo(false);
            setNewRepoName('');
            showToast(`Repo "${data.repo.name}" created!`, 'success');
        } catch (err) {
            showToast('Failed to create repo: ' + err.message, 'error');
        } finally {
            setIsCreatingRepo(false);
        }
    };

    const handleSaveGithubPAT = async () => {
        if (!githubPAT.trim()) return;
        try {
            await connectGithubPat(githubPAT.trim());
            setShowGithubInput(false);
            setGithubPAT('');
            showToast('GitHub connected!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to save GitHub token', 'error');
        }
    };

    const handleSaveSlack = async () => {
        if (!slackWebhook.trim()) return;
        setIsSavingSlack(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch(`${API_URL}/github/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ slack_webhook_url: slackWebhook.trim() })
            });

            const { error } = await supabase.from('user_settings').upsert({
                user_id: user.id,
                slack_webhook_url: slackWebhook.trim(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

            if (error) throw error;

            setIsSlackConnected(true);
            setShowSlackInput(false);
            showToast('Slack connected!', 'success');
        } catch (err) {
            showToast('Failed to save Slack webhook', 'error');
        } finally {
            setIsSavingSlack(false);
        }
    };

    const handleSaveNotion = async () => {
        if (!notionToken.trim()) return;
        setIsSavingNotion(true);
        try {
            const { error } = await supabase.from('user_settings').upsert({
                user_id: user.id, notion_token: notionToken.trim(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            if (error) throw error;
            setIsNotionConnected(true); setShowNotionInput(false);
            showToast('Notion connected!', 'success');
        } catch { showToast('Failed to save Notion token', 'error'); }
        finally { setIsSavingNotion(false); }
    };

    const handleSaveLinear = async () => {
        if (!linearToken.trim()) return;
        setIsSavingLinear(true);
        try {
            const { error } = await supabase.from('user_settings').upsert({
                user_id: user.id, linear_token: linearToken.trim(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            if (error) throw error;
            setIsLinearConnected(true); setShowLinearInput(false);
            showToast('Linear connected!', 'success');
        } catch { showToast('Failed to save Linear token', 'error'); }
        finally { setIsSavingLinear(false); }
    };

    const handleSaveJira = async () => {
        if (!jiraToken.trim() || !jiraDomain.trim()) return;
        setIsSavingJira(true);
        try {
            const { error } = await supabase.from('user_settings').upsert({
                user_id: user.id,
                jira_token: jiraToken.trim(),
                jira_domain: jiraDomain.trim(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            if (error) throw error;
            setIsJiraConnected(true); setShowJiraInput(false);
            showToast('Jira connected!', 'success');
        } catch { showToast('Failed to save Jira credentials', 'error'); }
        finally { setIsSavingJira(false); }
    };

    const integrations = [
        { id: 'github', name: 'GitHub', desc: 'Trigger workflows from PRs, merges, and issues.', icon: Github, connected: isGithubConnected },
        { id: 'slack', name: 'Slack', desc: 'Send notifications and alerts to channels.', icon: Hash, connected: isSlackConnected },
        { id: 'notion', name: 'Notion', desc: 'Create pages and update databases automatically.', icon: CheckCircle2, connected: isNotionConnected },
        { id: 'linear', name: 'Linear', desc: 'Create issues and manage cycles automatically.', icon: Trello, connected: isLinearConnected },
        { id: 'jira', name: 'Jira', desc: 'Sync issues, epic status, and bug reports.', icon: Trello, connected: isJiraConnected },
    ];

    return (
        <>
            <TopBar title={<span className="font-mono text-sm text-[#6EE7B7]">~ / integrations</span>} />
            <div className="p-6">
                <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-mono text-[#F1F5F9] lowercase tracking-tight">integrations</h2>
                            <p className="text-[#64748B] text-sm font-mono mt-1">connect_your_external_services</p>
                        </motion.div>
                    </motion.div>

                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {integrations.map((integration) => {
                            const Icon = integration.icon;
                            return (
                                <motion.div key={integration.id} variants={itemVariants} className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#0D0D0D] border border-[#222] flex items-center justify-center shrink-0 rounded-xl">
                                                <Icon className="w-6 h-6 text-[#F1F5F9]" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-mono font-semibold text-[#F1F5F9]">{integration.name}</h3>
                                                <p className="text-[#64748B] text-xs font-mono mt-1 max-w-[200px]">{integration.desc}</p>
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
                                                    <div className="relative group flex items-center h-full">
                                                        <button className="text-xs font-mono text-[#64748B] px-4 py-2 border border-[#222] hover:text-[#F1F5F9] hover:border-[#444] transition-colors rounded-xl">
                                                            Manage
                                                        </button>
                                                        <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-[#222] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 top-full">
                                                            <div className="p-1">
                                                                <div className="px-4 py-2 text-xs text-[#64748B] border-b border-[#222] mb-1 truncate">
                                                                    {integration.id === 'github' ? (user?.user_metadata?.user_name ? `@${user.user_metadata.user_name}` : 'GitHub User') : 'Connected Workspace'}
                                                                </div>
                                                                {integration.id === 'github' && (
                                                                    <a href={`https://github.com/${user?.user_metadata?.user_name || ''}`} target="_blank" rel="noreferrer" className="block w-full text-left px-4 py-2 text-sm text-[#F1F5F9] hover:bg-[#222] rounded-xl transition-colors">View on GitHub →</a>
                                                                )}
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const { data: { session } } = await supabase.auth.getSession();
                                                                            await supabase
                                                                                .from('user_settings')
                                                                                .update({
                                                                                    github_token: null,
                                                                                    selected_repo_full_name: null,
                                                                                    updated_at: new Date().toISOString()
                                                                                })
                                                                                .eq('user_id', session.user.id);
                                                                            // Clear context too
                                                                            window.location.reload();
                                                                        } catch (err) {
                                                                            showToast('Failed to disconnect GitHub', 'error');
                                                                        }
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#222] rounded-xl transition-colors">
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
                                                        onClick={async () => {
                                                            if (integration.id === 'github') {
                                                                setShowGithubInput(true);
                                                            } else if (integration.id === 'slack') {
                                                                setShowSlackInput(true);
                                                            } else if (integration.id === 'notion') {
                                                                setShowNotionInput(true);
                                                            } else if (integration.id === 'linear') {
                                                                setShowLinearInput(true);
                                                            } else if (integration.id === 'jira') {
                                                                setShowJiraInput(true);
                                                            } else {
                                                                showToast(`${integration.name} integration coming soon`, 'info');
                                                            }
                                                        }}
                                                        className="text-xs font-mono text-[#080808] bg-[#6EE7B7] hover:bg-[#34D399] px-4 py-2 transition-colors rounded-xl font-bold">
                                                        Connect
                                                    </button>
                                                </>
                                            )}
                                        </div>




                                        {showGithubInput && (
                                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-md">
                                                    <h3 className="text-base font-mono font-semibold text-[#F1F5F9] mb-1">Connect GitHub</h3>
                                                    <p className="text-[#64748B] text-xs font-mono mb-4">
                                                        Create a Personal Access Token at{' '}
                                                        <a href="https://github.com/settings/tokens/new?scopes=repo,read:user" target="_blank" rel="noreferrer"
                                                            className="text-[#6EE7B7] hover:underline">github.com/settings/tokens</a>
                                                        {' '}with <span className="text-[#F1F5F9]">repo</span> and <span className="text-[#F1F5F9]">read:user</span> scopes.
                                                    </p>
                                                    <input
                                                        type="password"
                                                        value={githubPAT}
                                                        onChange={e => setGithubPAT(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && !isSavingGithub && githubPAT.trim() && handleSaveGithubPAT()}
                                                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                                        className="w-full bg-[#0D0D0D] border border-[#333] rounded-xl px-4 py-3 text-sm font-mono text-[#F1F5F9] placeholder-[#444] focus:outline-none focus:border-[#6EE7B7] mb-4"
                                                    />
                                                    <div className="flex gap-3">
                                                        <button onClick={() => { setShowGithubInput(false); setGithubPAT(''); }}
                                                            className="flex-1 px-4 py-2 text-sm font-mono text-[#64748B] border border-[#222] rounded-xl hover:border-[#444] transition-colors">
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                setIsSavingGithub(true);
                                                                try {
                                                                    await connectGithubPat(githubPAT);
                                                                    setShowGithubInput(false);
                                                                    setGithubPAT('');
                                                                    showToast('GitHub connected!', 'success');
                                                                } catch (err) {
                                                                    showToast(err.message || 'Invalid PAT', 'error');
                                                                } finally {
                                                                    setIsSavingGithub(false);
                                                                }
                                                            }}
                                                            disabled={isSavingGithub || !githubPAT.trim()}
                                                            className="flex-1 px-4 py-2 text-sm font-mono text-[#080808] bg-[#6EE7B7] hover:bg-[#34D399] rounded-xl font-bold transition-colors disabled:opacity-50">
                                                            {isSavingGithub ? 'Verifying...' : 'Connect'}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}

                                        {/* ── SLACK CONNECTED BLOCK ─────────────────────────────────────────── */}
                                        {integration.id === 'slack' && (
                                            <AnimatePresence>
                                                {showSlackInput && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3 bg-[#0D0D0D] border border-[#222] rounded-xl p-3">
                                                        <div>
                                                            <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-2">Webhook URL</p>
                                                            <input
                                                                type="text"
                                                                value={slackWebhook}
                                                                onChange={e => setSlackWebhook(e.target.value)}
                                                                placeholder="https://hooks.slack.com/services/..."
                                                                className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]"
                                                            />
                                                            <p className="font-mono text-[10px] text-[#444] mt-1.5">
                                                                Get this from Slack → Apps → Incoming Webhooks
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setShowSlackInput(false)}
                                                                className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2 rounded-xl hover:border-[#333] transition-all">
                                                                Cancel
                                                            </button>
                                                            <button onClick={handleSaveSlack} disabled={!slackWebhook.trim() || isSavingSlack}
                                                                className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                                                {isSavingSlack ? <div className="w-3 h-3 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" /> : null}
                                                                Save Webhook
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}
                                        {integration.id === 'slack' && isSlackConnected && !showSlackInput && (
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(slackWebhook, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ text: '✅ DevFlow connection test successful!' })
                                                            });
                                                            if (res.ok) showToast('Slack test message sent!', 'success');
                                                            else showToast('Slack test failed', 'error');
                                                        } catch { showToast('Slack test failed', 'error'); }
                                                    }}
                                                    className="flex-1 font-mono text-[10px] text-[#64748B] border border-[#222] py-2 rounded-xl hover:border-[#333] transition-all">
                                                    Test Connection
                                                </button>
                                                <button
                                                    onClick={() => { setIsSlackConnected(false); setSlackWebhook(''); setShowSlackInput(true); }}
                                                    className="font-mono text-[10px] text-[#F87171] border border-[#F87171]/20 px-3 py-2 rounded-xl hover:bg-[#F87171]/10 transition-all">
                                                    Disconnect
                                                </button>
                                            </div>
                                        )}

                                        {/* ── NOTION CONNECTED BLOCK ────────────────────────────────────────── */}
                                        {integration.id === 'notion' && (
                                            <AnimatePresence>
                                                {showNotionInput && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3 bg-[#0D0D0D] border border-[#222] rounded-xl p-3">
                                                        <div>
                                                            <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-2">Integration Token</p>
                                                            <input type="text" value={notionToken} onChange={e => setNotionToken(e.target.value)}
                                                                placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                                className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]" />
                                                            <p className="font-mono text-[10px] text-[#444] mt-1.5">
                                                                Get from notion.so/my-integrations → New Integration
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setShowNotionInput(false)}
                                                                className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2 rounded-xl hover:border-[#333] transition-all">
                                                                Cancel
                                                            </button>
                                                            <button onClick={handleSaveNotion} disabled={!notionToken.trim() || isSavingNotion}
                                                                className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                                                {isSavingNotion && <div className="w-3 h-3 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" />}
                                                                Save Token
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}
                                        {integration.id === 'notion' && isNotionConnected && !showNotionInput && (
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => { setIsNotionConnected(false); setNotionToken(''); setShowNotionInput(true); }}
                                                    className="flex-1 font-mono text-[10px] text-[#F87171] border border-[#F87171]/20 px-3 py-2 rounded-xl hover:bg-[#F87171]/10 transition-all">
                                                    Disconnect
                                                </button>
                                            </div>
                                        )}

                                        {/* ── LINEAR CONNECTED BLOCK ────────────────────────────────────────── */}
                                        {integration.id === 'linear' && (
                                            <AnimatePresence>
                                                {showLinearInput && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3 bg-[#0D0D0D] border border-[#222] rounded-xl p-3">
                                                        <div>
                                                            <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-2">API Key</p>
                                                            <input type="text" value={linearToken} onChange={e => setLinearToken(e.target.value)}
                                                                placeholder="lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                                className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]" />
                                                            <p className="font-mono text-[10px] text-[#444] mt-1.5">
                                                                Get from linear.app/settings/api → Personal API keys
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setShowLinearInput(false)}
                                                                className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2 rounded-xl hover:border-[#333] transition-all">
                                                                Cancel
                                                            </button>
                                                            <button onClick={handleSaveLinear} disabled={!linearToken.trim() || isSavingLinear}
                                                                className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                                                {isSavingLinear && <div className="w-3 h-3 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" />}
                                                                Save API Key
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}
                                        {integration.id === 'linear' && isLinearConnected && !showLinearInput && (
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => { setIsLinearConnected(false); setLinearToken(''); setShowLinearInput(true); }}
                                                    className="flex-1 font-mono text-[10px] text-[#F87171] border border-[#F87171]/20 px-3 py-2 rounded-xl hover:bg-[#F87171]/10 transition-all">
                                                    Disconnect
                                                </button>
                                            </div>
                                        )}

                                        {/* ── JIRA CONNECTED BLOCK ──────────────────────────────────────────── */}
                                        {integration.id === 'jira' && (
                                            <AnimatePresence>
                                                {showJiraInput && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3 bg-[#0D0D0D] border border-[#222] rounded-xl p-3">
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-2">Jira Domain</p>
                                                                <input type="text" value={jiraDomain} onChange={e => setJiraDomain(e.target.value)}
                                                                    placeholder="yourcompany.atlassian.net"
                                                                    className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]" />
                                                            </div>
                                                            <div>
                                                                <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest mb-2">API Token</p>
                                                                <input type="password" value={jiraToken} onChange={e => setJiraToken(e.target.value)}
                                                                    placeholder="ATATxxxxxxxxxxxxxxxxxxxxxxxx"
                                                                    className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 placeholder:text-[#333]" />
                                                                <p className="font-mono text-[10px] text-[#444] mt-1.5">
                                                                    Get from id.atlassian.com/manage-profile/security/api-tokens
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setShowJiraInput(false)}
                                                                className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2 rounded-xl hover:border-[#333] transition-all">
                                                                Cancel
                                                            </button>
                                                            <button onClick={handleSaveJira} disabled={!jiraToken.trim() || !jiraDomain.trim() || isSavingJira}
                                                                className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                                                {isSavingJira && <div className="w-3 h-3 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" />}
                                                                Save Credentials
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}
                                        {integration.id === 'jira' && isJiraConnected && !showJiraInput && (
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => { setIsJiraConnected(false); setJiraToken(''); setJiraDomain(''); setShowJiraInput(true); }}
                                                    className="flex-1 font-mono text-[10px] text-[#F87171] border border-[#F87171]/20 px-3 py-2 rounded-xl hover:bg-[#F87171]/10 transition-all">
                                                    Disconnect
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default Integrations;