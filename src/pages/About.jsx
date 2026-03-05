import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Github, Linkedin, Briefcase, Mail, Code2, Layers, Cpu, Database, LayoutTemplate } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const About = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                        <span>DevFlow</span>
                        <span className="text-primary text-glow-primary">AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
                        <a href="/#features" className="hover:text-text-primary transition-colors">Features</a>
                        <Link to="/about" className="text-primary transition-colors">About</Link>
                        <Link to="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
                        <Link to="/docs" className="hover:text-text-primary transition-colors">Docs</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="relative group">
                                <Button variant="ghost" className="gap-2">
                                    Account
                                </Button>
                                <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-[#222] rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <div className="p-1">
                                        <button onClick={() => navigate('/dashboard')} className="w-full text-left px-4 py-2 text-sm text-[#F1F5F9] hover:bg-[#222] rounded-sm transition-colors">Go to Dashboard →</button>
                                        <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#222] rounded-sm transition-colors">Sign out</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => navigate('/auth?mode=login')}>Log in</Button>
                                <Button onClick={() => navigate('/auth?mode=signup')}>Sign up</Button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-24">
                {/* Hero Section */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="max-w-3xl mx-auto px-6 pt-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-8 mb-8 shadow-glow-primary">
                        <Briefcase className="w-3 h-3" />
                        Currently open to opportunities
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
                        Built by a developer,<br /><span className="text-text-secondary">for developers.</span>
                    </h1>

                    <div className="prose prose-invert prose-lg mx-auto text-text-secondary leading-relaxed space-y-6">
                        <p>
                            I'm a final-year CS student who got tired of setting up the same deployment scripts, managing CI/CD pipelines, and writing glue code over and over again.
                        </p>
                        <p>
                            So I built DevFlow AI. It's an experiment in combining natural language processing with robust, node-based automation to give engineering teams back their most valuable asset: time.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-12">
                        <a href="https://github.com/Vikrant-kun" target="_blank" rel="noreferrer">
                            <Button variant="dark" className="gap-2 px-6">
                                <Github className="w-4 h-4" /> GitHub
                            </Button>
                        </a>
                        <a href="https://www.linkedin.com/in/vikrant-vinchurkar-9496862bb/" target="_blank" rel="noreferrer">
                            <Button variant="dark" className="gap-2 px-6">
                                <Linkedin className="w-4 h-4" /> LinkedIn
                            </Button>
                        </a>
                        <a href="mailto:vikrantvinchurkar12@gmail.com">
                            <Button variant="ghost" className="gap-2 px-6 hover:bg-surface-2 text-text-secondary">
                                <Mail className="w-4 h-4" /> Email Me
                            </Button>
                        </a>
                    </div>
                </motion.section>

                {/* Tech Stack Section */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    className="max-w-4xl mx-auto px-6 mt-32"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">Under the hood</h2>
                        <div className="h-px w-24 bg-border mx-auto"></div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { name: "React Flow", icon: LayoutTemplate },
                            { name: "Framer Motion", icon: Code2 },
                            { name: "FastAPI", icon: Layers },
                            { name: "Supabase", icon: Database },
                            { name: "Claude AI", icon: Cpu }
                        ].map((tech, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#111] border border-[#222] text-[#F1F5F9] text-sm font-medium hover:border-primary/50 transition-colors shadow-sm"
                            >
                                <tech.icon className="w-4 h-4 text-[#64748B]" />
                                {tech.name}
                            </div>
                        ))}
                    </div>
                </motion.section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-background py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-text-secondary">
                    <div className="flex items-center gap-2 font-bold text-lg mb-4 md:mb-0">
                        <span className="text-text-primary">DevFlow</span>
                        <span className="text-primary">AI</span>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
                        <a href="#" className="hover:text-text-primary transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default About;
