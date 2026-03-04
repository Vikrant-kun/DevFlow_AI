import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, ChevronDown, Plus, LayoutGrid, CheckCircle2, Clock, Activity, Network, Play } from 'lucide-react';
import { motion } from 'framer-motion';

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

const Dashboard = () => {
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const name = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '';
    const initial = name.charAt(0) || 'U';

    const stats = [
        { label: 'Total Workflows', value: '12', icon: Network },
        { label: 'Runs Today', value: '1,284', icon: Activity },
        { label: 'Success Rate', value: '99.8%', icon: CheckCircle2 },
        { label: 'Time Saved', value: '45h', icon: Clock },
    ];

    const recentWorkflows = [
        { id: 1, name: 'Production Deploy', status: 'Success', lastRun: '2m ago' },
        { id: 2, name: 'PR AI Reviewer', status: 'Running', lastRun: 'Just now' },
        { id: 3, name: 'Nightly Database Backup', status: 'Success', lastRun: '5h ago' },
        { id: 4, name: 'Lead Assignment Sync', status: 'Failed', lastRun: '1d ago' },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-6xl mx-auto pb-10"
        >

            {/* Top Bar Area */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold">{getGreeting()}, {name}</h1>
                    <p className="text-text-secondary mt-1 text-sm">Here&apos;s what&apos;s happening with your pipelines today.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-glow-primary"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-border group cursor-pointer">
                        <div className="h-9 w-9 rounded-full bg-surface-2 overflow-hidden flex items-center justify-center border border-border">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-sm font-semibold text-text-primary">{initial}</span>
                            )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
                <Button className="gap-2"><Plus className="h-4 w-4" /> New Workflow</Button>
                <Button variant="ghost" className="gap-2"><LayoutGrid className="h-4 w-4" /> Browse Templates</Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="p-6 bg-[#111111]" hoverEffect>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[#64748B] font-medium text-sm tracking-wide">{stat.label}</p>
                            <stat.icon className="h-4 w-4 text-[#64748B] opacity-70" />
                        </div>
                        <p className="text-4xl font-bold text-[#6EE7B7] text-glow-primary font-mono">{stat.value}</p>
                    </Card>
                ))}
            </motion.div>

            {/* Recent Workflows */}
            <motion.div variants={itemVariants}>
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Recent Activity
                    </h2>
                    <Card className="overflow-hidden border-border bg-[#111111]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-surface-2/30">
                                        <th className="px-6 py-4 text-sm font-medium text-[#64748B]">Name</th>
                                        <th className="px-6 py-4 text-sm font-medium text-[#64748B]">Status</th>
                                        <th className="px-6 py-4 text-sm font-medium text-[#64748B]">Last Run</th>
                                        <th className="px-6 py-4 text-sm font-medium text-[#64748B] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentWorkflows.map((flow) => (
                                        <tr key={flow.id} className="hover:bg-surface-2/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-[#F1F5F9]">{flow.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${flow.status === 'Success' ? 'text-[#6EE7B7] bg-[#6EE7B7]/10' :
                                                        flow.status === 'Running' ? 'text-ai bg-ai/10 animate-pulse' :
                                                            'text-error bg-error/10'
                                                    }`}>
                                                    {flow.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#64748B] font-mono">{flow.lastRun}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="dark" size="sm" className="gap-2 h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="h-3 w-3" /> Run
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
