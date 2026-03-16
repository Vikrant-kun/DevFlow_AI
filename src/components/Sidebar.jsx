import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutGrid, GitBranch, Layers, Terminal, Plug,
    Settings, Users, Pin, Power, Zap, Sparkles, ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
    { icon: GitBranch, label: 'Workflows', path: '/workflows' },
    { icon: Layers, label: 'Templates', path: '/templates' },
    { icon: Users, label: 'Team', path: '/team', premium: true },
    { icon: Terminal, label: 'Logs', path: '/logs' },
    { icon: Plug, label: 'Integrations', path: '/integrations' },
];

// ── UPGRADE BLOCK ──────────────────────────────────────────────────────────
const UpgradeBlock = ({ isExpanded }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate('/upgrade')}
            className={cn(
                'w-full transition-all duration-200 group',
                isExpanded
                    ? 'bg-[#0D0D0D] border border-[#1E1E1E] hover:border-[#A78BFA]/30 rounded-xl p-3.5 text-left'
                    : 'h-10 flex items-center justify-center rounded-xl border border-[#1A1A1A] hover:border-[#A78BFA]/30 hover:bg-[#A78BFA]/5'
            )}
        >
            {isExpanded ? (
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles size={11} className="text-[#A78BFA]" />
                            <span className="font-mono text-[10px] text-[#A78BFA] uppercase tracking-widest font-bold">Upgrade</span>
                        </div>
                        <ArrowUpRight size={11} className="text-[#A78BFA]/40 group-hover:text-[#A78BFA] transition-colors" />
                    </div>
                    <p className="font-mono text-[9px] text-[#3A3A4A] leading-relaxed">
                        Unlimited workflows, all AI models & team features
                    </p>
                    <div className="h-0.5 w-full bg-[#111] rounded-full overflow-hidden">
                        <div className="h-full w-[72%] bg-[#A78BFA]/50 rounded-full" />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#A78BFA]/8 border border-[#A78BFA]/15 group-hover:bg-[#A78BFA]/12 transition-colors">
                        <Zap size={9} className="text-[#A78BFA]" />
                        <span className="font-mono text-[9px] text-[#A78BFA] uppercase tracking-wider font-bold">Pro · $9/mo</span>
                    </div>
                </div>
            ) : (
                <Zap size={14} className="text-[#A78BFA]/50 group-hover:text-[#A78BFA] transition-colors" />
            )}
        </button>
    );
};

// ── MOBILE HAMBURGER ───────────────────────────────────────────────────────
const MobileMenu = ({ isOpen, onToggle }) => (
    <>
        <button
            onClick={onToggle}
            className="md:hidden fixed top-5 left-4 z-[1001] w-9 h-9 flex flex-col items-center justify-center gap-1.5 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl"
        >
            <span className={cn('w-4 h-0.5 bg-[#6EE7B7] rounded-full transition-all duration-200', isOpen && 'rotate-45 translate-y-2')} />
            <span className={cn('w-4 h-0.5 bg-[#6EE7B7] rounded-full transition-all duration-200', isOpen && 'opacity-0')} />
            <span className={cn('w-4 h-0.5 bg-[#6EE7B7] rounded-full transition-all duration-200', isOpen && '-rotate-45 -translate-y-2')} />
        </button>

        {isOpen && (
            <>
                <div onClick={onToggle} className="md:hidden fixed inset-0 bg-black/60 z-[999]" />
                <div className="md:hidden fixed left-0 top-0 h-full w-64 bg-[#0A0A0A] border-r border-[#111] z-[1000] flex flex-col">
                    {/* Header */}
                    <div className="h-14 flex items-center px-5 border-b border-[#111]">
                        <span className="font-mono text-sm font-bold text-[#F1F5F9]">DevFlow<span className="text-[#6EE7B7]">AI</span></span>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-4 space-y-0.5">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onToggle}
                                className={({ isActive }) => cn(
                                    'flex items-center gap-3 h-10 px-3 rounded-lg font-mono text-[11px] uppercase tracking-widest transition-colors',
                                    isActive
                                        ? item.premium ? 'text-[#A78BFA] bg-[#A78BFA]/8' : 'text-[#6EE7B7] bg-[#6EE7B7]/5'
                                        : item.premium ? 'text-[#A78BFA]/40 hover:text-[#A78BFA] hover:bg-[#A78BFA]/5' : 'text-[#444] hover:text-[#C4C4D4] hover:bg-[#111]'
                                )}
                            >
                                <item.icon size={15} className="shrink-0" />
                                {item.label}
                                {item.premium && (
                                    <span className="ml-auto font-mono text-[7px] text-[#A78BFA] border border-[#A78BFA]/20 px-1.5 py-0.5 rounded uppercase tracking-wider">pro</span>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom */}
                    <div className="px-3 pb-5 space-y-1 border-t border-[#111] pt-3">
                        <div className="mb-3"><UpgradeBlock isExpanded={true} /></div>
                        <NavLink to="/settings" onClick={onToggle} className={({ isActive }) => cn('flex items-center gap-3 h-10 px-3 rounded-lg font-mono text-[11px] uppercase tracking-widest transition-colors', isActive ? 'text-[#6EE7B7]' : 'text-[#333] hover:text-[#888] hover:bg-[#111]')}>
                            <Settings size={14} /> Settings
                        </NavLink>
                        <button onClick={onToggle} className="w-full flex items-center gap-3 h-10 px-3 rounded-lg font-mono text-[11px] uppercase tracking-widest text-[#F87171]/30 hover:text-[#F87171]/60 hover:bg-[#F87171]/5 transition-colors">
                            <Power size={14} /> Terminate
                        </button>
                    </div>
                </div>
            </>
        )}
    </>
);

// ── MAIN SIDEBAR ───────────────────────────────────────────────────────────
const Sidebar = () => {
    const { isExpanded, setIsExpanded, isLocked, setIsLocked } = useSidebar();
    const { user, handleLogout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const hoverTimeout = useRef(null);

    const userName = user?.firstName || 'Vikrant';
    const initials = userName.charAt(0).toUpperCase();

    const toggleLock = (e) => { e.stopPropagation(); setIsLocked(!isLocked); };
    const handleMouseEnter = () => {
        if (!isLocked) { clearTimeout(hoverTimeout.current); setIsExpanded(true); }
    };
    const handleMouseLeave = () => {
        if (!isLocked) { hoverTimeout.current = setTimeout(() => setIsExpanded(false), 180); }
        setHoveredItem(null);
    };

    useEffect(() => () => clearTimeout(hoverTimeout.current), []);

    return (
        <>
            <MobileMenu isOpen={isMobileOpen} onToggle={() => setIsMobileOpen(v => !v)} />

            {/* ── DESKTOP ── */}
            <motion.div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                animate={{ width: isExpanded ? 220 : 60 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 z-[999] h-screen hidden md:flex flex-col bg-[#080808] border-r border-[#111] overflow-hidden"
            >
                {/* Header */}
                <div className="h-14 flex items-center px-4 shrink-0 border-b border-[#111]">
                    <div className="w-7 h-7 rounded-lg bg-[#111] border border-[#1A1A1A] flex items-center justify-center shrink-0">
                        <span className="font-mono text-[9px] font-bold text-[#6EE7B7]">{`>_`}</span>
                    </div>
                    <div
                        className="ml-3 flex items-baseline gap-1 font-mono font-bold text-sm whitespace-nowrap transition-all duration-200"
                        style={{ opacity: isExpanded ? 1 : 0, pointerEvents: isExpanded ? 'auto' : 'none' }}
                    >
                        <span className="text-[#F1F5F9]">DevFlow</span>
                        <span className="text-[#6EE7B7]">AI</span>
                    </div>
                    {isExpanded && (
                        <button
                            onClick={toggleLock}
                            className={cn('ml-auto p-1.5 rounded-md transition-colors', isLocked ? 'text-[#6EE7B7]' : 'text-[#222] hover:text-[#555]')}
                        >
                            <Pin size={11} className={cn('transition-transform duration-300', isLocked ? 'rotate-45' : 'rotate-0')} />
                        </button>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onMouseEnter={() => setHoveredItem(item.path)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={({ isActive }) => cn(
                                'relative flex items-center h-9 px-2.5 rounded-lg transition-colors duration-150',
                                isActive
                                    ? item.premium ? 'bg-[#A78BFA]/8 text-[#A78BFA]' : 'bg-[#111] text-[#6EE7B7]'
                                    : item.premium ? 'text-[#A78BFA]/35 hover:text-[#A78BFA] hover:bg-[#A78BFA]/5' : 'text-[#383840] hover:text-[#888] hover:bg-[#0D0D0D]'
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active pill */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
                                            style={{ background: item.premium ? '#A78BFA' : '#6EE7B7' }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                        />
                                    )}

                                    <item.icon
                                        size={15}
                                        className="shrink-0"
                                        style={{ color: isActive ? (item.premium ? '#A78BFA' : '#6EE7B7') : item.premium ? '#A78BFA55' : undefined }}
                                    />

                                    {/* Label */}
                                    <div
                                        className="ml-3 flex items-center gap-2 flex-1 min-w-0 transition-all duration-200"
                                        style={{ opacity: isExpanded ? 1 : 0, transform: isExpanded ? 'none' : 'translateX(-4px)', pointerEvents: isExpanded ? 'auto' : 'none' }}
                                    >
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{item.label}</span>
                                        {item.premium && (
                                            <span className="ml-auto font-mono text-[7px] uppercase tracking-wider border rounded px-1 py-px"
                                                style={{ color: '#A78BFA', borderColor: '#A78BFA22', background: '#A78BFA08' }}>
                                                pro
                                            </span>
                                        )}
                                    </div>

                                    {/* Tooltip when collapsed */}
                                    {!isExpanded && hoveredItem === item.path && (
                                        <div className="absolute left-12 z-50 px-2.5 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-widest whitespace-nowrap pointer-events-none bg-[#0D0D0D] border border-[#1A1A1A]"
                                            style={{ color: item.premium ? '#A78BFA' : '#C4C4D4' }}>
                                            {item.label}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="px-2 pb-3 space-y-0.5 border-t border-[#111] pt-3 shrink-0">
                    {/* Upgrade */}
                    <div className="mb-2 px-0.5">
                        <UpgradeBlock isExpanded={isExpanded} />
                    </div>

                    {/* Profile */}
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => cn(
                            'flex items-center h-9 px-2.5 rounded-lg transition-colors group',
                            isActive ? 'bg-[#111] text-[#6EE7B7]' : 'text-[#383840] hover:text-[#888] hover:bg-[#0D0D0D]'
                        )}
                    >
                        <div className="w-5 h-5 rounded-md bg-[#111] border border-[#1A1A1A] flex items-center justify-center shrink-0 overflow-hidden">
                            {user?.imageUrl
                                ? <img src={user.imageUrl} className="w-full h-full object-cover" />
                                : <span className="font-mono text-[8px] font-bold text-[#6EE7B7]">{initials}</span>
                            }
                        </div>
                        <div
                            className="ml-3 flex-1 min-w-0 transition-all duration-200"
                            style={{ opacity: isExpanded ? 1 : 0, transform: isExpanded ? 'none' : 'translateX(-4px)', pointerEvents: isExpanded ? 'auto' : 'none' }}
                        >
                            <p className="font-mono text-[10px] font-bold text-[#888] uppercase tracking-tight truncate group-hover:text-[#C4C4D4] transition-colors">{userName}</p>
                        </div>
                    </NavLink>

                    {/* Settings */}
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => cn(
                            'flex items-center h-9 px-2.5 rounded-lg transition-colors',
                            isActive ? 'text-[#6EE7B7]' : 'text-[#222] hover:text-[#666] hover:bg-[#0D0D0D]'
                        )}
                    >
                        <Settings size={14} className="shrink-0" />
                        <span
                            className="ml-3 font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-200"
                            style={{ opacity: isExpanded ? 1 : 0, transform: isExpanded ? 'none' : 'translateX(-4px)' }}
                        >Settings</span>
                    </NavLink>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center h-9 px-2.5 rounded-lg text-[#1E1E1E] hover:text-[#F87171]/50 hover:bg-[#F87171]/3 transition-colors"
                    >
                        <Power size={14} className="shrink-0" />
                        <span
                            className="ml-3 font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-200"
                            style={{ opacity: isExpanded ? 1 : 0, transform: isExpanded ? 'none' : 'translateX(-4px)' }}
                        >Terminate</span>
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;