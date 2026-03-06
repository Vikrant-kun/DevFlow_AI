import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ProductDemo from '../components/ProductDemo';
import { Bot, Zap, Plug, GitBranch, Terminal, LayoutGrid } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const AnimatedCount = ({ value, display, color }) => {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!value) return
        let start = 0
        const end = value
        const step = Math.ceil(end / (1500 / 16))
        const timer = setInterval(() => {
            start += step
            if (start >= end) { setCount(end); clearInterval(timer) }
            else setCount(start)
        }, 16)
        return () => clearInterval(timer)
    }, [value])
    return <span className="font-mono text-sm font-bold" style={{ color }}>{display || count.toLocaleString()}</span>
}

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeBlock3, setActiveBlock3] = useState(0);

    const block3Models = [
        { name: 'Claude 3.5 Sonnet', color: '#A78BFA' },
        { name: 'GPT-4o', color: '#60A5FA' },
        { name: 'Gemini 1.5 Pro', color: '#FBBF24' },
        { name: 'Groq 2', color: '#6EE7B7' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveBlock3(prev => (prev + 1) % block3Models.length)
        }, 2000)
        return () => clearInterval(interval)
    }, []);

    return (
        <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <span>DevFlow</span>
                        <span className="text-primary text-glow-primary">AI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
                        <a href="/#features" className="hover:text-text-primary transition-colors">Features</a>
                        <Link to="/about" className="hover:text-text-primary transition-colors">About</Link>
                        <Link to="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
                        <Link to="/docs" className="hover:text-text-primary transition-colors">Docs</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="relative group">
                                <Button variant="ghost" className="gap-2">
                                    Account
                                </Button>
                                <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-[#222] rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <div className="p-1">
                                        <button onClick={() => navigate('/dashboard')} className="w-full text-left px-4 py-2 text-sm text-[#F1F5F9] hover:bg-[#222] rounded-sm transition-colors">Go to Dashboard →</button>
                                        <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#222] rounded-sm transition-colors">Sign out</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => navigate('/auth?mode=login')}>Log in</Button>
                                <Button onClick={() => navigate('/auth?mode=signup')}>Sign up</Button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex flex-col justify-center">
                <div className="absolute top-10 left-10 w-[400px] h-[400px] rounded-full bg-primary opacity-[0.06] blur-[80px] pointer-events-none" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
                <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-ai opacity-[0.05] blur-[80px] pointer-events-none" style={{ animation: 'float 10s ease-in-out infinite 2s' }}></div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    className="max-w-4xl mx-auto px-6 text-center relative z-10"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                        Automate your dev workflow <span className="text-primary block mt-2">with AI</span>
                    </h1>

                    <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
                        Describe your pipeline in plain English. DevFlow builds, runs, and monitors it automatically.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/auth')}>Start for free</Button>
                        <Button size="lg" variant="ghost" className="w-full sm:w-auto" onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })}>See how it works</Button>
                    </div>

                    {/* Live Stats Ticker */}
                    <div className="max-w-2xl mx-auto mt-4">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: '⚡', label: 'pipelines running', value: 1247, color: '#6EE7B7' },
                                { icon: '🔀', label: 'PRs merged today', value: 342, color: '#A78BFA' },
                                { icon: '⏱', label: 'avg generation', value: null, display: '4.2s', color: '#60A5FA' },
                                { icon: '🤖', label: 'success rate', value: null, display: '98.7%', color: '#FBBF24' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.15, duration: 0.5 }}
                                    className="flex items-center gap-2 bg-[#111] border border-[#1A1A1A] rounded-full px-4 py-2"
                                >
                                    <span className="text-sm">{stat.icon}</span>
                                    <AnimatedCount value={stat.value} display={stat.display} color={stat.color} />
                                    <span className="font-mono text-xs text-[#64748B]">{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>
                        <p className="text-xs text-[#333] font-mono mt-4 text-center">live activity</p>
                    </div>
                </motion.div>
            </section>

            <div id="demo-section">
                <ProductDemo />
            </div>

            {/* Social Proof Bar */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                className="border-y border-border bg-surface-1 py-8"
            >
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
                    <p className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-6">Built for teams who ship fast</p>
                    <div className="flex flex-wrap justify-center gap-12 text-text-secondary w-full opacity-60 grayscale filter">
                        <div className="flex items-center gap-2 font-bold text-xl"><Zap className="h-6 w-6" /> ACME Corp</div>
                        <div className="flex items-center gap-2 font-bold text-xl"><Bot className="h-6 w-6" /> GlobalNet</div>
                        <div className="flex items-center gap-2 font-bold text-xl"><Plug className="h-6 w-6" /> TechFlow</div>
                    </div>
                </div>
            </motion.section>

            {/* Features Section */}
            <div id="features" className="py-24 space-y-32">
                {/* Block 1 */}
                <motion.section
                    className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center"
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
                >
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Describe it. <span className="text-primary block mt-2">We build it.</span></h2>
                        <p className="text-lg text-text-secondary leading-relaxed mb-6">Type your workflow in plain English. DevFlow's AI understands your intent and generates a complete pipeline instantly.</p>
                        <div className="space-y-3 mt-8">
                            <div className="flex items-center gap-3"><span className="text-primary font-mono text-sm leading-none">→</span><span className="font-mono text-xs text-[#64748B]">Works with any dev workflow</span></div>
                            <div className="flex items-center gap-3"><span className="text-primary font-mono text-sm leading-none">→</span><span className="font-mono text-xs text-[#64748B]">Understands GitHub, Slack, Jira context</span></div>
                            <div className="flex items-center gap-3"><span className="text-primary font-mono text-sm leading-none">→</span><span className="font-mono text-xs text-[#64748B]">Generates in under 5 seconds</span></div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 bg-[#0D0D0D] border border-border rounded-2xl p-8 relative overflow-hidden h-[340px] flex items-center shadow-2xl">
                        <div className="w-full">
                            <label className="block text-xs font-mono text-text-secondary mb-3">Workflow Prompt</label>
                            <div className="bg-[#111] border border-border rounded-lg p-6 font-mono text-lg text-[#F1F5F9] leading-relaxed relative shadow-inner">
                                <span className="text-text-primary">When a new PR is opened, </span>
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="text-primary">review code, run tests, </motion.span>
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="text-ai">and post a summary.</motion.span>
                                <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-3 h-5 bg-primary align-middle ml-1 shadow-glow-primary" />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Block 2 */}
                <motion.section
                    className="w-full bg-[#0D0D0D] py-32 border-y border-border"
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
                >
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-background border border-border rounded-2xl p-12 relative overflow-hidden h-[340px] flex items-center justify-center shadow-2xl">
                            <div className="relative w-[320px] flex items-center justify-between z-10">
                                <div className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-[#222] -z-10" style={{ left: '40px', right: '40px' }}></div>
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-primary -z-10 shadow-glow-primary origin-left"
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                    style={{ left: '40px', right: '40px' }}
                                ></motion.div>
                                <div className="w-20 h-20 rounded-2xl bg-[#24292e] flex items-center justify-center shadow-xl border border-[#444] z-10 shrink-0 relative">
                                    <motion.div className="absolute -inset-2 rounded-3xl border-2 border-[#6EE7B7] opacity-0" animate={{ scale: [0.9, 1.1, 0.9], opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                                    <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                </div>
                                <div className="w-20 h-20 rounded-2xl bg-[#E01E5A] flex items-center justify-center shadow-xl border border-[#FF3A79] z-10 shrink-0 relative">
                                    <motion.div className="absolute -inset-2 rounded-3xl border-2 border-[#6EE7B7] opacity-0" animate={{ scale: [0.9, 1.1, 0.9], opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6, ease: "easeInOut" }} />
                                    <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522v-2.521zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.687a2.527 2.527 0 0 1-2.523-2.52 2.528 2.528 0 0 1 2.523-2.522h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.313z" /></svg>
                                </div>
                                <div className="w-20 h-20 rounded-2xl bg-[#0052CC] flex items-center justify-center shadow-xl border border-[#2684FF] z-10 shrink-0 relative">
                                    <motion.div className="absolute -inset-2 rounded-3xl border-2 border-[#6EE7B7] opacity-0" animate={{ scale: [0.9, 1.1, 0.9], opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2, ease: "easeInOut" }} />
                                    <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white"><path d="M11.533 1.01L5.16 6.136c-.463.385-.463 1.012 0 1.4L11.533 12.66c.264.218.665.218.93 0l6.374-5.124a1 1 0 0 0 0-1.4l-6.374-5.126a.591.591 0 0 0-.93 0M2.93 11.23l-1.92 1.54a1.002 1.002 0 0 0 0 1.401l6.374 5.125a.591.591 0 0 0 .93 0l2.365-1.9-6.848-5.503c-.266-.217-.665-.217-.93 0L2.93 11.23M21.07 11.23l-.902-.663-6.819 5.485c-.264.218-.665.218-.93 0l-2.073-1.666 6.374 5.125a.592.592 0 0 0 .93 0l6.375-5.125a1 1 0 0 0 0-1.4l-2.954-2.378-.001.621z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Your tools. <span className="text-text-secondary block mt-2">Connected.</span></h2>
                            <p className="text-lg text-text-secondary leading-relaxed mb-6">GitHub, Slack, Jira — first class integrations. No Zapier. No glue code. Just works.</p>
                            <div className="space-y-3 mt-8">
                                <div className="flex items-center gap-3"><span className="text-primary font-mono text-sm leading-none">→</span><span className="font-mono text-xs text-[#64748B]">No API keys to manage</span></div>
                                <div className="flex items-center gap-3"><span className="text-primary font-mono text-sm leading-none">→</span><span className="font-mono text-xs text-[#64748B]">One-click OAuth connection</span></div>
                                <div className="flex items-center gap-3"><span className="text-primary font-mono text-sm leading-none">→</span><span className="font-mono text-xs text-[#64748B]">Real-time event triggers</span></div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Block 3 */}
                <motion.section
                    className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center"
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
                >
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Switch models <span className="text-ai block mt-2">instantly.</span></h2>
                        <p className="text-lg text-text-secondary leading-relaxed mb-8">Claude, GPT-4, Gemini, Groq. Pick the brain that fits the job. Switch mid-workflow anytime.</p>
                        <div className="flex flex-wrap gap-3 mt-8">
                            {block3Models.map((m, i) => (
                                <span
                                    key={i}
                                    className={`px-3 py-1.5 rounded-full font-mono text-xs min-w-[120px] text-center transition-all duration-300 ${i === activeBlock3
                                        ? 'border bg-primary/10 text-primary'
                                        : 'border border-border bg-[#111] text-[#64748B]'
                                        }`}
                                    style={i === activeBlock3 ? { borderColor: m.color, color: m.color, backgroundColor: m.color + '18' } : {}}
                                >
                                    → {m.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="order-1 md:order-2 bg-[#0D0D0D] border border-border rounded-2xl p-8 relative overflow-hidden h-[340px] flex items-center shadow-2xl">
                        <div className="w-full max-w-xs mx-auto bg-surface-1 border border-border rounded-xl shadow-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-semibold text-text-primary text-sm flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-ai" /> Model Selector
                                </span>
                            </div>
                            <div className="space-y-3">
                                {block3Models.map((m, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-300"
                                        style={i === activeBlock3 ? {
                                            borderColor: m.color,
                                            backgroundColor: m.color + '12'
                                        } : {
                                            borderColor: '#222',
                                            backgroundColor: '#111'
                                        }}
                                    >
                                        <div
                                            className="w-2 h-2 rounded-full transition-all duration-300"
                                            style={{ backgroundColor: i === activeBlock3 ? m.color : '#333' }}
                                        />
                                        <span
                                            className="text-sm font-mono transition-all duration-300"
                                            style={{ color: i === activeBlock3 ? m.color : '#64748B' }}
                                        >
                                            {m.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Block 4: How it works */}
                <motion.section
                    className="max-w-7xl mx-auto px-6"
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
                >
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How it works</h2>
                    </div>
                    <div className="relative">
                        <div className="absolute top-8 left-[10%] right-[10%] h-px border-b-2 border-dashed border-[#222] -z-10 hidden md:block"></div>
                        <div className="grid md:grid-cols-3 gap-12 relative z-10">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center font-mono text-xl font-bold text-primary mb-6 shadow-xl">01</div>
                                <h3 className="text-xl font-bold text-white mb-2">Describe</h3>
                                <p className="text-[#64748B] text-sm">Type your workflow in plain English</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center font-mono text-xl font-bold text-primary mb-6 shadow-xl relative">
                                    02
                                    <div className="absolute inset-0 rounded-2xl border border-primary/20 bg-primary/5 animate-pulse"></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Generate</h3>
                                <p className="text-[#64748B] text-sm">AI builds your pipeline instantly</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center font-mono text-xl font-bold text-primary mb-6 shadow-xl">03</div>
                                <h3 className="text-xl font-bold text-white mb-2">Automate</h3>
                                <p className="text-[#64748B] text-sm">It runs automatically, forever</p>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>

            {/* CTA Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                className="border-t border-border bg-surface-1 py-24 relative overflow-hidden"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary rounded-[100%] mix-blend-screen filter blur-[120px] opacity-5 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Your pipeline. <span className="text-text-secondary">Your rules.</span> Automated.</h2>
                    <Button size="lg" className="mt-4" onClick={() => navigate('/auth')}>Get started free</Button>
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="border-t border-border bg-background py-16">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-sm text-text-secondary text-center space-y-6">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <span className="text-text-primary">DevFlow</span>
                        <span className="text-primary text-glow-primary">AI</span>
                    </div>
                    <div className="flex gap-8">
                        <Link to="/about" className="hover:text-text-primary transition-colors text-text-secondary">About</Link>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors text-text-secondary">GitHub</a>
                    </div>
                    <p className="mt-4 text-xs opacity-50">&copy; {new Date().getFullYear()} DevFlow AI. All rights reserved.</p>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes float {
                        0%, 100% { transform: translateY(-20px); }
                        50% { transform: translateY(20px); }
                    }
                `
            }} />
        </div>
    );
};

export default Landing;