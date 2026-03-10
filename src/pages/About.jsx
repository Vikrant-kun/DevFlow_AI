import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Github,
    Linkedin,
    Briefcase,
    Mail,
    Code2,
    Layers,
    Cpu,
    Database,
    LayoutTemplate,
    Menu,
    X,
    Zap,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
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

const TECH_STACK = [
    { name: 'React Flow', icon: LayoutTemplate },
    { name: 'Framer Motion', icon: Code2 },
    { name: 'FastAPI', icon: Layers },
    { name: 'PostgreSQL', icon: Database },
    { name: 'AI Models', icon: Cpu },
];

export default function About() {
    const navigate = useNavigate();
    const { user, handleLogout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await handleLogout();
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    return (
        <div className="relative min-h-screen bg-[#080808] text-[#F1F5F9] selection:bg-[#6EE7B7]/30">
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

                    {/* Desktop nav */}
                    <div className="hidden items-center gap-8 text-sm font-mono md:flex">
                        {NAV_LINKS.map(({ href, label }) => (
                            <a
                                key={href}
                                href={href}
                                className={`transition-colors ${label === 'About' ? 'text-[#F1F5F9]' : 'text-[#64748B] hover:text-[#F1F5F9]'
                                    }`}
                            >
                                {label}
                            </a>
                        ))}
                    </div>

                    {/* Desktop auth buttons */}
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

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex h-9 w-9 items-center justify-center text-[#64748B] transition-colors hover:text-white md:hidden"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>

                {/* Mobile menu */}
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
                                        className={`border-b border-[#1A1A1A] py-4 text-sm font-mono transition-colors ${label === 'About'
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

            <main className="relative z-10 pt-32 pb-24">
                {/* Hero */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="mx-auto max-w-3xl px-6 pt-16 text-center"
                >
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#6EE7B7]/20 bg-[#6EE7B7]/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#6EE7B7] shadow-[0_0_15px_rgba(110,231,183,0.15)] md:text-xs">
                        <Briefcase size={14} />
                        Currently open to opportunities
                    </div>

                    <h1 className="mb-8 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-tight">
                        Built by a developer,
                        <br />
                        <span className="bg-gradient-to-r from-[#64748B] to-[#94A3B8] bg-clip-text text-transparent">
                            for developers.
                        </span>
                    </h1>

                    <div className="prose prose-invert mx-auto max-w-none text-sm leading-relaxed text-[#64748B] md:text-base prose-p:my-6">
                        <p>
                            I'm a final-year CS student who got tired of setting up the same deployment scripts,
                            managing CI/CD pipelines, and writing glue code over and over again.
                        </p>
                        <p>
                            So I built DevFlow AI — an experiment in combining natural language processing with
                            robust, node-based automation to give engineering teams back their most valuable
                            asset: <strong>time</strong>.
                        </p>
                    </div>

                    <div className="mt-12 flex flex-col items-stretch justify-center gap-4 px-4 sm:flex-row sm:items-center sm:px-0">
                        <a href="https://github.com/Vikrant-kun" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#222] bg-[#111] px-6 py-3 font-mono text-sm text-[#F1F5F9] transition-all hover:border-[#333] hover:bg-[#1A1A1A] sm:w-auto">
                                <Github size={16} /> GitHub
                            </button>
                        </a>

                        <a href="https://www.linkedin.com/in/vikrant-vinchurkar-9496862bb/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#222] bg-[#111] px-6 py-3 font-mono text-sm text-[#F1F5F9] transition-all hover:border-[#333] hover:bg-[#1A1A1A] sm:w-auto">
                                <Linkedin size={16} /> LinkedIn
                            </button>
                        </a>

                        <a href="mailto:vikrantvinchurkar12@gmail.com" className="w-full sm:w-auto">
                            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-6 py-3 font-mono text-sm text-[#64748B] transition-all hover:bg-[#111] hover:text-[#F1F5F9] sm:w-auto">
                                <Mail size={16} /> Email Me
                            </button>
                        </a>
                    </div>
                </motion.section>

                {/* Tech Stack */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={sectionVariants}
                    className="mx-auto mt-32 max-w-4xl px-6"
                >
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#64748B] md:text-xs font-mono">
                            Under the hood
                        </h2>
                        <div className="mx-auto h-px w-24 bg-[#1A1A1A]" />
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        {TECH_STACK.map(({ name, icon: Icon }, i) => (
                            <div
                                key={name}
                                className="flex items-center gap-2 rounded-xl border border-[#222] bg-[#111] px-4 py-2.5 text-xs font-medium text-[#F1F5F9] transition-colors hover:border-[#6EE7B7]/50 md:px-6 md:py-3 md:text-sm font-mono shadow-sm"
                            >
                                <Icon className="h-3.5 w-3.5 text-[#64748B] md:h-4 md:w-4" />
                                {name}
                            </div>
                        ))}
                    </div>
                </motion.section>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-[#1A1A1A] bg-[#080808] py-10 md:py-12">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 text-center text-xs font-mono text-[#64748B] sm:flex-row sm:text-left md:px-6">
                    <div className="flex items-center gap-2.5 font-bold">
                        <LogoMark size={20} />
                        <span className="text-[#F1F5F9]">DevFlow</span>
                        <span className="text-[#6EE7B7]">AI</span>
                    </div>

                    <div className="flex gap-6">
                        <Link to="/" className="transition-colors hover:text-[#F1F5F9]">
                            Home
                        </Link>
                        <a
                            href="https://github.com/Vikrant-kun"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-[#F1F5F9]"
                        >
                            GitHub
                        </a>
                    </div>

                    <p className="opacity-60 sm:block hidden">
                        © {new Date().getFullYear()} DevFlow AI
                    </p>
                </div>
            </footer>
        </div>
    );
}