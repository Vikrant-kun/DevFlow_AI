import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Settings as SettingsIcon, Shield, GitBranch } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

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

    const [teamName, setTeamName] = useState('');
    const [teamSlug, setTeamSlug] = useState('');

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');

    useEffect(() => {
        if (!user) return;
        fetchTeamInfo();
    }, [user]);

    const fetchTeamInfo = async () => {
        try {
            setLoading(true);
            let { data: ownedTeams } = await supabase.from('teams').select('*').eq('owner_id', user.id).limit(1);
            let myTeam = ownedTeams?.[0];
            let myRole = myTeam ? 'owner' : null;

            if (!myTeam) {
                const { data: membership } = await supabase.from('team_members').select('team_id, role, status').eq('user_id', user.id).limit(1);
                if (membership && membership.length > 0) {
                    const { data: memberTeam } = await supabase.from('teams').select('*').eq('id', membership[0].team_id).single();
                    myTeam = memberTeam;
                    myRole = membership[0].role;
                    if (membership[0].status === 'pending') {
                        await supabase.from('team_members').update({ status: 'active', joined_at: new Date().toISOString() }).eq('user_id', user.id);
                    }
                }
            }

            if (myTeam) {
                setTeamData(myTeam);
                setRole(myRole);
                await fetchMembers(myTeam.id, myTeam);
                await fetchTeamWorkflows(myTeam.id);
            } else {
                setTeamData(null);
                setRole(null);
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to load team data", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async (teamId, team) => {
        const { data } = await supabase.from('team_members').select('*').eq('team_id', teamId).order('role', { ascending: false });
        const ownerRow = {
            id: 'owner-row',
            team_id: teamId,
            user_id: team?.owner_id,
            email: user.email,
            role: 'owner',
            status: 'active',
            joined_at: team?.created_at
        };
        const filteredData = data?.filter(m => m.user_id !== team?.owner_id) || [];
        setMembers([ownerRow, ...filteredData]);
    };

    const fetchTeamWorkflows = async (teamId) => {
        const { data } = await supabase.from('workflows').select('id, name, updated_at, status').eq('team_id', teamId).order('updated_at', { ascending: false });
        setSharedWorkflows(data || []);
        setStats(prev => ({ ...prev, workflows: data?.length || 0 }));
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const colors = ['#6EE7B7', '#A78BFA', '#60A5FA', '#FBBF24', '#F472B6'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const { data, error } = await supabase.from('teams').insert({
                name: teamName,
                slug: teamSlug || teamName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                owner_id: user.id,
                avatar_color: color
            }).select().single();
            if (error) throw error;
            showToast("Team created!", "success");
            setShowCreateModal(false);
            setTeamData(data);
            setRole('owner');
            fetchTeamInfo();
        } catch (error) {
            showToast(error.message || "Failed to create team", "error");
        }
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        try {
            showToast("Invite sent to " + inviteEmail, "success");
            setMembers(prev => [...prev, {
                id: Math.random().toString(),
                email: inviteEmail,
                role: inviteRole,
                status: 'pending',
                invited_at: new Date().toISOString()
            }]);
            setShowInviteModal(false);
            setInviteEmail('');
        } catch (error) {
            showToast("Failed to send invite", "error");
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm("Remove this member?")) return;
        setMembers(prev => prev.filter(m => m.id !== memberId));
        showToast("Member removed", "success");
    };

    if (loading) {
        return <div className="min-h-[80vh] flex items-center justify-center font-mono text-[#6EE7B7] bg-[#080808]">loading team data...</div>;
    }

    if (!teamData) {
        return (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="min-h-[80vh] flex items-center justify-center py-12 px-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                        <Users className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold font-mono text-primary">no_team_yet</h1>
                    <p className="text-text-secondary text-lg">Create a team to collaborate on workflows with your squad.</p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] text-xs font-mono">
                        <Shield className="w-3 h-3 mr-2" /> Pro+ Feature
                    </div>
                    <div className="flex flex-col gap-4 mt-8">
                        <Button size="lg" className="w-full font-mono" onClick={() => setShowCreateModal(true)}>create_team</Button>
                        <Button size="lg" variant="ghost" className="w-full text-text-secondary font-mono">Have an invite code?</Button>
                    </div>
                </div>

                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                                className="w-full max-w-md bg-[#111] border border-[#1A1A1A] rounded-xl p-6 shadow-2xl relative">
                                <button className="absolute top-4 right-4 text-text-secondary hover:text-white" onClick={() => setShowCreateModal(false)}>✕</button>
                                <h2 className="text-xl font-bold text-white mb-6 font-mono">create_team</h2>
                                <form onSubmit={handleCreateTeam} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono text-text-secondary mb-1">team_name</label>
                                        <input type="text" required value={teamName}
                                            onChange={(e) => { setTeamName(e.target.value); setTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')); }}
                                            className="w-full bg-[#080808] border border-[#222] rounded-md px-3 py-2 text-white font-mono focus:border-primary outline-none"
                                            placeholder="e.g. Acme Backend" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-text-secondary mb-1">team_slug</label>
                                        <div className="flex bg-[#080808] border border-[#222] rounded-md overflow-hidden focus-within:border-primary">
                                            <span className="px-3 py-2 text-text-secondary font-mono text-sm bg-[#111] border-r border-[#222]">devflow.ai/team/</span>
                                            <input type="text" required value={teamSlug}
                                                onChange={(e) => setTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))}
                                                className="w-full bg-transparent px-3 py-2 text-white font-mono text-sm outline-none" />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full mt-4">Create Team</Button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }

    return (
        <motion.div variants={pageVariants} initial="hidden" animate="visible" className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-[#080808] shadow-lg"
                        style={{ backgroundColor: teamData.avatar_color }}>
                        {teamData.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{teamData.name}</h1>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-surface-2 border border-border text-text-secondary flex items-center gap-1.5">
                                {role === 'owner' && <Crown className="w-3 h-3 text-primary" />}{role}
                            </span>
                        </div>
                        <p className="text-[#64748B] font-mono text-sm mt-1">devflow.ai/team/{teamData.slug}</p>
                    </div>
                </div>
                {role === 'owner' && (
                    <Button onClick={() => setShowInviteModal(true)} className="font-mono text-sm">+ invite_member</Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'members', value: members.length },
                    { label: 'workflows', value: stats.workflows },
                    { label: 'runs_this_week', value: 0 },
                ].map((s, i) => (
                    <Card key={i} className="p-5 flex flex-col justify-between h-28">
                        <span className="text-text-secondary font-mono text-xs">{s.label}</span>
                        <span className="text-3xl font-bold text-white font-mono">{s.value}</span>
                    </Card>
                ))}
                <Card className="p-5 flex flex-col justify-between h-28 cursor-pointer border-[#A78BFA]/20" onClick={() => navigate('/upgrade')}>
                    <span className="text-[#A78BFA] font-mono text-xs flex items-center justify-between">plan <SettingsIcon className="w-3 h-3" /></span>
                    <span className="text-3xl font-bold text-white font-mono">{teamData.plan === 'pro' ? 'Pro' : 'Max'}</span>
                </Card>
            </div>

            {/* Members Table */}
            <div className="space-y-4 pt-6">
                <h2 className="text-base font-mono text-primary flex items-center gap-2 px-1">
                    <Users className="w-4 h-4" /> team_members
                </h2>
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-surface-2">
                                <tr>
                                    {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                        <th key={h} className={`px-6 py-4 font-mono text-xs text-text-secondary font-medium ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-surface-2/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-white">
                                                    {member.email.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-white flex items-center gap-2">
                                                    {member.email}
                                                    {member.role === 'owner' && <Crown className="w-3.5 h-3.5 text-primary" />}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-mono border ${
                                                member.role === 'owner' ? 'bg-primary/10 text-primary border-primary/20' :
                                                member.role === 'editor' ? 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20' :
                                                'bg-surface-2 text-text-secondary border-border'
                                            }`}>{member.role}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                                                <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-primary' : 'bg-[#F59E0B]'}`} />
                                                {member.status === 'active' ? 'active' : 'awaiting'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary font-mono text-xs">
                                            {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {role === 'owner' && member.role !== 'owner' && (
                                                <button onClick={() => handleRemoveMember(member.id)}
                                                    className="text-[#ef4444] hover:text-[#f87171] text-xs font-mono bg-[#ef4444]/10 px-2 py-1 rounded transition-colors">
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Shared Workflows */}
            <div className="space-y-4 pt-8">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-base font-mono text-primary flex items-center gap-2">
                        <GitBranch className="w-4 h-4" /> team_workflows
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/workflows/new?team=${teamData.id}`)} className="font-mono text-xs">
                        + new_team_workflow
                    </Button>
                </div>
                {sharedWorkflows.length === 0 ? (
                    <Card className="p-12 border-dashed flex flex-col items-center justify-center text-center">
                        <GitBranch className="w-8 h-8 text-text-secondary mb-4" />
                        <p className="text-text-primary mb-2">No shared workflows yet</p>
                        <p className="text-sm text-text-secondary mb-6">Create one and share with your team.</p>
                        <Button onClick={() => navigate(`/workflows/new?team=${teamData.id}`)}>Create shared workflow</Button>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sharedWorkflows.map(wf => (
                            <Card key={wf.id} className="p-5 cursor-pointer hover:border-text-secondary transition-colors" onClick={() => navigate(`/workflows/${wf.id}`)}>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-medium text-white">{wf.name}</h3>
                                    <div className={`w-2 h-2 rounded-full ${wf.status === 'active' ? 'bg-primary' : 'bg-text-secondary'}`} />
                                </div>
                                <div className="text-xs text-text-secondary font-mono">
                                    Last edit: {new Date(wf.updated_at).toLocaleDateString()}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                            className="w-full max-w-sm bg-[#111] border border-[#1A1A1A] rounded-xl p-6 shadow-2xl relative">
                            <button className="absolute top-4 right-4 text-text-secondary hover:text-white" onClick={() => setShowInviteModal(false)}>✕</button>
                            <h2 className="text-xl font-bold text-white mb-6 font-mono">invite_member</h2>
                            <form onSubmit={handleInviteMember} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-text-secondary mb-1">email_address</label>
                                    <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full bg-[#080808] border border-[#222] rounded-md px-3 py-2 text-white text-sm outline-none focus:border-primary"
                                        placeholder="colleague@company.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-text-secondary mb-1">role</label>
                                    <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full bg-[#080808] border border-[#222] rounded-md px-3 py-2 text-white text-sm outline-none focus:border-primary">
                                        <option value="editor">Editor — can create/edit</option>
                                        <option value="viewer">Viewer — read only</option>
                                    </select>
                                </div>
                                <Button type="submit" className="w-full mt-4">send_invite</Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
