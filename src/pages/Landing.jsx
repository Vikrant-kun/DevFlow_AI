import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDemo from '../components/ProductDemo';
import { Zap, Menu, X, Github, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
const sv = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeBlock3Model, setActiveBlock3Model] = useState(0);
    const [activeAppIndex, setActiveAppIndex] = useState(0);

    const block3Models = ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro', 'Groq 2'];
    useEffect(() => {
        const i = setInterval(() => setActiveBlock3Model(p => (p + 1) % block3Models.length), 2000);
        return () => clearInterval(i);
    }, []);
    // Slow, elegant carousel effect for Block 2
    useEffect(() => {
        const i = setInterval(() => setActiveAppIndex(p => (p + 1) % 3), 3000);
        return () => clearInterval(i);
    }, []);
    return (
        <div className="min-h-screen bg-[#080808] text-[#F1F5F9] selection:bg-[#6EE7B7]/30">
            <nav className="fixed top-0 w-full z-50 border-b border-[#1A1A1A] bg-[#080808]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <Link to={user ? "/dashboard" : "/"} className="font-bold text-lg flex items-center gap-1 font-mono hover:bg-white/5 hover:rounded-xl pt-1 pb-1 px-2 transition-colors">
                        <span className="text-[#F1F5F9]">DevFlow</span><span className="text-[#6EE7B7]">AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-mono text-[#64748B]">
                        <a href="/#features" className="hover:text-[#F1F5F9] transition-colors">Features</a>
                        <Link to="/about" className="hover:text-[#F1F5F9] transition-colors">About</Link>
                        <Link to="/pricing" className="hover:text-[#F1F5F9] transition-colors">Pricing</Link>
                        <Link to="/docs" className="hover:text-[#F1F5F9] transition-colors">Docs</Link>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <button onClick={() => navigate('/dashboard')} className="font-mono text-sm text-[#64748B] hover:text-[#F1F5F9] px-4 py-2 transition-colors">Dashboard</button>
                        ) : (
                            <>
                                <button className="font-mono text-sm text-[#64748B] hover:text-[#F1F5F9] px-4 py-2 transition-colors rounded-xl" onClick={() => navigate('/auth?mode=login')}>Log in</button>
                                <button className="font-mono text-sm bg-[#6EE7B7] text-[#080808] px-4 py-2 font-bold hover:bg-[#34D399] transition-colors rounded-xl" onClick={() => navigate('/auth?mode=signup')}>Sign up</button>
                            </>
                        )}
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-[#64748B] hover:text-white transition-colors">
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-[#0D0D0D] border-t border-[#1A1A1A] overflow-hidden"
                        >
                            <div className="px-4 flex flex-col py-4">
                                {[['/#features', 'Features'], ['/about', 'About'], ['/pricing', 'Pricing'], ['/docs', 'Docs']].map(([href, label]) => (
                                    <a key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}
                                        className="py-4 border-b border-[#1A1A1A] text-sm font-mono text-[#64748B] hover:text-white transition-colors">{label}</a>
                                ))}
                                <div className="pt-4 flex flex-col gap-3">
                                    {user ? (
                                        <>
                                            <button className="w-full bg-[#6EE7B7] text-[#080808] py-3 rounded-lg font-mono text-sm font-bold" onClick={() => navigate('/dashboard')}>Dashboard</button>
                                            <button className="w-full border border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] py-3 rounded-lg font-mono text-sm transition-colors" onClick={async () => { await supabase.auth.signOut(); setIsMobileMenuOpen(false); }}>Log out</button>
                                        </>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button className="flex-1 border border-[#222] text-[#F1F5F9] py-3 rounded-lg font-mono text-xs" onClick={() => navigate('/auth?mode=login')}>Log in</button>
                                            <button className="flex-1 bg-[#6EE7B7] text-[#080808] py-3 rounded-lg font-mono text-xs font-bold" onClick={() => navigate('/auth?mode=signup')}>Sign up</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            <section className="relative pt-24 pb-12 md:pt-36 md:pb-24 overflow-hidden min-h-[90vh] flex flex-col justify-center">
                <div className="absolute inset-0 z-0 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:24px_24px] opacity-40 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} className="max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-[#111]/80 backdrop-blur-sm border border-[#222] px-3 py-1.5 font-mono text-xs text-[#64748B] mb-8 rounded-full shadow-lg cursor-default">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] animate-pulse" />
                        <span className="text-[#F1F5F9]">v1.0 Open Beta</span> · free to start
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-[#F1F5F9] mb-6 leading-[1.1] md:leading-[1.15]">
                        Automate your dev workflow <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6EE7B7] to-[#34D399] drop-shadow-[0_0_15px_rgba(110,231,183,0.25)]">with AI.</span>
                    </h1>
                    <p className="text-sm md:text-lg text-[#64748B] mb-10 max-w-2xl mx-auto leading-relaxed">
                        Describe your pipeline in plain English. DevFlow builds, runs, and monitors it. <br className="hidden sm:block" /> GitHub, Slack, Jira — all connected in seconds.
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-12 px-2 sm:px-0">
                        <button onClick={() => navigate('/auth')} className="bg-[#6EE7B7] text-[#080808] font-mono font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-[#34D399] transition-all flex items-center justify-center gap-2">
                            Start building free <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </section>
            <div id="demo-section" className="relative z-20">
                <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-transparent to-[#0D0D0D] pointer-events-none h-32 -top-32" />
                <ProductDemo />
            </div>
            <div id="features" className="py-10 md:py-24 space-y-16 md:space-y-32 bg-[#0D0D0D]">

                {/* Block 2 — Tools connected (Smooth Carousel) */}
                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sv} className="w-full bg-[#111] py-16 md:py-24 border-y border-[#1A1A1A]">
                    <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight">Your tools. <br /><span className="text-[#64748B]">Connected.</span></h2>
                            <p className="text-sm md:text-base text-[#64748B] leading-relaxed mb-6">GitHub, Slack, Jira — first class integrations built strictly for developers. No Zapier overhead. No glue code.</p>
                        </div>
                        <div className="bg-[#080808] border border-[#1A1A1A] rounded-2xl p-6 md:p-8 h-[140px] md:h-[280px] flex items-center justify-center overflow-hidden order-1 md:order-2 relative shadow-2xl">
                            <div className="relative w-full flex items-center justify-between px-2 md:px-8">
                                <div className="absolute top-1/2 -translate-y-1/2 h-px bg-[#1A1A1A] left-[10%] right-[10%]" />
                                {[
                                    { bg: '#24292e', border: '#555', svg: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg> },
                                    { bg: '#E01E5A', border: '#FF3A79', svg: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522v-2.521zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.687a2.527 2.527 0 0 1-2.523-2.52 2.528 2.528 0 0 1 2.523-2.522h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.313z" /></svg> },
                                    { bg: '#0052CC', border: '#2684FF', svg: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M11.533 1.01L5.16 6.136c-.463.385-.463 1.012 0 1.4L11.533 12.66c.264.218.665.218.93 0l6.374-5.124a1 1 0 0 0 0-1.4l-6.374-5.126a.591.591 0 0 0-.93 0M2.93 11.23l-1.92 1.54a1.002 1.002 0 0 0 0 1.401l6.374 5.125a.591.591 0 0 0 .93 0l2.365-1.9-6.848-5.503c-.266-.217-.665-.217-.93 0L2.93 11.23M21.07 11.23l-.902-.663-6.819 5.485c-.264.218-.665.218-.93 0l-2.073-1.666 6.374 5.125a.592.592 0 0 0 .93 0l6.375-5.125a1 1 0 0 0 0-1.4l-2.954-2.378-.001.621z" /></svg> },
                                ].map(({ bg, border, svg }, i) => {
                                    const isActive = i === activeAppIndex;
                                    return (
                                        <div key={i} className="relative z-10 shrink-0 transition-all duration-700" style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>
                                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 shadow-xl ${isActive ? 'shadow-[0_0_30px_rgba(110,231,183,0.4)] border-[#6EE7B7]' : 'border-[#333]'}`} style={{ backgroundColor: bg }}>
                                                {svg}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.section>
                {/* Block 3 — Terminal AI Block (No purple) */}
                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sv} className="max-w-6xl mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                        <div className="bg-[#111] border border-[#1A1A1A] p-4 md:p-8 min-h-[200px] md:h-[280px] flex items-center justify-center overflow-hidden shadow-2xl rounded-2xl">
                            <div className="w-full bg-[#111] border border-[#222] p-4 md:p-6 shadow-xl relative overflow-hidden rounded-2xl font-mono text-xs flex flex-col justify-center">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#6EE7B7] to-transparent" />
                                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#222]">
                                    <Zap className="w-4 h-4 text-[#6EE7B7]" />
                                    <span className="font-mono text-[10px] md:text-xs text-[#F1F5F9] font-bold uppercase tracking-widest">Model_Engine</span>
                                </div>
                                <ul className="space-y-4 md:space-y-5">
                                    <li className="flex items-center gap-3"><span className="text-[#6EE7B7] font-bold">{`>_`}</span> <span className="text-[#64748B] tracking-wide">AI_Routing: <strong className="text-[#6EE7B7] font-normal">Optimal</strong></span></li>
                                    <li className="flex items-center gap-3"><span className="text-[#6EE7B7] font-bold">{`>_`}</span> <span className="text-[#64748B] tracking-wide">Auto-fallback: <strong className="text-[#F1F5F9] font-normal">Enabled</strong></span></li>
                                    <li className="flex items-center gap-3"><span className="text-[#6EE7B7] font-bold">{`>_`}</span> <span className="text-[#64748B] tracking-wide">Context_Injection: <strong className="text-[#F1F5F9] font-normal">Active</strong></span></li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight">Smart AI Routing <br /><span className="text-[#6EE7B7]">built-in.</span></h2>
                            <p className="text-sm md:text-base text-[#64748B] leading-relaxed">Claude 3.5, GPT-4o, Gemini, or Groq. Pick the AI that fits the job. Switch engines mid-workflow without changing a single line of code.</p>
                        </div>
                    </div>
                </motion.section>
            </div>

            {/* CTA */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv}
                className="border-t border-[#1A1A1A] bg-[#0A0A0A] py-16 md:py-28 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[#6EE7B7] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" />
                <div className="max-w-2xl mx-auto px-4 md:px-6 text-center relative z-10">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 tracking-tight text-[#F1F5F9]">Your pipeline. <br /><span className="text-[#64748B]">Automated forever.</span></h2>
                    <button onClick={() => navigate('/auth')}
                        className="mt-4 w-full sm:w-auto bg-[#6EE7B7] text-[#080808] font-mono font-bold text-sm px-10 py-4 rounded-xl hover:bg-[#34D399] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(110,231,183,0.4)] transition-all inline-flex items-center justify-center gap-2">
                        Deploy your first workflow <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.section>

            {/* FOOTER */}
            <footer className="border-t border-[#1A1A1A] bg-[#080808] py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="font-bold text-sm flex items-center gap-1 font-mono">
                        <span className="text-[#F1F5F9]">DevFlow</span><span className="text-[#6EE7B7]">_</span>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/about" className="hover:text-[#F1F5F9] transition-colors text-xs text-[#64748B] font-mono">About</Link>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#F1F5F9] transition-colors text-xs text-[#64748B] font-mono">GitHub</a>
                        <Link to="/pricing" className="hover:text-[#F1F5F9] transition-colors text-xs text-[#64748B] font-mono">Pricing</Link>
                    </div>
                    <p className="text-xs text-[#64748B] font-mono opacity-60">&copy; {new Date().getFullYear()} DevFlow AI.</p>
                </div>
            </footer>
        </div>
    );
};
export default Landing;