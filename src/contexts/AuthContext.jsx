import { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken, signOut } = useClerkAuth();
    const navigate = useNavigate();

    const [isGithubConnected, setIsGithubConnected] = useState(false);
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [githubLoading, setGithubLoading] = useState(false);

    const loading = !isLoaded;

    useEffect(() => {
        if (!isLoaded) return;
        if (isSignedIn) {
            checkGithubConnection();
        } else {
            setIsGithubConnected(false);
            setRepos([]);
            setSelectedRepo(null);
        }
    }, [isLoaded, isSignedIn]);

    const getAuthToken = async () => {
        return await getToken();
    };

    const checkGithubConnection = async () => {
        if (!isSignedIn) return;
        setGithubLoading(true);
        try {
            const token = await getAuthToken();
            const res = await fetch(`${API}/github/repos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIsGithubConnected(true);
                setRepos(data.repos || []);

                // Restore selected repo
                const repoRes = await fetch(`${API}/github/selected-repo`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (repoRes.ok) {
                    const repoData = await repoRes.json();
                    if (repoData.repo) setSelectedRepo(repoData.repo);
                }
            } else {
                setIsGithubConnected(false);
            }
        } catch (err) {
            console.error('GitHub connection check failed:', err);
            setIsGithubConnected(false);
        } finally {
            setGithubLoading(false);
        }
    };

    const fetchRepos = async () => {
        if (!isSignedIn) return;
        setGithubLoading(true);
        try {
            const token = await getAuthToken();
            const res = await fetch(`${API}/github/repos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRepos(data.repos || []);
            }
        } catch (err) {
            console.error('Fetch repos failed:', err);
        } finally {
            setGithubLoading(false);
        }
    };

    const connectGithubPat = async (pat) => {
        if (!isSignedIn || !pat.trim()) return;
        try {
            const test = await fetch('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${pat.trim()}` }
            });
            if (!test.ok) throw new Error('Invalid PAT');

            const token = await getAuthToken();
            await fetch(`${API}/github/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ token: pat.trim() })
            });

            setIsGithubConnected(true);
            await fetchRepos();
            return true;
        } catch (err) {
            console.error('PAT connect failed:', err);
            throw err;
        }
    };

    const handleLogout = async () => {
        await signOut();
        setIsGithubConnected(false);
        setRepos([]);
        setSelectedRepo(null);
        navigate('/');
    };

    const saveSelectedRepo = async (repo) => {
        setSelectedRepo(repo);
        if (!repo || !isSignedIn) return;
        try {
            const token = await getAuthToken();
            await fetch(`${API}/github/select-repo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ repo_full_name: repo.full_name })
            });
        } catch (e) {
            console.error('Failed to save selected repo:', e);
        }
    };

    const value = {
        user,
        session: { access_token: null }, // shim for any legacy refs
        loading,
        isSignedIn,
        isGithubConnected,
        repos,
        selectedRepo,
        saveSelectedRepo,
        githubLoading,
        connectGithubPat,
        fetchRepos,
        checkGithubConnection,
        handleLogout,
        getAuthToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);