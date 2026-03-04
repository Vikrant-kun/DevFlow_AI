import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Sparkles, Check, Zap } from 'lucide-react';

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Upgrade = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] p-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="max-w-4xl mx-auto"
            >
                <div className="mb-8">
                    <span className="font-mono text-sm text-[#6EE7B7]">{`~ / upgrade`}</span>
                    <h1 className="text-3xl font-bold text-white mt-4 mb-2">You're on the Free plan.</h1>
                    <p className="text-[#64748B]">Here's what you're missing.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start mb-12">

                    {/* Free Current Usage */}
                    <div className="bg-[#111111] border border-[#222222] rounded-md p-8 shadow-xl flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <Zap className="w-5 h-5 text-[#64748B]" />
                            <h3 className="text-xl font-bold text-white">Current Usage</h3>
                        </div>

                        <div className="space-y-8 flex-1">
                            {/* Workflow Progress */}
                            <div>
                                <div className="flex justify-between items-center text-sm font-mono text-[#F1F5F9] mb-3">
                                    <span>Workflows</span>
                                    <span><span className="text-white font-bold">3</span> of 5</span>
                                </div>
                                <div className="h-2 w-full bg-[#222222] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#6EE7B7] rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>

                            {/* Runs Progress */}
                            <div>
                                <div className="flex justify-between items-center text-sm font-mono text-[#F1F5F9] mb-3">
                                    <span>Monthly Runs</span>
                                    <span><span className="text-white font-bold">67</span> of 100</span>
                                </div>
                                <div className="h-2 w-full bg-[#222222] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#6EE7B7] rounded-full" style={{ width: '67%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro Unlock */}
                    <div className="bg-[#111111] border border-[rgba(110,231,183,0.3)] shadow-[0_0_30px_rgba(110,231,183,0.05)] rounded-md p-8 relative flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="w-5 h-5 text-[#6EE7B7]" />
                            <h3 className="text-xl font-bold text-white">Pro</h3>
                        </div>

                        <div className="space-y-4 font-mono text-sm text-[#F1F5F9] mb-10 flex-1">
                            <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> Unlimited workflows</div>
                            <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> Unlimited runs</div>
                            <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> Claude + GPT-4o + Gemini + Grok</div>
                            <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> All integrations</div>
                            <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> Priority support</div>
                            <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> Custom webhooks</div>
                            <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> Team collaboration</div>
                            <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> Advanced logs + analytics</div>
                        </div>

                        <Button className="w-full bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(110,231,183,0.4)] font-mono text-sm font-bold border-none rounded-md py-6 transition-all duration-300">
                            Upgrade to Pro →
                        </Button>
                    </div>

                </div>

                <div className="text-center">
                    <a href="mailto:vikrantvinchurkar12@gmail.com" className="text-[#64748B] hover:text-[#F1F5F9] text-sm font-mono transition-colors">
                        Questions? Email us at vikrantvinchurkar12@gmail.com
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default Upgrade;
