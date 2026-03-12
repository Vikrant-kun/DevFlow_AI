import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser, useAuth as useClerkAuth, useSession } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../lib/apiRoutes';

const AuthContext = createContext();
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken, signOut } = useClerkAuth();
    const { session } = useSession();
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

    const cachedToken = useRef(null);
    const tokenExpiry = useRef(0);

    const getAuthToken = async () => {
        const now = Date.now();

        if (cachedToken.current && now < tokenExpiry.current) {
            return cachedToken.current;
        }

        const token = await session?.getToken({ template: undefined, skipCache: true });

        cachedToken.current = token;
        tokenExpiry.current = now + 60000; // cache for 60 seconds

        return token;
    };

    const checkGithubConnection = async () => {
        if (!isSignedIn) return;
        setGithubLoading(true);
        try {
            const data = await apiFetch(API_ROUTES.githubRepos, {}, getAuthToken);
            if (data) {
                setIsGithubConnected(true);
                setRepos(data.repos || []);

                // Restore selected repo
                const repoData = await apiFetch(API_ROUTES.githubSelectedRepo, {}, getAuthToken);
                if (repoData && repoData.repo) setSelectedRepo(repoData.repo);
            } else {
                setIsGithubConnected(false);
            }
        } catch (err) {
            if (!err.message.includes("GitHub not connected")) {
                console.error("GitHub check failed:", err);
            }
            setIsGithubConnected(false);
        } finally {
            setGithubLoading(false);
        }
    };

    const fetchRepos = async () => {
        if (!isSignedIn) return;
        setGithubLoading(true);
        try {
            const data = await apiFetch(API_ROUTES.githubRepos, {}, getAuthToken);
            if (data) {
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

            await apiFetch('/github/token/', {
                method: 'POST',
                body: JSON.stringify({ token: pat.trim() })
            }, getAuthToken);

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
            await apiFetch(API_ROUTES.githubSelectRepo, {
                method: 'POST',
                body: JSON.stringify({ repo_full_name: repo.full_name })
            }, getAuthToken);
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