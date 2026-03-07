import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Menu, X, Github } from 'lucide-react';

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Docs = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#080808] text-[#F1F5F9] selection:bg-[#6EE7B7]/30 flex flex-col">

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
                        <Link to="/about" className="hover:text-[#F1F5F9] transition-colors">About</Link>
                        <Link to="/pricing" className="hover:text-[#F1F5F9] transition-colors">Pricing</Link>
                        <Link to="/docs" className="text-[#F1F5F9] transition-colors">Docs</Link>
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
                                        className={`py-4 border-b border-[#1A1A1A] text-sm font-mono transition-colors ${label === 'Docs' ? 'text-[#F1F5F9]' : 'text-[#64748B] hover:text-white'}`}>{label}</a>
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center pt-24 px-4 sm:px-6 relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="max-w-2xl w-full text-center"
                >
                    <div className="mb-6 font-mono text-[10px] md:text-xs text-[#6EE7B7] font-bold tracking-widest uppercase cursor-default">
                        {`>_ documentation`}
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#F1F5F9] leading-tight">
                        Documentation is <br className="sm:hidden" /> being written.
                    </h1>

                    <p className="text-sm md:text-base text-[#64748B] mb-10 max-w-md mx-auto">
                        We're documenting every feature as we build it. Check back soon for full API references and integration guides.
                    </p>

                    {/* Terminal Block - Updated to rounded-xl controls */}
                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 md:p-6 text-left font-mono text-xs md:text-sm shadow-2xl mx-auto max-w-lg mb-10 overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 border-b border-[#222] pb-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                            <div className="ml-4 text-[10px] text-[#64748B] uppercase tracking-widest hidden sm:block">build_status</div>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <div className="flex justify-between items-center text-[#F1F5F9] whitespace-nowrap overflow-hidden text-ellipsis">
                                <span className="truncate pr-4">writing installation guide..........</span>
                                <span className="text-[#6EE7B7] shrink-0 font-bold">✓</span>
                            </div>
                            <div className="flex justify-between items-center text-[#F1F5F9] whitespace-nowrap overflow-hidden text-ellipsis">
                                <span className="truncate pr-4">writing API reference...............</span>
                                <span className="text-[#6EE7B7] shrink-0 font-bold">✓</span>
                            </div>
                            <div className="flex justify-between items-center text-[#F1F5F9] whitespace-nowrap overflow-hidden text-ellipsis">
                                <span className="truncate pr-4">writing integration docs............</span>
                                <span className="text-[#F59E0B] inline-block animate-spin shrink-0">⟳</span>
                            </div>
                            <div className="flex justify-between items-center text-[#64748B] whitespace-nowrap overflow-hidden text-ellipsis">
                                <span className="truncate pr-4">writing workflow examples...........</span>
                                <span className="shrink-0 text-[10px]">pending</span>
                            </div>
                        </div>
                    </div>

                    <a href="https://github.com/Vikrant-kun" target="_blank" rel="noreferrer" className="inline-block">
                        <button className="bg-[#111] border border-[#222] text-[#F1F5F9] font-mono text-sm px-6 py-3 rounded-xl hover:bg-[#1A1A1A] hover:border-[#333] transition-colors flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto">
                            <Github className="w-4 h-4" /> Star on GitHub
                        </button>
                    </a>
                </motion.div>
            </main>
        </div>
    );
};

export default Docs;