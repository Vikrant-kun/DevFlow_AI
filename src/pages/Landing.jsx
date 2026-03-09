import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDemo from '../components/ProductDemo';
import { Zap, Menu, X, ArrowRight, GitBranch, Bell, Layers, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// ── Animation variants ────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
    })
};

// ── Tool definitions ──────────────────────────────────────────────
const TOOLS = [
    {
        label: 'GitHub', desc: 'Push commits, open PRs, manage branches automatically.',
        bg: '#161B22', accent: '#6EE7B7',
        svg: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
    },
    {
        label: 'Slack', desc: 'Send alerts, pipeline status updates, and failure notifications.',
        bg: '#1A0A1A', accent: '#E879B0',
        svg: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522v-2.521zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.687a2.527 2.527 0 0 1-2.523-2.52 2.528 2.528 0 0 1 2.523-2.522h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.313z" /></svg>
    },
    {
        label: 'Jira', desc: 'Create tickets, update issue status, track sprints — hands-free.',
        bg: '#060E1F', accent: '#4C9BF5',
        svg: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M11.571 11.429 5.714 5.571 0 11.286l5.714 5.714 5.857-5.571zm.858 0 5.857 5.571L24 11.286 18.286 5.57l-5.857 5.858zM12 12.286l-5.714 5.857L12 24l5.714-5.857L12 12.286zM12 0 6.286 5.714 12 11.429l5.714-5.715L12 0z" /></svg>
    },
    {
        label: 'Notion', desc: 'Write docs, update wikis, and log pipeline output automatically.',
        bg: '#111111', accent: '#E5E5E5',
        svg: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" /></svg>
    },
    {
        label: 'Linear', desc: 'Sync issues, update cycle progress, and triage bugs automatically.',
        bg: '#0A0A14', accent: '#8B7CF6',
        svg: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M0 14.008 9.992 24H24L0 0v14.008ZM14.659 24H24V14.34L14.659 24Z" /></svg>
    },
    {
        label: 'Email', desc: 'Alert your team on pipeline success, failure, or any custom event.',
        bg: '#0F1117', accent: '#6EE7B7',
        svg: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="1.8"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
    },
];

// ── DevFlow Logo mark ─────────────────────────────────────────────
const LogoMark = ({ size = 24 }) => (
    <div style={{ width: size, height: size }} className="rounded-lg bg-[#6EE7B7] flex items-center justify-center flex-shrink-0">
        <Zap style={{ width: size * 0.55, height: size * 0.55 }} className="text-[#080808]" strokeWidth={3} />
    </div>
);

// ── Subtle dot grid background ────────────────────────────────────
const DotGrid = ({ className = '' }) => (
    <div className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
        }}
    />
);

// ── Main ──────────────────────────────────────────────────────────
const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#080808] text-[#F1F5F9] selection:bg-[#6EE7B7]/20 overflow-x-hidden">

            {/* ── NAV ────────────────────────────────────────────── */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06]"
                style={{ background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(24px)' }}>
                <div className="max-w-6xl mx-auto px-5 h-15 flex items-center justify-between" style={{ height: 60 }}>
                    <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-mono font-bold text-base">
                        <LogoMark size={26} />
                        <span className="text-[#F1F5F9]">DevFlow</span><span className="text-[#6EE7B7]">AI</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-7 text-sm font-mono">
                        {[['/#features', 'Features'], ['/pricing', 'Pricing'], ['/docs', 'Docs'], ['/about', 'About']].map(([href, label]) => (
                            <a key={href} href={href} className="text-[#64748B] hover:text-[#F1F5F9] transition-colors duration-200">{label}</a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <button onClick={() => navigate('/dashboard')}
                                className="font-mono text-sm text-[#64748B] hover:text-[#F1F5F9] px-4 py-2 transition-colors">
                                Dashboard →
                            </button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/auth?mode=login')}
                                    className="font-mono text-sm text-[#64748B] hover:text-[#F1F5F9] px-4 py-2 transition-colors">
                                    Log in
                                </button>
                                <button onClick={() => navigate('/auth?mode=signup')}
                                    className="font-mono text-sm bg-[#6EE7B7] text-[#080808] px-5 py-2.5 font-bold hover:bg-[#4ADE80] transition-colors rounded-lg">
                                    Get started free
                                </button>
                            </>
                        )}
                    </div>

                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-[#64748B] hover:text-white transition-colors p-1">
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                            className="md:hidden border-t border-white/[0.06] bg-[#0A0A0A] overflow-hidden">
                            <div className="px-5 py-5 flex flex-col gap-1">
                                {[['/#features', 'Features'], ['/pricing', 'Pricing'], ['/docs', 'Docs'], ['/about', 'About']].map(([href, label]) => (
                                    <a key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}
                                        className="py-3 text-sm font-mono text-[#64748B] hover:text-white border-b border-white/[0.04] transition-colors">
                                        {label}
                                    </a>
                                ))}
                                <div className="pt-4 flex flex-col gap-3">
                                    {user ? (
                                        <button onClick={() => navigate('/dashboard')}
                                            className="w-full bg-[#6EE7B7] text-[#080808] py-3 rounded-lg font-mono text-sm font-bold">
                                            Dashboard
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={() => navigate('/auth?mode=login')}
                                                className="w-full border border-white/10 text-[#F1F5F9] py-3 rounded-lg font-mono text-sm">
                                                Log in
                                            </button>
                                            <button onClick={() => navigate('/auth?mode=signup')}
                                                className="w-full bg-[#6EE7B7] text-[#080808] py-3 rounded-lg font-mono text-sm font-bold">
                                                Get started free
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ── HERO ───────────────────────────────────────────── */}
            <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
                <DotGrid />

                {/* Soft glow — subtle, not blurry */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at top, rgba(110,231,183,0.06) 0%, transparent 70%)' }} />

                <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
                    <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
                        <div className="inline-flex items-center gap-2 border border-[#6EE7B7]/20 bg-[#6EE7B7]/[0.06] px-3.5 py-1.5 font-mono text-xs text-[#6EE7B7] mb-8 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] animate-pulse" />
                            Open Beta · free to start, no card needed
                        </div>
                    </motion.div>

                    <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUp}
                        className="text-4xl sm:text-5xl md:text-[68px] font-extrabold text-[#F1F5F9] mb-6 leading-[1.06] tracking-[-0.02em]">
                        Ship faster with<br className="hidden sm:block" />{' '}
                        <span className="text-[#6EE7B7]">AI-powered</span> dev workflows.
                    </motion.h1>

                    <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp}
                        className="text-base md:text-lg text-[#64748B] mb-10 max-w-xl mx-auto leading-relaxed">
                        Describe your pipeline in plain English. DevFlow connects your GitHub, Slack, Jira and more — and runs it automatically.
                    </motion.p>

                    <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
                        <button onClick={() => navigate('/auth')}
                            className="group w-full sm:w-auto bg-[#6EE7B7] text-[#080808] font-mono font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-[#4ADE80] transition-colors flex items-center justify-center gap-2">
                            Start building free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <button onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto border border-white/10 text-[#64748B] hover:text-[#F1F5F9] font-mono text-sm px-8 py-3.5 rounded-xl hover:border-white/20 transition-all">
                            See how it works
                        </button>
                    </motion.div>

                    {/* Social proof */}
                    <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
                        className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#475569]">
                        {['No credit card required', 'Free forever plan', '5 integrations built-in'].map((t, i) => (
                            <span key={i} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#6EE7B7]" />
                                {t}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── PRODUCT DEMO ───────────────────────────────────── */}
            <div id="demo-section" className="relative z-20">
                <ProductDemo />
            </div>

            {/* ── FEATURES ───────────────────────────────────────── */}
            <div id="features">

                {/* Integrations — clean card grid */}
                <motion.section
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
                    className="py-20 md:py-28 border-t border-white/[0.05]">
                    <div className="max-w-6xl mx-auto px-5">

                        {/* Header */}
                        <div className="max-w-xl mb-12 md:mb-16">
                            <p className="font-mono text-xs text-[#6EE7B7] uppercase tracking-widest mb-4">Integrations</p>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
                                Your stack, already connected.
                            </h2>
                            <p className="text-[#64748B] leading-relaxed text-sm md:text-base">
                                DevFlow speaks your tools natively. One PAT, full control. No Zapier overhead, no glue scripts, no compromises.
                            </p>
                        </div>

                        {/* Tool cards — 2 cols mobile, 3 cols md */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                            {TOOLS.map((tool, i) => (
                                <motion.div key={tool.label}
                                    custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
                                    className="group relative rounded-2xl border border-white/[0.07] p-5 md:p-6 overflow-hidden cursor-default hover:border-white/[0.14] transition-colors duration-300"
                                    style={{ background: tool.bg }}>
                                    {/* Accent glow on hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                        style={{ background: `radial-gradient(circle at 0% 0%, ${tool.accent}12, transparent 60%)` }} />

                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10"
                                        style={{ background: 'rgba(255,255,255,0.05)', color: tool.accent }}>
                                        {tool.svg}
                                    </div>

                                    <p className="font-mono font-bold text-sm text-[#F1F5F9] mb-1.5">{tool.label}</p>
                                    <p className="font-mono text-xs text-[#64748B] leading-relaxed">{tool.desc}</p>

                                    {/* Connected pill */}
                                    <div className="mt-4 inline-flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: tool.accent }} />
                                        <span className="font-mono text-[10px] text-[#64748B]">Available</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* How it works — 3 steps */}
                <motion.section
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
                    className="py-20 md:py-28 border-t border-white/[0.05]"
                    style={{ background: '#0A0A0A' }}>
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="max-w-xl mb-12 md:mb-16">
                            <p className="font-mono text-xs text-[#6EE7B7] uppercase tracking-widest mb-4">How it works</p>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
                                Plain English in.<br />Automated workflows out.
                            </h2>
                            <p className="text-[#64748B] text-sm md:text-base leading-relaxed">
                                No YAML. No config files. Just describe what you want and DevFlow handles the rest.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                            {[
                                {
                                    step: '01', icon: <Layers className="w-5 h-5" />,
                                    title: 'Describe your pipeline',
                                    desc: 'Type what you want in plain English. "Fix errors in my repo and send a Slack alert." That\'s it.',
                                    color: '#6EE7B7'
                                },
                                {
                                    step: '02', icon: <GitBranch className="w-5 h-5" />,
                                    title: 'DevFlow builds it',
                                    desc: 'AI generates a visual workflow — nodes, edges, logic — ready to review and run in one click.',
                                    color: '#6EE7B7'
                                },
                                {
                                    step: '03', icon: <Bell className="w-5 h-5" />,
                                    title: 'Runs automatically',
                                    desc: 'Your pipeline executes across GitHub, Slack, Jira and more. You get notified when it\'s done.',
                                    color: '#6EE7B7'
                                },
                            ].map((item, i) => (
                                <motion.div key={item.step}
                                    custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
                                    className="rounded-2xl border border-white/[0.07] bg-[#080808] p-6 md:p-7 relative overflow-hidden group hover:border-white/[0.12] transition-colors duration-300">
                                    <div className="absolute top-0 left-0 right-0 h-px"
                                        style={{ background: `linear-gradient(90deg, transparent, ${item.color}30, transparent)` }} />

                                    <div className="flex items-start justify-between mb-5">
                                        <div className="w-10 h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center"
                                            style={{ color: item.color }}>
                                            {item.icon}
                                        </div>
                                        <span className="font-mono text-xs text-[#1A1A2E] font-bold select-none"
                                            style={{ fontSize: 40, lineHeight: 1, color: 'rgba(255,255,255,0.04)' }}>
                                            {item.step}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-base text-[#F1F5F9] mb-2 leading-snug">{item.title}</h3>
                                    <p className="text-xs md:text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* AI Engine block */}
                <motion.section
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
                    className="py-20 md:py-28 border-t border-white/[0.05]">
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="rounded-2xl border border-white/[0.07] overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #0D0D0D 60%, #0A1208)' }}>
                            <div className="grid md:grid-cols-2 gap-0">

                                {/* Left — text */}
                                <div className="p-8 md:p-12 flex flex-col justify-center">
                                    <p className="font-mono text-xs text-[#6EE7B7] uppercase tracking-widest mb-4">AI Engine</p>
                                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-5 leading-tight">
                                        Powered by Groq.<br />
                                        <span className="text-[#64748B]">Fast by default.</span>
                                    </h2>
                                    <p className="text-[#64748B] text-sm leading-relaxed mb-8">
                                        DevFlow runs on Groq's Llama 3.3 70B — one of the fastest inference engines available. Your pipelines generate and execute in seconds, not minutes.
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            'Groq Llama 3.3 70B — default engine',
                                            'GPT-4o & Gemini available',
                                            'Auto-fallback if a provider is down',
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                                                <CheckCircle2 className="w-4 h-4 text-[#6EE7B7] flex-shrink-0" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right — live-ish metrics card */}
                                <div className="p-8 md:p-12 flex items-center justify-center border-t md:border-t-0 md:border-l border-white/[0.06]">
                                    <div className="w-full max-w-xs rounded-xl border border-white/[0.08] bg-[#080808] overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                                            <div className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
                                            <span className="font-mono text-xs text-[#64748B]">pipeline_engine</span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {[
                                                { label: 'Model', value: 'llama-3.3-70b', accent: true },
                                                { label: 'Provider', value: 'Groq', accent: false },
                                                { label: 'Avg latency', value: '~140ms', accent: false },
                                                { label: 'Fallback', value: 'enabled', accent: false },
                                                { label: 'Status', value: '● running', accent: true },
                                            ].map(({ label, value, accent }) => (
                                                <div key={label} className="flex items-center justify-between">
                                                    <span className="font-mono text-xs text-[#475569]">{label}</span>
                                                    <span className={`font-mono text-xs font-medium ${accent ? 'text-[#6EE7B7]' : 'text-[#94A3B8]'}`}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>

            {/* ── CTA ────────────────────────────────────────────── */}
            <motion.section
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="py-20 md:py-32 border-t border-white/[0.05] relative overflow-hidden"
                style={{ background: '#080808' }}>
                <DotGrid />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at top, rgba(110,231,183,0.07), transparent 70%)' }} />

                <div className="max-w-2xl mx-auto px-5 text-center relative z-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 mb-8 mx-auto">
                        <Zap className="w-6 h-6 text-[#6EE7B7]" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                        Ready to automate<br />your workflow?
                    </h2>
                    <p className="text-[#64748B] mb-10 text-sm md:text-base">
                        Join developers already using DevFlow to ship faster. Free forever, no card needed.
                    </p>
                    <button onClick={() => navigate('/auth')}
                        className="group bg-[#6EE7B7] text-[#080808] font-mono font-bold text-sm px-10 py-4 rounded-xl hover:bg-[#4ADE80] transition-colors inline-flex items-center gap-2">
                        Deploy your first workflow
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </motion.section>

            {/* ── FOOTER ─────────────────────────────────────────── */}
            <footer className="border-t border-white/[0.06] py-8 md:py-10">
                <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-5">
                    <Link to="/" className="flex items-center gap-2 font-mono font-bold text-sm">
                        <LogoMark size={22} />
                        <span className="text-[#F1F5F9]">DevFlow</span><span className="text-[#6EE7B7]">AI</span>
                    </Link>
                    <div className="flex gap-6">
                        {[['About', '/about'], ['Pricing', '/pricing'], ['GitHub', 'https://github.com']].map(([label, href]) => (
                            <a key={label} href={href}
                                target={href.startsWith('http') ? '_blank' : undefined}
                                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                                className="text-xs font-mono text-[#475569] hover:text-[#F1F5F9] transition-colors">
                                {label}
                            </a>
                        ))}
                    </div>
                    <p className="text-xs font-mono text-[#334155]">&copy; {new Date().getFullYear()} DevFlow AI.</p>
                </div>
            </footer>

        </div>
    );
};

export default Landing;