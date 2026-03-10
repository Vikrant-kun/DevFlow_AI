import { useState, useEffect } from 'react';
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

const Profile = () => {
    const { user, getAuthToken } = useAuth();
    const { showToast } = useToast();
    const [profileStatus, setProfileStatus] = useState('idle');

    // Form states
    const [fullName, setFullName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');

    // Stats
    const [workflowsCount, setWorkflowsCount] = useState(0);
    const [runsCount, setRunsCount] = useState(0);
    const [selectedRepo, setSelectedRepo] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '');
            setDisplayName(user.username || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || '');

            // Bio/Location/Website are traditionally in publicMetadata for Clerk
            const meta = user.publicMetadata || {};
            setBio(meta.bio || '');
            setLocation(meta.location || '');
            setWebsite(meta.website || '');

            const fetchStats = async () => {
                try {
                    const token = await getAuthToken();
                    const [wr, rr, sr] = await Promise.all([
                        fetch(`${API_URL}/workflows`, { headers: { Authorization: `Bearer ${token}` } }),
                        fetch(`${API_URL}/runs`, { headers: { Authorization: `Bearer ${token}` } }),
                        fetch(`${API_URL}/github/selected-repo`, { headers: { Authorization: `Bearer ${token}` } })
                    ]);

                    if (wr.ok) {
                        const { workflows } = await wr.json();
                        setWorkflowsCount(workflows?.length || 0);
                    }
                    if (rr.ok) {
                        const { runs } = await rr.json();
                        setRunsCount(runs?.length || 0);
                    }
                    if (sr.ok) {
                        const { repo } = await sr.json();
                        if (repo) setSelectedRepo(repo.full_name);
                    }
                } catch (err) {
                    console.error("Failed to fetch profile stats:", err);
                }
            };

            fetchStats();
        }
    }, [user, getAuthToken, API_URL]);

    const userEmail = user?.primaryEmailAddress?.emailAddress || '';
    const avatarUrl = user?.imageUrl;
    const initials = (user?.firstName || userEmail).substring(0, 1).toUpperCase() || 'U';

    let providerBadge = user?.externalAccounts?.[0]?.provider || "email";

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown';

    const lastLoginDate = user?.lastSignInAt
        ? new Date(user.lastSignInAt).toLocaleString('en-US')
        : 'Unknown';

    const handleSaveProfile = async () => {
        setProfileStatus('loading');
        try {
            // Split name if possible
            const names = fullName.split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '';

            await user.update({
                firstName,
                lastName,
                username: displayName,
                publicMetadata: {
                    bio,
                    location,
                    website
                }
            });

            setProfileStatus('success');
            showToast('Profile updated', 'success');
            setTimeout(() => setProfileStatus('idle'), 2000);
        } catch (error) {
            console.error(error);
            setProfileStatus('error');
            showToast('Failed to save — try again', 'error');
            setTimeout(() => setProfileStatus('idle'), 2000);
        }
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
        <div className="flex flex-col h-screen bg-[#080808]">
            <TopBar title={<span className="font-mono text-sm text-[#6EE7B7]">~ / profile</span>} />

            <div className="flex-1 overflow-y-auto p-8">
                <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pb-12">

                    {/* Left Column: Avatar Card */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full lg:w-[300px] shrink-0 space-y-6">
                        <motion.div variants={itemVariants} className="bg-[#111] border border-[#1A1A1A] p-6 rounded-xl text-center flex flex-col items-center">

                            <div className="w-[80px] h-[80px] shrink-0 bg-[#6EE7B7] rounded-full overflow-hidden flex items-center justify-center text-[#080808] font-mono text-3xl mb-4 uppercase relative">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>

                            <h2 className="font-mono text-lg text-white mb-1">{displayName || fullName || 'User'}</h2>
                            <p className="font-mono text-sm text-[#64748B] mb-4">{userEmail}</p>

                            <div className="bg-[#1A1A1A] text-[#6EE7B7] font-mono text-xs px-3 py-1 rounded-full mb-6">
                                {providerBadge}
                            </div>

                            <div className="w-full border-t border-[#1A1A1A] pt-6 flex justify-between px-2">
                                <div className="text-center">
                                    <div className="text-2xl font-mono text-[#6EE7B7]">{workflowsCount}</div>
                                    <div className="font-mono text-xs text-[#64748B]">workflows</div>
                                </div>
                                <div className="text-center border-l border-[#1A1A1A] pl-6">
                                    <div className="text-2xl font-mono text-[#6EE7B7]">{runsCount}</div>
                                    <div className="font-mono text-xs text-[#64748B]">runs</div>
                                </div>
                            </div>

                            <div className="w-full text-center mt-6 text-xs font-mono text-[#64748B]">
                                Member since {memberSince}
                            </div>

                        </motion.div>
                    </motion.div>

                    {/* Right Column: Forms */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 space-y-8">

                        {/* Personal Info */}
                        <motion.div variants={itemVariants} className="space-y-6 border-b border-[#1A1A1A] pb-8">
                            <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase">personal_info</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-[#64748B] lowercase">full_name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#F1F5F9] focus:border-[#6EE7B7] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-[#64748B] lowercase">display_name</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#F1F5F9] focus:border-[#6EE7B7] outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-[#64748B] lowercase">bio</label>
                                <textarea
                                    rows="3"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#F1F5F9] focus:border-[#6EE7B7] outline-none transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-[#64748B] lowercase">location</label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#F1F5F9] focus:border-[#6EE7B7] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-[#64748B] lowercase">website</label>
                                    <input
                                        type="text"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#F1F5F9] focus:border-[#6EE7B7] outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={profileStatus !== 'idle'}
                                className="bg-[#6EE7B7] hover:bg-[#34D399] text-[#080808] font-mono text-xs font-bold px-6 py-3 transition-colors mt-2 min-w-[140px] uppercase tracking-wide"
                            >
                                {getButtonContent(profileStatus, 'save_profile')}
                            </button>
                        </motion.div>

                        {/* Account Info Readonly */}
                        <motion.div variants={itemVariants} className="space-y-6 border-b border-[#1A1A1A] pb-8">
                            <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase">account_info</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-[#64748B] lowercase">email</label>
                                    <div className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#64748B] opacity-70">
                                        {userEmail}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-[#64748B] lowercase">user_id</label>
                                    <div className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#64748B] opacity-70">
                                        {user?.id?.substring(0, 8)}...
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-[#64748B] lowercase">last_login</label>
                                    <div className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#F1F5F9]">
                                        {lastLoginDate}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-[#64748B] lowercase">account_type</label>
                                    <div className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#F1F5F9] flex justify-between items-center">
                                        <span>free plan</span>
                                        <a href="/upgrade" className="text-[#6EE7B7] hover:text-[#34D399] transition-colors lowercase font-bold">upgrade →</a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* GitHub Info - Conditionally Rendered */}
                        {providerBadge === 'github' && (
                            <motion.div variants={itemVariants} className="space-y-6">
                                <h2 className="font-mono text-[#6EE7B7] text-sm tracking-widest uppercase">github_info</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-[#64748B] lowercase">github_username</label>
                                        <div className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#F1F5F9] flex justify-between items-center">
                                            <span>{user.externalAccounts?.find(acc => acc.provider === 'github')?.username || 'connected'}</span>
                                            <a
                                                href={`https://github.com/${user.externalAccounts?.find(acc => acc.provider === 'github')?.username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#6EE7B7] hover:text-[#34D399] transition-colors lowercase font-bold"
                                            >
                                                view →
                                            </a>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-[#64748B] lowercase">active_repository</label>
                                        <div className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3 font-mono text-sm text-[#F1F5F9]">
                                            {selectedRepo || <span className="text-[#64748B]">None selected</span>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
