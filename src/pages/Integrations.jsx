import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Slack, Trello, Hash, CheckCircle2, X, Upload, FileCode, GitCommit } from 'lucide-react';
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
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isGithubConnected, setIsGithubConnected] = useState(false);
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);

    // ── API & CREATE REPO STATE ──────────────────────────────────────────────
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const [showCreateRepo, setShowCreateRepo] = useState(false);
    const [newRepoName, setNewRepoName] = useState('');
    const [newRepoPrivate, setNewRepoPrivate] = useState(false);
    const [isCreatingRepo, setIsCreatingRepo] = useState(false);

    // ── FILE UPLOAD STATE ────────────────────────────────────────────────────
    const [uploadFiles, setUploadFiles] = useState([]);
    const [commitMessage, setCommitMessage] = useState('');
    const [isCommitting, setIsCommitting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // ── SLACK STATE ──────────────────────────────────────────────────────────
    const [slackWebhook, setSlackWebhook] = useState('');
    const [isSlackConnected, setIsSlackConnected] = useState(false);
    const [showSlackInput, setShowSlackInput] = useState(false);
    const [isSavingSlack, setIsSavingSlack] = useState(false);

    useEffect(() => {
        const checkGithubConnection = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            const connected = authUser?.app_metadata?.provider === 'github' ||
                authUser?.app_metadata?.providers?.includes('github');
            setIsGithubConnected(!!connected);

            if (connected && session) {
                // Save provider_token to backend if available
                const providerToken = session?.provider_token;
                if (providerToken) {
                    try {
                        await fetch(`${API_URL}/github/token`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`
                            },
                            body: JSON.stringify({ token: providerToken })
                        });
                    } catch (err) {
                        console.error('Failed to save GitHub token', err);
                    }
                }

                // Load repos from backend
                if (authUser) {
                    const { data: settings } = await supabase
                        .from('user_settings')
                        .select('selected_repo_full_name, selected_repo')
                        .eq('user_id', authUser.id)
                        .single();
                    if (settings?.selected_repo_full_name || settings?.selected_repo) {
                        setSelectedRepo(settings.selected_repo_full_name || settings.selected_repo);
                    }
                }

                setIsLoadingRepos(true);
                try {
                    const res = await fetch(`${API_URL}/github/repos`, {
                        headers: { 'Authorization': `Bearer ${session.access_token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setRepos(data.repos || []);
                    }
                } catch (err) {
                    console.error('Failed to fetch repos', err);
                } finally {
                    setIsLoadingRepos(false);
                }
            }

            // Load Slack webhook
            if (authUser) {
                const { data: slackSettings } = await supabase
                    .from('user_settings')
                    .select('slack_webhook_url')
                    .eq('user_id', authUser.id)
                    .single();
                if (slackSettings?.slack_webhook_url) {
                    setSlackWebhook(slackSettings.slack_webhook_url);
                    setIsSlackConnected(true);
                }
            }
        };
        checkGithubConnection();
    }, []);

    const handleRepoChange = async (e) => {
        const repoFullName = e.target.value;
        const repo = repos.find(r => r.full_name === repoFullName);
        setSelectedRepo(repoFullName);

        if (user && repo) {
            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    selected_repo: repo.name,
                    selected_repo_full_name: repo.full_name,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) {
                showToast("Failed to save repository selection", "error");
            } else {
                showToast("Repository linked successfully", "success");
            }
        }
    };

    // ── HANDLERS ─────────────────────────────────────────────────────────────
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const dropped = Array.from(e.dataTransfer?.files || e.target?.files || []);
        setUploadFiles(prev => [...prev, ...dropped]);
    }, []);

    const handleCommitFiles = async () => {
        if (!selectedRepo || uploadFiles.length === 0) return;
        setIsCommitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            for (const file of uploadFiles) {
                const content = await file.text();
                const res = await fetch(`${API_URL}/github/commit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        repo_full_name: selectedRepo,
                        path: file.name,
                        content,
                        message: commitMessage || `Add ${file.name} via DevFlow`
                    })
                });
                if (!res.ok) throw new Error((await res.json()).detail);
            }
            showToast(`${uploadFiles.length} file(s) pushed to ${selectedRepo}`, 'success');
            setUploadFiles([]);
            setCommitMessage('');
        } catch (err) {
            showToast('Commit failed: ' + err.message, 'error');
        } finally {
            setIsCommitting(false);
        }
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
            setRepos(prev => [data.repo, ...prev]);
            setSelectedRepo(data.repo.full_name);
            setShowCreateRepo(false);
            setNewRepoName('');
            showToast(`Repo "${data.repo.name}" created!`, 'success');
        } catch (err) {
            showToast('Failed to create repo: ' + err.message, 'error');
        } finally {
            setIsCreatingRepo(false);
        }
    };

    const handleSaveSlack = async () => {
        if (!slackWebhook.trim()) return;
        setIsSavingSlack(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/github/token`, { // Still hitting backend to register change if needed, otherwise just Supabase
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ slack_webhook_url: slackWebhook.trim() })
            });

            // Save directly to Supabase
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

    const integrations = [
        { id: 'github', name: 'GitHub', desc: 'Trigger workflows from PRs, merges, and issues.', icon: Github, connected: isGithubConnected },
        { id: 'slack', name: 'Slack', desc: 'Send notifications and alerts to channels.', icon: Hash, connected: isSlackConnected },
        { id: 'jira', name: 'Jira', desc: 'Sync issues, epic status, and bug reports.', icon: Trello, connected: false },
        { id: 'linear', name: 'Linear', desc: 'Link commits to issues and manage cycles.', icon: CheckCircle2, connected: false },
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
                                                                    {integration.id === 'github' ? (user?.user_metadata?.user_name ? `@${user.user_metadata.user_name}` : 'GitHub User') : 'Slack Workspace'}
                                                                </div>
                                                                {integration.id === 'github' && (
                                                                    <a href={`https://github.com/${user?.user_metadata?.user_name || ''}`} target="_blank" rel="noreferrer" className="block w-full text-left px-4 py-2 text-sm text-[#F1F5F9] hover:bg-[#222] rounded-xl transition-colors">View on GitHub →</a>
                                                                )}
                                                                <button onClick={() => showToast("Disconnect coming soon", "info")} className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#222] rounded-xl transition-colors">Disconnect</button>
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
                                                                const { error } = await supabase.auth.signInWithOAuth({
                                                                    provider: 'github',
                                                                    options: { scopes: 'repo read:user', redirectTo: window.location.href }
                                                                });
                                                                if (error) showToast('GitHub connect failed', 'error');
                                                            } else if (integration.id === 'slack') {
                                                                setShowSlackInput(true);
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

                                        {/* ── GITHUB CONNECTED BLOCK ────────────────────────────────────────── */}
                                        {integration.connected && integration.id === 'github' && (
                                            <div className="mt-4 flex flex-col gap-3 bg-[#0D0D0D] p-3 border border-[#222] rounded-xl">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-mono text-[#64748B]">Repository</span>
                                                    <button
                                                        onClick={() => setShowCreateRepo(true)}
                                                        className="text-[10px] font-mono text-[#6EE7B7] hover:underline flex items-center gap-1">
                                                        + New Repo
                                                    </button>
                                                </div>
                                                <select
                                                    className="w-full bg-[#111] border border-[#222] rounded-xl text-xs font-mono text-[#F1F5F9] outline-none px-3 py-2 focus:border-[#444] transition-colors appearance-none cursor-pointer hover:border-[#333]"
                                                    value={selectedRepo || ''}
                                                    onChange={handleRepoChange}>
                                                    <option value="" disabled>Select a repository...</option>
                                                    {repos.map(r => (
                                                        <option key={r.id} value={r.full_name}>{r.full_name}</option>
                                                    ))}
                                                </select>
                                                {isLoadingRepos && <span className="text-[10px] font-mono text-[#64748B]">Loading repositories...</span>}
                                                {!isLoadingRepos && repos.length === 0 && (
                                                    <span className="text-[10px] font-mono text-[#F59E0B]">No repos found. Create one above.</span>
                                                )}

                                                {/* ── FILE UPLOAD ZONE ───────────────────────────────────────────── */}
                                                {selectedRepo && (
                                                    <div className="mt-2 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-widest">Push Files</span>
                                                            <span className="text-[10px] font-mono text-[#444]">{selectedRepo}</span>
                                                        </div>
                                                        {/* Drop Zone */}
                                                        <div
                                                            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                                                            onDragLeave={() => setIsDragOver(false)}
                                                            onDrop={handleDrop}
                                                            onClick={() => document.getElementById('devflow-file-input').click()}
                                                            className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${isDragOver
                                                                ? 'border-[#6EE7B7]/60 bg-[#6EE7B7]/5'
                                                                : 'border-[#222] hover:border-[#6EE7B7]/30 hover:bg-[#6EE7B7]/3 bg-[#0A0A0A]'
                                                                }`}>
                                                            <input
                                                                id="devflow-file-input"
                                                                type="file"
                                                                multiple
                                                                className="hidden"
                                                                onChange={handleDrop}
                                                            />
                                                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isDragOver ? 'border-[#6EE7B7]/40 bg-[#6EE7B7]/10' : 'border-[#222] bg-[#111]'
                                                                }`}>
                                                                <Upload className={`w-4 h-4 transition-colors ${isDragOver ? 'text-[#6EE7B7]' : 'text-[#444]'}`} />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="font-mono text-xs text-[#64748B]">
                                                                    {isDragOver ? 'Drop to add files' : 'Drag files or click to browse'}
                                                                </p>
                                                                <p className="font-mono text-[10px] text-[#333] mt-0.5">Any file type · Multiple allowed</p>
                                                            </div>
                                                        </div>

                                                        {/* File List */}
                                                        <AnimatePresence>
                                                            {uploadFiles.length > 0 && (
                                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }} className="space-y-2">
                                                                    {uploadFiles.map((file, i) => (
                                                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                                                            className="flex items-center gap-3 bg-[#111] border border-[#1A1A1A] rounded-xl px-3 py-2.5">
                                                                            <FileCode className="w-3.5 h-3.5 text-[#6EE7B7] shrink-0" />
                                                                            <span className="font-mono text-xs text-[#F1F5F9] flex-1 truncate">{file.name}</span>
                                                                            <span className="font-mono text-[10px] text-[#444] shrink-0">
                                                                                {(file.size / 1024).toFixed(1)}kb
                                                                            </span>
                                                                            <button onClick={(e) => { e.stopPropagation(); setUploadFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                                                                                className="text-[#333] hover:text-[#F87171] transition-colors">
                                                                                <X className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </motion.div>
                                                                    ))}
                                                                    {/* Commit message + push */}
                                                                    <input
                                                                        type="text"
                                                                        value={commitMessage}
                                                                        onChange={e => setCommitMessage(e.target.value)}
                                                                        placeholder={`Add ${uploadFiles.length} file(s) via DevFlow`}
                                                                        className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 transition-colors placeholder:text-[#333]"
                                                                    />
                                                                    <button
                                                                        onClick={handleCommitFiles}
                                                                        disabled={isCommitting}
                                                                        className="w-full flex items-center justify-center gap-2 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                                                        {isCommitting
                                                                            ? <div className="w-3.5 h-3.5 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" />
                                                                            : <GitCommit className="w-3.5 h-3.5" />}
                                                                        {isCommitting ? 'Pushing...' : `Push ${uploadFiles.length} file(s) to GitHub`}
                                                                    </button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}

                                                {/* Create Repo Modal */}
                                                <AnimatePresence>
                                                    {showCreateRepo && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                                                            style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)' }}
                                                            onClick={() => setShowCreateRepo(false)}>
                                                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className="w-full max-w-md bg-[#0D0D0D] border border-[#222] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden"
                                                                onClick={e => e.stopPropagation()}>
                                                                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A]">
                                                                    <div className="flex items-center gap-3">
                                                                        <Github className="w-5 h-5 text-[#6EE7B7]" />
                                                                        <h3 className="font-mono text-sm font-bold text-[#F1F5F9]">Create Repository</h3>
                                                                    </div>
                                                                    <button onClick={() => setShowCreateRepo(false)} className="text-[#64748B] hover:text-[#F1F5F9] bg-[#111] p-1.5 rounded-full transition-colors">
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                <div className="p-6 space-y-4">
                                                                    <div>
                                                                        <label className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider mb-2 block">Repository Name</label>
                                                                        <input
                                                                            type="text"
                                                                            value={newRepoName}
                                                                            onChange={e => setNewRepoName(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                                                                            placeholder="my-awesome-project"
                                                                            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/40 transition-colors placeholder:text-[#444]"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center justify-between bg-[#111] border border-[#222] rounded-xl px-4 py-3">
                                                                        <div>
                                                                            <p className="font-mono text-xs text-[#F1F5F9]">Private repository</p>
                                                                            <p className="font-mono text-[10px] text-[#64748B] mt-0.5">Only you can see this repo</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => setNewRepoPrivate(!newRepoPrivate)}
                                                                            className={`w-10 h-5 rounded-full transition-colors relative ${newRepoPrivate ? 'bg-[#6EE7B7]' : 'bg-[#333]'}`}>
                                                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${newRepoPrivate ? 'left-5' : 'left-0.5'}`} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="px-6 pb-6 flex gap-3">
                                                                    <button onClick={() => setShowCreateRepo(false)}
                                                                        className="flex-1 font-mono text-xs text-[#64748B] border border-[#222] py-2.5 rounded-xl hover:border-[#333] hover:text-[#F1F5F9] transition-all bg-[#111]">
                                                                        Cancel
                                                                    </button>
                                                                    <button onClick={handleCreateRepo} disabled={!newRepoName.trim() || isCreatingRepo}
                                                                        className="flex-1 font-mono text-xs font-bold bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                                                        {isCreatingRepo
                                                                            ? <div className="w-3.5 h-3.5 border-2 border-[#080808]/40 border-t-[#080808] rounded-full animate-spin" />
                                                                            : <Github className="w-3.5 h-3.5" />}
                                                                        {isCreatingRepo ? 'Creating...' : 'Create Repo'}
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
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