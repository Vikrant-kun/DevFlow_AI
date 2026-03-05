import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const Settings = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [profileStatus, setProfileStatus] = useState('idle');

    // Form states
    const [name, setName] = useState('');
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
            setDisplayName(user.user_metadata?.display_name || user.user_metadata?.user_name || user.email?.split('@')[0] || '');
        }
    }, [user]);

    const userEmail = user?.email || '';
    const avatarUrl = user?.user_metadata?.avatar_url;

    // Derived values
    const initials = name.substring(0, 2).toUpperCase() || 'U';

    let providerBadge = "Email account";
    if (user?.app_metadata?.provider === 'github') {
        providerBadge = "Connected via GitHub";
    } else if (user?.app_metadata?.provider === 'google') {
        providerBadge = "Connected via Google";
    }

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown';

    const lastLoginDate = user?.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleString('en-US')
        : 'Unknown';

    const handleSaveProfile = async () => {
        setProfileStatus('loading');
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: name,
                    display_name: displayName
                }
            });

            if (error) throw error;

            setProfileStatus('success');
            showToast('Profile updated successfully', 'success');
            setTimeout(() => setProfileStatus('idle'), 2000);
        } catch (error) {
            setProfileStatus('error');
            showToast('Failed to save — try again', 'error');
            setTimeout(() => setProfileStatus('idle'), 2000);
        }
    };

    const getButtonStyles = (status) => {
        if (status === 'success') return "bg-[#6EE7B7] text-[#080808] cursor-default";
        if (status === 'error') return "bg-[#F87171] text-[#080808] cursor-default";
        return "bg-[#6EE7B7] hover:bg-[#34D399] text-[#080808]";
    };

    const getButtonContent = (status, text) => {
        if (status === 'loading') {
            return (
                <div className="flex items-center gap-2 justify-center">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    saving...
                </div>
            );
        }
        if (status === 'success') return "✓ saved";
        if (status === 'error') return "✗ failed";
        return text;
    };

    return (
        <>
            <TopBar title={<span className="font-mono text-sm text-[#6EE7B7]">~ / settings</span>} />
            <div className="p-6">
                <div className="w-full max-w-3xl mx-auto space-y-12 pb-12 pt-4">

                    {/* Profile Section */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-lg font-mono text-text-primary lowercase tracking-tight">profile</h2>
                            <p className="text-[#64748B] text-xs font-mono mt-1">manage_personal_info</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-[#111] border border-[#222] p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 rounded-none">
                            <div className="w-20 h-20 shrink-0 bg-[#222] border border-[#333] rounded-full overflow-hidden flex items-center justify-center text-[#64748B] font-mono text-2xl uppercase relative">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <div className="space-y-2 text-center sm:text-left flex-1">
                                <h3 className="font-mono text-base text-text-primary">{name}</h3>
                                <div className="text-xs font-mono text-[#64748B]">
                                    {providerBadge}
                                </div>
                                <div className="text-xs font-mono text-text-secondary mt-2 flex flex-col gap-1">
                                    <span>Member since: {memberSince}</span>
                                    <span>Last login: {lastLoginDate}</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-[#64748B] lowercase">full_name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#111] border border-[#222] rounded-none px-4 py-2 font-mono text-sm text-text-primary focus:border-[#6EE7B7] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-[#64748B] lowercase">display_name</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-[#111] border border-[#222] rounded-none px-4 py-2 font-mono text-sm text-text-primary focus:border-[#6EE7B7] outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-[#64748B] lowercase">email</label>
                                <input type="email" value={userEmail} disabled className="w-full bg-[#0A0A0A] border border-[#222] rounded-none px-4 py-2 font-mono text-sm text-text-secondary outline-none cursor-not-allowed" />
                            </div>
                            <button
                                onClick={handleSaveProfile}
                                disabled={profileStatus !== 'idle'}
                                className={`text-xs font-mono px-6 py-2 transition-colors rounded-none mt-2 min-w-[140px] ${getButtonStyles(profileStatus)}`}
                            >
                                {getButtonContent(profileStatus, 'save_profile')}
                            </button>
                        </motion.div>
                    </motion.div>

                    <div className="w-full h-px bg-[#1A1A1A]"></div>

                    {/* Danger Zone */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-lg font-mono text-[#F87171] lowercase tracking-tight">danger_zone</h2>
                            <p className="text-[#64748B] text-xs font-mono mt-1">irreversible_actions</p>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <div className="bg-[#111] border border-[#F87171] rounded-none p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div>
                                    <h3 className="font-mono text-sm text-text-primary">Delete Account</h3>
                                    <p className="text-[#64748B] text-xs font-mono mt-1">Permanently remove your account and all data.</p>
                                </div>
                                <button className="text-xs font-mono font-bold text-[#F87171] bg-transparent hover:bg-[#F87171]/10 border border-[#F87171] px-6 py-2 transition-colors rounded-none whitespace-nowrap">
                                    delete_account
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </>
    );
};

export default Settings;
