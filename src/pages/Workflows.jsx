import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Play, FileEdit, Trash2, Activity, Clock, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiFetch } from '../lib/api';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

// Premium Status Badge Component
const StatusBadge = ({ status }) => {
    const s = (status || 'draft').toLowerCase();
    if (s === 'active' || s === 'success') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 text-[#6EE7B7] text-[10px] md:text-xs font-mono font-medium">
                <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6EE7B7] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-[#6EE7B7]"></span>
                </span>
                Active
            </span>
        );
    }
    if (s === 'paused') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] md:text-xs font-mono font-medium">
                <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-amber-500"></span>
                Paused
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#1A1A1A] border border-[#333] text-[#64748B] text-[10px] md:text-xs font-mono font-medium">
            <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-[#64748B]"></span>
            Draft
        </span>
    );
};

const Workflows = () => {
    const navigate = useNavigate();
    const { user, getAuthToken } = useAuth();
    const { showToast } = useToast();
    const [workflows, setWorkflows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [workflowToDelete, setWorkflowToDelete] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchWorkflows = async () => {
            if (!user) return;
            try {
                const dataObj = await apiFetch('/workflows', {}, getAuthToken);
                const data = dataObj.workflows || [];

                const formatted = data.map(w => ({
                    id: w.id,
                    name: w.name,
                    status: (w.status || 'draft').charAt(0).toUpperCase() + (w.status || 'draft').slice(1),
                    nodesCount: w.nodes ? w.nodes.length : 0,
                    updatedAt: new Date(w.updated_at || w.created_at).toLocaleDateString()
                }));

                setWorkflows(formatted);
            } catch (err) {
                console.error(err);
                showToast("Failed to load workflows", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchWorkflows();
    }, [user, showToast, getAuthToken, API_URL]);

    const confirmDelete = async () => {
        if (!workflowToDelete) return;
        try {
            await apiFetch(`/workflows/${workflowToDelete.id}`, {
                method: 'DELETE'
            }, getAuthToken);
            setWorkflows(prev => prev.filter(w => w.id !== workflowToDelete.id));
            showToast("Workflow deleted", "success");
        } catch (err) {
            showToast("Failed to delete", "error");
        } finally {
            setWorkflowToDelete(null);
        }
    };

    const filteredWorkflows = workflows.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex flex-col h-screen bg-[#080808] transition-colors duration-300 overflow-hidden">
            <TopBar title={<span className="font-mono text-xs md:text-sm text-[#6EE7B7]">~ / workflows</span>} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">

                    {/* Header Controls */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-lg md:text-xl font-mono text-[#F1F5F9] lowercase tracking-tight font-bold">your_pipelines</h2>
                            <p className="text-[#64748B] text-[10px] md:text-xs font-mono mt-1">Manage, edit, and monitor your automation logic.</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="w-3.5 h-3.5 md:w-4 md:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                                <input
                                    type="text"
                                    placeholder="Search workflows..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#111] border border-[#222] rounded-xl font-mono text-[10px] md:text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7] transition-colors shadow-sm"
                                />
                            </div>
                            <button onClick={() => navigate('/workflows/new')} className="px-4 py-2 bg-[#6EE7B7] hover:bg-[#34D399] text-[#080808] rounded-xl font-mono text-[10px] md:text-xs font-bold transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm">
                                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> create_new
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* The Elite Table */}
                    {isLoading ? (
                        <div className="py-24 text-center text-[#64748B] font-mono text-sm">loading workflows...</div>
                    ) : filteredWorkflows.length === 0 ? (
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="pt-16 md:pt-24 flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 pb-12 border border-dashed border-[#1A1A1A] bg-[#0A0A0A]/50 rounded-xl shadow-sm">
                            <motion.div variants={itemVariants} className="text-[#64748B] font-mono text-sm md:text-base">
                                {`>_`} no workflows found
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4">
                                <button onClick={() => navigate('/workflows/new')} className="bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] rounded-xl px-6 py-2.5 font-mono shadow-sm font-bold text-xs w-full sm:w-auto transition-colors">
                                    Create your first workflow
                                </button>
                                <button onClick={() => navigate('/templates')} className="px-6 py-2.5 font-mono rounded-xl text-[#F1F5F9] border border-[#222] hover:bg-[#111] text-xs w-full sm:w-auto transition-colors shadow-sm">
                                    Browse templates &rarr;
                                </button>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full bg-[#111] border border-[#222] rounded-xl shadow-sm overflow-hidden">
                            <div className="w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                <div className="min-w-[700px]">

                                    {/* Table Header */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 100px' }} className="py-3 px-4 border-b border-[#222] bg-[#0D0D0D]">
                                        <div className="font-mono text-[9px] md:text-[10px] tracking-widest uppercase text-[#64748B]">NAME</div>
                                        <div className="font-mono text-[9px] md:text-[10px] tracking-widest uppercase text-[#64748B]">STATUS</div>
                                        <div className="font-mono text-[9px] md:text-[10px] tracking-widest uppercase text-[#64748B]">COMPLEXITY</div>
                                        <div className="font-mono text-[9px] md:text-[10px] tracking-widest uppercase text-[#64748B]">LAST UPDATED</div>
                                        <div className="font-mono text-[9px] md:text-[10px] tracking-widest uppercase text-[#64748B] text-right">ACTIONS</div>
                                    </div>

                                    {/* Data Rows */}
                                    <div className="flex flex-col divide-y divide-[#1A1A1A]">
                                        {filteredWorkflows.map((workflow) => (
                                            <motion.div
                                                key={workflow.id}
                                                variants={itemVariants}
                                                className="group transition-colors hover:bg-[#161616]"
                                                style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 100px' }}
                                            >
                                                {/* Name */}
                                                <div className="py-4 px-4 flex items-center gap-3 overflow-hidden">
                                                    <div className="w-8 h-8 rounded-xl bg-[#0A0A0A] border border-[#222] flex items-center justify-center shrink-0">
                                                        <Activity className="w-4 h-4 text-[#6EE7B7]" />
                                                    </div>
                                                    <span
                                                        onClick={() => navigate(`/workflows/new?id=${workflow.id}`)}
                                                        className="text-xs md:text-sm font-mono font-medium text-[#F1F5F9] group-hover:text-[#6EE7B7] transition-colors cursor-pointer truncate"
                                                    >
                                                        {workflow.name}
                                                    </span>
                                                </div>

                                                {/* Status */}
                                                <div className="py-4 px-4 flex items-center">
                                                    <StatusBadge status={workflow.status} />
                                                </div>

                                                {/* Complexity (Nodes) */}
                                                <div className="py-4 px-4 flex items-center gap-1.5 text-[10px] md:text-xs font-mono text-[#64748B]">
                                                    <span className="font-bold text-[#F1F5F9]">{workflow.nodesCount}</span> steps
                                                </div>

                                                {/* Updated Date */}
                                                <div className="py-4 px-4 flex items-center gap-1.5 text-[10px] md:text-xs font-mono text-[#64748B]">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {workflow.updatedAt}
                                                </div>

                                                {/* Actions */}
                                                <div className="py-4 px-4 flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => navigate(`/workflows/new?id=${workflow.id}`)} className="p-1.5 text-[#64748B] hover:text-[#6EE7B7] transition-colors rounded-xl hover:bg-[#222]" title="Edit">
                                                        <FileEdit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    </button>
                                                    <button onClick={() => showToast('Manual run triggered', 'success')} className="p-1.5 text-[#64748B] hover:text-blue-400 transition-colors rounded-xl hover:bg-[#222]" title="Run Now">
                                                        <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                                                    </button>
                                                    <button onClick={() => setWorkflowToDelete({ id: workflow.id, name: workflow.name })} className="p-1.5 text-[#64748B] hover:text-[#F87171] transition-colors rounded-xl hover:bg-[#222]" title="Delete">
                                                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {workflowToDelete && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full max-w-sm bg-[#111] border border-[#F87171]/30 p-6 shadow-2xl relative rounded-xl"
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-[#F87171]/10 flex items-center justify-center border border-[#F87171]/20 rounded-xl shrink-0">
                                    <Trash2 className="w-5 h-5 text-[#F87171]" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-bold text-[#F87171] font-mono uppercase tracking-widest">delete_workflow</h2>
                                    <p className="text-[10px] text-[#64748B] font-mono mt-0.5">This action is permanent.</p>
                                </div>
                            </div>

                            <div className="bg-[#080808] border border-[#222] p-3 mb-6 rounded-xl">
                                <span className="font-mono text-xs text-[#F1F5F9] truncate block">
                                    {workflowToDelete.name}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setWorkflowToDelete(null)}
                                    className="flex-1 border border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] font-mono text-xs py-2.5 transition-colors rounded-xl"
                                >
                                    cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 bg-[#F87171] text-[#080808] hover:bg-[#EF4444] font-bold font-mono text-xs py-2.5 transition-colors rounded-xl"
                                >
                                    confirm_delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Workflows;