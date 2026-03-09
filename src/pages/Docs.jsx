import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Menu, X, Github, Zap } from 'lucide-react';

const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const LogoMark = ({ size = 24 }) => (
    <div
        style={{
            width: size,
            height: size,
            borderRadius: 6,
            background: '#6EE7B7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        }}
    >
        <Zap
            style={{ width: size * 0.58, height: size * 0.58, color: '#080808' }}
            strokeWidth={3}
        />
    </div>
);

const NAV_LINKS = [
    { href: '/#features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/docs', label: 'Docs' },
    { href: '/about', label: 'About' },
];

export default function Docs() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    return (
        <div className="relative min-h-screen bg-[#080808] text-[#F1F5F9] selection:bg-[#6EE7B7]/30 flex flex-col">
            {/* Background grid */}
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:24px_24px] opacity-30 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

            {/* ─── Navbar ──────────────────────────────────────────────── */}
            <nav className="fixed top-0 z-50 w-full border-b border-[#1A1A1A] bg-[#080808]/80 backdrop-blur-md">
                <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 md:px-6">
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 font-mono text-xl font-bold transition-colors hover:bg-white/5 hover:rounded-xl px-2 py-1 -ml-2"
                    >
                        <LogoMark size={26} />
                        <span className="text-[#F1F5F9]">DevFlow</span>
                        <span className="text-[#6EE7B7]">AI</span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden items-center gap-8 text-sm font-mono md:flex">
                        {NAV_LINKS.map(({ href, label }) => (
                            <a
                                key={href}
                                href={href}
                                className={`transition-colors ${label === 'Docs' ? 'text-[#F1F5F9]' : 'text-[#64748B] hover:text-[#F1F5F9]'
                                    }`}
                            >
                                {label}
                            </a>
                        ))}
                    </div>

                    {/* Desktop auth area */}
                    <div className="hidden items-center gap-3 md:flex">
                        {user ? (
                            <div className="group relative">
                                <button className="font-mono rounded-xl border border-transparent px-4 py-2 text-sm text-[#64748B] transition-colors hover:border-[#222] hover:text-[#F1F5F9]">
                                    Account
                                </button>
                                <div className="invisible absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-[#222] bg-[#111] opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100">
                                    <div className="p-1">
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="w-full rounded-xl px-3 py-2 text-left text-xs font-mono text-[#F1F5F9] transition-colors hover:bg-[#1A1A1A]"
                                        >
                                            Dashboard →
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full rounded-xl px-3 py-2 text-left text-xs font-mono text-[#F87171] transition-colors hover:bg-[#1A1A1A]"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/auth?mode=login')}
                                    className="rounded-xl px-4 py-2 text-sm font-mono text-[#64748B] transition-colors hover:text-white"
                                >
                                    Log in
                                </button>
                                <button
                                    onClick={() => navigate('/auth?mode=signup')}
                                    className="rounded-xl bg-[#6EE7B7] px-4 py-2 font-bold text-sm font-mono text-[#080808] transition-colors hover:bg-[#34D399]"
                                >
                                    Sign up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex h-9 w-9 items-center justify-center text-[#64748B] transition-colors hover:text-white md:hidden"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>

                {/* Mobile menu dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-[#1A1A1A] bg-[#0D0D0D] md:hidden"
                        >
                            <div className="flex flex-col px-4">
                                {NAV_LINKS.map(({ href, label }) => (
                                    <a
                                        key={href}
                                        href={href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`border-b border-[#1A1A1A] py-4 text-sm font-mono transition-colors ${label === 'Docs'
                                            ? 'text-[#F1F5F9]'
                                            : 'text-[#64748B] hover:text-white'
                                            }`}
                                    >
                                        {label}
                                    </a>
                                ))}
                            </div>

                            <div className="flex gap-3 p-4">
                                {user ? (
                                    <button
                                        onClick={() => {
                                            navigate('/dashboard');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full rounded-xl border border-[#222] bg-[#111] py-3 text-sm font-mono text-[#F1F5F9]"
                                    >
                                        Dashboard
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                navigate('/auth?mode=login');
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex-1 rounded-xl border border-[#1A1A1A] py-2.5 text-xs font-mono text-[#64748B] transition-colors hover:text-white"
                                        >
                                            Log in
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/auth?mode=signup');
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex-1 rounded-xl bg-[#6EE7B7] py-2.5 text-xs font-bold font-mono text-[#080808] transition-colors hover:bg-[#34D399]"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ─── Main Content ────────────────────────────────────────── */}
            <main className="relative z-10 flex flex-1 flex-col items-center justify-center pt-28 pb-16 px-5 sm:px-8">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="w-full max-w-2xl text-center"
                >
                    <div className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-[#6EE7B7] md:text-sm">
                        {`>_ documentation`}
                    </div>

                    <h1 className="mb-5 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight text-[#F1F5F9]">
                        Documentation is
                        <br className="sm:hidden" /> being written.
                    </h1>

                    <p className="mx-auto mb-10 max-w-md text-base text-[#64748B] sm:text-lg">
                        We're documenting every feature as we build it. Full API references, integration
                        guides, and workflow examples coming soon.
                    </p>

                    {/* Terminal-style status block */}
                    <div className="mx-auto mb-10 max-w-lg overflow-hidden rounded-xl border border-[#222] bg-[#111] p-5 shadow-2xl md:p-6">
                        <div className="mb-4 flex items-center gap-2 border-b border-[#222] pb-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                            <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                            <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                            <div className="ml-4 hidden text-[10px] uppercase tracking-widest text-[#64748B] sm:block">
                                build_status
                            </div>
                        </div>

                        <div className="space-y-3.5 text-left font-mono text-xs md:text-sm">
                            <div className="flex items-center justify-between text-[#F1F5F9]">
                                <span className="truncate pr-3">writing installation guide</span>
                                <span className="font-bold text-[#6EE7B7]">✓</span>
                            </div>
                            <div className="flex items-center justify-between text-[#F1F5F9]">
                                <span className="truncate pr-3">writing API reference</span>
                                <span className="font-bold text-[#6EE7B7]">✓</span>
                            </div>
                            <div className="flex items-center justify-between text-[#F1F5F9]">
                                <span className="truncate pr-3">writing integration guides</span>
                                <span className="inline-block animate-spin text-[#F59E0B]">⟳</span>
                            </div>
                            <div className="flex items-center justify-between text-[#64748B]">
                                <span className="truncate pr-3">writing workflow examples</span>
                                <span className="text-[10px] opacity-70">pending</span>
                            </div>
                        </div>
                    </div>

                    <a
                        href="https://github.com/Vikrant-kun"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                    >
                        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#222] bg-[#111] px-7 py-3 font-mono text-sm text-[#F1F5F9] transition-all hover:border-[#333] hover:bg-[#1A1A1A] sm:w-auto">
                            <Github size={16} /> Star on GitHub
                        </button>
                    </a>
                </motion.div>
            </main>
        </div>
    );
}