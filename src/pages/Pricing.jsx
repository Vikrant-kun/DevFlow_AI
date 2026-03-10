import { useState, useEffect, useRef } from 'react';
import {
    motion,
    AnimatePresence,
    useSpring,
    useMotionValue,
} from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Zap,
    Sparkles,
    Star,
    Check,
    Minus,
    ChevronDown,
    Menu,
    X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';

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

const plans = [
    {
        id: 'free',
        name: 'Free',
        icon: Zap,
        iconColor: '#64748B',
        border: 'border-[#1A1A1A]',
        glow: '',
        badge: null,
        lift: false,
        monthly: 0,
        yearly: 0,
        inr: '₹0 / forever',
        period: 'forever',
        desc: 'For solo devs and side projects',
        cta: 'Get started free',
        ctaStyle: 'ghost',
        href: '/auth?mode=signup',
        features: [
            '3 workflows',
            '50 runs / month',
            'GitHub integration only',
            'Community support',
            'DevFlow branding',
        ],
        missing: ['Multi-model AI', 'Priority support', 'Custom webhooks', 'Team access'],
    },
    {
        id: 'pro',
        name: 'Pro',
        icon: Sparkles,
        iconColor: '#6EE7B7',
        border: 'border-[#6EE7B7]/40',
        glow: 'shadow-[0_0_40px_rgba(110,231,183,0.12)]',
        badge: { label: 'Most Popular', color: '#6EE7B7' },
        lift: true,
        monthly: 9,
        yearly: 7,
        inr: '~₹830 / mo',
        period: 'month',
        desc: 'For individual developers who ship fast',
        cta: 'Start 14-day free trial',
        ctaStyle: 'primary',
        href: '/auth?mode=signup',
        features: [
            'Unlimited workflows',
            '5,000 runs / month',
            'All integrations (GitHub + Slack + Linear + Notion)',
            'AI model selector',
            'Priority support',
            'Custom webhooks',
            'Execution logs',
        ],
        missing: [],
    },
    {
        id: 'team',
        name: 'Team',
        icon: Star,
        iconColor: '#60A5FA',
        border: 'border-[#60A5FA]/30',
        glow: 'shadow-[0_0_30px_rgba(96,165,250,0.08)]',
        badge: null,
        lift: false,
        monthly: 29,
        yearly: 23,
        inr: '~₹2,490 / mo',
        period: 'month',
        desc: 'For teams building together',
        cta: 'Start team trial',
        ctaStyle: 'violet',
        href: '/auth?mode=signup',
        features: [
            'Everything in Pro',
            'Up to 15 members',
            'Shared workflow canvas',
            'Role-based access',
            'Team analytics',
            'Slack team notifications',
            '15,000 runs / month',
        ],
        missing: [],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        icon: Zap,
        iconColor: '#F1F5F9',
        border: 'border-[#1A1A1A]',
        glow: '',
        badge: null,
        lift: false,
        monthly: null,
        yearly: null,
        inr: 'custom pricing',
        period: null,
        desc: 'For large orgs with specific needs',
        cta: 'Contact sales',
        ctaStyle: 'ghost',
        href: 'mailto:hello@devflowai.com',
        features: [
            'Everything in Team',
            'Unlimited members',
            'SSO / SAML auth',
            'SLA guarantee',
            'Dedicated account manager',
            'On-premise option',
            'Custom integrations',
            'Unlimited runs',
        ],
        missing: [],
    },
];

const tableRows = [
    { label: 'Workflows', free: '3', pro: 'Unlimited', team: 'Unlimited', enterprise: 'Unlimited' },
    { label: 'Runs / month', free: '50', pro: '5,000', team: '15,000', enterprise: 'Unlimited' },
    { label: 'Integrations', free: 'GitHub only', pro: 'All', team: 'All', enterprise: 'All + Custom' },
    { label: 'AI models', free: 'Claude only', pro: 'All models', team: 'All models', enterprise: 'All models' },
    { label: 'Team members', free: '—', pro: '1', team: 'Up to 15', enterprise: 'Unlimited' },
    { label: 'Custom webhooks', free: false, pro: true, team: true, enterprise: true },
    { label: 'Analytics', free: false, pro: true, team: true, enterprise: true },
    { label: 'SSO / SAML', free: false, pro: false, team: false, enterprise: true },
    { label: 'SLA', free: false, pro: false, team: false, enterprise: true },
    { label: 'Support', free: 'Community', pro: 'Priority', team: 'Priority', enterprise: 'Dedicated' },
];

const faqs = [
    { q: 'Can I switch plans anytime?', a: 'Yes — upgrade or downgrade anytime. Changes take effect immediately and billing is prorated automatically.' },
    { q: 'Is there a free trial?', a: 'Every paid plan includes a 14-day free trial. No credit card required to start.' },
    { q: 'What happens if I exceed my run limit?', a: 'We notify you at 80% usage. Once you hit the limit, workflows pause until the next billing cycle or you upgrade.' },
    { q: 'Do you offer student or OSS discounts?', a: 'Yes — reach out at hello@devflowai.com. We offer 50% off for verified students and open source maintainers.' },
];

const AnimatedPrice = ({ value }) => {
    const [display, setDisplay] = useState(value);
    const prevRef = useRef(value);

    useEffect(() => {
        const start = prevRef.current;
        const end = value;
        if (start === end) return;

        const duration = 420;
        const startTime = performance.now();

        const tick = (now) => {
            const p = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(start + (end - start) * ease));
            if (p < 1) requestAnimationFrame(tick);
            else {
                setDisplay(end);
                prevRef.current = end;
            }
        };

        requestAnimationFrame(tick);
    }, [value]);

    return <span>{display}</span>;
};

const StarParticle = () => {
    const [pos] = useState({ x: Math.random() * 100, y: Math.random() * 100 });
    const [size] = useState(1 + Math.random() * 1.5);
    const [color] = useState(Math.random() > 0.5 ? '#6EE7B7' : '#60A5FA');
    const [delay] = useState(Math.random() * 5);
    const [dur] = useState(2 + Math.random() * 3);

    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: size,
                height: size,
                backgroundColor: color,
            }}
            animate={{ opacity: [0, 0.75, 0] }}
            transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
    );
};

export const BillingToggle = ({ isYearly, onToggle }) => {
    const toggleRef = useRef(null);

    const handleToggle = (yearly) => {
        if (yearly === isYearly) return;
        onToggle(yearly);

        if (yearly && toggleRef.current) {
            const rect = toggleRef.current.getBoundingClientRect();
            confetti({
                particleCount: 80,
                spread: 70,
                origin: {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight,
                },
                colors: ['#6EE7B7', '#F1F5F9', '#60A5FA'],
                ticks: 250,
                gravity: 1.1,
                decay: 0.93,
                startVelocity: 28,
            });
        }
    };

    return (
        <div
            ref={toggleRef}
            className="relative inline-flex items-center rounded-xl border border-[#1A1A1A] bg-[#111] p-1"
        >
            <motion.div
                className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-xl bg-[#6EE7B7]"
                animate={{ left: isYearly ? 'calc(50% + 0px)' : '4px' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
            <button
                onClick={() => handleToggle(false)}
                className={`relative z-10 w-32 py-2.5 font-mono text-sm transition-colors ${!isYearly ? 'font-bold text-[#080808]' : 'text-[#64748B]'
                    }`}
            >
                Monthly
            </button>
            <button
                onClick={() => handleToggle(true)}
                className={`relative z-10 flex w-32 items-center justify-center gap-1.5 py-2.5 font-mono text-sm transition-colors ${isYearly ? 'font-bold text-[#080808]' : 'text-[#64748B]'
                    }`}
            >
                Yearly
                <span
                    className={`rounded-xl border px-1.5 py-0.5 text-[10px] font-bold transition-all ${isYearly
                        ? 'border-[#080808]/20 bg-[#080808]/20 text-[#080808]'
                        : 'border-[#6EE7B7]/30 bg-[#6EE7B7]/10 text-[#6EE7B7]'
                        }`}
                >
                    Save 20%
                </span>
            </button>
        </div>
    );
};

export default function Pricing() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [isYearly, setIsYearly] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        setMobileMenuOpen(false);
        navigate('/');
    };

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen bg-[#080808] text-[#F1F5F9] selection:bg-[#6EE7B7]/30 flex flex-col overflow-x-hidden"
            onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setMouse({ x: null, y: null })}
        >
            {/* Star particles */}
            <div className="pointer-events-none fixed inset-0 z-0">
                {stars.current.map((i) => (
                    <StarParticle
                        key={i}
                    />
                ))}
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full border-b border-[#1A1A1A] bg-[#080808]/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 font-mono text-xl font-bold transition-colors hover:bg-white/5 hover:rounded-xl px-2 py-1 -ml-2"
                    >
                        <LogoMark size={26} />
                        <span className="text-[#F1F5F9]">DevFlow</span>
                        <span className="text-[#6EE7B7]">AI</span>
                    </Link>

                    <div className="hidden items-center gap-8 text-sm font-mono md:flex">
                        {NAV_LINKS.map(({ href, label }) => (
                            <a
                                key={href}
                                href={href}
                                className={`transition-colors ${label === 'Pricing' ? 'text-[#6EE7B7]' : 'text-[#64748B] hover:text-[#F1F5F9]'
                                    }`}
                            >
                                {label}
                            </a>
                        ))}
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        {user ? (
                            <div className="group relative">
                                <button className="rounded-xl border border-transparent px-4 py-2 font-mono text-sm text-[#64748B] transition-colors hover:border-[#222] hover:text-[#F1F5F9]">
                                    Account
                                </button>
                                <div className="invisible absolute right-0 mt-2 w-48 rounded-xl border border-[#222] bg-[#111] opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100">
                                    <div className="p-1">
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="w-full rounded-xl px-4 py-2 text-left text-sm font-mono text-[#F1F5F9] transition-colors hover:bg-[#1A1A1A]"
                                        >
                                            Dashboard →
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full rounded-xl px-4 py-2 text-left text-sm font-mono text-[#F87171] transition-colors hover:bg-[#1A1A1A]"
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
                                    className="rounded-xl px-4 py-2 font-mono text-sm text-[#64748B] transition-colors hover:text-white"
                                >
                                    Log in
                                </button>
                                <button
                                    onClick={() => navigate('/auth?mode=signup')}
                                    className="rounded-xl bg-[#6EE7B7] px-4 py-2 font-bold font-mono text-sm text-[#080808] transition-colors hover:bg-[#34D399]"
                                >
                                    Sign up
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex h-10 w-10 items-center justify-center text-[#64748B] transition-colors hover:text-white md:hidden"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-[#1A1A1A] bg-[#0D0D0D] md:hidden"
                        >
                            <div className="flex flex-col px-5 py-5">
                                {NAV_LINKS.map(({ href, label }) => (
                                    <a
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`border-b border-[#1A1A1A] py-3.5 text-sm font-mono transition-colors ${label === 'Pricing' ? 'text-[#6EE7B7]' : 'text-[#64748B] hover:text-white'
                                            }`}
                                    >
                                        {label}
                                    </a>
                                ))}
                            </div>

                            <div className="flex gap-4 px-5 pb-6 pt-2">
                                {user ? (
                                    <button
                                        onClick={() => {
                                            navigate('/dashboard');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full rounded-xl border border-[#222] bg-[#111] py-3 font-mono text-sm text-[#F1F5F9]"
                                    >
                                        Dashboard
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                navigate('/auth?mode=login');
                                                setMobileMenuOpen(false);
                                            }}
                                            className="flex-1 rounded-xl border border-[#1A1A1A] py-3 font-mono text-sm text-[#64748B] transition-colors hover:text-white"
                                        >
                                            Log in
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/auth?mode=signup');
                                                setMobileMenuOpen(false);
                                            }}
                                            className="flex-1 rounded-xl bg-[#6EE7B7] py-3 font-bold font-mono text-sm text-[#080808] transition-colors hover:bg-[#34D399]"
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

            <main className="relative z-10 flex-1 pt-32 pb-24 px-5 md:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="mb-16 text-center">
                        <div className="mb-5 font-mono text-xs font-bold uppercase tracking-widest text-[#6EE7B7]">
                            &gt;_ simple pricing
                        </div>
                        <h1 className="mb-5 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                            No hidden fees.
                            <br />
                            <span className="text-[#64748B]">No surprises.</span>
                        </h1>
                        <p className="font-mono text-base text-[#64748B]">
                            Start free. Upgrade when you're ready.
                        </p>
                    </motion.div>

                    {/* Billing Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-16 flex justify-center"
                    >
                        <BillingToggle isYearly={isYearly} onToggle={setIsYearly} />
                    </motion.div>

                    {/* Pricing Cards */}
                    <div className="mb-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                        {plans.map((plan, i) => {
                            const Icon = plan.icon;
                            const price = isYearly ? plan.yearly : plan.monthly;

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.55, type: 'spring', stiffness: 100 }}
                                    className={`relative flex flex-col rounded-2xl border bg-[#0D0D0D] p-7 ${plan.border} ${plan.glow} ${plan.lift ? 'lg:-translate-y-6' : ''}`}
                                >
                                    {plan.badge && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <div
                                                className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: `${plan.badge.color}18`,
                                                    color: plan.badge.color,
                                                    borderColor: `${plan.badge.color}40`,
                                                }}
                                            >
                                                <Star className="h-3 w-3 fill-current" />
                                                {plan.badge.label}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-4 flex items-center gap-2.5">
                                        <Icon className="h-4.5 w-4.5" style={{ color: plan.iconColor }} />
                                        <span
                                            className="font-mono text-xs font-bold uppercase tracking-widest"
                                            style={{ color: plan.iconColor }}
                                        >
                                            {plan.name}
                                        </span>
                                    </div>

                                    <div className="mb-6 font-mono">
                                        {plan.monthly === null ? (
                                            <div className="text-4xl font-bold text-white">Custom</div>
                                        ) : (
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-4xl font-extrabold text-white">
                                                    ${price === 0 ? '0' : <AnimatedPrice value={price} />}
                                                </span>
                                                {plan.period && (
                                                    <span className="text-sm text-[#64748B]">/{plan.period}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-1 text-[11px] text-[#444]">{plan.inr}</div>

                                        {isYearly && plan.monthly > 0 && plan.monthly !== null && (
                                            <div className="mt-1 text-[11px] text-[#6EE7B7]">
                                                Billed ${plan.yearly * 12}/yr
                                            </div>
                                        )}
                                    </div>

                                    <p className="mb-7 font-mono text-xs text-[#64748B]">{plan.desc}</p>

                                    <div className="mb-8 flex-1 space-y-2.5">
                                        {plan.features.map((f) => (
                                            <div key={f} className="flex items-start gap-2">
                                                <span
                                                    className="mt-0.5 font-mono text-xs shrink-0"
                                                    style={{ color: plan.iconColor }}
                                                >
                                                    →
                                                </span>
                                                <span className="font-mono text-xs text-[#C7D2FE]">{f}</span>
                                            </div>
                                        ))}
                                        {plan.missing.map((f) => (
                                            <div key={f} className="flex items-start gap-2 opacity-40">
                                                <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#444]" />
                                                <span className="font-mono text-xs text-[#666]">{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {plan.ctaStyle === 'primary' && (
                                        <button
                                            onClick={() => navigate(plan.href)}
                                            className="w-full rounded-xl bg-[#6EE7B7] py-3 font-mono text-sm font-bold text-[#080808] transition-colors hover:bg-[#34D399]"
                                        >
                                            {plan.cta} →
                                        </button>
                                    )}

                                    {plan.ctaStyle === 'violet' && (
                                        <button
                                            onClick={() => navigate(plan.href)}
                                            className="w-full rounded-xl border border-[#60A5FA]/30 bg-[#60A5FA]/10 py-3 font-mono text-sm font-bold text-[#60A5FA] transition-colors hover:bg-[#60A5FA]/20"
                                        >
                                            {plan.cta} →
                                        </button>
                                    )}

                                    {plan.ctaStyle === 'ghost' && (
                                        <button
                                            onClick={() =>
                                                plan.href.startsWith('mailto')
                                                    ? (window.location.href = plan.href)
                                                    : navigate(plan.href)
                                            }
                                            className="w-full rounded-xl border border-[#1A1A1A] py-3 font-mono text-sm text-[#64748B] transition-all hover:border-[#333] hover:text-white"
                                        >
                                            {plan.cta} →
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Comparison Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-24 hidden md:block"
                    >
                        <h2 className="mb-8 text-center font-mono text-xs font-bold uppercase tracking-widest text-[#64748B]">
                            Feature Comparison
                        </h2>
                        <div className="overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D]">
                            <div className="grid grid-cols-5 border-b border-[#1A1A1A]">
                                <div className="p-5 font-mono text-xs uppercase tracking-widest text-[#64748B]">Feature</div>
                                {['Free', 'Pro', 'Team', 'Enterprise'].map((label, idx) => {
                                    const colors = ['#64748B', '#6EE7B7', '#60A5FA', '#F1F5F9'];
                                    return (
                                        <div
                                            key={label}
                                            className="p-5 text-center font-mono text-xs font-bold uppercase tracking-widest"
                                            style={{ color: colors[idx] }}
                                        >
                                            {label}
                                        </div>
                                    );
                                })}
                            </div>
                            {tableRows.map((row, i) => (
                                <div
                                    key={row.label}
                                    className={`grid grid-cols-5 border-b border-[#1A1A1A] last:border-0 ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0D0D0D]'
                                        }`}
                                >
                                    <div className="p-5 font-mono text-xs text-[#64748B]">{row.label}</div>
                                    {[row.free, row.pro, row.team, row.enterprise].map((val, j) => (
                                        <div key={j} className="flex items-center justify-center p-5">
                                            {val === true ? (
                                                <Check className="h-5 w-5 text-[#6EE7B7]" />
                                            ) : val === false ? (
                                                <Minus className="h-5 w-5 text-[#444]" />
                                            ) : (
                                                <span className="font-mono text-sm text-[#C7D2FE]">{val}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* FAQ */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mx-auto mb-24 max-w-3xl"
                    >
                        <h2 className="mb-8 text-center font-mono text-xs font-bold uppercase tracking-widest text-[#64748B]">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-3">
                            {faqs.map((faq, i) => (
                                <div
                                    key={i}
                                    className="overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="flex w-full items-center justify-between px-6 py-4 text-left font-mono text-sm text-[#F1F5F9] transition-colors hover:text-[#6EE7B7]"
                                    >
                                        <span>{faq.q}</span>
                                        <motion.div
                                            animate={{ rotate: openFaq === i ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown className="h-5 w-5 text-[#64748B]" />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="border-t border-[#1A1A1A] px-6 pb-5 pt-4 font-mono text-sm text-[#C7D2FE]">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bottom CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative mb-20 overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-10 text-center md:p-16"
                    >
                        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6EE7B7] blur-[120px] opacity-5" />
                        <div className="relative z-10">
                            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#64748B]">
                                Still not sure?
                            </p>
                            <h2 className="mb-3 font-mono text-2xl font-bold text-white md:text-3xl">
                                Start free. Upgrade anytime.
                            </h2>
                            <p className="mb-8 font-mono text-sm text-[#64748B]">
                                14-day free trial on all paid plans. No credit card required.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <button
                                    onClick={() => navigate('/auth?mode=signup')}
                                    className="w-full rounded-xl bg-[#6EE7B7] px-10 py-3.5 font-mono font-bold text-[#080808] transition-colors hover:bg-[#34D399] sm:w-auto"
                                >
                                    Start Free →
                                </button>
                                <a
                                    href="mailto:hello@devflowai.com"
                                    className="w-full rounded-xl border border-[#1A1A1A] px-10 py-3.5 font-mono text-sm text-[#64748B] transition-all hover:border-[#333] hover:text-white sm:w-auto"
                                >
                                    Talk to us →
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <footer className="relative z-10 border-t border-[#1A1A1A] bg-[#080808] py-10">
                <div className="mx-auto max-w-7xl px-5 md:px-8">
                    <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
                        <div className="flex items-center gap-2.5 font-bold font-mono">
                            <LogoMark size={20} />
                            <span className="text-[#F1F5F9]">DevFlow</span>
                            <span className="text-[#6EE7B7]">AI</span>
                        </div>
                        <p className="text-xs font-mono text-[#64748B] opacity-70">
                            © {new Date().getFullYear()} DevFlow AI. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}