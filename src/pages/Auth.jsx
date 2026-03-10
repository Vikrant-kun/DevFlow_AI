import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Zap, GitBranch, Sparkles, ArrowLeft } from "lucide-react";

const Auth = () => {

    const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
    const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

    const { isSignedIn, user } = useAuth();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const mode = searchParams.get("mode");

    const [isLogin, setIsLogin] = useState(mode === "signup" ? false : true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [completedNodes, setCompletedNodes] = useState([0]);
    const [terminalLines, setTerminalLines] = useState([]);

    const TERMINAL_SEQUENCE = [
        ">_ REQUESTING_ACCESS...",
        ">_ STATUS: UNAUTHORIZED",
        ">_ ACTION: PLEASE_SIGN_IN",
    ];

    useEffect(() => {
        let lineIdx = 0;

        const showNext = () => {
            if (lineIdx < TERMINAL_SEQUENCE.length) {
                const line = TERMINAL_SEQUENCE[lineIdx];
                lineIdx++;
                setTerminalLines((prev) => [...prev, line]);
                setTimeout(showNext, 700);
            } else {
                setTimeout(() => {
                    setTerminalLines([]);
                    lineIdx = 0;
                    setTimeout(showNext, 400);
                }, 3500);
            }
        };

        const t = setTimeout(showNext, 600);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        let step = 0;

        const intervalId = setInterval(() => {
            step = (step + 1) % 3;

            if (step === 0) setCompletedNodes([0]);
            else if (step === 1) setCompletedNodes([0, 1]);
            else setCompletedNodes([0, 1, 2]);
        }, 1500);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (mode === "signup") setIsLogin(false);
        else if (mode === "login") setIsLogin(true);
    }, [mode]);

    useEffect(() => {
        if (isSignedIn) {
            const hasOnboarded =
                localStorage.getItem("devflow_onboarded") === "true";

            if (hasOnboarded) {
                navigate("/dashboard", { replace: true });
            } else {
                navigate("/onboarding", { replace: true });
            }
        }
    }, [isSignedIn, navigate]);

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        if (!isSignInLoaded || !isSignUpLoaded) return;

        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const result = await signIn.create({
                    identifier: email,
                    password,
                });

                if (result.status === "complete") {
                    await setSignInActive({
                        session: result.createdSessionId,
                    });

                    navigate("/dashboard");
                } else {
                    setError(
                        "Sign in requires MFA or other steps not implemented."
                    );
                }
            } else {
                const result = await signUp.create({
                    emailAddress: email,
                    password,
                    firstName: fullName.split(" ")[0],
                    lastName: fullName.split(" ").slice(1).join(" "),
                });

                if (result.status === "complete") {
                    await setSignUpActive({
                        session: result.createdSessionId,
                    });

                    navigate("/onboarding");
                } else {
                    setError(
                        "Check your email for verification. (Verification flow not implemented)"
                    );
                }
            }
        } catch (err) {
            setError(err.errors ? err.errors[0].message : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider) => {
        if (isLogin) {
            signIn.authenticateWithRedirect({
                strategy: `oauth_${provider}`,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard",
            });
        } else {
            signUp.authenticateWithRedirect({
                strategy: `oauth_${provider}`,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/onboarding",
            });
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary flex relative">

            {!user && (
                <Link
                    to="/"
                    className="absolute top-4 left-4 z-50 flex items-center gap-1.5 font-mono text-xs text-[#64748B] hover:text-[#6EE7B7] transition-colors bg-[#111] border border-[#222] hover:border-[#6EE7B7]/40 px-3 py-2 rounded-xl"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Link>
            )}

            <div className="flex-1 bg-surface-1 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">

                <div className="w-full max-w-sm space-y-6">

                    <div className="flex bg-surface-2 p-1 rounded-xl mb-2 border border-border">
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${!isLogin
                                    ? "bg-surface-1 text-text-primary shadow-sm border border-border/50"
                                    : "text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            Sign up
                        </button>

                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${isLogin
                                    ? "bg-surface-1 text-text-primary shadow-sm border border-border/50"
                                    : "text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            Log in
                        </button>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
                            {isLogin ? "Welcome back" : "Create an account"}
                        </h2>
                        <p className="text-sm text-text-secondary mt-2">
                            Enter your details to proceed.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="dark"
                            className="w-full gap-2 rounded-xl"
                            onClick={() => handleOAuth("github")}
                        >
                            <Github className="h-5 w-5" />
                            Continue with GitHub
                        </Button>

                        <Button
                            variant="dark"
                            className="w-full gap-2 rounded-xl"
                            onClick={() => handleOAuth("google")}
                        >
                            Continue with Google
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-surface-1 px-2 text-text-secondary">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl p-3">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <label className="block text-sm mb-1">
                                        Full Name
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Grace Hopper"
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                        required={!isLogin}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Input
                            type="email"
                            placeholder="grace@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-[#6EE7B7] text-[#080808] font-bold rounded-xl"
                        >
                            {loading
                                ? "Processing..."
                                : isLogin
                                    ? "Log in"
                                    : "Sign up"}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Auth;