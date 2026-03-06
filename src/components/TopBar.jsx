import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const TopBar = ({ title, children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notificationsRef = useRef(null);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
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

                <div className="relative" ref={notificationsRef}>
                    <button
                        className="relative p-2 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[#6EE7B7] flex items-center justify-center text-[8px] font-bold text-[#080808]">2</span>
                    </button>

                    <AnimatePresence>
                        {notificationsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute right-0 top-12 w-80 bg-[#111] border border-[#1A1A1A] rounded-md shadow-xl overflow-hidden z-50 flex flex-col"
                            >
                                <div className="px-4 py-3 border-b border-[#1A1A1A] flex justify-between items-center">
                                    <span className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase">notifications</span>
                                    <button className="font-mono text-[10px] text-[#64748B] hover:text-[#F1F5F9] transition-colors">Mark all read</button>
                                </div>
                                <div className="flex flex-col max-h-80 overflow-y-auto hidden-scrollbar">
                                    {/* Unread 1 */}
                                    <div className="bg-[#111] hover:bg-[#0D0D0D] p-3 border-l-2 border-[#6EE7B7] border-b border-[#1A1A1A] flex items-start gap-3 transition-colors cursor-pointer">
                                        <div className="mt-0.5 text-sm">🟢</div>
                                        <div>
                                            <p className="font-mono text-sm text-[#F1F5F9] transition-colors">Pipeline saved successfully</p>
                                            <p className="font-mono text-xs text-[#64748B] mt-1">just now</p>
                                        </div>
                                    </div>
                                    {/* Unread 2 */}
                                    <div className="bg-[#111] hover:bg-[#0D0D0D] p-3 border-l-2 border-[#6EE7B7] border-b border-[#1A1A1A] flex items-start gap-3 transition-colors cursor-pointer">
                                        <div className="mt-0.5 text-sm">🔵</div>
                                        <div>
                                            <p className="font-mono text-sm text-[#F1F5F9] transition-colors">Welcome to DevFlow AI</p>
                                            <p className="font-mono text-xs text-[#64748B] mt-1">2 hours ago</p>
                                        </div>
                                    </div>
                                    {/* Read 1 */}
                                    <div className="bg-[#111] hover:bg-[#0D0D0D] p-3 border-l-2 border-transparent border-b border-[#1A1A1A] flex items-start gap-3 transition-colors cursor-pointer">
                                        <div className="mt-0.5 text-sm opacity-50">⚪</div>
                                        <div>
                                            <p className="font-mono text-sm text-[#F1F5F9] opacity-80">Check out workflow templates</p>
                                            <p className="font-mono text-xs text-[#64748B] mt-1">1 day ago</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 border-t border-[#1A1A1A] bg-[#0D0D0D]">
                                    <button
                                        className="w-full py-2 text-center font-mono text-xs text-[#64748B] hover:text-[#6EE7B7] transition-colors lowercase"
                                        onClick={() => showToast('coming soon', 'info')}
                                    >
                                        view all notifications →
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

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
                                <button onClick={() => { setDropdownOpen(false); navigate('/profile'); }} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 flex items-center gap-2 transition-colors">
                                    <UserIcon className="w-4 h-4" /> Profile
                                </button>
                                <button onClick={() => { setDropdownOpen(false); navigate('/settings'); }} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 flex items-center gap-2 transition-colors">
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
