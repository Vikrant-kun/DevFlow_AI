import { motion } from 'framer-motion';
import { Github, Slack, Trello, Hash, CheckCircle2 } from 'lucide-react';
import TopBar from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const Integrations = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isGithubConnected, setIsGithubConnected] = useState(false);
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);

    useEffect(() => {
        const checkGithubConnection = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const { data: { user } } = await supabase.auth.getUser();

            const connected = user?.app_metadata?.provider === 'github' ||
                user?.app_metadata?.providers?.includes('github');
            setIsGithubConnected(!!connected);

            if (connected) {
                if (user) {
                    const { data: settings } = await supabase
                        .from('user_settings')
                        .select('selected_repo')
                        .eq('user_id', user.id)
                        .single();

                    if (settings?.selected_repo) {
                        setSelectedRepo(settings.selected_repo);
                    }
                }

                const token = session?.provider_token;
                if (token) {
                    setIsLoadingRepos(true);
                    try {
                        const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const reposData = await res.json();
                            setRepos(reposData);
                        }
                    } catch (err) {
                        console.error("Failed to fetch repos", err);
                    } finally {
                        setIsLoadingRepos(false);
                    }
                }
            }
        };
        checkGithubConnection();
    }, []);

    const handleRepoChange = async (e) => {
        const repoFullName = e.target.value;
        setSelectedRepo(repoFullName);

        if (user) {
            const { error } = await supabase
                .from('user_settings')
                .upsert({ user_id: user.id, selected_repo: repoFullName });

            if (error) {
                showToast("Failed to save repository selection", "error");
            } else {
                showToast("Repository linked successfully", "success");
            }
        }
    };

    const integrations = [
        { id: 'github', name: 'GitHub', desc: 'Trigger workflows from PRs, merges, and issues.', icon: Github, connected: isGithubConnected },
        { id: 'slack', name: 'Slack', desc: 'Send notifications and alerts to channels.', icon: Hash, connected: false },
        { id: 'jira', name: 'Jira', desc: 'Sync issues, epic status, and bug reports.', icon: Trello, connected: false },
        { id: 'linear', name: 'Linear', desc: 'Link commits to issues and manage cycles.', icon: CheckCircle2, connected: false }, // Linear logo approximation
    ];

    return (
        <>
            <TopBar title={<span className="font-mono text-sm text-[#6EE7B7]">~ / integrations</span>} />
            <div className="p-6">
                <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-mono text-text-primary lowercase tracking-tight">integrations</h2>
                            <p className="text-text-secondary text-sm font-mono mt-1">connect_your_external_services</p>
                        </motion.div>
                    </motion.div>

                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {integrations.map((integration) => {
                            const Icon = integration.icon;
                            return (
                                <motion.div key={integration.id} variants={itemVariants} className="bg-[#111111] border border-[#222222] rounded-none p-6 flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#0D0D0D] border border-[#222] flex items-center justify-center shrink-0">
                                                <Icon className="w-6 h-6 text-text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-mono font-semibold text-text-primary">{integration.name}</h3>
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
                                                        <button className="text-xs font-mono text-[#64748B] px-4 py-2 border border-[#222] hover:text-text-primary hover:border-[#444] transition-colors rounded-none">
                                                            Manage
                                                        </button>
                                                        <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-[#222] rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 top-full">
                                                            <div className="p-1">
                                                                <div className="px-4 py-2 text-xs text-[#64748B] border-b border-[#222] mb-1">
                                                                    {user?.user_metadata?.user_name ? `@${user.user_metadata.user_name}` : 'GitHub User'}
                                                                </div>
                                                                <a href={`https://github.com/${user?.user_metadata?.user_name || ''}`} target="_blank" rel="noreferrer" className="block w-full text-left px-4 py-2 text-sm text-[#F1F5F9] hover:bg-[#222] rounded-sm transition-colors">View on GitHub →</a>
                                                                <button onClick={() => showToast("Disconnect coming soon", "info")} className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#222] rounded-sm transition-colors">Disconnect</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
                                                        <span className="w-2 h-2 rounded-full bg-[#333]"></span> disconnected
                                                    </span>
                                                    <button className="text-xs font-mono text-[#080808] bg-[#6EE7B7] hover:bg-[#34D399] px-4 py-2 transition-colors rounded-none">
                                                        Connect
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {integration.connected && integration.id === 'github' && (
                                            <div className="mt-4 flex flex-col gap-3 bg-[#0D0D0D] p-3 border border-[#222]">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-mono text-[#64748B]">Repository Link</span>
                                                    {selectedRepo && (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#6EE7B7]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] animate-pulse"></span> Active repo
                                                        </span>
                                                    )}
                                                </div>
                                                <select
                                                    className="w-full bg-[#111] border border-[#222] rounded-none text-xs font-mono text-[#F1F5F9] outline-none px-3 py-2 focus:border-[#444] transition-colors appearance-none cursor-pointer hover:border-[#333]"
                                                    value={selectedRepo || ''}
                                                    onChange={handleRepoChange}
                                                >
                                                    <option value="" disabled>Select a repository...</option>
                                                    {repos.map(r => (
                                                        <option key={r.id} value={r.full_name}>{r.full_name}</option>
                                                    ))}
                                                </select>
                                                {isLoadingRepos && <span className="text-[10px] font-mono text-[#64748B]">Loading available repositories...</span>}
                                                {!isLoadingRepos && repos.length === 0 && <span className="text-[10px] font-mono text-[#F59E0B]">No repos found. To view private repos, ensure scopes are granted.</span>}
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
