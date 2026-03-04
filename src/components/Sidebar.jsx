import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, GitBranch, Layers, Terminal, Plug, Settings, User as UserIcon, LogOut, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
    const initial = userName.charAt(0).toUpperCase() || 'U';

    const navItems = [
        { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
        { icon: GitBranch, label: 'Workflows', path: '/workflows' },
        { icon: Layers, label: 'Templates', path: '/templates' },
        { icon: Terminal, label: 'Logs', path: '/logs' },
        { icon: Plug, label: 'Integrations', path: '/integrations' },
    ];

    return (
        <div
            className={cn(
                "fixed left-0 top-0 z-40 h-screen bg-[#0D0D0D] border-r border-border flex flex-col transition-all duration-300 ease-[cubic-bezier(0,0,0.2,1)] hidden md:flex",
                isExpanded ? "w-[220px]" : "w-[64px]"
            )}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex h-16 items-center px-4 shrink-0">
                {isExpanded ? (
                    <div className="flex items-center gap-2 font-mono font-bold text-xl overflow-hidden whitespace-nowrap">
                        <span className="text-white">devflow</span>
                        <span className="text-primary animate-pulse">_</span>
                    </div>
                ) : (
                    <div className="w-full flex justify-center">
                        <span className="text-primary font-mono font-bold text-lg animate-pulse">{`>_`}</span>
                    </div>
                )}
            </div>

            <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto hidden-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center h-10 px-3 relative transition-all duration-150 group overflow-hidden whitespace-nowrap",
                            isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                        )}
                        title={!isExpanded ? item.label : undefined}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />
                                )}
                                <item.icon className={cn("h-5 w-5 shrink-0 transition-colors duration-150 group-hover:text-[#F1F5F9]", isActive ? "text-[#6EE7B7]" : "text-[#64748B]")} />
                                {isExpanded && (
                                    <span className={cn("ml-3 font-medium transition-colors duration-150", isActive ? "text-[#F1F5F9]" : "text-[#64748B] group-hover:text-[#F1F5F9]")}>
                                        {item.label}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto flex flex-col px-2 pb-4 pt-2 border-t border-[#222]">
                <NavLink
                    to="/upgrade"
                    className={({ isActive }) => cn(
                        "flex items-center h-10 px-3 relative transition-all duration-150 group overflow-hidden whitespace-nowrap mb-1",
                        isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                    )}
                    title={!isExpanded ? "Upgrade" : undefined}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />}
                            <Zap className={cn("h-5 w-5 shrink-0 transition-colors duration-150 text-[#F59E0B]", isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100")} />
                            {isExpanded && (
                                <span className={cn("ml-3 font-medium text-[#F59E0B]", isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100")}>
                                    Upgrade
                                </span>
                            )}
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => cn(
                        "flex items-center h-10 px-3 mb-2 relative transition-all duration-150 group overflow-hidden whitespace-nowrap",
                        isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                    )}
                    title={!isExpanded ? "Settings" : undefined}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />}
                            <Settings className={cn("h-5 w-5 shrink-0 transition-colors duration-150 group-hover:text-[#F1F5F9]", isActive ? "text-[#6EE7B7]" : "text-[#64748B]")} />
                            {isExpanded && (
                                <span className={cn("ml-3 font-medium", isActive ? "text-[#F1F5F9]" : "text-[#64748B] group-hover:text-[#F1F5F9]")}>
                                    Settings
                                </span>
                            )}
                        </>
                    )}
                </NavLink>

                <div className="relative" ref={dropdownRef}>
                    <div
                        className="flex items-center px-3 h-10 mt-1 cursor-pointer group overflow-hidden whitespace-nowrap"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="h-8 w-8 rounded-full bg-surface-2 shrink-0 flex items-center justify-center border border-border overflow-hidden">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xs font-semibold text-text-primary">{initial}</span>
                            )}
                        </div>
                        {isExpanded && (
                            <span className="ml-3 font-mono text-text-primary text-sm truncate" style={{ maxWidth: "120px" }}>{userName}</span>
                        )}
                    </div>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className={cn(
                                    "absolute bottom-full mb-2 bg-[#111] border border-[#222] shadow-xl overflow-hidden z-50 py-1 rounded-none",
                                    isExpanded ? "left-0 w-[204px]" : "left-0 w-48"
                                )}
                            >
                                <button onClick={() => { setDropdownOpen(false); navigate('/settings'); }} className="w-full text-left px-4 py-2 font-mono text-xs text-text-secondary hover:text-text-primary hover:bg-[#1A1A1A] flex items-center gap-2 transition-colors">
                                    <UserIcon className="w-3.5 h-3.5" /> profile
                                </button>
                                <div className="h-px bg-[#1A1A1A] my-1"></div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 font-mono text-xs text-[#F87171] hover:bg-[#F87171]/10 flex items-center gap-2 transition-colors">
                                    <LogOut className="w-3.5 h-3.5" /> log_out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
