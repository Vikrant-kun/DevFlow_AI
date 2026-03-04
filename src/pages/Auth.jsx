import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Zap, GitBranch, Sparkles } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [completedNodes, setCompletedNodes] = useState([0]);

    useEffect(() => {
        let step = 0;
        const intervalId = setInterval(() => {
            step = (step + 1) % 3;
            if (step === 0) setCompletedNodes([0]);
            else if (step === 1) setCompletedNodes([0, 1]);
            else if (step === 2) setCompletedNodes([0, 1, 2]);
        }, 1500);
        return () => clearInterval(intervalId);
    }, []);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate(from, { replace: true });
            } else {
                const { error } = await supabase.auth.signUp({
                    email, password, options: { data: { full_name: fullName } }
                });
                if (error) throw error;
                navigate('/onboarding', { replace: true });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider) => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/dashboard` } });
            if (error) throw error;
        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <div className="min-h-screen bg-background text-text-primary flex">
            {/* Left Half - Animated Visualization */}
            <div className="hidden lg:flex w-1/2 bg-[#080808] border-r border-border p-12 flex-col relative overflow-hidden justify-center items-center">
                <div className="absolute top-12 left-12 flex items-center gap-2 font-bold text-2xl z-10">
                    <span>DevFlow</span>
                    <span className="text-primary text-glow-primary">AI</span>
                </div>

                <div className="flex flex-col items-center justify-center w-full relative flex-1">
                    <span className="text-xs font-mono text-text-secondary w-full text-center mb-12">Your pipeline, automated.</span>
                    <div className="relative w-[348px] h-[48px] flex justify-between items-center z-10">
                        {/* Connecting dashed lines running underneath */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] flex items-center h-0.5">
                            <svg width="100%" height="2" className="overflow-visible absolute top-0 left-0 w-full z-0">
                                <line x1="0" y1="0" x2="300" y2="0" stroke="#6EE7B7" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_1s_linear_infinite]" />
                            </svg>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-col items-center gap-4 relative">
                            <div className={`w-[48px] h-[48px] rounded-full border-2 flex items-center justify-center transition-all bg-[#080808] z-10 ${completedNodes.includes(0) ? 'border-primary bg-primary/10 animate-[glowPrimary_1.5s_ease-in-out_infinite]' : 'border-text-secondary bg-text-secondary/10'}`}>
                                <GitBranch className={`w-5 h-5 ${completedNodes.includes(0) ? 'text-primary' : 'text-text-secondary'}`} />
                            </div>
                            <span className="text-[12px] text-text-secondary font-mono absolute top-[60px] whitespace-nowrap">PR Merged</span>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.50 }} className="flex flex-col items-center gap-4 relative">
                            <div className={`w-[48px] h-[48px] rounded-full border-2 flex items-center justify-center transition-all bg-[#080808] z-10 ${completedNodes.includes(1) ? 'border-primary bg-primary/10 animate-[glowPrimary_1.5s_ease-in-out_infinite]' : 'border-text-secondary bg-text-secondary/10'}`}>
                                <Zap className={`w-5 h-5 animate-[spinLoop_3s_linear_infinite] ${completedNodes.includes(1) ? 'text-primary' : 'text-text-secondary'}`} />
                            </div>
                            <span className="text-[12px] text-text-secondary font-mono absolute top-[60px] whitespace-nowrap">Run Tests</span>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="flex flex-col items-center gap-4 relative">
                            <div className={`w-[48px] h-[48px] rounded-full border-2 flex items-center justify-center transition-all bg-[#080808] z-10 ${completedNodes.includes(2) ? 'border-ai bg-ai/10 animate-[glowAi_1.5s_ease-in-out_infinite]' : 'border-text-secondary bg-text-secondary/10'}`}>
                                <Sparkles className={`w-5 h-5 animate-[spinLoop_4s_linear_infinite] ${completedNodes.includes(2) ? 'text-ai' : 'text-text-secondary'}`} />
                            </div>
                            <span className="text-[12px] text-text-secondary font-mono absolute top-[60px] whitespace-nowrap">AI Summary</span>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute bottom-12 text-center w-full pb-10">
                    <p className="text-sm italic text-[#64748B]">"DevFlow changed how our team ships." — Engineering Lead @ TechFlow</p>
                </div>
            </div>

            {/* Right Half - Auth Form */}
            <div className="flex-1 bg-surface-1 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
                <div className="w-full max-w-sm space-y-8">

                    <div className="flex bg-surface-2 p-1 rounded-xl mb-8 border border-border">
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-surface-1 text-text-primary shadow-sm border border-border/50' : 'text-text-secondary hover:text-text-primary'}`}
                        >Sign up</button>
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-surface-1 text-text-primary shadow-sm border border-border/50' : 'text-text-secondary hover:text-text-primary'}`}
                        >Log in</button>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                        <p className="text-sm text-text-secondary mt-2">Enter your details to proceed.</p>
                    </div>

                    <div className="space-y-4">
                        <Button variant="dark" className="w-full gap-2 relative group" onClick={() => handleOAuth('github')}>
                            <Github className="h-5 w-5 group-hover:text-text-primary text-text-secondary transition-colors" /> Continue with GitHub
                        </Button>
                        <Button variant="dark" className="w-full gap-2 relative group" onClick={() => handleOAuth('google')}>
                            <svg className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface-1 px-2 text-text-secondary">Or continue with email</span></div>
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                                    <Input
                                        type="text"
                                        placeholder="Grace Hopper"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={!isLogin}
                                        isValid={fullName.length > 2}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                            <Input
                                type="email"
                                placeholder="grace@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                isValid={email.includes('@')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                isValid={password.length >= 6}
                            />
                        </div>

                        <Button type="submit" className="w-full mt-2" disabled={loading}>
                            {loading ? 'Processing...' : isLogin ? 'Log in' : 'Sign up'}
                        </Button>
                    </form>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes dash {
          to { stroke-dashoffset: -8; }
        }
        @keyframes spinLoop {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes glowPrimary {
            0%, 100% { box-shadow: 0 0 15px rgba(110,231,183,0.6); }
            50% { box-shadow: 0 0 30px rgba(110,231,183,0.6); }
        }
        @keyframes glowAi {
            0%, 100% { box-shadow: 0 0 15px rgba(167,139,250,0.6); }
            50% { box-shadow: 0 0 30px rgba(167,139,250,0.6); }
        }
      `}} />
        </div>
    );
};

export default Auth;
