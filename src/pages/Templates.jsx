import { motion } from 'framer-motion';
import { Play, Sparkles, Code, GitBranch, Bug, RefreshCcw, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { Button } from '../components/ui/Button';

const templates = [
    { title: 'Deploy Pipeline', slug: 'deploy-pipeline', desc: 'Auto-deploy to AWS ECS on merge to main', icon: Play, steps: 5 },
    { title: 'Code Review Automation', slug: 'code-review-automation', desc: 'AI summary and initial review on all PRs', icon: Sparkles, steps: 4 },
    { title: 'Release Notes Generator', slug: 'release-notes-generator', desc: 'Draft GitHub releases from branch diffs', icon: Code, steps: 4 },
    { title: 'Bug Report Handler', slug: 'bug-report-handler', desc: 'Triage Jira bugs and notify Slack channel', icon: Bug, steps: 4 },
    { title: 'PR Review Reminder', slug: 'pr-review-reminder', desc: 'Ping reviewers if PR is stagnant for 2 days', icon: Bell, steps: 3 },
    { title: 'Staging Environment Sync', slug: 'staging-environment-sync', desc: 'Sync production database to staging nightly', icon: RefreshCcw, steps: 5 }
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

const Templates = () => {
    const navigate = useNavigate();

    return (
        <>
            <TopBar title={<span className="font-mono text-sm text-[#6EE7B7]">~ / templates</span>} />
            <div className="p-6">
                <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-mono text-text-primary lowercase tracking-tight">templates</h2>
                            <p className="text-text-secondary text-sm font-mono mt-1">start_with_pre_built_pipelines</p>
                        </motion.div>
                    </motion.div>

                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((tpl, i) => {
                            const Icon = tpl.icon;
                            return (
                                <motion.div key={i} variants={itemVariants} className="bg-[#111] border border-[#222] rounded-none p-6 hover:border-[#6EE7B7] transition-colors group flex flex-col h-full relative cursor-pointer" onClick={() => navigate(`/workflows/new?template=${tpl.slug}`)}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-[#222] flex items-center justify-center shrink-0 group-hover:bg-[#6EE7B7] group-hover:text-[#080808] transition-colors text-[#64748B]">
                                            <Icon className="w-5 h-5 group-hover:fill-current" />
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-[#222] text-[#64748B]">
                                            {tpl.steps} steps
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#6EE7B7] transition-colors">{tpl.title}</h3>
                                    <p className="text-[#64748B] text-sm leading-relaxed mb-6 flex-1">{tpl.desc}</p>

                                    <div className="mt-auto">
                                        <div className="font-mono text-xs uppercase tracking-widest text-[#64748B] group-hover:text-[#6EE7B7] transition-colors flex items-center gap-2">
                                            <span>Use Template</span>
                                            <span className="translate-x-0 group-hover:translate-x-1 transition-transform">&rarr;</span>
                                        </div>
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

export default Templates;
