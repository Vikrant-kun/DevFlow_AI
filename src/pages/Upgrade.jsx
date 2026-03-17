import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Zap, Sparkles, Star, ArrowRight, Check, X, Minus,
    ChevronDown, ChevronUp, Shield, Users,
    Activity, Lock, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

// ── ANIMATED PRICE ────────────────────────────────────────────────────────
const AnimatedPrice = ({ value }) => {
    const [display, setDisplay] = useState(value);
    const prevRef = useRef(value);
    useEffect(() => {
        const start = prevRef.current;
        const end = value;
        if (start === end) return;
        const duration = 380;
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

// ── STARFIELD ─────────────────────────────────────────────────────────────
const StarParticle = ({ mouseX, mouseY, containerRef }) => {
    const [pos] = useState({ x: Math.random() * 100, y: Math.random() * 100 });
    const [size] = useState(1 + Math.random() * 1.5);
    const [color] = useState(Math.random() > 0.5 ? '#6EE7B7' : '#60A5FA');
    const [delay] = useState(Math.random() * 5);
    const [dur] = useState(2 + Math.random() * 3);
    const mx = useMotionValue(0); const my = useMotionValue(0);
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

// ── PLAN DATA ─────────────────────────────────────────────────────────────
const PLANS = [
    {
        id: 'free', name: 'Free', icon: Zap, iconColor: '#64748B',
        border: 'border-[#1A1A1A]', glow: '', badge: null, lift: false,
        monthly: 0, yearly: 0, inr: 'forever free',
        desc: 'Get started with the basics',
        cta: 'current_plan', ctaStyle: 'disabled',
        highlight: false,
        features: [
            '3 workflows max',
            '100 runs / month',
            'GitHub integration',
            'Groq AI model only',
            '7-day execution history',
            'Community support',
        ],
    },
    {
        id: 'pro', name: 'Pro', icon: Sparkles, iconColor: '#6EE7B7',
        border: 'border-[#6EE7B7]/40', glow: 'shadow-[0_0_50px_rgba(110,231,183,0.10)]',
        badge: { label: 'most_popular', color: '#6EE7B7' }, lift: true,
        monthly: 9, yearly: 7, inr: '~₹830/mo',
        desc: 'For developers who ship fast',
        cta: 'upgrade_to_pro', ctaStyle: 'primary',
        highlight: true,
        savings: '22% off',
        features: [
            'Unlimited workflows',
            '5,000 runs / month',
            'All integrations',
            'GitHub + Slack + Linear + Notion + Jira',
            'Claude, GPT-4, Gemini, Groq',
            'Priority support',
            'Custom webhooks',
            '30-day execution logs & analytics',
        ],
    },
    {
        id: 'team', name: 'Team', icon: Users, iconColor: '#60A5FA',
        border: 'border-[#60A5FA]/30', glow: 'shadow-[0_0_30px_rgba(96,165,250,0.07)]',
        badge: null, lift: false,
        monthly: 29, yearly: 23, inr: '~₹2,490/mo',
        desc: 'For teams building together',
        cta: 'upgrade_to_team', ctaStyle: 'violet',
        highlight: false,
        savings: '21% off',
        features: [
            'Everything in Pro',
            'Up to 15 members',
            'Shared workflow canvas',
            'Role-based access control',
            'Team analytics dashboard',
            'Slack team notifications',
            '15,000 runs / month',
            '90-day execution history',
        ],
    },
    {
        id: 'enterprise', name: 'Enterprise', icon: Shield, iconColor: '#F1F5F9',
        border: 'border-[#1A1A1A]', glow: '', badge: null, lift: false,
        monthly: null, yearly: null, inr: 'custom pricing',
        desc: 'For large orgs with specific needs',
        cta: 'contact_sales', ctaStyle: 'ghost',
        highlight: false,
        features: [
            'Everything in Team',
            'Unlimited members',
            'SSO / SAML auth',
            'SLA guarantee',
            'Dedicated account manager',
            'On-premise deployment option',
            'Custom integrations & models',
            'Unlimited execution history',
        ],
    },
];

// ── COMPARISON TABLE DATA ─────────────────────────────────────────────────
const COMPARE_SECTIONS = [
    {
        title: 'Core',
        rows: [
            { feature: 'Workflows', free: '3', pro: 'Unlimited', team: 'Unlimited', enterprise: 'Unlimited' },
            { feature: 'Monthly Runs', free: '100', pro: '5,000', team: '15,000', enterprise: 'Custom' },
            { feature: 'AI Models', free: 'Groq only', pro: 'Claude, GPT-4, Gemini, Groq', team: 'All models', enterprise: 'All + fine-tuned' },
            { feature: 'Execution History', free: '7 days', pro: '30 days', team: '90 days', enterprise: 'Unlimited' },
        ],
    },
    {
        title: 'Integrations',
        rows: [
            { feature: 'GitHub', free: true, pro: true, team: true, enterprise: true },
            { feature: 'Slack', free: false, pro: true, team: true, enterprise: true },
            { feature: 'Linear', free: false, pro: true, team: true, enterprise: true },
            { feature: 'Notion', free: false, pro: true, team: true, enterprise: true },
            { feature: 'Jira', free: false, pro: true, team: true, enterprise: true },
            { feature: 'Custom Webhooks', free: false, pro: true, team: true, enterprise: true },
        ],
    },
    {
        title: 'Team',
        rows: [
            { feature: 'Seats', free: '1', pro: '1', team: '15', enterprise: 'Unlimited' },
            { feature: 'Shared Canvas', free: false, pro: false, team: true, enterprise: true },
            { feature: 'Role-based Access', free: false, pro: false, team: true, enterprise: true },
            { feature: 'Team Analytics', free: false, pro: false, team: true, enterprise: true },
            { feature: 'SSO / SAML', free: false, pro: false, team: false, enterprise: true },
        ],
    },
    {
        title: 'Support',
        rows: [
            { feature: 'Community', free: true, pro: true, team: true, enterprise: true },
            { feature: 'Priority Support', free: false, pro: true, team: true, enterprise: true },
            { feature: 'Dedicated Manager', free: false, pro: false, team: false, enterprise: true },
            { feature: 'SLA Guarantee', free: false, pro: false, team: false, enterprise: true },
        ],
    },
];

// ── CHECKOUT MODAL ─────────────────────────────────────────────────────────
function CheckoutModal({ plan, isYearly, onClose, onConfirm }) {
    const price = isYearly ? plan.yearly : plan.monthly;
    const annual = price * 12;
    const [step, setStep] = useState('review'); // review → processing → done
    const [cardNum, setCardNum] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    const formatExpiry = (v) => {
        const d = v.replace(/\D/g, '').slice(0, 4);
        return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
    };

    const handlePay = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('done');
            onConfirm(plan);
        }, 2200);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.94, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.94, y: 20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-3xl w-full max-w-md overflow-hidden"
                style={{ boxShadow: `0 0 60px ${plan.iconColor}15` }}
            >
                {step === 'done' ? (
                    <div className="p-10 flex flex-col items-center text-center gap-5">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: `${plan.iconColor}15`, border: `1px solid ${plan.iconColor}30` }}
                        >
                            <Check size={28} style={{ color: plan.iconColor }} />
                        </motion.div>
                        <div>
                            <h3 className="font-mono text-lg font-bold text-[#F1F5F9] mb-1">you're on {plan.name}!</h3>
                            <p className="font-mono text-xs text-[#64748B]">welcome to the next level. your workspace has been upgraded.</p>
                        </div>
                        <button onClick={onClose} className="w-full py-3 rounded-xl font-mono text-xs font-bold text-[#080808] transition-colors hover:opacity-90" style={{ background: plan.iconColor }}>
                            start building →
                        </button>
                    </div>
                ) : step === 'processing' ? (
                    <div className="p-10 flex flex-col items-center gap-5">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                            <RefreshCw size={28} style={{ color: plan.iconColor }} />
                        </motion.div>
                        <div className="text-center">
                            <p className="font-mono text-xs font-bold text-[#F1F5F9] mb-1">processing payment...</p>
                            <p className="font-mono text-[10px] text-[#333]">upgrading your workspace</p>
                        </div>
                        <div className="w-full h-1 bg-[#111] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: plan.iconColor }}
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2, ease: 'easeInOut' }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="p-7 space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <plan.icon size={14} style={{ color: plan.iconColor }} />
                                    <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: plan.iconColor }}>{plan.name} plan</span>
                                </div>
                                <h3 className="font-mono text-lg font-bold text-[#F1F5F9]">
                                    ${price}<span className="text-sm text-[#64748B] font-normal">/mo</span>
                                </h3>
                                {isYearly && (
                                    <p className="font-mono text-[10px] text-[#6EE7B7] mt-0.5">billed ${annual}/yr · {plan.savings}</p>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#111] transition-colors">
                                <X size={14} className="text-[#333]" />
                            </button>
                        </div>

                        {/* Order summary */}
                        <div className="bg-[#080808] border border-[#111] rounded-2xl p-4 space-y-2">
                            <p className="font-mono text-[8px] text-[#2A2A2A] uppercase tracking-widest mb-3">order_summary</p>
                            <div className="flex justify-between font-mono text-xs">
                                <span className="text-[#64748B]">{plan.name} ({isYearly ? 'yearly' : 'monthly'})</span>
                                <span className="text-[#F1F5F9]">${isYearly ? annual : price}</span>
                            </div>
                            <div className="flex justify-between font-mono text-xs">
                                <span className="text-[#64748B]">14-day trial</span>
                                <span className="text-[#6EE7B7]">FREE</span>
                            </div>
                            <div className="border-t border-[#111] pt-2 flex justify-between font-mono text-xs font-bold">
                                <span className="text-[#F1F5F9]">Due today</span>
                                <span className="text-[#F1F5F9]">$0.00</span>
                            </div>
                        </div>

                        {/* Card inputs */}
                        <div className="space-y-3">
                            <p className="font-mono text-[8px] text-[#2A2A2A] uppercase tracking-widest">payment_details</p>
                            <div className="px-4 py-3 bg-[#080808] border border-[#1A1A1A] rounded-xl focus-within:border-[#2A2A2A] transition-colors">
                                <input
                                    value={cardNum}
                                    onChange={e => setCardNum(formatCard(e.target.value))}
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full bg-transparent font-mono text-xs text-[#F1F5F9] placeholder-[#222] outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="px-4 py-3 bg-[#080808] border border-[#1A1A1A] rounded-xl focus-within:border-[#2A2A2A] transition-colors">
                                    <input
                                        value={expiry}
                                        onChange={e => setExpiry(formatExpiry(e.target.value))}
                                        placeholder="MM / YY"
                                        className="w-full bg-transparent font-mono text-xs text-[#F1F5F9] placeholder-[#222] outline-none"
                                    />
                                </div>
                                <div className="px-4 py-3 bg-[#080808] border border-[#1A1A1A] rounded-xl focus-within:border-[#2A2A2A] transition-colors">
                                    <input
                                        value={cvc}
                                        onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                        placeholder="CVC"
                                        className="w-full bg-transparent font-mono text-xs text-[#F1F5F9] placeholder-[#222] outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePay}
                            className="w-full py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                            style={{ background: plan.iconColor === '#F1F5F9' ? '#1A1A1A' : plan.iconColor, color: plan.iconColor === '#F1F5F9' ? '#F1F5F9' : '#080808', border: plan.iconColor === '#F1F5F9' ? '1px solid #333' : 'none' }}
                        >
                            <Lock size={11} /> start 14-day trial
                        </button>
                        <p className="font-mono text-[9px] text-[#1A1A1A] text-center">no charge until trial ends · cancel anytime</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function Upgrade() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isYearly, setIsYearly] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [activePlan, setActivePlan] = useState('free');
    const [checkoutPlan, setCheckoutPlan] = useState(null);
    const [showCompare, setShowCompare] = useState(false);
    const [mobileComparePlan, setMobileComparePlan] = useState('pro');
    const [mouse, setMouse] = useState({ x: null, y: null });
    const containerRef = useRef(null);
    const stars = useRef(Array.from({ length: 100 }, (_, i) => i));

    const workflowCount = 3;
    const workflowLimit = 3;
    const runCount = 67;
    const runLimit = 100;

    const handleConfirm = (plan) => {
        setActivePlan(plan.id);
        setCheckoutPlan(null);
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.55 },
            colors: [plan.iconColor, '#A78BFA', '#080808'],
        });
    };

    const handleCTA = (plan) => {
        if (plan.ctaStyle === 'disabled') return;
        if (plan.id === 'enterprise') {
            window.location.href = 'mailto:hello@devflowai.com';
            return;
        }
        setCheckoutPlan(plan);
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-screen bg-[#080808] overflow-hidden text-[#F1F5F9]"
            onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setMouse({ x: null, y: null })}
        >
            {/* Starfield */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {stars.current.map((i) => <StarParticle key={i} mouseX={mouse.x} mouseY={mouse.y} containerRef={containerRef} />)}
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <TopBar title={<span className="font-mono text-xs text-[#6EE7B7] tracking-widest uppercase">/ upgrade_plan</span>} />

                <div className="flex-1 overflow-y-auto no-scrollbar p-5 md:p-8">
                    <div className="max-w-6xl mx-auto space-y-10 pb-20">

                        {/* Header */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                            <div className="font-mono text-[10px] text-[#6EE7B7] tracking-widest uppercase">{`>_ upgrade_plan`}</div>
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                                        You're on the <span className="text-[#64748B]">Free</span> plan.
                                    </h1>
                                    <p className="font-mono text-xs text-[#64748B] mt-1">unlock the full power of DevFlow AI.</p>
                                </div>
                                {activePlan !== 'free' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="px-4 py-2 rounded-xl border font-mono text-[10px] uppercase tracking-wider"
                                        style={{
                                            background: `${PLANS.find(p => p.id === activePlan)?.iconColor}10`,
                                            borderColor: `${PLANS.find(p => p.id === activePlan)?.iconColor}30`,
                                            color: PLANS.find(p => p.id === activePlan)?.iconColor,
                                        }}
                                    >
                                        ✓ currently on {activePlan}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* Usage */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <Activity size={13} className="text-[#444]" />
                                <span className="font-mono text-[10px] text-[#444] uppercase tracking-widest">current_usage</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { label: 'workflows', used: workflowCount, limit: workflowLimit, pct: (workflowCount / workflowLimit) * 100 },
                                    { label: 'monthly_runs', used: runCount, limit: runLimit, pct: (runCount / runLimit) * 100 },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="flex justify-between items-center font-mono text-xs mb-2">
                                            <span className="text-[#444]">{item.label}</span>
                                            <span>
                                                <span className={item.pct >= 80 ? 'text-[#F87171]' : 'text-white'}>{item.used}</span>
                                                <span className="text-[#222]"> / {item.limit}</span>
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[#111] rounded-full overflow-hidden">
                                            <motion.div className="h-full rounded-full"
                                                style={{ backgroundColor: item.pct >= 80 ? '#F87171' : '#6EE7B7' }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.pct}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }} />
                                        </div>
                                        {item.pct >= 80 && (
                                            <p className="font-mono text-[9px] text-[#F87171] mt-1">almost at limit — upgrade to avoid interruptions</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Billing Toggle */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                            className="flex justify-center">
                            <div className="flex items-center gap-4 p-1 bg-[#0A0A0A] border border-[#111] rounded-2xl">
                                {['monthly', 'yearly'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setIsYearly(opt === 'yearly')}
                                        className={cn(
                                            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all",
                                            (opt === 'yearly') === isYearly
                                                ? "bg-[#A78BFA]/15 border border-[#A78BFA]/25 text-[#A78BFA]"
                                                : "text-[#333] hover:text-[#666]"
                                        )}
                                    >
                                        {opt}
                                        {opt === 'yearly' && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-[#6EE7B7]/10 border border-[#6EE7B7]/15 font-mono text-[7px] text-[#6EE7B7]">save 20%</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Plan Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
                            {PLANS.map((plan, i) => {
                                const Icon = plan.icon;
                                const price = isYearly ? plan.yearly : plan.monthly;
                                const isActive = activePlan === plan.id;
                                const isSelected = selectedPlan === plan.id;

                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 120, damping: 16 }}
                                        onClick={() => setSelectedPlan(isSelected ? null : plan.id)}
                                        className={cn(
                                            "relative bg-[#0D0D0D] border rounded-2xl p-6 flex flex-col cursor-pointer transition-all duration-300",
                                            plan.border, plan.glow,
                                            plan.lift ? "md:-translate-y-3" : "",
                                            isSelected ? "ring-1 ring-[#A78BFA]/30" : "",
                                            isActive ? "opacity-50 cursor-default" : "hover:border-opacity-70"
                                        )}
                                    >
                                        {/* Badge */}
                                        {plan.badge && (
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider"
                                                    style={{ backgroundColor: plan.badge.color + '18', color: plan.badge.color, border: `1px solid ${plan.badge.color}40` }}>
                                                    <Star size={10} className="fill-current" />{plan.badge.label}
                                                </div>
                                            </div>
                                        )}

                                        {isActive && (
                                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 font-mono text-[7px] text-[#6EE7B7] uppercase tracking-wider">
                                                active
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mb-4">
                                            <Icon size={15} style={{ color: plan.iconColor }} />
                                            <span className="font-mono text-xs uppercase tracking-widest font-bold" style={{ color: plan.iconColor }}>{plan.name}</span>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-2">
                                            {plan.monthly === null ? (
                                                <p className="font-mono text-4xl font-bold text-[#F1F5F9]">custom</p>
                                            ) : plan.monthly === 0 ? (
                                                <p className="font-mono text-4xl font-bold text-[#F1F5F9]">$0</p>
                                            ) : (
                                                <div className="flex items-baseline gap-1">
                                                    <span className="font-mono text-4xl font-bold text-[#F1F5F9]">$<AnimatedPrice value={price} /></span>
                                                    <span className="font-mono text-sm text-[#444]">/month</span>
                                                </div>
                                            )}
                                            <p className="font-mono text-xs text-[#333] mt-1">{plan.inr}</p>
                                            {isYearly && plan.yearly && plan.yearly > 0 && (
                                                <p className="font-mono text-xs text-[#6EE7B7] mt-0.5">billed ${plan.yearly * 12}/yr · {plan.savings}</p>
                                            )}
                                        </div>

                                        <p className="font-mono text-xs text-[#555] mb-5 mt-2 leading-relaxed">{plan.desc}</p>

                                        {/* Features */}
                                        <div className="space-y-2.5 flex-1 mb-7">
                                            {plan.features.map((f) => (
                                                <div key={f} className="flex items-start gap-2.5">
                                                    <span className="font-mono text-sm mt-0.5 shrink-0 leading-none" style={{ color: plan.iconColor }}>→</span>
                                                    <span className="font-mono text-xs text-[#555] leading-relaxed">{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA */}
                                        {plan.ctaStyle === 'primary' && !isActive && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCTA(plan); }}
                                                className="w-full py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                                                style={{ background: '#6EE7B7', color: '#080808' }}
                                            >
                                                {plan.cta} <ArrowRight size={12} />
                                            </button>
                                        )}
                                        {plan.ctaStyle === 'violet' && !isActive && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCTA(plan); }}
                                                className="w-full py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 bg-[#60A5FA]/10 border border-[#60A5FA]/25 text-[#60A5FA] transition-all hover:bg-[#60A5FA]/20 active:scale-[0.98]"
                                            >
                                                {plan.cta} <ArrowRight size={12} />
                                            </button>
                                        )}
                                        {plan.ctaStyle === 'ghost' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCTA(plan); }}
                                                className="w-full py-3 rounded-xl font-mono text-xs border border-[#1A1A1A] text-[#444] flex items-center justify-center gap-2 transition-all hover:border-[#2A2A2A] hover:text-[#888]"
                                            >
                                                {plan.cta} <ArrowRight size={12} />
                                            </button>
                                        )}
                                        {plan.ctaStyle === 'disabled' && (
                                            <div className="w-full py-3 rounded-xl font-mono text-xs border border-[#111] text-[#2A2A2A] text-center">
                                                {plan.cta}
                                            </div>
                                        )}
                                        {isActive && plan.ctaStyle !== 'disabled' && (
                                            <div className="w-full py-3 rounded-xl font-mono text-xs border border-[#1A1A1A] text-[#2A2A2A] text-center">
                                                current plan
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Compare Table Toggle */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center">
                            <button
                                onClick={() => setShowCompare(!showCompare)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl font-mono text-xs text-[#444] uppercase tracking-wider hover:border-[#2A2A2A] hover:text-[#888] transition-all"
                            >
                                {showCompare ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                {showCompare ? 'hide' : 'compare'} all features
                            </button>
                        </motion.div>

                        {/* Comparison Table */}
                        <AnimatePresence>
                            {showCompare && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-3xl overflow-hidden">

                                        {/* ── MOBILE PLAN SELECTOR (Visible only on small screens) ── */}
                                        <div className="md:hidden flex items-center gap-2 p-4 bg-[#080808] border-b border-[#111] overflow-x-auto no-scrollbar">
                                            {PLANS.map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setMobileComparePlan(p.id)}
                                                    className={cn(
                                                        "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-[10px] uppercase transition-all",
                                                        mobileComparePlan === p.id
                                                            ? "bg-[#111] border-[#333] text-white"
                                                            : "border-transparent text-[#333]"
                                                    )}
                                                >
                                                    <p.icon size={10} style={{ color: mobileComparePlan === p.id ? p.iconColor : '#333' }} />
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>

                                        {/* ── DESKTOP TABLE HEADER (Hidden on mobile) ── */}
                                        <div className="hidden md:grid grid-cols-5 border-b border-[#111]">
                                            <div className="px-6 py-4 font-mono text-[8px] text-[#2A2A2A] uppercase tracking-widest">feature</div>
                                            {PLANS.map(p => (
                                                <div key={p.id} className="px-4 py-4 flex items-center gap-2">
                                                    <p.icon size={10} style={{ color: p.iconColor }} />
                                                    <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: p.iconColor }}>{p.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── TABLE CONTENT ── */}
                                        {COMPARE_SECTIONS.map((section) => (
                                            <div key={section.title}>
                                                <div className="px-6 py-3 bg-[#080808] border-y border-[#0F0F0F]">
                                                    <span className="font-mono text-[8px] text-[#2A2A2A] uppercase tracking-[0.2em]">{section.title}</span>
                                                </div>
                                                {section.rows.map((row, ri) => (
                                                    <div
                                                        key={row.feature}
                                                        className={cn(
                                                            "grid grid-cols-2 md:grid-cols-5 hover:bg-[#0F0F0F] transition-colors",
                                                            ri < section.rows.length - 1 && "border-b border-[#0A0A0A]"
                                                        )}
                                                    >
                                                        {/* Feature Name */}
                                                        <div className="px-6 py-3.5 font-mono text-[10px] text-[#666] flex items-center">
                                                            {row.feature}
                                                        </div>

                                                        {/* Mobile View: Only show the selected plan's value */}
                                                        <div className="md:hidden px-6 py-3.5 flex justify-end items-center">
                                                            {renderValue(row[mobileComparePlan])}
                                                        </div>

                                                        {/* Desktop View: Show all plans */}
                                                        {PLANS.map(p => (
                                                            <div key={p.id} className="hidden md:flex px-4 py-3.5 items-center">
                                                                {renderValue(row[p.id])}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer */}
                        <div className="text-center space-y-2 pb-4">
                            <p className="font-mono text-xs text-[#333]">14-day free trial · no credit card required · cancel anytime</p>
                            <a href="mailto:hello@devflowai.com" className="font-mono text-xs text-[#444] hover:text-[#6EE7B7] transition-colors inline-block">
                                questions? hello@devflowai.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            <AnimatePresence>
                {checkoutPlan && (
                    <CheckoutModal
                        plan={checkoutPlan}
                        isYearly={isYearly}
                        onClose={() => setCheckoutPlan(null)}
                        onConfirm={handleConfirm}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper to keep the JSX clean
const renderValue = (val) => {
    if (typeof val === 'boolean') {
        return val
            ? <Check size={12} className="text-[#6EE7B7]" />
            : <Minus size={12} className="text-[#1A1A1A]" />;
    }
    return <span className="font-mono text-[9px] text-[#555]">{val}</span>;
};