import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Github, Users, Crown, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const ToggleSwitch = ({ checked, onChange }) => (
    <div
        className={`w-10 h-5 rounded-xl flex items-center p-0.5 cursor-pointer transition-colors shrink-0 border ${checked ? 'bg-[#6EE7B7]/10 border-[#6EE7B7]' : 'bg-[#111] border-[#333]'}`}
        onClick={() => onChange(!checked)}
    >
        <div className={`w-3.5 h-3.5 rounded-xl transition-transform shadow-sm ${checked ? 'translate-x-5 bg-[#6EE7B7]' : 'translate-x-0 bg-[#64748B]'}`} />
    </div>
);

const Settings = () => {
    const { user, getAuthToken, handleLogout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const [activeTab, setActiveTab] = useState('notifications');

    const [prefs, setPrefs] = useState({
        email_notifications: true,
        pipeline_alerts: true,
        weekly_digest: false,
        product_updates: true,
    });

    useEffect(() => {
        const saved = localStorage.getItem('devflow_notification_prefs');
        if (saved) setPrefs(JSON.parse(saved));
    }, []);

    const handleSavePrefs = () => {
        localStorage.setItem('devflow_notification_prefs', JSON.stringify(prefs));
        showToast('Preferences saved', 'success');
    };

    const handlePasswordChange = () => {
        showToast('Use your account settings to change password (via Clerk)', 'info');
    };

    const handleDeleteWorkflows = async () => {
        if (!window.confirm('Delete all workflows? This cannot be undone.')) return;
        try {
            const token = await getAuthToken();
            // First fetch all workflows
            const wfRes = await fetch(`${API_URL}/workflows`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!wfRes.ok) throw new Error('Failed to fetch workflows');
            const { workflows } = await wfRes.json();

            // Delete them all in parallel
            await Promise.all(
                workflows.map(w =>
                    fetch(`${API_URL}/workflows/${w.id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(res => {
                        if (!res.ok) throw new Error(`Failed to delete workflow ${w.id}`);
                    })
                )
            );

            showToast('All workflows deleted', 'success');
        } catch (err) {
            showToast('Failed to delete workflows: ' + err.message, 'error');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmStr = window.prompt("Type DELETE to confirm account deletion:");
        if (confirmStr === 'DELETE') {
            try {
                await handleLogout();
                navigate('/');
                showToast('Logged out successfully', 'success');
            } catch (err) {
                showToast('Logout failed: ' + err.message, 'error');
            }
        } else {
            showToast('Account deletion cancelled', 'info');
        }
    };

    const [teamData, setTeamData] = useState(null);
    const [teamRole, setTeamRole] = useState(null);
    const [teamMembersCount, setTeamMembersCount] = useState(0);
    const [teamLoading, setTeamLoading] = useState(false);

    useEffect(() => {
        const checkTeamStatus = async () => {
            if (!user || activeTab !== 'team') return;
            setTeamLoading(true);
            try {
                // Team API is not yet implemented in new backend → stub for now
                setTeamData(null);
                setTeamRole(null);
                setTeamMembersCount(0);
            } catch (err) {
                console.error(err);
            } finally {
                setTeamLoading(false);
            }
        };

        checkTeamStatus();
    }, [activeTab, user]);

    const handleUpdateTeam = async (field, value) => {
        showToast("Team updates coming soon to the new API", "info");
    };

    const handleLeaveTeam = async () => {
        showToast("Team management coming soon", "info");
    };

    const handleOwnerDeleteTeam = async () => {
        showToast("Team management coming soon", "info");
    };

    // Clerk-based provider detection
    const isEmailProvider = !!user?.primaryEmailAddress;
    const hasGithub = user?.externalAccounts?.some(a => a.provider === 'github') || false;
    const hasGoogle = user?.externalAccounts?.some(a => a.provider === 'google') || false;

    const activeSessionTime = user?.lastSignInAt
        ? new Date(user.lastSignInAt).toLocaleString()
        : 'Active now';

    const tabs = [
        { id: 'notifications', label: 'notifications' },
        { id: 'security', label: 'security' },
        { id: 'team', label: 'team' },
        { id: 'danger_zone', label: 'danger_zone' }
    ];

    const renderNotifications = () => (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 md:space-y-8">
            <div className="border-b border-[#1A1A1A] pb-6 md:pb-8">
                <h2 className="font-mono text-[#6EE7B7] text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">notification_preferences</h2>
                <div className="space-y-3 md:space-y-4">
                    {[
                        { id: 'email_notifications', label: 'email_notifications', desc: 'Receive email updates on pipeline runs' },
                        { id: 'pipeline_alerts', label: 'pipeline_alerts', desc: 'Get notified when a pipeline fails' },
                        { id: 'weekly_digest', label: 'weekly_digest', desc: 'Weekly summary of your workflow activity' },
                        { id: 'product_updates', label: 'product_updates', desc: 'New features and product announcements' }
                    ].map((pref) => (
                        <div key={pref.id} className="flex flex-row justify-between items-center bg-[#111] border border-[#1A1A1A] p-4 md:p-5 gap-4 rounded-xl shadow-sm">
                            <div className="flex-1 min-w-0">
                                <div className="font-mono text-[#64748B] text-[10px] md:text-xs mb-1 lowercase truncate">{pref.label}</div>
                                <div className="text-[10px] md:text-xs text-[#F1F5F9] font-mono opacity-60 line-clamp-2 md:truncate">{pref.desc}</div>
                            </div>
                            <ToggleSwitch checked={prefs[pref.id]} onChange={(val) => setPrefs(p => ({ ...p, [pref.id]: val }))} />
                        </div>
                    ))}
                    <div className="pt-4">
                        <button className="w-full sm:w-auto bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] font-mono text-[10px] md:text-xs px-6 py-2.5 transition-colors font-bold uppercase tracking-wide rounded-xl shadow-sm" onClick={handleSavePrefs}>
                            save_preferences
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderTeam = () => {
        if (teamLoading) return (
            <div className="py-12 text-center font-mono text-[#6EE7B7] text-xs md:text-sm lowercase">loading team data...</div>
        );

        return (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 md:space-y-8">
                {!teamData ? (
                    <div className="text-center py-12 md:py-16 border border-[#1A1A1A] border-dashed bg-[#0A0A0A]/50 rounded-xl px-4 shadow-sm">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-[#111] rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#222]">
                            <Users className="w-6 h-6 md:w-8 md:h-8 text-[#64748B]" />
                        </div>
                        <h3 className="text-sm md:text-lg font-bold text-[#F1F5F9] font-mono mb-2 lowercase">no_team_yet</h3>
                        <p className="text-[#64748B] font-mono text-[10px] md:text-xs mb-6 md:mb-8">Upgrade to create or join an organization workspace.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button onClick={() => navigate('/upgrade')} className="bg-amber-500 text-[#080808] font-mono text-[10px] md:text-xs px-6 py-2.5 font-bold hover:bg-amber-600 transition-colors rounded-xl w-full sm:w-auto shadow-sm flex justify-center items-center gap-2">
                                <Crown className="w-4 h-4" /> upgrade_now
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="border-b border-[#1A1A1A] pb-6 md:pb-8">
                            <h2 className="font-mono text-[#6EE7B7] text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">team_info</h2>
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <div className="font-mono text-[#64748B] text-[10px] md:text-xs mb-1.5 lowercase">team_name</div>
                                    <input type="text"
                                        className={`w-full bg-[#111] border border-[#222] text-[#F1F5F9] font-mono text-[10px] md:text-xs p-2.5 md:p-3 rounded-xl outline-none transition-colors ${teamRole === 'owner' ? 'focus:border-[#6EE7B7]' : 'opacity-60 cursor-not-allowed'}`}
                                        defaultValue={teamData.name} readOnly={teamRole !== 'owner'}
                                        onBlur={(e) => { if (e.target.value !== teamData.name) handleUpdateTeam('name', e.target.value); }} />
                                </div>
                                <div>
                                    <div className="font-mono text-[#64748B] text-[10px] md:text-xs mb-1.5 lowercase">team_slug</div>
                                    <div className="flex bg-[#111] border border-[#222] rounded-xl overflow-hidden focus-within:border-[#6EE7B7] transition-colors">
                                        <span className="px-2 md:px-3 py-2.5 md:py-3 text-[#64748B] font-mono text-[9px] md:text-xs bg-[#0D0D0D] border-r border-[#222] flex items-center shrink-0">devflow.ai/team/</span>
                                        <input type="text"
                                            className={`w-full bg-transparent text-[#F1F5F9] font-mono text-[10px] md:text-xs p-2.5 md:p-3 outline-none ${teamRole !== 'owner' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            defaultValue={teamData.slug} readOnly={teamRole !== 'owner'}
                                            onBlur={(e) => { if (e.target.value !== teamData.slug) handleUpdateTeam('slug', e.target.value); }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-[#1A1A1A] pb-6 md:pb-8">
                            <h2 className="font-mono text-[#F1F5F9] text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6 flex items-center gap-2">team_plan <Crown className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#F59E0B]" /></h2>
                            <div className="bg-[#111] border border-[#1A1A1A] p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl shadow-sm">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                                        <span className="font-mono text-lg md:text-xl text-[#F1F5F9] font-bold">{teamData.plan === 'pro' ? 'Pro' : 'Max'}</span>
                                        <span className="px-1.5 py-0.5 rounded-xl text-[8px] md:text-[10px] uppercase tracking-wider font-mono bg-[#6EE7B7]/10 text-[#6EE7B7] border border-[#6EE7B7]/20">Active</span>
                                    </div>
                                    <div className="font-mono text-[#64748B] text-[10px] md:text-xs">{teamMembersCount} / {teamData.plan === 'pro' ? '5' : '15'} members</div>
                                </div>
                                <button className="w-full sm:w-auto text-[10px] md:text-xs font-mono text-[#60A5FA] border border-[#60A5FA]/50 hover:bg-[#60A5FA]/10 px-6 py-2.5 transition-colors font-bold lowercase rounded-xl" onClick={() => navigate('/upgrade')}>
                                    manage_plan →
                                </button>
                            </div>
                        </div>

                        <div className="border-b border-[#1A1A1A] pb-6 md:pb-8">
                            <h2 className="font-mono text-[#6EE7B7] text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">your_role</h2>
                            <div className="bg-[#111] border border-[#1A1A1A] p-4 md:p-5 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-2 md:mb-3">
                                    <span className={`px-2 py-1 rounded-xl text-[10px] md:text-xs font-mono border flex items-center gap-1.5 ${teamRole === 'owner' ? 'bg-[#6EE7B7]/10 text-[#6EE7B7] border-[#6EE7B7]/20' :
                                        teamRole === 'editor' ? 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20' :
                                            'bg-[#111] text-[#64748B] border-[#222]'
                                        }`}>
                                        {teamRole === 'owner' && <Crown className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                                        {teamRole}
                                    </span>
                                </div>
                                <p className="text-[10px] md:text-xs text-[#64748B] font-mono leading-relaxed">
                                    {teamRole === 'owner' && "Full access — manage members, billing, and all workflows"}
                                    {teamRole === 'editor' && "Can create and edit workflows, cannot manage members"}
                                    {teamRole === 'viewer' && "Read-only access to team workflows"}
                                </p>
                            </div>
                        </div>

                        {teamRole !== 'owner' ? (
                            <div className="border-b border-[#1A1A1A] pb-6 md:pb-8">
                                <h2 className="font-mono text-[#F87171] text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">leave_team</h2>
                                <div className="bg-[#111] border border-[#F87171]/20 p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl shadow-sm">
                                    <div>
                                        <div className="font-mono text-[#F1F5F9] text-[10px] md:text-sm lowercase">revoke_access</div>
                                        <div className="font-mono text-[#64748B] text-[9px] md:text-xs mt-0.5 md:mt-1">You will lose access to all shared workflows.</div>
                                    </div>
                                    <button className="w-full sm:w-auto text-[10px] md:text-xs font-mono text-[#F87171] border border-[#F87171]/50 hover:bg-[#F87171]/10 px-4 py-2.5 transition-colors lowercase flex items-center justify-center gap-2 rounded-xl" onClick={handleLeaveTeam}>
                                        <LogOut className="w-3.5 h-3.5" /> leave_team
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-b border-[#1A1A1A] pb-6 md:pb-8">
                                <h2 className="font-mono text-[#F87171] text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">delete_team</h2>
                                <div className="bg-[#111] border border-[#F87171]/30 p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl shadow-sm">
                                    <div>
                                        <div className="font-mono text-[#F1F5F9] text-[10px] md:text-sm lowercase flex items-center gap-2"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#F87171]" /> delete_organization</div>
                                        <div className="font-mono text-[#64748B] text-[9px] md:text-xs mt-0.5 md:mt-1">Permanently delete team and all resources.</div>
                                    </div>
                                    <button className="w-full sm:w-auto text-[10px] md:text-xs font-mono text-[#080808] bg-[#F87171] hover:bg-[#EF4444] px-4 py-2.5 transition-colors font-bold lowercase rounded-xl shadow-sm" onClick={handleOwnerDeleteTeam}>
                                        delete_team
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        );
    };

    const renderSecurity = () => (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 md:space-y-8">
            <div className="border-b border-[#1A1A1A] pb-6 md:pb-8">
                <h2 className="font-mono text-[#6EE7B7] text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">connected_accounts</h2>
                <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#111] border border-[#1A1A1A] rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                            <Github className="w-4 h-4 md:w-5 md:h-5 text-[#F1F5F9] shrink-0" />
                            <div className="min-w-0">
                                <div className="font-mono text-[#F1F5F9] text-[10px] md:text-sm lowercase">github</div>
                                {hasGithub && <div className="font-mono text-[#64748B] text-[9px] md:text-xs mt-0.5 md:mt-1 truncate">{user?.primaryEmailAddress?.emailAddress}</div>}
                            </div>
                        </div>
                        {hasGithub ? (
                            <span className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-xs font-mono text-[#6EE7B7] shrink-0"><span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#6EE7B7]"></span> Connected</span>
                        ) : (
                            <button className="text-[9px] md:text-xs font-mono text-[#F1F5F9] px-3 md:px-4 py-1.5 border border-[#333] hover:bg-[#222] rounded-xl shrink-0" onClick={() => showToast('coming soon', 'info')}>Connect</button>
                        )}
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#111] border border-[#1A1A1A] rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-[#F1F5F9] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                            </svg>
                            <div className="min-w-0">
                                <div className="font-mono text-[#F1F5F9] text-[10px] md:text-sm lowercase">google</div>
                                {hasGoogle && <div className="font-mono text-[#64748B] text-[9px] md:text-xs mt-0.5 md:mt-1 truncate">{user?.primaryEmailAddress?.emailAddress}</div>}
                            </div>
                        </div>
                        {hasGoogle ? (
                            <span className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-xs font-mono text-[#6EE7B7] shrink-0"><span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#6EE7B7]"></span> Connected</span>
                        ) : (
                            <button className="text-[9px] md:text-xs font-mono text-[#F1F5F9] px-3 md:px-4 py-1.5 border border-[#333] hover:bg-[#222] rounded-xl shrink-0" onClick={() => showToast('coming soon', 'info')}>Connect</button>
                        )}
                    </div>
                </div>
            </div>
            <div className="border-b border-[#1A1A1A] pb-6 md:pb-8">
                <h2 className="font-mono text-[#6EE7B7] text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">active_sessions</h2>
                <div className="bg-[#111] border border-[#1A1A1A] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl shadow-sm">
                    <div>
                        <div className="font-mono text-[#F1F5F9] text-[10px] md:text-sm">Current Browser Session</div>
                        <div className="font-mono text-[#64748B] text-[9px] md:text-xs mt-0.5 md:mt-1 lowercase">last active: {activeSessionTime}</div>
                    </div>
                    <button className="w-full sm:w-auto text-[10px] md:text-xs font-mono text-[#F1F5F9] px-4 py-2 border border-[#333] hover:bg-[#222] transition-colors rounded-xl" onClick={handleLogout}>
                        Sign out
                    </button>
                </div>
            </div>
            {isEmailProvider && (
                <div className="border-b border-[#1A1A1A] pb-6 md:pb-8">
                    <h2 className="font-mono text-[#6EE7B7] text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">change_password</h2>
                    <div className="space-y-4 max-w-sm">
                        <div>
                            <div className="font-mono text-[#64748B] text-[10px] md:text-xs mb-1.5 lowercase">new_password</div>
                            <input type="password" className="w-full bg-[#111] border border-[#222] text-[#F1F5F9] font-mono text-[10px] md:text-xs p-2.5 outline-none focus:border-[#6EE7B7] transition-colors rounded-xl shadow-sm" value={''} readOnly placeholder="Managed by Clerk" />
                        </div>
                        <button className="w-full bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] font-mono text-[10px] md:text-xs px-6 py-2.5 transition-colors font-bold mt-2 rounded-xl shadow-sm" onClick={handlePasswordChange}>
                            manage_password
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );

    const renderDangerZone = () => (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 md:space-y-8">
            <div className="border-b border-[#1A1A1A] pb-6 md:pb-8">
                <h2 className="font-mono text-[#F87171] text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">danger_zone</h2>
                <div className="font-mono text-[#F87171] text-[9px] md:text-xs mb-4 md:mb-6 opacity-80 uppercase tracking-widest leading-relaxed">Warning: These actions are permanent and cannot be undone.</div>
                <div className="space-y-4">
                    <div className="bg-[#111] border border-[#1A1A1A] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl shadow-sm">
                        <div>
                            <div className="font-mono text-[#F1F5F9] text-[10px] md:text-sm lowercase">delete_workflows</div>
                            <div className="font-mono text-[#64748B] text-[9px] md:text-xs mt-0.5 md:mt-1">Remove all your saved workflows.</div>
                        </div>
                        <button className="w-full sm:w-auto text-[10px] md:text-xs font-mono text-[#F87171] border border-[#F87171] px-4 py-2 hover:bg-[#F87171]/10 transition-colors lowercase rounded-xl" onClick={handleDeleteWorkflows}>
                            delete_all_workflows
                        </button>
                    </div>
                    <div className="bg-[#111] border border-[#F87171]/30 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl shadow-sm">
                        <div>
                            <div className="font-mono text-[#F1F5F9] text-[10px] md:text-sm lowercase">terminate_account</div>
                            <div className="font-mono text-[#64748B] text-[9px] md:text-xs mt-0.5 md:mt-1">Permanently remove your account and all data.</div>
                        </div>
                        <button className="w-full sm:w-auto text-[10px] md:text-xs font-mono text-[#080808] bg-[#F87171] hover:bg-[#EF4444] px-4 py-2 transition-colors font-bold lowercase rounded-xl shadow-sm" onClick={handleDeleteAccount}>
                            delete_account
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="flex flex-col h-screen bg-[#080808] transition-colors duration-300">
            <TopBar title={<span className="font-mono text-xs md:text-sm text-[#6EE7B7]">~ / settings</span>} />
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <div className="w-full md:w-[200px] bg-[#0D0D0D] border-b md:border-b-0 md:border-r border-[#1A1A1A] shrink-0 overflow-x-auto hidden-scrollbar">
                    <div className="flex flex-row md:flex-col py-0 md:py-6 w-max md:w-full">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`text-left px-5 py-4 md:px-6 md:py-3 font-mono text-[10px] md:text-sm transition-colors border-b-2 md:border-b-0 md:border-l-2 lowercase whitespace-nowrap ${activeTab === tab.id ? 'border-[#6EE7B7] text-[#6EE7B7] bg-[#1A1A1A]/30' : 'border-transparent text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A]/20'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080808] transition-colors duration-300">
                    <div className="max-w-3xl pb-12">
                        {activeTab === 'notifications' && renderNotifications()}
                        {activeTab === 'security' && renderSecurity()}
                        {activeTab === 'team' && renderTeam()}
                        {activeTab === 'danger_zone' && renderDangerZone()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;