import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const TopBar = ({ title, children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#1A1A1A] bg-[#080808]/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
            <div className="flex items-center">
                {typeof title === 'string' ? (
                    <h1 className="text-lg font-semibold text-text-primary">
                        {title || `${getGreeting()}, ${userName}`}
                    </h1>
                ) : (
                    title || <h1 className="text-lg font-semibold text-text-primary">{`${getGreeting()}, ${userName}`}</h1>
                )}
            </div>

            <div className="flex items-center gap-4 relative">
                {children}

                <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-glow-primary"></span>
                </button>

                <div className="relative pl-4 border-l border-border" ref={dropdownRef}>
                    <div
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="h-8 w-8 rounded-full bg-[#111] overflow-hidden flex items-center justify-center border border-[#333]">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-sm font-medium text-ai">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="text-sm font-mono text-text-secondary hidden sm:block">{userName}</span>
                        <ChevronDown className="h-4 w-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                    </div>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-border rounded-lg shadow-xl overflow-hidden z-50 py-1"
                            >
                                <div className="px-4 py-2 border-b border-border mb-1">
                                    <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
                                    <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                                </div>
                                <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 flex items-center gap-2 transition-colors">
                                    <UserIcon className="w-4 h-4" /> Profile
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 flex items-center gap-2 transition-colors">
                                    <Settings className="w-4 h-4" /> Settings
                                </button>
                                <div className="h-px bg-border my-1"></div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2 transition-colors">
                                    <LogOut className="w-4 h-4" /> Log out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
