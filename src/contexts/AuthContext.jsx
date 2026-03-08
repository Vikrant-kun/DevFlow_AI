// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // GitHub-specific state — shared across Dashboard & Integrations
    const [isGithubConnected, setIsGithubConnected] = useState(false);
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [githubLoading, setGithubLoading] = useState(false); // for spinners

    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            if (session?.user) checkGithubConnection(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) checkGithubConnection(session);
            } else if (event === 'SIGNED_OUT') {
                setIsGithubConnected(false);
                setRepos([]);
                setSelectedRepo(null);
                navigate('/');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const checkGithubConnection = async (currentSession = session) => {
        if (!currentSession?.user) return;

        setGithubLoading(true);
        try {
            const { data: settings } = await supabase
                .from('user_settings')
                .select('github_token, selected_repo, selected_repo_full_name')
                .eq('user_id', currentSession.user.id)
                .maybeSingle();

            const oauthConnected =
                currentSession.user?.app_metadata?.provider === 'github' ||
                currentSession.user?.app_metadata?.providers?.includes('github');

            const connected = oauthConnected || !!settings?.github_token;

            setIsGithubConnected(connected);

            if (connected) {
                // Restore selected repo
                if (settings?.selected_repo_full_name || settings?.selected_repo) {
                    setSelectedRepo({
                        name: settings.selected_repo || settings.selected_repo_full_name.split('/')[1],
                        full_name: settings.selected_repo_full_name || settings.selected_repo,
                    });
                }
                await fetchRepos(currentSession);
            }
        } catch (err) {
            console.error('GitHub connection check failed:', err);
        } finally {
            setGithubLoading(false);
        }
    };

    const fetchRepos = async (currentSession = session) => {
        if (!currentSession) return;
        setGithubLoading(true);
        try {
            let res;
            // Prefer backend (handles PAT securely)
            res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/github/repos`, {
                headers: { Authorization: `Bearer ${currentSession.access_token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setRepos(data.repos || []);
            } else if (currentSession.provider_token) {
                // Fallback direct (OAuth case)
                const ghRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', {
                    headers: { Authorization: `Bearer ${currentSession.provider_token}` },
                });
                if (ghRes.ok) setRepos(await ghRes.json());
            }
        } catch (err) {
            console.error('Fetch repos failed:', err);
        } finally {
            setGithubLoading(false);
        }
    };

    const connectGithubPat = async (pat) => {
        if (!user || !pat.trim()) return;
        try {
            // Test token
            const test = await fetch('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${pat.trim()}` },
            });
            if (!test.ok) throw new Error('Invalid PAT');

            // Save via backend (preferred)
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/github/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ token: pat.trim() }),
            });

            // Backup in Supabase
            await supabase.from('user_settings').upsert({
                user_id: user.id,
                github_token: pat.trim(),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            setIsGithubConnected(true);
            await fetchRepos();
            return true;
        } catch (err) {
            console.error('PAT connect failed:', err);
            throw err;
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsGithubConnected(false);
        setRepos([]);
        setSelectedRepo(null);
        navigate('/');
    };

    const value = {
        session,
        user,
        loading,
        isGithubConnected,
        repos,
        selectedRepo,
        setSelectedRepo,
        githubLoading,
        connectGithubPat,
        fetchRepos,
        checkGithubConnection,
        handleLogout, // expose so Sidebar can use it
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);