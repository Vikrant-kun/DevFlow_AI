import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Star, Check, Minus, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

// ── Animated price number ──
const AnimatedPrice = ({ value }) => {
    const [display, setDisplay] = useState(value);
    const prevRef = useRef(value);
    useEffect(() => {
        const start = prevRef.current;
        const end = value;
        if (start === end) return;
        const duration = 400;
        const startTime = performance.now();
        const tick = (now) => {
            const p = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(start + (end - start) * ease));
            if (p < 1) requestAnimationFrame(tick);
            else { setDisplay(end); prevRef.current = end; }
        };
        requestAnimationFrame(tick);
    }, [value]);
    return <span>{display}</span>;
};

// ── Star particle ──
const StarParticle = ({ mouseX, mouseY, containerRef }) => {
    const [pos] = useState({ x: Math.random() * 100, y: Math.random() * 100 });
    const [size] = useState(1 + Math.random() * 1.5);
    const [color] = useState(Math.random() > 0.5 ? '#6EE7B7' : '#A78BFA');
    const [delay] = useState(Math.random() * 5);
    const [dur] = useState(2 + Math.random() * 3);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 80, damping: 20, mass: 0.1 });
    const sy = useSpring(my, { stiffness: 80, damping: 20, mass: 0.1 });

    useEffect(() => {
        if (!containerRef.current || mouseX === null) { mx.set(0); my.set(0); return; }
        const rect = containerRef.current.getBoundingClientRect();
        const starX = rect.left + (pos.x / 100) * rect.width;
        const starY = rect.top + (pos.y / 100) * rect.height;
        const dx = mouseX - starX, dy = mouseY - starY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 350) { const f = (1 - dist / 350) * 0.4; mx.set(dx * f); my.set(dy * f); }
        else { mx.set(0); my.set(0); }
    }, [mouseX, mouseY]);

    return (
        <motion.div className="absolute rounded-full pointer-events-none"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: size, height: size, backgroundColor: color, x: sx, y: sy }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }} />
    );
};

// ── Data ──
const plans = [
    {
        id: 'free', name: 'Free', icon: Zap, iconColor: '#64748B',
        border: 'border-[#1A1A1A]', glow: '', badge: null, lift: false,
        monthly: 0, yearly: 0, inr: '₹0 / forever', period: 'forever',
        desc: 'For solo devs and side projects',
        cta: 'get_started_free', ctaStyle: 'ghost', href: '/auth',
        features: ['3 workflows', '50 runs / month', 'GitHub integration only', 'Community support', 'DevFlow branding'],
        missing: ['Multi-model AI', 'Priority support', 'Custom webhooks', 'Team access'],
    },
    {
        id: 'pro', name: 'Pro', icon: Sparkles, iconColor: '#6EE7B7',
        border: 'border-[#6EE7B7]/40', glow: 'shadow-[0_0_40px_rgba(110,231,183,0.12)]',
        badge: { label: 'most_popular', color: '#6EE7B7' }, lift: true,
        monthly: 9, yearly: 7, inr: '~₹830 / mo', period: 'month',
        desc: 'For individual developers who ship fast',
        cta: 'start_free_trial', ctaStyle: 'primary', href: '/auth',
        features: ['Unlimited workflows', '5,000 runs / month', 'All integrations', 'GitHub + Slack + Linear + Notion', 'AI model selector', 'Priority support', 'Custom webhooks', 'Execution logs'],
        missing: [],
    },
    {
        id: 'team', name: 'Team', icon: Star, iconColor: '#A78BFA',
        border: 'border-[#A78BFA]/30', glow: 'shadow-[0_0_30px_rgba(167,139,250,0.08)]',
        badge: null, lift: false,
        monthly: 29, yearly: 23, inr: '~₹2,490 / mo', period: 'month',
        desc: 'For teams building together',
        cta: 'start_team_trial', ctaStyle: 'violet', href: '/auth',
        features: ['Everything in Pro', 'Up to 15 members', 'Shared workflow canvas', 'Role-based access', 'Team analytics', 'Slack team notifications', '15,000 runs / month'],
        missing: [],
    },
    {
        id: 'enterprise', name: 'Enterprise', icon: Zap, iconColor: '#F1F5F9',
        border: 'border-[#1A1A1A]', glow: '', badge: null, lift: false,
        monthly: null, yearly: null, inr: 'custom pricing', period: null,
        desc: 'For large orgs with specific needs',
        cta: 'contact_sales', ctaStyle: 'ghost', href: 'mailto:hello@devflowai.com',
        features: ['Everything in Team', 'Unlimited members', 'SSO / SAML auth', 'SLA guarantee', 'Dedicated account manager', 'On-premise option', 'Custom integrations', 'Unlimited runs'],
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
    { q: 'can I switch plans anytime?', a: 'Yes — upgrade or downgrade anytime. Changes take effect immediately and billing is prorated automatically.' },
    { q: 'is there a free trial?', a: 'Every paid plan includes a 14-day free trial. No credit card required to start.' },
    { q: 'what happens if I exceed my run limit?', a: 'We notify you at 80% usage. Once you hit the limit, workflows pause until the next billing cycle or you upgrade.' },
    { q: 'do you offer student or OSS discounts?', a: 'Yes — reach out at hello@devflowai.com with proof. We offer 50% off for verified students and open source maintainers.' },
];

const Pricing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isYearly, setIsYearly] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mouse, setMouse] = useState({ x: null, y: null });
    const containerRef = useRef(null);
    const toggleRef = useRef(null);
    const stars = useRef(Array.from({ length: 150 }, (_, i) => i));

    const handleToggle = (yearly) => {
        if (yearly === isYearly) return;
        setIsYearly(yearly);
        if (yearly && toggleRef.current) {
            const rect = toggleRef.current.getBoundingClientRect();
            confetti({
                particleCount: 80, spread: 70,
                origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
                colors: ['#6EE7B7', '#A78BFA', '#60A5FA'],
                ticks: 250, gravity: 1.1, decay: 0.93, startVelocity: 28,
            });
        }
    };

    return (
        <div ref={containerRef}
            className="min-h-screen bg-[#080808] text-[#F1F5F9] selection:bg-primary/30 flex flex-col relative overflow-x-hidden"
            onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setMouse({ x: null, y: null })}>

            {/* Starfield */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {stars.current.map((i) => <StarParticle key={i} mouseX={mouse.x} mouseY={mouse.y} containerRef={containerRef} />)}
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-[#1A1A1A] bg-[#080808]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                        <span>DevFlow</span><span className="text-[#6EE7B7]">AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
                        <a href="/#features" className="hover:text-[#F1F5F9] transition-colors">Features</a>
                        <Link to="/about" className="hover:text-[#F1F5F9] transition-colors">About</Link>
                        <Link to="/pricing" className="text-[#6EE7B7]">Pricing</Link>
                        <Link to="/docs" className="hover:text-[#F1F5F9] transition-colors">Docs</Link>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="relative group">
                                <button className="font-mono text-sm text-[#64748B] hover:text-white px-4 py-2 transition-colors">Account</button>
                                <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-[#222] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <div className="p-1">
                                        <button onClick={() => navigate('/dashboard')} className="w-full text-left px-4 py-2 text-sm text-[#F1F5F9] hover:bg-[#222] transition-colors">Go to Dashboard →</button>
                                        <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#222] transition-colors">Sign out</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => navigate('/auth?mode=login')} className="font-mono text-sm text-[#64748B] hover:text-white px-4 py-2 transition-colors">Log in</button>
                                <button onClick={() => navigate('/auth?mode=signup')} className="font-mono text-sm bg-[#6EE7B7] text-[#080808] px-4 py-2 font-bold hover:bg-[#34D399] transition-colors">Sign up</button>
                            </>
                        )}
                    </div>
                    <button className="md:hidden text-[#64748B] hover:text-white p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-[#0D0D0D] border-t border-[#1A1A1A] overflow-hidden">
                            <div className="px-4 py-4 space-y-1">
                                {[['/#features','Features'],['/about','About'],['/pricing','Pricing'],['/docs','Docs']].map(([href, label]) => (
                                    <Link key={href} to={href} onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-[#64748B] hover:text-white border-b border-[#1A1A1A] transition-colors">{label}</Link>
                                ))}
                                <div className="pt-3 flex gap-3">
                                    <button className="flex-1 font-mono text-xs border border-[#1A1A1A] text-[#64748B] py-2 hover:text-white transition-colors" onClick={() => { navigate('/auth?mode=login'); setMobileMenuOpen(false); }}>Log in</button>
                                    <button className="flex-1 font-mono text-xs bg-[#6EE7B7] text-[#080808] py-2 font-bold hover:bg-[#34D399] transition-colors" onClick={() => { navigate('/auth?mode=signup'); setMobileMenuOpen(false); }}>Sign up</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Main */}
            <main className="relative z-10 flex-1 pt-32 pb-24 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
                        <div className="font-mono text-xs text-[#6EE7B7] tracking-widest uppercase mb-4">{`>_ simple_pricing`}</div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
                            no hidden fees.<br /><span className="text-[#64748B]">no surprises.</span>
                        </h1>
                        <p className="font-mono text-sm text-[#64748B] mt-4">start free. upgrade when you're ready.</p>
                    </motion.div>

                    {/* Toggle */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-16">
                        <div ref={toggleRef} className="relative flex items-center bg-[#111] border border-[#1A1A1A] rounded-full p-1">
                            <motion.div className="absolute top-1 bottom-1 rounded-full bg-[#6EE7B7]"
                                animate={{ left: isYearly ? '50%' : '4px', right: isYearly ? '4px' : '50%' }}
                                transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                            <button onClick={() => handleToggle(false)}
                                className={`relative z-10 px-5 py-2 font-mono text-sm rounded-full transition-colors ${!isYearly ? 'text-[#080808] font-bold' : 'text-[#64748B]'}`}>
                                monthly
                            </button>
                            <button onClick={() => handleToggle(true)}
                                className={`relative z-10 px-5 py-2 font-mono text-sm rounded-full transition-colors flex items-center gap-2 ${isYearly ? 'text-[#080808] font-bold' : 'text-[#64748B]'}`}>
                                yearly
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border font-bold transition-all ${isYearly ? 'bg-[#080808]/20 text-[#080808] border-[#080808]/20' : 'bg-[#6EE7B7]/10 text-[#6EE7B7] border-[#6EE7B7]/30'}`}>
                                    save 20%
                                </span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 items-start">
                        {plans.map((plan, i) => {
                            const Icon = plan.icon;
                            const price = isYearly ? plan.yearly : plan.monthly;
                            return (
                                <motion.div key={plan.id}
                                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
                                    className={`relative bg-[#0D0D0D] border ${plan.border} ${plan.glow} rounded-2xl p-7 flex flex-col ${plan.lift ? 'lg:-translate-y-5' : ''}`}>
                                    {plan.badge && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                                                style={{ backgroundColor: plan.badge.color + '18', color: plan.badge.color, border: `1px solid ${plan.badge.color}40` }}>
                                                <Star className="w-3 h-3 fill-current" />{plan.badge.label}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Icon className="w-4 h-4" style={{ color: plan.iconColor }} />
                                        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: plan.iconColor }}>{plan.name}</span>
                                    </div>
                                    <div className="mb-1 font-mono">
                                        {plan.monthly === null ? (
                                            <span className="text-4xl font-bold text-white">custom</span>
                                        ) : (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold text-white">$<AnimatedPrice value={price} /></span>
                                                {plan.period && <span className="text-[#64748B] text-sm">/{plan.period}</span>}
                                            </div>
                                        )}
                                        <div className="font-mono text-[10px] text-[#444] mt-1">{plan.inr}</div>
                                        {isYearly && plan.monthly > 0 && plan.monthly !== null && (
                                            <div className="font-mono text-[10px] text-[#6EE7B7] mt-0.5">billed ${plan.yearly * 12}/yr</div>
                                        )}
                                    </div>
                                    <p className="font-mono text-xs text-[#64748B] mb-6 mt-2">{plan.desc}</p>
                                    <div className="space-y-2.5 flex-1 mb-8">
                                        {plan.features.map((f) => (
                                            <div key={f} className="flex items-start gap-2">
                                                <span className="font-mono text-xs mt-0.5 shrink-0" style={{ color: plan.iconColor }}>→</span>
                                                <span className="font-mono text-xs text-[#64748B]">{f}</span>
                                            </div>
                                        ))}
                                        {plan.missing.map((f) => (
                                            <div key={f} className="flex items-start gap-2 opacity-25">
                                                <Minus className="w-3 h-3 mt-0.5 text-[#333] shrink-0" />
                                                <span className="font-mono text-xs text-[#333]">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {plan.ctaStyle === 'primary' && (
                                        <button onClick={() => navigate(plan.href)} className="w-full font-mono text-xs font-bold py-3 bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] transition-colors">
                                            {plan.cta} →
                                        </button>
                                    )}
                                    {plan.ctaStyle === 'violet' && (
                                        <button onClick={() => navigate(plan.href)} className="w-full font-mono text-xs font-bold py-3 bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/30 hover:bg-[#A78BFA]/20 transition-colors">
                                            {plan.cta} →
                                        </button>
                                    )}
                                    {plan.ctaStyle === 'ghost' && (
                                        <button onClick={() => plan.href.startsWith('mailto') ? (window.location.href = plan.href) : navigate(plan.href)}
                                            className="w-full font-mono text-xs py-3 border border-[#1A1A1A] text-[#64748B] hover:text-white hover:border-[#333] transition-colors">
                                            {plan.cta} →
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Comparison Table — desktop only */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="hidden md:block mb-24">
                        <h2 className="font-mono text-xs text-[#64748B] uppercase tracking-widest text-center mb-8">feature_comparison</h2>
                        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl overflow-hidden">
                            <div className="grid grid-cols-5 border-b border-[#1A1A1A]">
                                <div className="p-5 font-mono text-xs text-[#333] uppercase tracking-widest">feature</div>
                                {[['Free','#64748B'],['Pro','#6EE7B7'],['Team','#A78BFA'],['Enterprise','#F1F5F9']].map(([label, color]) => (
                                    <div key={label} className="p-5 text-center font-mono text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</div>
                                ))}
                            </div>
                            {tableRows.map((row, i) => (
                                <div key={row.label} className={`grid grid-cols-5 border-b border-[#1A1A1A] last:border-0 ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0D0D0D]'}`}>
                                    <div className="p-4 font-mono text-xs text-[#64748B]">{row.label}</div>
                                    {[row.free, row.pro, row.team, row.enterprise].map((val, j) => (
                                        <div key={j} className="p-4 flex justify-center items-center">
                                            {val === true ? <Check className="w-4 h-4 text-[#6EE7B7]" />
                                                : val === false ? <Minus className="w-4 h-4 text-[#222]" />
                                                : <span className="font-mono text-xs text-[#64748B] text-center">{val}</span>}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* FAQ */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto mb-24">
                        <h2 className="font-mono text-xs text-[#64748B] uppercase tracking-widest text-center mb-8">faq</h2>
                        <div className="space-y-2">
                            {faqs.map((faq, i) => (
                                <div key={i} className="bg-[#0D0D0D] border border-[#1A1A1A] overflow-hidden">
                                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between px-6 py-4 font-mono text-sm text-[#F1F5F9] hover:text-[#6EE7B7] transition-colors text-left gap-4">
                                        <span>{faq.q}</span>
                                        <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                            <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
                                                <div className="px-6 pb-5 font-mono text-xs text-[#64748B] border-t border-[#1A1A1A] pt-4">{faq.a}</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bottom CTA */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-10 md:p-14 text-center relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[#6EE7B7] rounded-full blur-[120px] opacity-[0.04] pointer-events-none" />
                        <div className="relative z-10">
                            <p className="font-mono text-xs text-[#64748B] uppercase tracking-widest mb-3">still not sure?</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-mono">start free. upgrade anytime.</h2>
                            <p className="font-mono text-xs text-[#64748B] mb-8">14-day free trial on all paid plans. no credit card required.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button onClick={() => navigate('/auth')} className="w-full sm:w-auto font-mono text-sm font-bold bg-[#6EE7B7] text-[#080808] px-8 py-3 hover:bg-[#34D399] transition-colors">
                                    start_free →
                                </button>
                                <a href="mailto:hello@devflowai.com" className="w-full sm:w-auto font-mono text-sm text-[#64748B] border border-[#1A1A1A] px-8 py-3 hover:text-white hover:border-[#333] transition-colors text-center">
                                    talk_to_us →
                                </a>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </main>

            <footer className="relative z-10 border-t border-[#1A1A1A] py-8 text-center">
                <p className="font-mono text-xs text-[#333]">&copy; {new Date().getFullYear()} DevFlow AI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Pricing;
