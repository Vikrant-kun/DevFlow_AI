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

const [isGithubConnected, setIsGithubConnected] = useState(false);
const { showToast } = useToast();

useEffect(() => {
    const checkGithubConnection = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const connected = user?.app_metadata?.provider === 'github' ||
            user?.app_metadata?.providers?.includes('github');
        setIsGithubConnected(!!connected);
    };
    checkGithubConnection();
}, []);

const integrations = [
    { id: 'github', name: 'GitHub', desc: 'Trigger workflows from PRs, merges, and issues.', icon: Github, connected: isGithubConnected },
    { id: 'slack', name: 'Slack', desc: 'Send notifications and alerts to channels.', icon: Hash, connected: false },
    { id: 'jira', name: 'Jira', desc: 'Sync issues, epic status, and bug reports.', icon: Trello, connected: false },
    { id: 'linear', name: 'Linear', desc: 'Link commits to issues and manage cycles.', icon: CheckCircle2, connected: false }, // Linear logo approximation
];

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const Integrations = () => {
    const { user } = useAuth();
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
                                    <div className="mt-6 flex items-center justify-between border-t border-[#1A1A1A] pt-4">
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
