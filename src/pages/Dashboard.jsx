import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FileEdit, Plus, Layers, CheckCircle2, PauseCircle, XCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';

const stats = [
    { label: 'Total Workflows', value: '0' },
    { label: 'Runs Today', value: '0' },
    { label: 'Success Rate', value: '—' },
    { label: 'Time Saved', value: '0h' }
];

const recentWorkflows = [];

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
    const { toast } = useToast();
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
                toast("You're all set. Welcome to DevFlow. 🚀", "success");
            }
        }
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
