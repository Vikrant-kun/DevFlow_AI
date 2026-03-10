import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Star, Check, Minus, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import { BillingToggle } from './Pricing';
import confetti from 'canvas-confetti';

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

const StarParticle = ({ mouseX, mouseY, containerRef }) => {
    const [pos] = useState({ x: Math.random() * 100, y: Math.random() * 100 });
    const [size] = useState(1 + Math.random() * 1.5);
    const [color] = useState(Math.random() > 0.5 ? '#6EE7B7' : '#60A5FA');
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

const paidPlans = [
    {
        id: 'pro', name: 'Pro', icon: Sparkles, iconColor: '#6EE7B7',
        border: 'border-[#6EE7B7]/40', glow: 'shadow-[0_0_40px_rgba(110,231,183,0.12)]',
        badge: { label: 'most_popular', color: '#6EE7B7' }, lift: true,
        monthly: 9, yearly: 7, inr: '~₹830 / mo',
        desc: 'For individual developers who ship fast',
        cta: 'upgrade_to_pro', ctaStyle: 'primary',
        features: ['Unlimited workflows', '5,000 runs / month', 'All integrations', 'GitHub + Slack + Linear + Notion', 'AI model selector (Claude, GPT-4, Gemini, Groq)', 'Priority support', 'Custom webhooks', 'Execution logs & analytics'],
    },
    {
        id: 'team', name: 'Team', icon: Star, iconColor: '#60A5FA',
        border: 'border-[#60A5FA]/30', glow: 'shadow-[0_0_30px_rgba(96,165,250,0.08)]',
        badge: null, lift: false,
        monthly: 29, yearly: 23, inr: '~₹2,490 / mo',
        desc: 'For teams building together',
        cta: 'upgrade_to_team', ctaStyle: 'violet',
        features: ['Everything in Pro', 'Up to 15 members', 'Shared workflow canvas', 'Role-based access', 'Team analytics dashboard', 'Slack team notifications', '15,000 runs / month'],
    },
    {
        id: 'enterprise', name: 'Enterprise', icon: Zap, iconColor: '#F1F5F9',
        border: 'border-[#1A1A1A]', glow: '', badge: null, lift: false,
        monthly: null, yearly: null, inr: 'custom pricing',
        desc: 'For large orgs with specific needs',
        cta: 'contact_sales', ctaStyle: 'ghost',
        features: ['Everything in Team', 'Unlimited members', 'SSO / SAML auth', 'SLA guarantee', 'Dedicated account manager', 'On-premise option', 'Custom integrations'],
    },
];

const Upgrade = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isYearly, setIsYearly] = useState(false);
    const [mouse, setMouse] = useState({ x: null, y: null });
    const containerRef = useRef(null);
    const stars = useRef(Array.from({ length: 100 }, (_, i) => i));

    const workflowCount = 3;
    const workflowLimit = 3;
    const runCount = 67;
    const runLimit = 100;

    return (
        <div ref={containerRef}
            className="flex flex-col h-screen bg-[#080808] overflow-hidden"
            onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setMouse({ x: null, y: null })}>

            {/* Starfield */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {stars.current.map((i) => <StarParticle key={i} mouseX={mouse.x} mouseY={mouse.y} containerRef={containerRef} />)}
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <TopBar title={<span className="font-mono text-sm text-[#6EE7B7]">~ / upgrade</span>} />

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">

                        {/* Header */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                            <div className="font-mono text-xs text-[#6EE7B7] tracking-widest uppercase mb-2">{`>_ upgrade_plan`}</div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">You're on the <span className="text-[#64748B]">Free</span> plan.</h1>
                            <p className="font-mono text-sm text-[#64748B]">unlock the full power of DevFlow AI.</p>
                        </motion.div>

                        {/* Current usage */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 mb-10">
                            <div className="flex items-center gap-2 mb-6">
                                <Zap className="w-4 h-4 text-[#64748B]" />
                                <span className="font-mono text-xs text-[#64748B] uppercase tracking-widest">current_usage</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { label: 'workflows', used: workflowCount, limit: workflowLimit, pct: (workflowCount / workflowLimit) * 100 },
                                    { label: 'monthly_runs', used: runCount, limit: runLimit, pct: (runCount / runLimit) * 100 },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="flex justify-between items-center font-mono text-xs mb-2">
                                            <span className="text-[#64748B]">{item.label}</span>
                                            <span>
                                                <span className={item.pct >= 80 ? 'text-[#F87171]' : 'text-white'}>{item.used}</span>
                                                <span className="text-[#333]"> / {item.limit}</span>
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: item.pct >= 80 ? '#F87171' : '#6EE7B7' }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.pct}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                                            />
                                        </div>
                                        {item.pct >= 80 && (
                                            <p className="font-mono text-[10px] text-[#F87171] mt-1">almost at limit — upgrade to avoid interruptions</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Toggle */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex justify-center mb-10">
                            <BillingToggle isYearly={isYearly} onToggle={setIsYearly} />
                        </motion.div>

                        {/* Plan cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-start">
                            {paidPlans.map((plan, i) => {
                                const Icon = plan.icon;
                                const price = isYearly ? plan.yearly : plan.monthly;
                                return (
                                    <motion.div key={plan.id}
                                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
                                        className={`relative bg-[#0D0D0D] border ${plan.border} ${plan.glow} rounded-2xl p-7 flex flex-col ${plan.lift ? 'md:-translate-y-4' : ''}`}>
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
                                                    <span className="text-[#64748B] text-sm">/month</span>
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
                                        </div>
                                        {plan.ctaStyle === 'primary' && (
                                            <button className="w-full font-mono text-xs font-bold py-3 bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] transition-colors flex items-center justify-center gap-2">
                                                {plan.cta} <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                        {plan.ctaStyle === 'violet' && (
                                            <button className="w-full font-mono text-xs font-bold py-3 bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/30 hover:bg-[#60A5FA]/20 transition-colors flex items-center justify-center gap-2">
                                                {plan.cta} <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                        {plan.ctaStyle === 'ghost' && (
                                            <a href="mailto:hello@devflowai.com" className="w-full font-mono text-xs py-3 border border-[#1A1A1A] text-[#64748B] hover:text-white hover:border-[#333] transition-colors flex items-center justify-center gap-2">
                                                {plan.cta} <ArrowRight className="w-3 h-3" />
                                            </a>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Footer note */}
                        <div className="text-center">
                            <p className="font-mono text-xs text-[#333]">14-day free trial on all paid plans · no credit card required</p>
                            <a href="mailto:hello@devflowai.com" className="font-mono text-xs text-[#64748B] hover:text-[#6EE7B7] transition-colors mt-2 inline-block">
                                questions? hello@devflowai.com
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upgrade;
