import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, GitBranch, Layers, Terminal, Plug,
    Settings, Zap, Users, X, Pin,
    Fingerprint, Power, ChevronRight, Menu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const { isExpanded, setIsExpanded, isLocked, setIsLocked } = useSidebar();
    const { user, handleLogout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const hoverTimeout = useRef(null);

    const userName = user?.firstName || 'Vikrant';
    const initials = userName.charAt(0).toUpperCase();

    // ── SCROLL DETECTION ──
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 40) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ── ANIMATION VARIANTS ──
    const mobileDrawerVariants = {
        closed: { x: "-100%", transition: { type: "spring", stiffness: 400, damping: 40 } },
        open: { x: 0, transition: { type: "spring", stiffness: 400, damping: 40, staggerChildren: 0.05, delayChildren: 0.2 } }
    };

    const itemFadeVariants = {
        closed: { opacity: 0, x: -20 },
        open: { opacity: 1, x: 0 }
    };

    // ── THE MORPHING PULSE-BLADE TRIGGER ──
    const HamburgerTrigger = ({ isOpen, onClick, scrolled }) => (
        <motion.button
            onClick={onClick}
            initial={false}
            animate={{
                x: scrolled && !isOpen ? -4 : 0, // Slight tuck
                width: scrolled && !isOpen ? "14px" : "44px",
                height: scrolled && !isOpen ? "70px" : "44px",
                borderRadius: scrolled && !isOpen ? "0px 12px 12px 0px" : "14px",
                backgroundColor: scrolled && !isOpen ? "#6EE7B7" : "#0D0D0D",
                boxShadow: scrolled && !isOpen
                    ? "0 0 20px rgba(110, 231, 183, 0.4)"
                    : "0 10px 30px rgba(0,0,0,0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={cn(
                "md:hidden fixed top-6 left-0 z-[1001] flex items-center justify-center border transition-colors",
                scrolled && !isOpen ? "border-[#6EE7B7]" : "border-[#1A1A1A] left-4"
            )}
        >
            <AnimatePresence mode="wait">
                {!scrolled || isOpen ? (
                    <motion.div
                        key="hamburger-icon"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        className="relative w-5 h-4 flex flex-col justify-between"
                    >
                        <motion.span
                            animate={isOpen ? { rotate: 45, y: 7.5, backgroundColor: "#F1F5F9" } : { rotate: 0, y: 0, backgroundColor: "#6EE7B7" }}
                            className="w-full h-0.5 rounded-full origin-center"
                        />
                        <motion.span
                            animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0, backgroundColor: "#6EE7B7" }}
                            className="w-full h-0.5 rounded-full"
                        />
                        <motion.span
                            animate={isOpen ? { rotate: -45, y: -7.5, backgroundColor: "#F1F5F9" } : { rotate: 0, y: 0, backgroundColor: "#6EE7B7" }}
                            className="w-full h-0.5 rounded-full origin-center"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="shutter-grip"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col gap-1 items-center"
                    >
                        {/* Industrial Grip Glyph */}
                        <motion.div
                            animate={{ width: [4, 8, 4] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="h-[2px] bg-[#080808] rounded-full"
                        />
                        <motion.div
                            animate={{ width: [8, 4, 8] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="h-[2px] bg-[#080808] rounded-full"
                        />
                        <motion.div
                            animate={{ width: [4, 8, 4] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="h-[2px] bg-[#080808] rounded-full"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );

    const toggleLock = (e) => { e.stopPropagation(); setIsLocked(!isLocked); };
    const handleMouseEnter = () => { if (!isLocked) { clearTimeout(hoverTimeout.current); setIsExpanded(true); } };
    const handleMouseLeave = () => { if (!isLocked) { hoverTimeout.current = setTimeout(() => setIsExpanded(false), 200); } };

    const navItems = [
        { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
        { icon: GitBranch, label: 'Workflows', path: '/workflows' },
        { icon: Layers, label: 'Templates', path: '/templates' },
        { icon: Users, label: 'Team', path: '/team' },
        { icon: Terminal, label: 'Logs', path: '/logs' },
        { icon: Plug, label: 'Integrations', path: '/integrations' },
    ];

    return (
        <>
            <HamburgerTrigger
                isOpen={isMobileOpen}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                scrolled={isScrolled}
            />

            {/* --- MOBILE DRAWER --- */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] md:hidden" />
                        <motion.aside initial="closed" animate="open" exit="closed" variants={mobileDrawerVariants} className="fixed left-0 top-0 h-full w-[280px] bg-[#0D0D0D] border-r border-[#1A1A1A] z-[1000] flex flex-col p-6 pt-20 md:hidden">
                            <nav className="flex-1 space-y-1">
                                {navItems.map((item) => (
                                    <motion.div key={item.path} variants={itemFadeVariants}>
                                        <NavLink to={item.path} onClick={() => setIsMobileOpen(false)} className={({ isActive }) => cn(
                                            "flex items-center h-12 px-4 rounded-xl transition-all font-mono text-xs font-bold uppercase tracking-widest",
                                            isActive ? "bg-[#6EE7B7]/5 text-[#6EE7B7] border border-[#6EE7B7]/20" : "text-[#444]"
                                        )}>
                                            <item.icon size={16} className="mr-4" /> {item.label}
                                        </NavLink>
                                    </motion.div>
                                ))}
                            </nav>

                            <motion.div variants={itemFadeVariants} className="mt-auto space-y-3 pt-6 border-t border-[#1A1A1A]">
                                <NavLink to="/profile" onClick={() => setIsMobileOpen(false)} className={({ isActive }) => cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all",
                                    isActive ? "bg-[#6EE7B7]/5 border-[#6EE7B7]/20" : "bg-[#111] border-[#1A1A1A]"
                                )}>
                                    <div className="h-10 w-10 rounded-xl bg-[#1A1A1A] border border-[#333] flex items-center justify-center shrink-0 overflow-hidden">
                                        {user?.imageUrl ? <img src={user.imageUrl} className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-[#6EE7B7]">{initials}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[11px] font-mono font-bold text-[#F1F5F9] uppercase tracking-tighter">View_Profile</p>
                                        <p className="text-[9px] font-mono text-[#444] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                </NavLink>
                                <NavLink to="/settings" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-4 px-4 py-2 text-[#444] font-mono text-[10px] uppercase tracking-widest hover:text-[#F1F5F9]">
                                    <Settings size={14} /> Settings
                                </NavLink>
                                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-2 text-[#F87171]/60 font-mono text-[10px] uppercase tracking-widest hover:text-[#F87171]">
                                    <Power size={14} /> Terminate_Session
                                </button>
                            </motion.div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* --- DESKTOP SIDEBAR --- */}
            <motion.div
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                animate={{ width: isExpanded ? 240 : 68 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 z-[999] h-screen bg-[#0D0D0D] border-r border-[#1A1A1A] hidden md:flex flex-col overflow-hidden"
            >
                <div className="h-16 flex items-center px-5 shrink-0 border-b border-[#1A1A1A] justify-between">
                    <AnimatePresence mode="wait">
                        {isExpanded ? (
                            <motion.div key="logo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 font-mono font-bold text-sm">
                                <span className="text-[#F1F5F9]">DevFlow</span><span className="text-[#6EE7B7]">AI</span>
                            </motion.div>
                        ) : (
                            <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center text-[#6EE7B7] font-mono font-bold">{`>_`}</motion.div>
                        )}
                    </AnimatePresence>
                    {isExpanded && <button onClick={toggleLock} className={cn("p-1.5 rounded-md transition-colors", isLocked ? "bg-[#6EE7B7]/10 text-[#6EE7B7]" : "text-[#333] hover:text-[#6EE7B7]")}><Pin className={cn("h-3.5 w-3.5 transition-transform", isLocked ? "rotate-45" : "rotate-0")} /></button>}
                </div>

                <nav className="flex-1 px-3 py-6 space-y-1">
                    {navItems.map((item) => (
                        <NavLink key={item.path} to={item.path} className={({ isActive }) => cn(
                            "flex items-center h-11 px-3 rounded-xl transition-all duration-200 group relative",
                            isActive ? "bg-[#161616] text-[#6EE7B7]" : "text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#111]"
                        )}>
                            <item.icon size={20} className="shrink-0" />
                            {isExpanded && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="ml-4 font-mono text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">{item.label}</motion.span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-[#1A1A1A] space-y-1">
                    <NavLink to="/profile" className={({ isActive }) => cn(
                        "flex items-center h-12 px-2 rounded-xl transition-all group",
                        isActive ? "bg-[#6EE7B7]/5 border border-[#6EE7B7]/10" : "hover:bg-[#111]"
                    )}>
                        <div className="h-8 w-8 rounded-lg bg-[#1A1A1A] border border-[#333] flex items-center justify-center shrink-0 overflow-hidden group-hover:border-[#6EE7B7]/40 transition-colors">
                            {user?.imageUrl ? <img src={user.imageUrl} className="h-full w-full object-cover" /> : <span className="text-[10px] font-bold text-[#6EE7B7]">{initials}</span>}
                        </div>
                        {isExpanded && (
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-[11px] font-mono font-bold text-[#F1F5F9] truncate group-hover:text-[#6EE7B7] transition-colors">{userName}</p>
                                <p className="text-[8px] font-mono text-[#333] uppercase tracking-tighter">View_Identity</p>
                            </div>
                        )}
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => cn(
                        "flex items-center h-10 px-3 rounded-xl transition-all",
                        isActive ? "text-[#6EE7B7]" : "text-[#444] hover:text-[#F1F5F9]"
                    )}>
                        <Settings size={16} />
                        {isExpanded && <span className="ml-4 font-mono text-[10px] uppercase tracking-widest">Settings</span>}
                    </NavLink>
                    {isExpanded && (
                        <button onClick={handleLogout} className="w-full flex items-center h-10 px-3 rounded-xl text-[#F87171]/40 hover:text-[#F87171] hover:bg-[#F87171]/5 transition-all">
                            <Power size={16} />
                            <span className="ml-4 font-mono text-[10px] uppercase tracking-widest">Terminate</span>
                        </button>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;