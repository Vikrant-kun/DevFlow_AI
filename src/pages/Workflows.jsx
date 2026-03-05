import { motion } from 'framer-motion';
import { Play, FileEdit, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { useState, useEffect } from 'react';
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
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const Workflows = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [workflows, setWorkflows] = useState([]);

    useEffect(() => {
        const fetchWorkflows = async () => {
            if (!user) return;
            const { data, error } = await supabase
                .from('workflows')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data && !error) {
                const formatted = data.map(w => ({
                    id: w.id,
                    name: w.name,
                    status: w.status.charAt(0).toUpperCase() + w.status.slice(1),
                    lastRun: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : 'Never'
                }));
                setWorkflows(formatted);
            }
        };
        fetchWorkflows();
    }, [user]);

    return (
        <>
            <TopBar title={<span className="font-mono text-sm text-[#6EE7B7]">~ / workflows</span>} />
            <div className="p-6">
                <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-mono text-text-primary lowercase tracking-tight">workflows</h2>
                            <p className="text-text-secondary text-sm font-mono mt-1">manage_your_automation_pipelines</p>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <Button variant="primary" className="gap-2 shadow-glow-primary" onClick={() => navigate('/workflows/new')}>
                                <Plus className="w-4 h-4" /> New Workflow
                            </Button>
                        </motion.div>
                    </motion.div>

                    {workflows.length === 0 ? (
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="pt-24 flex flex-col items-center justify-center text-center space-y-8 pb-12">
                            <motion.div variants={itemVariants} className="text-[#64748B] font-mono text-base">
                                {`>_`} no workflows found
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex gap-4">
                                <Button variant="primary" className="bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] rounded-none px-6 font-mono shadow-none border-none font-bold" onClick={() => navigate('/workflows/new')}>
                                    Create your first workflow
                                </Button>
                                <Button variant="ghost" className="px-6 font-mono rounded-none" onClick={() => navigate('/templates')}>
                                    Or start from a template &rarr;
                                </Button>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="pt-4">
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
                                        {workflows.map((workflow) => (
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
                                                        <button className="text-[#64748B] hover:text-[#6EE7B7] transition-colors" title="Edit" onClick={() => navigate('/workflows/new')}>
                                                            <FileEdit className="w-4 h-4" />
                                                        </button>
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
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Workflows;
