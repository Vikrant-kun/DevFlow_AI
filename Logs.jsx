import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Play, Clock, Search, Filter, Terminal, AlertCircle, Check } from 'lucide-react';
import TopBar from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const getStatusBadge = (status) => {
    switch (status) {
        case 'Success':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 text-[#6EE7B7] text-[10px] md:text-xs font-mono">
                    <CheckCircle2 className="w-3 h-3" /><span>Success</span>
                </span>
            );
        case 'Running':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-[10px] md:text-xs font-mono">
                    <Play className="w-3 h-3 animate-pulse" /><span>Running</span>
                </span>
            );
        case 'Failed':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171] text-[10px] md:text-xs font-mono">
                    <AlertCircle className="w-3 h-3" /><span>Failed</span>
                </span>
            );
        default: return null;
    }
};

const getStepIcon = (status) => {
    if (status === 'Success') return <CheckCircle2 className="w-4 h-4 text-[#6EE7B7]" />;
    if (status === 'Failed') return <AlertCircle className="w-4 h-4 text-[#F87171]" />;
    if (status === 'Running') return <Play className="w-4 h-4 text-[#F59E0B]" />;
    return <Clock className="w-4 h-4 text-[#64748B]" />;
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

const Logs = () => {
    const [expandedRow, setExpandedRow] = useState(null);
    const { user } = useAuth();
    const [logsData, setLogsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const filterRef = useRef(null);

    // Close filter when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            if (!user) { setIsLoading(false); return; }
            const { data, error } = await supabase
                .from('workflow_runs')
                .select('*')
                .eq('user_id', user.id)
                .order('started_at', { ascending: false });

            if (data && !error) {
                const formatted = data.map(log => ({
                    id: log.id,
                    workflow: log.workflow_name || 'Unknown Workflow',
                    status: log.status.charAt(0).toUpperCase() + log.status.slice(1),
                    started: new Date(log.started_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
                    duration: log.duration,
                    trigger: log.triggered_by,
                    steps: [
                        { name: 'Pipeline Initiated', status: 'Success', duration: '0s', timestamp: new Date(log.started_at).toLocaleTimeString() },
                        { name: 'Execution Completed', status: log.status.charAt(0).toUpperCase() + log.status.slice(1), duration: log.duration, timestamp: new Date(new Date(log.started_at).getTime() + 84000).toLocaleTimeString() }
                    ]
                }));
                setLogsData(formatted);
            }
            setIsLoading(false);
        };
        fetchLogs();
    }, [user]);

    // Apply Filter Logic
    const displayedLogs = logsData.filter(log => activeFilter === 'All' || log.status === activeFilter);

    return (
        <div className="flex flex-col h-[100dvh] bg-[#080808] overflow-hidden">
            <TopBar title={<span className="font-mono text-xs md:text-sm font-bold text-[#F1F5F9]">Logs</span>} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">

                    {/* Header Section */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <motion.div variants={itemVariants} className="space-y-1">
                            <h2 className="text-2xl md:text-3xl font-mono font-bold text-[#F1F5F9] tracking-tight">Execution Logs</h2>
                            <p className="text-[#64748B] font-mono text-xs md:text-sm">Detailed history and step-by-step traces of all your workflow runs.</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                                <input type="text" placeholder="Search runs..." className="w-full sm:w-64 pl-9 pr-4 py-2 h-10 bg-[#111] border border-[#222] rounded-xl font-mono text-xs text-[#F1F5F9] outline-none focus:border-[#6EE7B7]/50 focus:bg-[#1A1A1A] transition-all" />
                            </div>

                            {/* WORKING FILTER DROPDOWN */}
                            <div className="relative w-full sm:w-auto" ref={filterRef}>
                                <button
                                    onClick={() => setFilterOpen(!filterOpen)}
                                    className={`px-4 py-2 h-10 border rounded-xl font-mono text-xs transition-all flex items-center justify-between gap-2 w-full sm:w-[120px] ${activeFilter !== 'All' ? 'bg-[#6EE7B7]/10 border-[#6EE7B7]/30 text-[#6EE7B7]' : 'bg-[#111] border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A]'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4" /> {activeFilter === 'All' ? 'Filter' : activeFilter}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {filterOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                            className="absolute right-0 top-[calc(100%+8px)] w-[160px] bg-[#0D0D0D] border border-[#222] rounded-xl shadow-2xl z-50 p-1 overflow-hidden"
                                        >
                                            {['All', 'Success', 'Running', 'Failed'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => { setActiveFilter(status); setFilterOpen(false); }}
                                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1A1A1A] text-left font-mono text-xs text-[#F1F5F9] transition-colors"
                                                >
                                                    {status}
                                                    {activeFilter === status && <Check className="w-3.5 h-3.5 text-[#6EE7B7]" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Table Section */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full bg-[#0D0D0D] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
                        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                            <div className="min-w-[900px]">
                                <div style={{ display: 'grid', gridTemplateColumns: '48px 2fr 1fr 1.5fr 1fr 1fr' }} className="py-3 bg-[#111] border-b border-[#222] px-2">
                                    <div></div>
                                    <div className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#64748B]">Workflow</div>
                                    <div className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#64748B]">Status</div>
                                    <div className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#64748B]">Started</div>
                                    <div className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#64748B]">Duration</div>
                                    <div className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[#64748B]">Triggered By</div>
                                </div>

                                <div className="flex flex-col">
                                    {isLoading ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-[#64748B] space-y-4">
                                            <div className="w-6 h-6 border-2 border-[#64748B] border-t-transparent rounded-full animate-spin" />
                                            <span className="font-mono text-xs">Loading logs...</span>
                                        </div>
                                    ) : displayedLogs.length === 0 ? (
                                        <div className="py-20 text-center text-[#64748B] font-mono text-sm border-t border-[#111]">
                                            &gt;_ No execution logs match "{activeFilter}".
                                        </div>
                                    ) : displayedLogs.map((log) => (
                                        <div key={log.id} className="flex flex-col border-b border-[#222] last:border-0 group">
                                            <div
                                                style={{ display: 'grid', gridTemplateColumns: '48px 2fr 1fr 1.5fr 1fr 1fr' }}
                                                className={`py-3.5 px-2 items-center transition-all cursor-pointer ${expandedRow === log.id ? 'bg-[#111]' : 'hover:bg-[#111]/50'}`}
                                                onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                            >
                                                <div className="flex justify-center">
                                                    <ChevronRight className={`w-4 h-4 text-[#64748B] group-hover:text-[#F1F5F9] transition-transform duration-200 ${expandedRow === log.id ? 'rotate-90 text-[#6EE7B7]' : ''}`} />
                                                </div>
                                                <div className="font-mono text-xs md:text-sm font-medium text-[#F1F5F9] truncate pr-4">{log.workflow}</div>
                                                <div>{getStatusBadge(log.status)}</div>
                                                <div className="font-mono text-xs text-[#9CA3AF]">{log.started}</div>
                                                <div className="font-mono text-xs text-[#9CA3AF]">{log.duration}</div>
                                                <div className="font-mono text-xs text-[#9CA3AF] truncate flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[10px]">🤖</span>
                                                    {log.trigger}
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {expandedRow === log.id && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#080808] border-t border-[#222] overflow-hidden">
                                                        <div className="p-6 md:p-8 pl-[64px] relative">
                                                            <div className="absolute left-[79px] top-10 bottom-10 w-px bg-[#222]" />
                                                            <div className="space-y-6 max-w-3xl relative">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="flex items-center gap-2 text-xs font-mono font-bold text-[#64748B]"><Terminal className="w-4 h-4" /> Trace ID: <span className="text-[#F1F5F9] select-all">{log.id}</span></h4>
                                                                    <button className="text-xs font-mono text-[#6EE7B7] hover:underline">View Raw JSON</button>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    {log.steps.map((step, idx) => (
                                                                        <div key={idx} className="flex items-start gap-4 relative z-10 group/step">
                                                                            <div className="mt-0.5 bg-[#080808] p-1 rounded-full border border-[#222] group-hover/step:border-[#444] transition-colors">{getStepIcon(step.status)}</div>
                                                                            <div className="flex-1 bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover/step:border-[#333] transition-colors">
                                                                                <div className="flex flex-col gap-1">
                                                                                    <span className={`font-mono text-sm font-semibold ${step.status === 'Failed' ? 'text-[#F87171]' : 'text-[#F1F5F9]'}`}>{step.name}</span>
                                                                                    <span className="font-mono text-[10px] text-[#64748B]">{step.timestamp}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="font-mono text-xs text-[#64748B] bg-[#0D0D0D] border border-[#222] px-2 py-1 rounded-md">{step.duration}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Logs;