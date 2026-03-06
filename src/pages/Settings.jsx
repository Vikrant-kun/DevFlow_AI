import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Github, Users, Crown, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const ToggleSwitch = ({ checked, onChange }) => (
    <div
        className={`w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors ${checked ? 'bg-[#6EE7B7]' : 'bg-[#333]'}`}
        onClick={() => onChange(!checked)}
    >
        <div className={`w-3 h-3 rounded-full bg-[#080808] transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
);

const Settings = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('general');

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

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordChange = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            showToast('Passwords do not match or are empty', 'error');
            return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) showToast(error.message, 'error');
        else {
            showToast('Password updated', 'success');
            setNewPassword(''); setConfirmPassword('');
        }
    };

    const handleDeleteWorkflows = async () => {
        if (!window.confirm('Delete all workflows? This cannot be undone.')) return;
        const { error } = await supabase.from('workflows').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) showToast(error.message, 'error');
        else showToast('All workflows deleted', 'success');
    };

    const handleDeleteAccount = async () => {
        const confirmStr = window.prompt("Type DELETE to confirm account deletion:");
        if (confirmStr === 'DELETE') {
            try {
                await supabase.auth.signOut();
                navigate('/');
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    };

    const [teamData, setTeamData] = useState(null);
    const [teamRole, setTeamRole] = useState(null);
    const [teamMembersCount, setTeamMembersCount] = useState(0);
    const [teamLoading, setTeamLoading] = useState(false);

    const checkTeamStatus = async () => {
        if (!user) return;
        setTeamLoading(true);
        try {
            let { data: ownedTeams } = await supabase.from('teams').select('*').eq('owner_id', user.id).limit(1);
            let myTeam = ownedTeams?.[0];
            let myRole = myTeam ? 'owner' : null;

            if (!myTeam) {
                const { data: membership } = await supabase.from('team_members').select('team_id, role, status').eq('user_id', user.id).limit(1);
                if (membership && membership.length > 0) {
                    const { data: memberTeam } = await supabase.from('teams').select('*').eq('id', membership[0].team_id).single();
                    myTeam = memberTeam;
                    myRole = membership[0].role;
                }
            }

            if (myTeam) {
                setTeamData(myTeam);
                setTeamRole(myRole);
                const { count } = await supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', myTeam.id);
                setTeamMembersCount((count || 0) + 1);
            } else {
                setTeamData(null);
                setTeamRole(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setTeamLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'team') checkTeamStatus();
    }, [activeTab, user]);

    const handleUpdateTeam = async (field, value) => {
        if (teamRole !== 'owner') return;
        try {
            const updates = { [field]: value };
            if (field === 'name') updates.slug = value.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const { error } = await supabase.from('teams').update(updates).eq('id', teamData.id);
            if (error) throw error;
            showToast(`Team ${field} updated`, 'success');
            checkTeamStatus();
        } catch (err) { showToast(err.message, 'error'); }
    };

    const handleLeaveTeam = async () => {
        if (!window.confirm("Leave this team?")) return;
        try {
            await supabase.from('team_members').delete().eq('team_id', teamData.id).eq('user_id', user.id);
            showToast("You have left the team", "success");
            setTeamData(null); setTeamRole(null);
        } catch (err) { showToast("Failed to leave team", "error"); }
    };

    const handleOwnerDeleteTeam = async () => {
        const confirmStr = window.prompt(`Type "${teamData.name}" to delete this team:`);
        if (confirmStr === teamData.name) {
            try {
                const { error } = await supabase.from('teams').delete().eq('id', teamData.id);
                if (error) throw error;
                showToast("Team deleted", "success");
                setTeamData(null); setTeamRole(null);
            } catch (err) { showToast("Failed to delete team", "error"); }
        }
    };

    const isEmailProvider = user?.app_metadata?.provider === 'email';
    const providers = user?.app_metadata?.providers || [];
    const hasGithub = providers.includes('github') || user?.app_metadata?.provider === 'github';
    const hasGoogle = providers.includes('google') || user?.app_metadata?.provider === 'google';
    const activeSessionTime = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('en-US') : 'Unknown';

    const tabs = [
        { id: 'general', label: 'general' },
        { id: 'notifications', label: 'notifications' },
        { id: 'security', label: 'security' },
        { id: 'team', label: 'team' },
        { id: 'danger_zone', label: 'danger_zone' }
    ];

    const renderGeneral = () => (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            <div className="border-b border-[#1A1A1A] pb-8">
                <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase mb-6">appearance</h2>
                <div className="flex items-center justify-between bg-[#111] border border-[#1A1A1A] p-4">
                    <div>
                        <div className="font-mono text-[#64748B] text-xs mb-1 lowercase">color_scheme</div>
                        <div className="text-xs text-[#F1F5F9] font-mono opacity-60">Light mode is coming soon — dark mode only for now</div>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
            <div className="border-b border-[#1A1A1A] pb-8">
                <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase mb-6">localization</h2>
                <div className="space-y-4">
                    <div className="bg-[#111] border border-[#1A1A1A] p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <div className="font-mono text-[#64748B] text-xs mb-1 lowercase">language</div>
                            <div className="text-xs text-[#F1F5F9] font-mono opacity-60">Your display language</div>
                        </div>
                        <select className="w-full sm:w-48 bg-[#0D0D0D] border border-[#1A1A1A] text-[#F1F5F9] font-mono text-xs p-2 outline-none focus:border-[#6EE7B7] transition-colors rounded-none">
                            <option>English</option>
                        </select>
                    </div>
                    <div className="bg-[#111] border border-[#1A1A1A] p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <div className="font-mono text-[#64748B] text-xs mb-1 lowercase">timezone</div>
                            <div className="text-xs text-[#F1F5F9] font-mono opacity-60">Automatically detected</div>
                        </div>
                        <div className="text-[#F1F5F9] font-mono text-xs border border-[#1A1A1A] bg-[#0D0D0D] px-4 py-2">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderNotifications = () => (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            <div className="border-b border-[#1A1A1A] pb-8">
                <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase mb-6">notification_preferences</h2>
                <div className="space-y-4">
                    {[
                        { id: 'email_notifications', label: 'email_notifications', desc: 'Receive email updates on pipeline runs' },
                        { id: 'pipeline_alerts', label: 'pipeline_alerts', desc: 'Get notified when a pipeline fails' },
                        { id: 'weekly_digest', label: 'weekly_digest', desc: 'Weekly summary of your workflow activity' },
                        { id: 'product_updates', label: 'product_updates', desc: 'New features and product announcements' }
                    ].map((pref) => (
                        <div key={pref.id} className="flex flex-row justify-between items-center bg-[#111] border border-[#1A1A1A] p-4">
                            <div>
                                <div className="font-mono text-[#64748B] text-xs mb-1 lowercase">{pref.label}</div>
                                <div className="text-xs text-[#F1F5F9] font-mono opacity-60">{pref.desc}</div>
                            </div>
                            <ToggleSwitch checked={prefs[pref.id]} onChange={(val) => setPrefs(p => ({ ...p, [pref.id]: val }))} />
                        </div>
                    ))}
                    <div className="pt-4">
                        <button className="bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] font-mono text-xs px-6 py-2 transition-colors font-bold uppercase tracking-wide" onClick={handleSavePrefs}>
                            save_preferences
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderTeam = () => {
        if (teamLoading) return (
            <div className="py-12 text-center font-mono text-[#6EE7B7] text-sm">loading team data...</div>
        );

        return (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
                {!teamData ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1A1A1A]">
                            <Users className="w-8 h-8 text-[#64748B]" />
                        </div>
                        <h3 className="text-lg font-bold text-white font-mono mb-2">no_team_yet</h3>
                        <p className="text-[#64748B] font-mono text-sm mb-8">Create your own team or join an existing one.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => navigate('/team')} className="bg-[#6EE7B7] text-[#080808] font-mono text-xs px-6 py-2 font-bold hover:bg-[#34D399] transition-colors">create_team</button>
                            <button onClick={() => navigate('/team')} className="text-[#64748B] hover:text-white font-mono text-xs px-6 py-2 transition-colors border border-[#1A1A1A] hover:border-[#333]">join_team</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="border-b border-[#1A1A1A] pb-8">
                            <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase mb-6">team_info</h2>
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <div className="font-mono text-[#64748B] text-xs mb-2 lowercase">team_name</div>
                                    <input type="text"
                                        className={`w-full bg-[#111] border border-[#1A1A1A] text-[#F1F5F9] font-mono text-sm p-3 outline-none transition-colors ${teamRole === 'owner' ? 'focus:border-[#6EE7B7]' : 'opacity-60 cursor-not-allowed'}`}
                                        defaultValue={teamData.name} readOnly={teamRole !== 'owner'}
                                        onBlur={(e) => { if (e.target.value !== teamData.name) handleUpdateTeam('name', e.target.value); }} />
                                </div>
                                <div>
                                    <div className="font-mono text-[#64748B] text-xs mb-2 lowercase">team_slug</div>
                                    <div className="flex bg-[#111] border border-[#1A1A1A] overflow-hidden focus-within:border-[#6EE7B7] transition-colors">
                                        <span className="px-3 py-3 text-[#64748B] font-mono text-sm bg-[#0D0D0D] border-r border-[#1A1A1A]">devflow.ai/team/</span>
                                        <input type="text"
                                            className={`w-full bg-transparent text-[#F1F5F9] font-mono text-sm p-3 outline-none ${teamRole !== 'owner' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            defaultValue={teamData.slug} readOnly={teamRole !== 'owner'}
                                            onBlur={(e) => { if (e.target.value !== teamData.slug) handleUpdateTeam('slug', e.target.value); }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-[#1A1A1A] pb-8">
                            <h2 className="font-mono text-[#A78BFA] text-sm tracking-widest uppercase mb-6 flex items-center gap-2">team_plan <Crown className="w-4 h-4" /></h2>
                            <div className="bg-[#111] border border-[#1A1A1A] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-mono text-xl text-white font-bold">{teamData.plan === 'pro' ? 'Pro' : 'Max'}</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20">Active</span>
                                    </div>
                                    <div className="font-mono text-[#64748B] text-xs">{teamMembersCount} / {teamData.plan === 'pro' ? '5' : '15'} members</div>
                                </div>
                                <button className="text-xs font-mono text-[#A78BFA] border border-[#A78BFA]/50 hover:bg-[#A78BFA]/10 px-6 py-2 transition-colors font-bold lowercase" onClick={() => navigate('/upgrade')}>
                                    upgrade_plan →
                                </button>
                            </div>
                        </div>

                        <div className="border-b border-[#1A1A1A] pb-8">
                            <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase mb-6">your_role</h2>
                            <div className="bg-[#111] border border-[#1A1A1A] p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-2.5 py-1 rounded text-xs font-mono border flex items-center gap-1.5 ${
                                        teamRole === 'owner' ? 'bg-primary/10 text-primary border-primary/20' :
                                        teamRole === 'editor' ? 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20' :
                                        'bg-[#111] text-[#64748B] border-[#1A1A1A]'
                                    }`}>
                                        {teamRole === 'owner' && <Crown className="w-3.5 h-3.5" />}
                                        {teamRole}
                                    </span>
                                </div>
                                <p className="text-sm text-[#64748B] font-mono">
                                    {teamRole === 'owner' && "Full access — manage members, billing, and all workflows"}
                                    {teamRole === 'editor' && "Can create and edit workflows, cannot manage members"}
                                    {teamRole === 'viewer' && "Read-only access to team workflows"}
                                </p>
                            </div>
                        </div>

                        {teamRole !== 'owner' ? (
                            <div className="border-b border-[#1A1A1A] pb-8">
                                <h2 className="font-mono text-[#F87171] text-sm tracking-widest uppercase mb-6">leave_team</h2>
                                <div className="bg-[#111] border border-[#F87171]/20 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="font-mono text-[#F1F5F9] text-sm lowercase">revoke_access</div>
                                        <div className="font-mono text-[#64748B] text-xs mt-1">You will lose access to all shared workflows.</div>
                                    </div>
                                    <button className="text-xs font-mono text-[#F87171] border border-[#F87171]/50 hover:bg-[#F87171]/10 px-4 py-2 transition-colors lowercase flex items-center gap-2" onClick={handleLeaveTeam}>
                                        <LogOut className="w-3.5 h-3.5" /> leave_team
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-b border-[#1A1A1A] pb-8">
                                <h2 className="font-mono text-[#F87171] text-sm tracking-widest uppercase mb-6">delete_team</h2>
                                <div className="bg-[#111] border border-[#F87171]/30 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="font-mono text-[#F1F5F9] text-sm lowercase flex items-center gap-2"><Trash2 className="w-4 h-4 text-[#F87171]" /> delete_organization</div>
                                        <div className="font-mono text-[#64748B] text-xs mt-1">Permanently delete team and all resources.</div>
                                    </div>
                                    <button className="text-xs font-mono text-[#080808] bg-[#F87171] hover:bg-[#EF4444] px-4 py-2 transition-colors font-bold lowercase" onClick={handleOwnerDeleteTeam}>
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
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            <div className="border-b border-[#1A1A1A] pb-8">
                <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase mb-6">connected_accounts</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#111] border border-[#1A1A1A]">
                        <div className="flex items-center gap-4">
                            <Github className="w-5 h-5 text-[#F1F5F9]" />
                            <div>
                                <div className="font-mono text-[#F1F5F9] text-sm lowercase">github</div>
                                {hasGithub && <div className="font-mono text-[#64748B] text-xs mt-1">{user?.email}</div>}
                            </div>
                        </div>
                        {hasGithub ? (
                            <span className="flex items-center gap-2 text-xs font-mono text-[#6EE7B7]"><span className="w-2 h-2 rounded-full bg-[#6EE7B7]"></span> Connected</span>
                        ) : (
                            <button className="text-xs font-mono text-[#F1F5F9] px-4 py-1.5 border border-[#333] hover:bg-[#222]" onClick={() => showToast('coming soon', 'info')}>Connect</button>
                        )}
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#111] border border-[#1A1A1A]">
                        <div className="flex items-center gap-4">
                            <svg className="w-5 h-5 text-[#F1F5F9]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                            </svg>
                            <div>
                                <div className="font-mono text-[#F1F5F9] text-sm lowercase">google</div>
                                {hasGoogle && <div className="font-mono text-[#64748B] text-xs mt-1">{user?.email}</div>}
                            </div>
                        </div>
                        {hasGoogle ? (
                            <span className="flex items-center gap-2 text-xs font-mono text-[#6EE7B7]"><span className="w-2 h-2 rounded-full bg-[#6EE7B7]"></span> Connected</span>
                        ) : (
                            <button className="text-xs font-mono text-[#F1F5F9] px-4 py-1.5 border border-[#333] hover:bg-[#222]" onClick={() => showToast('coming soon', 'info')}>Connect</button>
                        )}
                    </div>
                </div>
            </div>
            <div className="border-b border-[#1A1A1A] pb-8">
                <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase mb-6">active_sessions</h2>
                <div className="bg-[#111] border border-[#1A1A1A] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="font-mono text-[#F1F5F9] text-sm">Current Browser Session</div>
                        <div className="font-mono text-[#64748B] text-xs mt-1 lowercase">last active: {activeSessionTime}</div>
                    </div>
                    <button className="text-xs font-mono text-[#F1F5F9] px-4 py-2 border border-[#333] hover:bg-[#222] transition-colors" onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}>
                        Sign out all sessions
                    </button>
                </div>
            </div>
            {isEmailProvider && (
                <div className="border-b border-[#1A1A1A] pb-8">
                    <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase mb-6">change_password</h2>
                    <div className="space-y-4 max-w-sm">
                        <div>
                            <div className="font-mono text-[#64748B] text-xs mb-2 lowercase">new_password</div>
                            <input type="password" className="w-full bg-[#111] border border-[#1A1A1A] text-[#F1F5F9] font-mono text-sm p-2 outline-none focus:border-[#6EE7B7] transition-colors" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        </div>
                        <div>
                            <div className="font-mono text-[#64748B] text-xs mb-2 lowercase">confirm_password</div>
                            <input type="password" className="w-full bg-[#111] border border-[#1A1A1A] text-[#F1F5F9] font-mono text-sm p-2 outline-none focus:border-[#6EE7B7] transition-colors" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        </div>
                        <button className="bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] font-mono text-xs px-6 py-2 transition-colors font-bold mt-2" onClick={handlePasswordChange}>save_password</button>
                    </div>
                </div>
            )}
        </motion.div>
    );

    const renderDangerZone = () => (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            <div className="border-b border-[#1A1A1A] pb-8">
                <h2 className="font-mono text-[#F87171] text-sm tracking-widest uppercase mb-6">danger_zone</h2>
                <div className="font-mono text-[#F87171] text-xs mb-6 opacity-80 uppercase tracking-widest">Warning: These actions are permanent and cannot be undone.</div>
                <div className="space-y-4">
                    <div className="bg-[#111] border border-[#1A1A1A] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="font-mono text-[#F1F5F9] text-sm lowercase">delete_workflows</div>
                            <div className="font-mono text-[#64748B] text-xs mt-1">Remove all your saved workflows.</div>
                        </div>
                        <button className="text-xs font-mono text-[#F87171] border border-[#F87171] px-4 py-2 hover:bg-[#F87171]/10 transition-colors lowercase" onClick={handleDeleteWorkflows}>delete_all_workflows</button>
                    </div>
                    <div className="bg-[#111] border border-[#F87171]/30 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="font-mono text-[#F1F5F9] text-sm lowercase">terminate_account</div>
                            <div className="font-mono text-[#64748B] text-xs mt-1">Permanently remove your account and all data.</div>
                        </div>
                        <button className="text-xs font-mono text-[#080808] bg-[#F87171] hover:bg-[#EF4444] px-4 py-2 transition-colors font-bold lowercase" onClick={handleDeleteAccount}>delete_account</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="flex flex-col h-screen bg-[#080808]">
            <TopBar title={<span className="font-mono text-sm text-[#6EE7B7]">~ / settings</span>} />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-full md:w-[200px] bg-[#0D0D0D] border-r border-[#1A1A1A] flex-shrink-0 flex flex-col">
                    <div className="flex flex-col py-6">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`text-left px-6 py-3 font-mono text-sm transition-colors border-l-2 lowercase ${activeTab === tab.id ? 'border-[#6EE7B7] text-[#6EE7B7] bg-[#1A1A1A]/30' : 'border-transparent text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A]/20'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-[#080808]">
                    <div className="max-w-3xl">
                        {activeTab === 'general' && renderGeneral()}
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
