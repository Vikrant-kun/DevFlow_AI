import { useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

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
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
    const userEmail = user?.email || '';

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
                        <motion.div variants={itemVariants} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-[#64748B] lowercase">name</label>
                                <input type="text" defaultValue={userName} className="w-full bg-[#111] border border-[#222] rounded-none px-4 py-2 font-mono text-sm text-text-primary focus:border-[#6EE7B7] outline-none transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-[#64748B] lowercase">email</label>
                                <input type="email" defaultValue={userEmail} disabled className="w-full bg-[#0A0A0A] border border-[#222] rounded-none px-4 py-2 font-mono text-sm text-text-secondary outline-none cursor-not-allowed" />
                            </div>
                            <button className="text-xs font-mono text-[#080808] bg-[#6EE7B7] hover:bg-[#34D399] px-6 py-2 transition-colors rounded-none mt-2">
                                save_profile
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
