import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Check, X } from 'lucide-react';
import React, { useState } from 'react';

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Pricing = () => {
    const navigate = useNavigate();
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className="min-h-screen bg-[#080808] text-[#F1F5F9] selection:bg-primary/30 flex flex-col">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-[#222222] bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                        <span>DevFlow</span>
                        <span className="text-[#6EE7B7] text-glow-primary">AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
                        <a href="/#features" className="hover:text-[#F1F5F9] transition-colors">Features</a>
                        <Link to="/about" className="hover:text-[#F1F5F9] transition-colors">About</Link>
                        <Link to="/pricing" className="text-[#F1F5F9] transition-colors">Pricing</Link>
                        <Link to="/docs" className="hover:text-[#F1F5F9] transition-colors">Docs</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/auth')}>Log in</Button>
                        <Button onClick={() => navigate('/auth')}>Sign up</Button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center pt-32 px-6 pb-24">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="max-w-5xl w-full text-center"
                >
                    <div className="mb-6 font-mono text-sm text-[#6EE7B7]">
                        {`>_ pricing`}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
                        Simple, transparent pricing.
                    </h1>

                    <p className="text-lg text-[#64748B] mb-12">
                        Free while in beta. Upgrade when you're ready.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-3 mb-16">
                        <span className={`text-sm font-mono ${!isYearly ? 'text-[#F1F5F9]' : 'text-[#64748B]'}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="bg-[#111111] border border-[#222222] w-[42px] h-[24px] rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-[#6EE7B7] focus:ring-offset-2 focus:ring-offset-[#080808]"
                        >
                            <span className={`block w-[16px] h-[16px] bg-white rounded-full absolute top-[3px] transition-transform ${isYearly ? 'translate-x-[21px] bg-[#6EE7B7]' : 'translate-x-[4px] bg-[#64748B]'}`}></span>
                        </button>
                        <span className={`text-sm font-mono flex items-center gap-2 ${isYearly ? 'text-[#F1F5F9]' : 'text-[#64748B]'}`}>
                            Yearly
                            <span className="text-[10px] bg-[#111] text-[#6EE7B7] border border-[#6EE7B7] px-2 py-0.5 rounded-full uppercase font-bold">Save 33%</span>
                        </span>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16 items-start">

                        {/* Free Card */}
                        <div className="bg-[#111111] border border-[#222222] rounded-md p-8 text-left h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="w-5 h-5 text-[#64748B]" />
                                <h3 className="text-xl font-bold text-white">Free</h3>
                            </div>
                            <div className="text-sm text-[#64748B] mb-6 min-h-[40px]">
                                For solo devs and side projects
                            </div>
                            <div className="mb-8 font-mono">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-[#64748B]">/month</span>
                            </div>

                            <div className="space-y-4 font-mono text-sm text-[#F1F5F9] mb-10 flex-1">
                                <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> 5 workflows</div>
                                <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> 100 runs/month</div>
                                <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> Claude AI only</div>
                                <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> GitHub integration</div>
                                <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7] shrink-0" /> Community support</div>
                                <div className="flex items-center gap-3 text-[#64748B]"><X className="w-4 h-4 text-[#333333] shrink-0" /> Multi-model AI</div>
                                <div className="flex items-center gap-3 text-[#64748B]"><X className="w-4 h-4 text-[#333333] shrink-0" /> Priority support</div>
                                <div className="flex items-center gap-3 text-[#64748B]"><X className="w-4 h-4 text-[#333333] shrink-0" /> Custom integrations</div>
                            </div>

                            <Button onClick={() => navigate('/auth')} variant="ghost" className="w-full border border-[#222222] hover:bg-[#1A1A1A] font-mono text-sm rounded-md py-6">
                                Get started free →
                            </Button>
                        </div>

                        {/* Pro Card */}
                        <div className="bg-[#111111] border border-[rgba(110,231,183,0.3)] shadow-[0_0_30px_rgba(110,231,183,0.05)] rounded-md p-8 text-left relative flex flex-col h-full transform md:-translate-y-4">
                            <div className="absolute top-0 right-8 -translate-y-1/2">
                                <div className="bg-[#111111] text-[#6EE7B7] border border-[#6EE7B7] px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-md">
                                    Most Popular
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-5 h-5 text-[#6EE7B7]" />
                                <h3 className="text-xl font-bold text-white">Pro</h3>
                            </div>
                            <div className="text-sm text-[#64748B] mb-6 min-h-[40px]">
                                For teams who ship fast
                            </div>
                            <div className="mb-8 font-mono">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold">${isYearly ? '96' : '12'}</span>
                                    <span className="text-[#64748B]">/{isYearly ? 'year' : 'month'}</span>
                                </div>
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

                            <Button onClick={() => navigate('/auth')} className="w-full bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(110,231,183,0.4)] font-mono text-sm font-bold border-none rounded-md py-6 transition-all duration-300">
                                Get started →
                            </Button>
                        </div>

                    </div>

                    <div className="text-[#64748B] text-sm font-mono mt-8">
                        All plans include a 14-day free trial. No credit card required.
                    </div>

                </motion.div>
            </main>
        </div>
    );
};

export default Pricing;
