import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
    LayoutGrid,
    GitBranch,
    Layers,
    Terminal,
    Plug,
    Settings,
    User as UserIcon,
    LogOut,
    Zap,
    Users,
    Menu,
    X,
    Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [hasTeam] = useState(false); // ← you can keep logic if you fetch it later

    const auth = useAuth() || {};
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const hoverTimeout = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (auth.loading || !auth.user) return null;
    const { user } = auth;

    const { handleLogout } = auth;

    const userName = user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || '';
    const initial = userName.charAt(0).toUpperCase() || 'U';

    const navItems = [
        { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
        { icon: GitBranch, label: 'Workflows', path: '/workflows' },
        { icon: Layers, label: 'Templates', path: '/templates' },
        { icon: Users, label: 'Team', path: '/team', isPremium: !hasTeam },
        { icon: Terminal, label: 'Logs', path: '/logs' },
        { icon: Plug, label: 'Integrations', path: '/integrations' },
    ];

    const NavBody = ({ onLinkClick, showLabels, isMobile }) => (
        <>
            <nav className="flex flex-col overflow-y-auto hidden-scrollbar" style={{ flex: '1 1 0%' }}>
                {isMobile && (
                    <div className="p-4 border-b border-[#1A1A1A] shrink-0 flex flex-col gap-3 pointer-events-auto mb-2 bg-[#111]/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#111] shrink-0 flex items-center justify-center border border-[#333] overflow-hidden">
                                {user?.imageUrl ? (
                                    <img
                                        src={user.imageUrl}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-semibold text-[#6EE7B7]">{initial}</span>
                                )}
                            </div>
                            <div className="font-mono text-sm text-[#F1F5F9] truncate">{userName}</div>
                        </div>
                        <div className="flex gap-2 relative z-[100] pointer-events-auto">
                            <button
                                onClick={() => {
                                    onLinkClick?.();
                                    navigate('/profile');
                                }}
                                className="flex-1 py-2 bg-[#111] text-[#6EE7B7] rounded-lg flex items-center justify-center gap-1.5 font-mono text-xs transition-colors border border-[#222] hover:bg-[#1A1A1A] pointer-events-auto"
                            >
                                <UserIcon className="w-3.5 h-3.5" /> profile
                            </button>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    onLinkClick?.();
                                }}
                                className="flex-1 py-2 bg-[#111] text-[#F87171] rounded-lg flex items-center justify-center gap-1.5 font-mono text-xs transition-colors border border-[#222] hover:bg-[#1A1A1A] pointer-events-auto"
                            >
                                <LogOut className="w-3.5 h-3.5" /> log_out
                            </button>
                        </div>
                    </div>
                )}

                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onLinkClick}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center h-11 px-4 mx-2 mb-1 rounded-lg relative transition-all duration-200 ease-out group',
                                isActive ? 'bg-[#161616] text-[#F1F5F9]' : 'text-[#64748B] hover:bg-[#111] hover:text-[#F1F5F9]',
                                item.isPremium && !isActive && 'opacity-80 hover:opacity-100'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-md bg-[#6EE7B7]" />
                                )}
                                <div className="relative shrink-0">
                                    <item.icon
                                        className={cn(
                                            'h-4 w-4 transition-colors duration-200',
                                            isActive ? 'text-[#6EE7B7]' : 'text-[#64748B] group-hover:text-[#F1F5F9]'
                                        )}
                                    />
                                </div>

                                <AnimatePresence>
                                    {showLabels && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="ml-3 flex items-center justify-between w-full"
                                        >
                                            <span
                                                className={cn(
                                                    'font-mono text-xs whitespace-nowrap',
                                                    isActive ? 'text-[#F1F5F9]' : 'text-[#64748B] group-hover:text-[#F1F5F9]'
                                                )}
                                            >
                                                {item.label}
                                            </span>
                                            {item.isPremium && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/30 text-[9px] font-bold text-[#A78BFA] uppercase tracking-wider ml-2">
                                                    <Lock className="w-2.5 h-2.5" /> Pro
                                                </span>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div
                className="flex flex-col border-t border-[#1A1A1A] shrink-0 pt-2 transition-all duration-200"
                style={{ paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 32px) + 20px)' : '8px' }}
            >
                <NavLink
                    to="/upgrade"
                    onClick={onLinkClick}
                    className={({ isActive }) =>
                        cn(
                            'flex items-center h-11 px-4 mx-2 mb-1 rounded-lg relative transition-all group',
                            isActive ? 'bg-[#161616]' : 'hover:bg-[#111]'
                        )
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-lg bg-amber-500" />
                            )}
                            <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                            <AnimatePresence>
                                {showLabels && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="ml-3 font-mono text-xs text-amber-500 whitespace-nowrap font-bold"
                                    >
                                        Upgrade
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/settings"
                    onClick={onLinkClick}
                    className={({ isActive }) =>
                        cn(
                            'flex items-center h-11 px-4 mx-2 mb-1 rounded-lg relative transition-all group',
                            isActive ? 'bg-[#161616] text-[#F1F5F9]' : 'text-[#64748B] hover:bg-[#111] hover:text-[#F1F5F9]'
                        )
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-lg bg-[#6EE7B7]" />
                            )}
                            <Settings
                                className={cn(
                                    'h-4 w-4 shrink-0 transition-colors',
                                    isActive ? 'text-[#6EE7B7]' : 'text-[#64748B] group-hover:text-[#F1F5F9]'
                                )}
                            />
                            <AnimatePresence>
                                {showLabels && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className={cn(
                                            'ml-3 font-mono text-xs whitespace-nowrap',
                                            isActive ? 'text-[#F1F5F9]' : 'text-[#64748B] group-hover:text-[#F1F5F9]'
                                        )}
                                    >
                                        Settings
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </NavLink>

                {!isMobile && (
                    <div className="relative pb-2 pt-1 mx-2" ref={dropdownRef}>
                        <div
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center h-11 px-2 rounded-lg cursor-pointer hover:bg-[#111] transition-colors"
                        >
                            <div className="h-6 w-6 rounded-lg bg-[#1A1A1A] shrink-0 flex items-center justify-center border border-[#333] overflow-hidden">
                                {user?.imageUrl ? (
                                    <img
                                        src={user.imageUrl}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-[10px] font-semibold text-[#F1F5F9]">{initial}</span>
                                )}
                            </div>

                            <AnimatePresence>
                                {showLabels && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="ml-3 font-mono text-xs text-[#F1F5F9] truncate"
                                        style={{ maxWidth: '140px' }}
                                    >
                                        {userName}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute bottom-full left-2 right-2 mb-1 bg-[#111] border border-[#222] rounded-lg shadow-xl z-50 py-1 overflow-hidden"
                                >
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            onLinkClick?.();
                                            navigate('/profile');
                                        }}
                                        className="w-full text-left px-4 py-2.5 font-mono text-xs text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] flex items-center gap-2 transition-colors"
                                    >
                                        <UserIcon className="w-3 h-3" /> profile
                                    </button>
                                    <div className="h-px bg-[#1A1A1A]" />
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            onLinkClick?.();
                                        }}
                                        className="w-full text-left px-4 py-2.5 font-mono text-xs text-[#F87171] hover:bg-[#F87171]/10 flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut className="w-3 h-3" /> log_out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <>
            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-[999] bg-[#0D0D0D] border-b border-[#1A1A1A]">
                <div className="h-10 flex items-center px-4 border-b border-[#111]">
                    <Link
                        to={user ? '/dashboard' : '/'}
                        className="font-mono font-bold text-sm flex items-center gap-1 hover:bg-white/5 hover:rounded-xl transition-colors px-2 py-1 -ml-2"
                    >
                        <span className="text-[#F1F5F9]">DevFlow</span>
                        <span className="text-[#6EE7B7]">AI</span>
                    </Link>
                </div>
                <div className="h-9 flex items-center px-4">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="flex items-center gap-2 text-[#64748B] hover:text-white transition-colors"
                    >
                        <Menu className="w-4 h-4" />
                        <span className="font-mono text-xs">menu</span>
                    </button>
                </div>
            </div>

            {/* Mobile sidebar overlay + drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[999] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            style={{ maxHeight: '-webkit-fill-available' }}
                            className="fixed top-0 left-0 bottom-0 w-[68vw] max-w-[260px] bg-[#0D0D0D] border-r border-[#1A1A1A] z-[999] md:hidden flex flex-col h-[100dvh] overflow-hidden"
                        >
                            {/* ... mobile header ... */}
                            <div className="h-12 flex items-center justify-between px-4 border-b border-[#1A1A1A] shrink-0">
                                <Link
                                    to={user ? '/dashboard' : '/'}
                                    className="font-mono font-bold text-sm flex items-center gap-1 hover:bg-white/5 hover:rounded-xl transition-colors px-2 py-1 -ml-2"
                                >
                                    <span className="text-[#F1F5F9]">DevFlow</span>
                                    <span className="text-[#6EE7B7]">AI</span>
                                </Link>
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#111] text-[#64748B] hover:text-white transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col overflow-hidden">
                                <NavBody onLinkClick={() => setIsMobileOpen(false)} showLabels={true} isMobile={true} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar – width moved to style prop */}
            <div
                className="fixed left-0 top-0 z-[999] h-[100dvh] bg-[#0D0D0D] border-r border-[#1A1A1A] flex-col hidden md:flex"
                style={{
                    width: isExpanded ? '200px' : '56px',
                    transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={() => {
                    clearTimeout(hoverTimeout.current);
                    setIsExpanded(true);
                }}
                onMouseLeave={() => {
                    hoverTimeout.current = setTimeout(() => {
                        setIsExpanded(false);
                        setDropdownOpen(false);
                    }, 150);
                }}
            >
                <div className="h-14 flex items-center px-3 shrink-0 border-b border-[#1A1A1A]">
                    {isExpanded ? (
                        <Link
                            to={user ? '/dashboard' : '/'}
                            className="font-mono font-bold text-base flex items-center gap-1 overflow-hidden whitespace-nowrap ml-1 hover:bg-white/5 hover:rounded-xl transition-colors px-2 py-1"
                        >
                            <span className="text-[#F1F5F9]">DevFlow</span>
                            <span className="text-[#6EE7B7]">AI</span>
                        </Link>
                    ) : (
                        <div className="w-full flex justify-center">
                            <span className="text-[#6EE7B7] font-mono font-bold text-sm animate-pulse">{`>_`}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <NavBody onLinkClick={null} showLabels={isExpanded} />
                </div>
            </div>
        </>
    );
};

export default Sidebar;