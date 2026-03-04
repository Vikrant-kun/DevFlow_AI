import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Docs = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#080808] text-text-primary selection:bg-primary/30 flex flex-col">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                        <span>DevFlow</span>
                        <span className="text-primary text-glow-primary">AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
                        <a href="/#features" className="hover:text-text-primary transition-colors">Features</a>
                        <Link to="/about" className="hover:text-text-primary transition-colors">About</Link>
                        <Link to="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
                        <Link to="/docs" className="text-text-primary transition-colors">Docs</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/auth')}>Log in</Button>
                        <Button onClick={() => navigate('/auth')}>Sign up</Button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center pt-16 px-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="max-w-2xl w-full text-center"
                >
                    <div className="mb-6 font-mono text-sm text-[#6EE7B7] animate-pulse">
                        {`>_ docs`}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
                        Documentation is being written.
                    </h1>

                    <p className="text-lg text-[#64748B] mb-12">
                        We're documenting every feature as we build it. Check back soon.
                    </p>

                    {/* Terminal Block */}
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-left font-mono text-sm shadow-2xl mx-auto max-w-lg mb-12">
                        <div className="flex items-center gap-2 mb-4 border-b border-[#222222] pb-3">
                            <div className="w-3 h-3 rounded-full bg-[#333333]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#333333]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#333333]"></div>
                            <div className="ml-4 text-xs text-[#64748B]">terminal</div>
                        </div>

                        <div className="space-y-3">
                            <div className="flexjustify-between items-center text-[#F1F5F9]">
                                <span>writing installation guide..........</span>
                                <span className="text-[#6EE7B7]"> ✓</span>
                            </div>
                            <div className="flexjustify-between items-center text-[#F1F5F9]">
                                <span>writing API reference...............</span>
                                <span className="text-[#6EE7B7]"> ✓</span>
                            </div>
                            <div className="flexjustify-between items-center text-[#F1F5F9]">
                                <span>writing integration docs............</span>
                                <span className="text-[#F59E0B] inline-block animate-spin"> ⟳</span>
                            </div>
                            <div className="flexjustify-between items-center text-[#F1F5F9]">
                                <span>writing workflow examples...........</span>
                                <span className="text-[#64748B]"> pending</span>
                            </div>
                        </div>
                    </div>

                    <a href="https://github.com" target="_blank" rel="noreferrer">
                        <Button variant="ghost" className="gap-2">
                            Star on GitHub →
                        </Button>
                    </a>
                </motion.div>
            </main>
        </div>
    );
};

export default Docs;
