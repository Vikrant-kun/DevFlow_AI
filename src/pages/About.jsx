import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Briefcase, Mail, Code2, Layers, Cpu, Database, LayoutTemplate, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const About = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#080808] text-[#F1F5F9] selection:bg-[#6EE7B7]/30">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:24px_24px] opacity-30 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] pointer-events-none" />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-[#1A1A1A] bg-[#080808]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl font-mono hover:bg-white/5 hover:rounded-xl px-2 py-1 -ml-2 transition-colors">
                        <span className="text-[#F1F5F9]">DevFlow</span><span className="text-[#6EE7B7]">AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-mono text-[#64748B]">
                        <a href="/#features" className="hover:text-[#F1F5F9] transition-colors">Features</a>
                        <Link to="/about" className="text-[#F1F5F9] transition-colors">About</Link>
                        <Link to="/pricing" className="hover:text-[#F1F5F9] transition-colors">Pricing</Link>
                        <Link to="/docs" className="hover:text-[#F1F5F9] transition-colors">Docs</Link>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <div className="relative group">
                                <button className="font-mono text-sm text-[#64748B] hover:text-[#F1F5F9] px-4 py-2 transition-colors border border-transparent hover:border-[#222] rounded-xl">Account</button>
                                <div className="absolute right-0 mt-2 w-44 bg-[#111] border border-[#222] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 rounded-xl overflow-hidden">
                                    <div className="p-1">
                                        <button onClick={() => navigate('/dashboard')} className="w-full text-left px-3 py-2 text-xs text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors font-mono rounded-xl">Dashboard →</button>
                                        <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-3 py-2 text-xs text-[#F87171] hover:bg-[#1A1A1A] transition-colors font-mono rounded-xl">Sign out</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => navigate('/auth?mode=login')} className="font-mono text-sm text-[#64748B] hover:text-white px-4 py-2 transition-colors rounded-xl">Log in</button>
                                <button onClick={() => navigate('/auth?mode=signup')} className="font-mono text-sm bg-[#6EE7B7] text-[#080808] px-4 py-2 font-bold hover:bg-[#34D399] transition-colors rounded-xl">Sign up</button>
                            </>
                        )}
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-9 h-9 flex items-center justify-center text-[#64748B] hover:text-white transition-colors">
                        {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-[#0D0D0D] border-t border-[#1A1A1A] overflow-hidden">
                            <div className="px-4 flex flex-col">
                                {[['/#features', 'Features'], ['/about', 'About'], ['/pricing', 'Pricing'], ['/docs', 'Docs']].map(([href, label]) => (
                                    <a key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}
                                        className={`py-4 border-b border-[#1A1A1A] text-sm font-mono transition-colors ${label === 'About' ? 'text-[#F1F5F9]' : 'text-[#64748B] hover:text-white'}`}>{label}</a>
                                ))}
                            </div>
                            <div className="p-4 flex gap-3">
                                {user ? (
                                    <button className="w-full bg-[#111] border border-[#222] text-[#F1F5F9] py-3 rounded-xl font-mono text-sm" onClick={() => navigate('/dashboard')}>Dashboard</button>
                                ) : (
                                    <>
                                        <button className="flex-1 font-mono text-xs border border-[#1A1A1A] text-[#64748B] py-2 hover:text-white transition-colors rounded-xl" onClick={() => { navigate('/auth?mode=login'); setIsMobileMenuOpen(false); }}>Log in</button>
                                        <button className="flex-1 font-mono text-xs bg-[#6EE7B7] text-[#080808] py-2 font-bold hover:bg-[#34D399] transition-colors rounded-xl" onClick={() => { navigate('/auth?mode=signup'); setIsMobileMenuOpen(false); }}>Sign up</button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="pt-32 pb-24 relative z-10">
                {/* Hero Section */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="max-w-3xl mx-auto px-6 pt-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 text-[#6EE7B7] font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(110,231,183,0.15)] cursor-default">
                        <Briefcase className="w-3.5 h-3.5" />
                        Currently open to opportunities
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
                        Built by a developer,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#64748B] to-[#94A3B8]">for developers.</span>
                    </h1>

                    <div className="prose prose-invert prose-lg mx-auto text-[#64748B] leading-relaxed space-y-6 text-sm md:text-base">
                        <p>
                            I'm a final-year CS student who got tired of setting up the same deployment scripts, managing CI/CD pipelines, and writing glue code over and over again.
                        </p>
                        <p>
                            So I built DevFlow AI. It's an experiment in combining natural language processing with robust, node-based automation to give engineering teams back their most valuable asset: time.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mt-12 px-4 sm:px-0">
                        <a href="https://github.com/Vikrant-kun" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto bg-[#111] border border-[#222] text-[#F1F5F9] font-mono text-sm px-6 py-3 rounded-xl hover:bg-[#1A1A1A] hover:border-[#333] transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <Github className="w-4 h-4" /> GitHub
                            </button>
                        </a>
                        <a href="https://www.linkedin.com/in/vikrant-vinchurkar-9496862bb/" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto bg-[#111] border border-[#222] text-[#F1F5F9] font-mono text-sm px-6 py-3 rounded-xl hover:bg-[#1A1A1A] hover:border-[#333] transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <Linkedin className="w-4 h-4" /> LinkedIn
                            </button>
                        </a>
                        <a href="mailto:vikrantvinchurkar12@gmail.com" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto border border-transparent text-[#64748B] font-mono text-sm px-6 py-3 rounded-xl hover:bg-[#111] hover:text-[#F1F5F9] transition-colors flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" /> Email Me
                            </button>
                        </a>
                    </div>
                </motion.section>

                {/* Tech Stack Section */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    className="max-w-4xl mx-auto px-6 mt-32"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-[10px] md:text-xs font-mono font-bold text-[#64748B] uppercase tracking-widest mb-4">Under the hood</h2>
                        <div className="h-px w-24 bg-[#1A1A1A] mx-auto"></div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        {[
                            { name: "React Flow", icon: LayoutTemplate },
                            { name: "Framer Motion", icon: Code2 },
                            { name: "FastAPI", icon: Layers },
                            { name: "Supabase", icon: Database },
                            { name: "AI Models", icon: Cpu }
                        ].map((tech, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl bg-[#111] border border-[#222] text-[#F1F5F9] text-xs md:text-sm font-mono font-medium hover:border-[#6EE7B7]/50 transition-colors shadow-sm"
                            >
                                <tech.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#64748B]" />
                                {tech.name}
                            </div>
                        ))}
                    </div>
                </motion.section>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#1A1A1A] bg-[#080808] py-8 md:py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="font-bold text-sm flex items-center gap-1 font-mono">
                        <span className="text-[#F1F5F9]">DevFlow</span><span className="text-[#6EE7B7]">_</span>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/" className="hover:text-[#F1F5F9] transition-colors text-xs text-[#64748B] font-mono">Home</Link>
                        <a href="https://github.com/Vikrant-kun" target="_blank" rel="noreferrer" className="hover:text-[#F1F5F9] transition-colors text-xs text-[#64748B] font-mono">GitHub</a>
                    </div>
                    <p className="text-xs text-[#64748B] font-mono opacity-60 hidden sm:block">&copy; {new Date().getFullYear()} DevFlow AI.</p>
                </div>
            </footer>
        </div>
    );
};

export default About;