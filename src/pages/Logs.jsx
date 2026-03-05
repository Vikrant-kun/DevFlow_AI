import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Play, Server, Clock, Search, Filter, Terminal } from 'lucide-react';
import TopBar from '../components/TopBar';

import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const getStatusBadge = (status) => {
    switch (status) {
        case 'Success': return <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]"></span><span>Success</span></span>;
        case 'Running': return <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span><span>Running</span></span>;
        case 'Failed': return <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F87171]"></span><span>Failed</span></span>;
        default: return null;
    }
};

const getStepIcon = (status) => {
    if (status === 'Success') return <CheckCircle2 className="w-4 h-4 text-primary" />;
    if (status === 'Failed') return <Server className="w-4 h-4 text-error" />;
    if (status === 'Running') return <Play className="w-4 h-4 text-[#F59E0B]" />;
    return <Clock className="w-4 h-4 text-[#444]" />;
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

const Logs = () => {
    const [expandedRow, setExpandedRow] = useState(null);
    const { user } = useAuth();
    const [logsData, setLogsData] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user) return;
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
                    started: new Date(log.started_at).toLocaleString(),
                    duration: log.duration,
                    trigger: log.triggered_by,
                    steps: [
                        { name: 'Pipeline Initiated', status: log.status.charAt(0).toUpperCase() + log.status.slice(1), duration: log.duration, timestamp: new Date(log.started_at).toLocaleTimeString() }
                    ]
                }));
                setLogsData(formatted);
            }
        };
        fetchLogs();
    }, [user]);

    return (
        <>
            <TopBar title="Execution Logs" />
            <div className="p-6">
                <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-2xl font-bold text-text-primary">Execution Logs</h2>
                            <p className="text-text-secondary text-sm mt-1">Detailed history and step-by-step traces of all your workflow runs.</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input type="text" placeholder="Search runs..." className="pl-9 pr-4 py-2 bg-[#111] border border-[#222] rounded-lg text-sm text-text-primary outline-none focus:border-primary transition-colors w-64" />
                            </div>
                            <button className="px-3 py-2 bg-[#111] border border-[#222] rounded-lg text-text-secondary hover:text-text-primary hover:border-[#333] transition-colors flex items-center gap-2">
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                        </motion.div>
                    </motion.div>

                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full">
                        {/* Header Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '32px 280px 140px 140px 100px 1fr' }} className="pb-3 border-b border-[#1A1A1A]">
                            <div></div>
                            <div className="font-mono text-[11px] tracking-widest uppercase text-[#64748B]">WORKFLOW</div>
                            <div className="font-mono text-[11px] tracking-widest uppercase text-[#64748B]">STATUS</div>
                            <div className="font-mono text-[11px] tracking-widest uppercase text-[#64748B]">STARTED</div>
                            <div className="font-mono text-[11px] tracking-widest uppercase text-[#64748B]">DURATION</div>
                            <div className="font-mono text-[11px] tracking-widest uppercase text-[#64748B]">TRIGGERED BY</div>
                        </div>

                        {/* Data Rows */}
                        <div className="flex flex-col">
                            {logsData.length === 0 ? (
                                <div className="py-12 text-center text-[#64748B] font-mono text-sm">
                                    &gt;_ no execution logs found
                                </div>
                            ) : logsData.map((log) => (
                                <motion.div key={log.id}>
                                    <div
                                        style={{ display: 'grid', gridTemplateColumns: '32px 280px 140px 140px 100px 1fr' }}
                                        className="py-4 border-b border-[#111111] hover:bg-[#0D0D0D] transition cursor-pointer group items-center"
                                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                    >
                                        <div className="pl-2">
                                            <ChevronRight className={`w - 4 h - 4 text - [#64748B] group - hover: text - [#F1F5F9] transition - transform duration - 200 ${expandedRow === log.id ? 'rotate-90' : ''} `} />
                                        </div>
                                        <div className="font-mono text-sm text-[#F1F5F9] truncate pr-4">
                                            {log.workflow}
                                        </div>
                                        <div className="font-mono text-sm text-[#F1F5F9]">
                                            {getStatusBadge(log.status)}
                                        </div>
                                        <div className="font-mono text-sm text-[#64748B]">
                                            {log.started}
                                        </div>
                                        <div className="font-mono text-sm text-[#64748B]">
                                            {log.duration}
                                        </div>
                                        <div className="font-mono text-sm text-[#64748B] truncate">
                                            {log.trigger}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedRow === log.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-[#0A0A0A] overflow-hidden"
                                            >
                                                <div className="px-6 py-6 border-b border-[#222]">
                                                    <div className="max-w-4xl mx-auto space-y-4">
                                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-4 p-2 bg-[#151515] rounded border border-[#222]">
                                                            <Terminal className="w-4 h-4 text-text-secondary" /> Trace: {log.id}
                                                        </h4>
                                                        {log.steps.map((step, idx) => (
                                                            <div key={idx} className="flex items-center justify-between text-sm py-2 px-4 rounded-lg bg-[#111] border border-[#222] hover:border-[#333] transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-text-secondary min-w-[60px] font-mono text-xs">{step.timestamp}</span>
                                                                    {getStepIcon(step.status)}
                                                                    <span className={`font - medium ${step.status === 'Failed' ? 'text-error' : 'text-text-primary'} `}>{step.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-6 text-text-secondary">
                                                                    <span>{step.duration}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default Logs;
