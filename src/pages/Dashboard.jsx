import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FileEdit, Plus, Layers, CheckCircle2, PauseCircle, XCircle, X, Github, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const getStatusBadge = (status) => {
    switch (status) {
        case 'Active':
            return <span className="flex items-center gap-2 text-sm font-mono text-text-secondary"><span className="w-2 h-2 rounded-full bg-[#6EE7B7]"></span> Active</span>;
        case 'Paused':
            return <span className="flex items-center gap-2 text-sm font-mono text-text-secondary"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Paused</span>;
        case 'Failed':
            return <span className="flex items-center gap-2 text-sm font-mono text-text-secondary"><span className="w-2 h-2 rounded-full bg-[#F87171]"></span> Failed</span>;
        default:
            return null;
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

import TopBar from '../components/TopBar';

const Dashboard = () => {
    const navigate = useNavigate();
    const [recentWorkflows, setRecentWorkflows] = useState([]);
    const [stats, setStats] = useState([
        { label: "Total Workflows", value: "0" },
        { label: "Runs Today", value: "0" },
        { label: "Success Rate", value: "—" },
        { label: "Time Saved", value: "0h" }
    ]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [repos, setRepos] = useState([]);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [isGithubConnected, setIsGithubConnected] = useState(false);
    const [showRepoSelector, setShowRepoSelector] = useState(false);
    const { showToast } = useToast();
    const { user } = useAuth();
    const [checklistDismissed, setChecklistDismissed] = useState(true); // Default true until checked
    const [checklistItems, setChecklistItems] = useState([
        { id: 'create_account', label: 'create_account', done: true, route: null },
        { id: 'connect_github', label: 'connect_github', done: false, route: '/integrations' },
        { id: 'create_workflow', label: 'create_first_workflow', done: false, route: '/workflows/new' },
        { id: 'run_pipeline', label: 'run_first_pipeline', done: false, route: null, locked: true }
    ]);

    useEffect(() => {
        const isDismissed = localStorage.getItem('devflow_checklist_dismissed') === 'true';
        setChecklistDismissed(isDismissed);

        const checkStates = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: { session } } = await supabase.auth.getSession();
            const isGithubConnected = user?.app_metadata?.provider === 'github' ||
                user?.app_metadata?.providers?.includes('github');
            setIsGithubConnected(!!isGithubConnected);

            if (user && isGithubConnected) {
                const { data: settings } = await supabase
                    .from('user_settings')
                    .select('selected_repo_full_name, selected_repo')
                    .eq('user_id', user.id)
                    .single();

                if (settings && (settings.selected_repo_full_name || settings.selected_repo)) {
                    setSelectedRepo({
                        name: settings.selected_repo || settings.selected_repo_full_name.split('/')[1],
                        full_name: settings.selected_repo_full_name || settings.selected_repo
                    });
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

            const hasWorkflow = localStorage.getItem('devflow_has_workflow') === 'true';
            const hasRun = localStorage.getItem('devflow_has_run') === 'true';

            setChecklistItems([
                { id: 'create_account', label: 'create_account', done: true, route: null },
                { id: 'connect_github', label: 'connect_github', done: !!isGithubConnected, route: '/integrations' },
                { id: 'create_workflow', label: 'create_first_workflow', done: hasWorkflow, route: '/workflows/new' },
                { id: 'run_pipeline', label: 'run_first_pipeline', done: hasRun, route: null, locked: true }
            ]);

            if (user) {
                const { data: workflowsData } = await supabase
                    .from('workflows')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (workflowsData) {
                    setStats([
                        { label: 'Total Workflows', value: workflowsData.length.toString() },
                        { label: 'Runs Today', value: '0' },
                        { label: 'Success Rate', value: '—' },
                        { label: 'Time Saved', value: '0h' }
                    ]);

                    const recent = workflowsData.slice(0, 4).map(w => ({
                        id: w.id,
                        name: w.name,
                        status: w.status.charAt(0).toUpperCase() + w.status.slice(1),
                        lastRun: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : 'Never'
                    }));
                    setRecentWorkflows(recent);
                }
            }
        };
        checkStates();
    }, []);

    const handleDismissChecklist = () => {
        localStorage.setItem('devflow_checklist_dismissed', 'true');
        setChecklistDismissed(true);
    };

    const handleChecklistClick = (item) => {
        if (item.locked) return;
        if (item.route) {
            navigate(item.route);
        } else {
            // Optimistic completion for demo purposes if clicked and no route
            const updated = checklistItems.map(i => i.id === item.id ? { ...i, done: true } : i);
            setChecklistItems(updated);

            if (updated.every(i => i.done || i.locked === false)) {
                handleDismissChecklist();
                showToast("You're all set. Welcome to DevFlow. 🚀", "success");
            }
        }
    };

    const handleRepoSelect = async (e) => {
        const repoFullName = e.target.value;
        const repo = repos.find(r => r.full_name === repoFullName);
        if (!repo) return;

        setSelectedRepo({
            name: repo.name,
            full_name: repo.full_name
        });

        if (user) {
            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    selected_repo: repo.name,
                    selected_repo_full_name: repo.full_name,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) {
                showToast("Failed to save repository", "error");
            } else {
                showToast("Repository updated", "success");
            }
        }
        setShowRepoSelector(false);
    };

    return (
        <>
            <TopBar title={<span className="font-mono text-sm text-[#6EE7B7]">~ / dashboard</span>} />
            <div className="p-6">
                <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-mono text-text-primary lowercase tracking-tight">dashboard</h2>
                            <p className="text-text-secondary text-sm font-mono mt-1">overview_of_active_pipelines</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex gap-3">
                            <Button variant="ghost" className="gap-2" onClick={() => navigate('/templates')}>
                                <Layers className="w-4 h-4" /> Browse Templates
                            </Button>
                            <Button variant="primary" className="gap-2 shadow-glow-primary" onClick={() => navigate('/workflows/new')}>
                                <Plus className="w-4 h-4" /> New Workflow
                            </Button>
                        </motion.div>
                    </motion.div>

                    <AnimatePresence>
                        {!checklistDismissed && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                className="w-full"
                            >
                                <div className="bg-[#111] border border-[#222] p-6 relative">
                                    <button
                                        onClick={handleDismissChecklist}
                                        className="absolute top-4 right-4 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <h3 className="font-mono text-sm text-[#6EE7B7] mb-6">getting_started</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {checklistItems.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleChecklistClick(item)}
                                                className={`flex items-center gap-3 font-mono text-sm transition-colors ${item.locked ? 'opacity-50 cursor-not-allowed text-[#64748B]' : item.done ? 'text-[#6EE7B7] cursor-default' : 'text-[#64748B] hover:text-[#F1F5F9] cursor-pointer'}`}
                                            >
                                                {item.done ? (
                                                    <span className="text-[#6EE7B7]">✓</span>
                                                ) : (
                                                    <span className="text-[#64748B]">○</span>
                                                )}
                                                <span>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div key={i} variants={itemVariants} className="bg-[#111111] rounded-md p-5 border-l-2 border-[#6EE7B7] hover:bg-[#151515] transition-colors">
                                <p className="text-[#64748B] text-xs font-mono lowercase tracking-wider mb-2">{stat.label}</p>
                                <h3 className="text-3xl font-mono font-bold tracking-tight text-[#6EE7B7]">{stat.value}</h3>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Active Repository Card */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-mono text-[#64748B] lowercase tracking-wider">active_repository</h3>
                        </div>

                        <div className="bg-[#111111] border border-[#222222] rounded-md p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#0D0D0D] border border-[#222] flex items-center justify-center shrink-0">
                                    <Github className="w-6 h-6 text-[#F1F5F9]" />
                                </div>
                                <div>
                                    {selectedRepo ? (
                                        <>
                                            <h3 className="text-base font-mono font-semibold text-[#F1F5F9] mb-1">{selectedRepo.full_name}</h3>
                                            <span className="flex items-center gap-2 text-xs font-mono text-[#6EE7B7]">
                                                <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse"></span> connected
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-base font-mono font-semibold text-[#F1F5F9] mb-1">No repository connected</h3>
                                            <span className="text-xs font-mono text-[#64748B]">
                                                Select a GitHub repository to get started with dev pipelines.
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto relative">
                                {selectedRepo ? (
                                    <>
                                        <Button variant="ghost" onClick={() => setShowRepoSelector(!showRepoSelector)} className="font-mono text-sm border-none shadow-none text-[#F1F5F9]">
                                            Change Repo
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="gap-2 bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] border-none shadow-none font-bold"
                                            onClick={() => navigate(`/workflows/new?repo=${selectedRepo.full_name}`)}
                                        >
                                            Create Workflow →
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="primary"
                                        className="gap-2 bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] border-none shadow-none font-bold"
                                        onClick={() => setShowRepoSelector(!showRepoSelector)}
                                    >
                                        Select Repository →
                                    </Button>
                                )}

                                <AnimatePresence>
                                    {showRepoSelector && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full mt-2 w-64 bg-[#111] border border-[#222] shadow-xl z-50 p-3 flex flex-col gap-2 rounded-md"
                                        >
                                            {!isGithubConnected ? (
                                                <div className="text-xs font-mono text-[#F59E0B] p-2 text-center">
                                                    Connect GitHub in Integrations first.
                                                    <Button variant="ghost" className="mt-2 text-xs w-full justify-center" onClick={() => navigate('/integrations')}>Go to Integrations</Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-xs font-mono text-[#64748B] mb-1 px-1">Select repository</div>
                                                    <select
                                                        className="w-full bg-[#0A0A0A] border border-[#222] rounded-none text-xs font-mono text-[#F1F5F9] outline-none px-3 py-2 cursor-pointer focus:border-[#444] hover:border-[#333]"
                                                        value={selectedRepo?.full_name || ''}
                                                        onChange={handleRepoSelect}
                                                    >
                                                        <option value="" disabled>Choose a repo...</option>
                                                        {repos.map(r => (
                                                            <option key={r.id} value={r.full_name}>{r.full_name}</option>
                                                        ))}
                                                    </select>
                                                    {isLoadingRepos && <span className="text-[10px] font-mono text-[#64748B] pt-1 border-none shadow-none">Loading...</span>}
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-mono text-[#64748B] lowercase tracking-wider">recent workflows</h3>
                        </div>
                        {recentWorkflows.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#1A1A1A]">
                                            <th className="py-3 pr-6 text-xs font-mono font-semibold text-[#64748B] lowercase tracking-wider">name</th>
                                            <th className="px-6 py-3 text-xs font-mono font-semibold text-[#64748B] lowercase tracking-wider">status</th>
                                            <th className="px-6 py-3 text-xs font-mono font-semibold text-[#64748B] lowercase tracking-wider">last_run</th>
                                            <th className="pl-6 py-3 text-xs font-mono font-semibold text-[#64748B] lowercase tracking-wider text-right">actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1A1A1A]">
                                        {recentWorkflows.map((workflow, i) => (
                                            <motion.tr key={workflow.id} variants={itemVariants} className="hover:bg-[#111111]/50 transition-colors group">
                                                <td className="py-4 pr-6 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-mono text-text-primary group-hover:text-primary transition-colors cursor-pointer">{workflow.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(workflow.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#64748B]">
                                                    {workflow.lastRun}
                                                </td>
                                                <td className="pl-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link to="/workflows/new" className="text-[#64748B] hover:text-[#6EE7B7] transition-colors" title="Edit">
                                                            <FileEdit className="w-4 h-4" />
                                                        </Link>
                                                        <button className="text-[#64748B] hover:text-[#6EE7B7] transition-colors" title="Run">
                                                            <Play className="w-4 h-4 fill-current" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="w-full py-24 flex flex-col items-center justify-center border border-[#1A1A1A] border-dashed rounded-lg bg-[#0A0A0A]/50 gap-6">
                                <div className="font-mono text-[#64748B]">&gt;_ no workflows yet</div>
                                <div className="flex gap-4">
                                    <Button variant="primary" className="bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] font-mono rounded-none px-6 shadow-none border-none font-bold" onClick={() => navigate('/workflows/new')}>
                                        Create from scratch
                                    </Button>
                                    <Button variant="ghost" className="font-mono rounded-none px-6" onClick={() => navigate('/templates')}>
                                        Browse templates
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
