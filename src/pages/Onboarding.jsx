import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Github, Slack, Trello, Sparkles, GitBranch, Layers } from 'lucide-react';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const { user } = useAuth();
    const navigate = useNavigate();

    const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '';

    const handleComplete = (path) => {
        localStorage.setItem('devflow_onboarded', 'true');
        navigate(path);
    };

    return (
        <div className="h-screen w-full bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden text-[#F1F5F9]">
            {/* Progress Indicator */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
                {[1, 2, 3].map((num) => (
                    <div key={num} className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${step === num ? 'bg-[#6EE7B7]' : step > num ? 'bg-[#6EE7B7]' : 'bg-[#222]'}`}>
                            {step > num && (
                                <svg className="w-2.5 h-2.5 text-[#080808]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        {num !== 3 && <div className="w-12 h-px bg-[#222]"></div>}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-xl text-center flex flex-col items-center gap-6"
                    >
                        <div className="font-mono text-sm text-[#64748B]">&gt;_ step 1 of 3</div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Welcome, {userName}.</h1>
                        <p className="text-[#64748B] text-lg leading-relaxed max-w-md">
                            You're about to automate the most repetitive parts of your dev workflow. Let's get you set up in 2 minutes.
                        </p>
                        <button
                            onClick={() => setStep(2)}
                            className="mt-4 px-8 py-3 bg-[#6EE7B7] hover:bg-[#34D399] text-[#080808] font-mono text-sm uppercase tracking-widest transition-colors rounded-none outline-none"
                        >
                            Let's go &rarr;
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-4xl w-full px-6 flex flex-col items-center gap-8"
                    >
                        <div className="text-center space-y-3">
                            <div className="font-mono text-sm text-[#64748B]">&gt;_ step 2 of 3</div>
                            <h2 className="text-3xl font-bold text-white">Connect your tools.</h2>
                            <p className="text-[#64748B]">DevFlow works best when connected to your existing stack.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                            {/* GitHub */}
                            <div className="bg-[#111] border border-[#222] p-6 flex flex-col items-center text-center gap-4 group hover:border-[#6EE7B7] transition-colors relative overflow-hidden">
                                <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#6EE7B7]/10 text-[#6EE7B7] font-mono text-[10px] uppercase tracking-wider">Required</div>
                                <div className="p-3 rounded-xl bg-[#222] text-white group-hover:bg-[#6EE7B7] group-hover:text-[#080808] transition-colors">
                                    <Github className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">GitHub</h3>
                                    <p className="text-sm text-[#64748B] mt-1">Source code & triggers</p>
                                </div>
                                <button className="mt-2 w-full py-2 bg-[#222] hover:bg-[#333] text-white font-mono text-xs uppercase transition-colors">Connect GitHub</button>
                            </div>

                            {/* Slack */}
                            <div className="bg-[#111] border border-[#222] p-6 flex flex-col items-center text-center gap-4 hover:border-[#444] transition-colors relative">
                                <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#222] text-[#64748B] font-mono text-[10px] uppercase tracking-wider">Optional</div>
                                <div className="p-3 rounded-xl bg-[#222] text-[#64748B]">
                                    <Slack className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Slack</h3>
                                    <p className="text-sm text-[#64748B] mt-1">Alerts & notifications</p>
                                </div>
                                <button className="mt-2 w-full py-2 bg-transparent border border-[#333] hover:border-[#444] text-[#64748B] hover:text-[#F1F5F9] font-mono text-xs uppercase transition-colors">Connect Slack</button>
                            </div>

                            {/* Jira/Linear fallback */}
                            <div className="bg-[#111] border border-[#222] p-6 flex flex-col items-center text-center gap-4 hover:border-[#444] transition-colors relative">
                                <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#222] text-[#64748B] font-mono text-[10px] uppercase tracking-wider">Optional</div>
                                <div className="p-3 rounded-xl bg-[#222] text-[#64748B]">
                                    <Trello className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Jira</h3>
                                    <p className="text-sm text-[#64748B] mt-1">Issue tracking</p>
                                </div>
                                <button className="mt-2 w-full py-2 bg-transparent border border-[#333] hover:border-[#444] text-[#64748B] hover:text-[#F1F5F9] font-mono text-xs uppercase transition-colors">Connect Jira</button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 mt-4">
                            <button
                                onClick={() => setStep(3)}
                                className="px-8 py-3 bg-white hover:bg-[#E2E8F0] text-[#080808] font-mono text-sm uppercase tracking-widest transition-colors rounded-none outline-none"
                            >
                                Continue &rarr;
                            </button>
                            <span className="text-xs text-[#64748B]">You can connect more tools later in Integrations</span>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-5xl w-full px-6 flex flex-col items-center gap-12"
                    >
                        <div className="text-center space-y-3">
                            <div className="font-mono text-sm text-[#64748B]">&gt;_ step 3 of 3</div>
                            <h2 className="text-3xl font-bold text-white">How do you want to start?</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            {/* Scratch */}
                            <button
                                onClick={() => handleComplete('/workflows/new')}
                                className="group bg-[#111] border border-[#222] p-8 flex flex-col items-start gap-4 hover:border-[#6EE7B7] hover:scale-[1.02] transition-all text-left outline-none"
                            >
                                <div className="p-3 rounded-xl bg-[#6EE7B7]/10 text-[#6EE7B7]">
                                    <GitBranch className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Start from scratch</h3>
                                    <p className="text-sm text-[#64748B] leading-relaxed">Build your pipeline node by node</p>
                                </div>
                            </button>

                            {/* Template */}
                            <button
                                onClick={() => handleComplete('/templates')}
                                className="group bg-[#111] border border-[#222] p-8 flex flex-col items-start gap-4 hover:border-[#6EE7B7] hover:scale-[1.02] transition-all text-left outline-none"
                            >
                                <div className="p-3 rounded-xl bg-[#6EE7B7]/10 text-[#6EE7B7]">
                                    <Layers className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Use a template</h3>
                                    <p className="text-sm text-[#64748B] leading-relaxed">Pick from pre-built pipelines</p>
                                </div>
                            </button>

                            {/* AI */}
                            <button
                                onClick={() => handleComplete('/workflows/new?focus=ai')}
                                className="group bg-[#111] border border-[#222] p-8 flex flex-col items-start gap-4 hover:border-[#6EE7B7] hover:scale-[1.02] transition-all text-left outline-none relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6EE7B7] opacity-[0.03] blur-2xl group-hover:opacity-10 transition-opacity rounded-full"></div>
                                <div className="p-3 rounded-xl bg-[#6EE7B7]/10 text-[#6EE7B7]">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Let AI build it</h3>
                                    <p className="text-sm text-[#64748B] leading-relaxed">Describe it, Claude generates it</p>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
