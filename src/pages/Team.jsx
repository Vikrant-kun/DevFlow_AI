import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Settings as SettingsIcon, Shield, GitBranch } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { TeamUpsellPopup } from '../components/TeamUpsellPopup';
const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }
};

export default function Team() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [teamData, setTeamData] = useState(null);
    const [members, setMembers] = useState([]);
    const [role, setRole] = useState(null);
    const [stats, setStats] = useState({ workflows: 0, runs: 0 });
    const [sharedWorkflows, setSharedWorkflows] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teamSlug, setTeamSlug] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');
    const [joinCode, setJoinCode] = useState('');
    useEffect(() => {
        if (!user) return;
        fetchTeamInfo();
    }, [user]);
    const fetchTeamInfo = async () => {
        setLoading(true);
        // Team API not yet implemented in new backend
        setTeamData(null);
        setRole(null);
        setLoading(false);
    };
    const handleInviteMember = async (e) => {
        e.preventDefault();
        try {
            showToast("Invite sent to " + inviteEmail, "success");
            setMembers(prev => [...prev, { id: Math.random().toString(), email: inviteEmail, role: inviteRole, status: 'pending', invited_at: new Date().toISOString() }]);
            setShowInviteModal(false);
            setInviteEmail('');
        } catch (error) { showToast("Failed to send invite", "error"); }
    };
    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Remove this member?")) return;
        setMembers(prev => prev.filter(m => m.id !== memberId));
        showToast("Member removed", "success");
    };
    const handleJoinTeam = (e) => {
        e.preventDefault();
        showToast("Invalid or expired invite code.", "error");
    };
    return (
        <div className="flex flex-col h-screen bg-[#080808] overflow-hidden">
            <TopBar title={<span className="font-mono text-xs md:text-sm text-[#6EE7B7]">~ / team</span>} />
            {!teamData && !loading && <TeamUpsellPopup />}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {loading ? (
                    <div className="min-h-full flex items-center justify-center font-mono text-[#6EE7B7] text-sm">loading team data...</div>
                ) : !teamData ? (
                    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="min-h-[80vh] flex items-center justify-center">
                        <div className="max-w-md w-full bg-[#111] border border-[#222] p-8 md:p-10 text-center relative overflow-hidden rounded-xl shadow-xl">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-[#222]" />
                            <div className="w-16 h-16 bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6 border border-[#333] rounded-xl">
                                <Users className="w-8 h-8 text-[#64748B]" />
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold font-mono text-[#F1F5F9] mb-2 lowercase tracking-tight">no_team_yet</h1>
                            <p className="text-[#64748B] font-mono text-[10px] md:text-xs mb-6 leading-relaxed">Create a shared workspace to collaborate on workflows, manage billing, and track team analytics.</p>
                            <div className="inline-flex items-center px-3 py-1.5 bg-[#A78BFA]/10 border border-[#A78BFA]/30 text-[#A78BFA] text-[9px] md:text-[10px] font-mono uppercase tracking-widest mb-8 rounded-lg shadow-[0_0_15px_rgba(167,139,250,0.15)]">
                                <Shield className="w-3 h-3 mr-1.5" /> Pro Feature
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => navigate('/upgrade')} className="w-full bg-[#A78BFA] text-[#080808] hover:bg-[#8B5CF6] font-bold font-mono text-xs py-3.5 transition-colors rounded-xl lowercase">sudo upgrade</button>
                                <button onClick={() => setShowJoinModal(true)} className="w-full border border-[#222] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] font-mono text-xs py-3.5 transition-colors rounded-xl lowercase">have_an_invite_code?</button>
                            </div>
                        </div>
                        {/* Create Team Modal */}
                        <AnimatePresence>
                            {showCreateModal && (
                                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                    <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md bg-[#111] border border-[#222] p-6 md:p-8 shadow-2xl relative rounded-xl">
                                        <button className="absolute top-4 right-4 text-[#64748B] hover:text-[#F1F5F9]" onClick={() => setShowCreateModal(false)}>✕</button>
                                        <h2 className="text-sm font-bold text-[#6EE7B7] mb-6 font-mono uppercase tracking-widest">init_team</h2>
                                        <form onSubmit={handleCreateTeam} className="space-y-5">
                                            <div>
                                                <label className="block text-[10px] font-mono text-[#64748B] mb-1.5 lowercase">team_name</label>
                                                <input type="text" required value={teamName} onChange={(e) => { setTeamName(e.target.value); setTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')); }} className="w-full bg-[#080808] border border-[#222] px-3 py-2.5 text-[#F1F5F9] font-mono text-xs focus:border-[#6EE7B7] outline-none transition-colors rounded-xl" placeholder="e.g. Acme Backend" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-[#64748B] mb-1.5 lowercase">team_slug</label>
                                                <div className="flex bg-[#080808] border border-[#222] overflow-hidden focus-within:border-[#6EE7B7] transition-colors rounded-xl">
                                                    <span className="px-3 py-2.5 text-[#64748B] font-mono text-[10px] bg-[#0D0D0D] border-r border-[#222] flex items-center">devflow.ai/team/</span>
                                                    <input type="text" required value={teamSlug} onChange={(e) => setTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))} className="w-full bg-transparent px-3 py-2.5 text-[#F1F5F9] font-mono text-xs outline-none rounded-xl" />
                                                </div>
                                            </div>
                                            <button type="submit" className="w-full mt-2 bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] font-bold font-mono text-xs py-3 transition-colors rounded-xl lowercase">Create Workspace</button>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                        {/* Join Team Modal */}
                        <AnimatePresence>
                            {showJoinModal && (
                                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                    <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-sm bg-[#111] border border-[#222] p-6 shadow-2xl relative rounded-xl">
                                        <button className="absolute top-4 right-4 text-[#64748B] hover:text-[#F1F5F9]" onClick={() => setShowJoinModal(false)}>✕</button>
                                        <h2 className="text-xs font-bold text-[#F1F5F9] mb-6 font-mono uppercase tracking-widest">join_team</h2>
                                        <form onSubmit={handleJoinTeam} className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-mono text-[#64748B] mb-1.5 lowercase">invite_code</label>
                                                <input type="text" required value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="w-full bg-[#080808] border border-[#222] px-3 py-2.5 text-[#F1F5F9] text-xs font-mono outline-none focus:border-[#6EE7B7] transition-colors rounded-xl" placeholder="XXXX-XXXX-XXXX" />
                                            </div>
                                            <button type="submit" className="w-full mt-4 border border-[#222] text-[#F1F5F9] hover:bg-[#1A1A1A] font-bold font-mono text-xs py-2.5 transition-colors rounded-xl lowercase">Authenticate</button>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-8 pb-12">
                        {/* Authenticated Team UI */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#1A1A1A]">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-xl md:text-2xl font-bold text-[#080808] shadow-lg rounded-xl border border-[#222]" style={{ backgroundColor: teamData.avatar_color }}>
                                    {teamData.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-xl md:text-3xl font-bold text-[#F1F5F9] font-mono">{teamData.name}</h1>
                                        <span className="px-2 py-0.5 text-[9px] md:text-[10px] font-mono uppercase tracking-widest bg-[#111] border border-[#222] text-[#6EE7B7] flex items-center gap-1.5 rounded-xl">
                                            {role === 'owner' && <Crown className="w-3 h-3 text-[#6EE7B7]" />}{role}
                                        </span>
                                    </div>
                                    <p className="text-[#64748B] font-mono text-[10px] md:text-xs mt-1.5">devflow.ai/team/{teamData.slug}</p>
                                </div>
                            </div>
                            {role === 'owner' && (
                                <button onClick={() => setShowInviteModal(true)} className="bg-[#111] border border-[#222] text-[#F1F5F9] hover:bg-[#1A1A1A] px-4 py-2 font-mono text-xs transition-colors rounded-xl">+ invite_member</button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[{ label: 'members', value: members.length }, { label: 'workflows', value: stats.workflows }, { label: 'runs_this_week', value: 0 }].map((s, i) => (
                                <div key={i} className="bg-[#111] border border-[#1A1A1A] p-5 flex flex-col justify-between h-24 md:h-28 rounded-xl">
                                    <span className="text-[#64748B] font-mono text-[10px] md:text-xs lowercase">{s.label}</span>
                                    <span className="text-2xl md:text-3xl font-bold text-[#F1F5F9] font-mono">{s.value}</span>
                                </div>
                            ))}
                            <div className="bg-[#111] border border-[#333] hover:border-[#6EE7B7]/50 transition-colors p-5 flex flex-col justify-between h-24 md:h-28 cursor-pointer rounded-xl relative overflow-hidden" onClick={() => navigate('/upgrade')}>
                                <span className="text-[#6EE7B7] font-mono text-[10px] md:text-xs flex items-center justify-between uppercase tracking-widest relative z-10">plan <SettingsIcon className="w-3 h-3" /></span>
                                <span className="text-2xl md:text-3xl font-bold text-[#F1F5F9] font-mono relative z-10">{teamData.plan === 'pro' ? 'Pro' : 'Max'}</span>
                            </div>
                        </div>
                        {/* Members Table */}
                        <div className="space-y-4 pt-6">
                            <h2 className="text-[10px] md:text-xs font-mono text-[#6EE7B7] uppercase tracking-widest flex items-center gap-2 px-1">
                                <Users className="w-3.5 h-3.5" /> team_members
                            </h2>
                            <div className="bg-[#111] border border-[#1A1A1A] overflow-hidden rounded-xl">
                                <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                    <table className="w-full text-left text-sm min-w-[600px]">
                                        <thead className="border-b border-[#222] bg-[#0D0D0D]">
                                            <tr>
                                                {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                                    <th key={h} className={`px-4 md:px-6 py-3 font-mono text-[10px] text-[#64748B] uppercase tracking-widest ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#222]">
                                            {members.map((member) => (
                                                <tr key={member.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                                    <td className="px-4 md:px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-7 h-7 bg-[#080808] border border-[#333] flex items-center justify-center text-[10px] font-bold text-[#F1F5F9] rounded-xl shrink-0">
                                                                {member.email.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-mono text-xs text-[#F1F5F9] flex items-center gap-2 truncate">
                                                                {member.email}
                                                                {member.role === 'owner' && <Crown className="w-3 h-3 text-[#6EE7B7] shrink-0" />}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4">
                                                        <span className={`px-2 py-1 text-[9px] md:text-[10px] font-mono border lowercase rounded-xl ${member.role === 'owner' ? 'bg-[#6EE7B7]/10 text-[#6EE7B7] border-[#6EE7B7]/20' :
                                                            member.role === 'editor' ? 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20' :
                                                                'bg-[#080808] text-[#64748B] border-[#222]'
                                                            }`}>{member.role}</span>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4">
                                                        <span className="flex items-center gap-1.5 text-[10px] md:text-xs text-[#64748B] font-mono lowercase">
                                                            <div className={`w-1.5 h-1.5 rounded-xl ${member.status === 'active' ? 'bg-[#6EE7B7]' : 'bg-[#F59E0B]'}`} />
                                                            {member.status === 'active' ? 'active' : 'awaiting'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4 text-[#64748B] font-mono text-[10px] md:text-xs">
                                                        {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4 text-right">
                                                        {role === 'owner' && member.role !== 'owner' && (
                                                            <button onClick={() => handleRemoveMember(member.id)}
                                                                className="text-[#F87171] hover:text-[#EF4444] text-[10px] font-mono border border-[#F87171]/20 hover:border-[#F87171]/50 bg-[#F87171]/5 px-2 py-1 transition-colors rounded-xl lowercase">
                                                                remove
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        {/* Invite Modal */}
                        <AnimatePresence>
                            {showInviteModal && (
                                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                    <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                                        className="w-full max-w-sm bg-[#111] border border-[#222] p-6 shadow-2xl relative rounded-xl">
                                        <button className="absolute top-4 right-4 text-[#64748B] hover:text-white" onClick={() => setShowInviteModal(false)}>✕</button>
                                        <h2 className="text-xs font-bold text-[#6EE7B7] mb-6 font-mono uppercase tracking-widest">invite_member</h2>
                                        <form onSubmit={handleInviteMember} className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-mono text-[#64748B] mb-1.5 lowercase">email_address</label>
                                                <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                                                    className="w-full bg-[#080808] border border-[#222] px-3 py-2 text-[#F1F5F9] text-xs font-mono outline-none focus:border-[#6EE7B7] transition-colors rounded-xl"
                                                    placeholder="colleague@company.com" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-[#64748B] mb-1.5 lowercase">role</label>
                                                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                                                    className="w-full bg-[#080808] border border-[#222] px-3 py-2 text-[#F1F5F9] text-xs font-mono outline-none focus:border-[#6EE7B7] transition-colors rounded-xl">
                                                    <option value="editor">Editor — can create/edit</option>
                                                    <option value="viewer">Viewer — read only</option>
                                                </select>
                                            </div>
                                            <button type="submit" className="w-full mt-4 bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] font-bold font-mono text-xs py-2.5 transition-colors rounded-xl lowercase">send_invite</button>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
