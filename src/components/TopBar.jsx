import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User as UserIcon, Settings, LogOut, CheckCircle2, Zap, GitCommit, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Using inline icon references to ensure no import collisions
const MOCK_NOTIFICATIONS = [
    { id: '1', name: "Pipeline 'PR Review' Succeeded", description: "Successfully ran tests and posted to Slack.", time: "Just now", iconType: 'success', color: "#10B981" },
    { id: '2', name: "GitHub Connected", description: "Successfully authorized devflow-ai app.", time: "2m ago", iconType: 'commit', color: "#3B82F6" },
];

const TopBar = ({ title, children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notificationsRef = useRef(null);

    // Animated List state
    const [activeNotifications, setActiveNotifications] = useState(MOCK_NOTIFICATIONS);

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

    // Simulate incoming notifications for the Magic UI effect when dropdown is open
    useEffect(() => {
        if (!notificationsOpen) return;

        const possibleEvents = [
            { name: "Workflow Triggered", description: "Push to main branch detected.", iconType: 'zap', color: "#6EE7B7" },
            { name: "Pipeline Failed", description: "Timeout error on 'Deploy to Vercel'.", iconType: 'error', color: "#F87171" },
            { name: "Team Invite Accepted", description: "Alex joined your workspace.", iconType: 'user', color: "#F59E0B" }
        ];

        let count = 0;
        const interval = setInterval(() => {
            if (count >= 3) {
                clearInterval(interval);
                return;
            }
            const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            const newNotif = {
                ...randomEvent,
                id: Date.now().toString() + Math.random().toString(), // Guarantee unique ID for framer motion layout
                time: "Just now"
            };

            setActiveNotifications(prev => {
                const updated = [newNotif, ...prev];
                if (updated.length > 5) return updated.slice(0, 5); // Keep list clean
                return updated;
            });
            count++;
        }, 3000); // Pops a new notification every 3 seconds

        return () => clearInterval(interval);
    }, [notificationsOpen]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    // Helper to render the correct icon safely
    const renderIcon = (type, color) => {
        const props = { className: "h-4 w-4", style: { color } };
        switch (type) {
            case 'success': return <CheckCircle2 {...props} />;
            case 'commit': return <GitCommit {...props} />;
            case 'zap': return <Zap {...props} />;
            case 'error': return <AlertCircle {...props} />;
            case 'user': return <UserIcon {...props} />;
            default: return <Bell {...props} />;
        }
    };

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[#1A1A1A] bg-[#080808]/80 backdrop-blur-md sticky top-0 z-30 shrink-0 transition-colors duration-300">
            <div className="flex items-center min-w-0 flex-1 mr-2">
                {typeof title === 'string' ? (
                    <h1 className="text-sm md:text-lg font-semibold text-[#F1F5F9] truncate max-w-[200px] md:max-w-none">
                        {title || `${getGreeting()}, ${userName}`}
                    </h1>
                ) : (
                    <div className="min-w-0 truncate">{title || <h1 className="text-sm md:text-lg font-semibold text-[#F1F5F9] truncate max-w-[200px] md:max-w-none">{`${getGreeting()}, ${userName}`}</h1>}</div>
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0 relative">
                {children}

                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationsRef}>
                    <button
                        className="relative p-2 text-[#64748B] hover:text-[#F1F5F9] transition-colors rounded-xl hover:bg-[#111]"
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                    >
                        <Bell className="h-4 w-4 md:h-5 md:w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-[#6EE7B7] flex items-center justify-center border-2 border-[#080808]"></span>
                    </button>

                    <AnimatePresence>
                        {notificationsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute right-0 top-12 w-[300px] md:w-80 bg-[#0A0A0A] border border-[#222] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                            >
                                <div className="px-4 py-3 border-b border-[#222] flex justify-between items-center bg-[#111]">
                                    <span className="font-mono text-[#6EE7B7] text-[10px] md:text-xs tracking-widest uppercase font-bold">Activity Feed</span>
                                    <button className="font-mono text-[9px] md:text-[10px] text-[#64748B] hover:text-[#F1F5F9] transition-colors">Mark all read</button>
                                </div>

                                {/* Magic UI style Animated List Wrapper */}
                                <div className="flex flex-col max-h-80 overflow-y-auto hidden-scrollbar p-2 gap-2 bg-[#0A0A0A]">
                                    <AnimatePresence mode="popLayout">
                                        {activeNotifications.map((notif) => (
                                            <motion.div
                                                key={notif.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                className="relative w-full cursor-pointer overflow-hidden rounded-xl p-3 transition-all duration-200 ease-in-out hover:scale-[102%] bg-[#111] border border-[#222] shadow-sm"
                                            >
                                                <div className="flex flex-row items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: `${notif.color}1A` }}>
                                                        {renderIcon(notif.iconType, notif.color)}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                                                        <div className="flex flex-row items-center text-[11px] md:text-xs font-mono font-medium text-[#F1F5F9]">
                                                            <span className="truncate">{notif.name}</span>
                                                            <span className="mx-1 text-[#64748B]">·</span>
                                                            <span className="text-[9px] text-[#64748B] shrink-0">{notif.time}</span>
                                                        </div>
                                                        <p className="text-[9px] md:text-[10px] font-mono text-[#64748B] mt-0.5 truncate">
                                                            {notif.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <div className="p-2 border-t border-[#222] bg-[#111]">
                                    <button
                                        className="w-full py-2 text-center font-mono text-[10px] md:text-xs text-[#64748B] hover:text-[#6EE7B7] transition-colors lowercase"
                                        onClick={() => { setNotificationsOpen(false); navigate('/logs'); }}
                                    >
                                        view all execution logs →
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative pl-2 md:pl-4 border-l border-[#1A1A1A]" ref={dropdownRef}>
                    <div
                        className="flex items-center gap-2 md:gap-3 group cursor-pointer"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-xl bg-[#111] overflow-hidden flex items-center justify-center border border-[#333] shrink-0">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xs md:text-sm font-medium text-[#F1F5F9]">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="text-xs md:text-sm font-mono text-slate-500 text-text-secondary hidden md:block truncate max-w-[100px]">{userName}</span>
                        <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-slate-400 text-text-secondary group-hover:text-slate-900 group-hover:text-text-primary transition-colors hidden sm:block" />
                    </div>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-[#222] rounded-xl shadow-xl overflow-hidden z-50 py-1"
                            >
                                <div className="px-4 py-2 border-b border-[#222] mb-1 bg-[#0A0A0A]">
                                    <p className="text-[10px] md:text-xs font-mono font-bold text-[#F1F5F9] truncate">{userName}</p>
                                    <p className="text-[9px] md:text-[10px] font-mono text-[#64748B] truncate mt-0.5">{user?.email}</p>
                                </div>
                                <button onClick={() => { setDropdownOpen(false); navigate('/profile'); }} className="w-full text-left px-4 py-2 text-[10px] md:text-xs font-mono text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] flex items-center gap-2 transition-colors lowercase">
                                    <UserIcon className="w-3.5 h-3.5" /> profile
                                </button>
                                <button onClick={() => { setDropdownOpen(false); navigate('/settings'); }} className="w-full text-left px-4 py-2 text-[10px] md:text-xs font-mono text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] flex items-center gap-2 transition-colors lowercase">
                                    <Settings className="w-3.5 h-3.5" /> settings
                                </button>
                                <div className="h-px bg-[#222] my-1"></div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-[10px] md:text-xs font-mono text-[#F87171] hover:bg-[#F87171]/10 flex items-center gap-2 transition-colors lowercase">
                                    <LogOut className="w-3.5 h-3.5" /> log_out
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