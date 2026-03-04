import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Github, Rocket, Zap, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [teamSize, setTeamSize] = useState('');
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const navigate = useNavigate();

    const handleNext = () => setStep(s => Math.min(s + 1, 3));
    const handleComplete = () => navigate('/dashboard');

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl">

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between mb-2">
                        {[1, 2, 3].map((i) => (
                            <span key={i} className={`text-sm font-medium ${step >= i ? 'text-primary' : 'text-text-secondary'}`}>
                                Step {i}
                            </span>
                        ))}
                    </div>
                    <div className="h-2 bg-surface-2 rounded-full overflow-hidden flex">
                        <motion.div
                            className="h-full bg-primary shadow-glow-primary"
                            initial={{ width: '33%' }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                <div className="bg-surface-1 border border-border rounded-2xl p-8 shadow-sm overflow-hidden relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 max-w-md"
                            >
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Welcome to DevFlow.</h2>
                                    <p className="text-text-secondary">Let&apos;s set up your workspace.</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Full name</label>
                                        <Input placeholder="Engineering Team" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Team name</label>
                                        <Input placeholder="Acme Corp" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Team size</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Just me', '2-5', '6-20', '20+'].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setTeamSize(size)}
                                                    className={`py-2 px-4 rounded-lg border text-sm transition-all text-left ${teamSize === size
                                                            ? 'border-primary bg-primary/10 text-primary shadow-glow-primary'
                                                            : 'border-border bg-surface-2 text-text-secondary hover:border-text-secondary'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleNext} disabled={!teamSize}>Next step</Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 flex flex-col items-center text-center py-8"
                            >
                                <div className="w-16 h-16 bg-surface-2 border border-border rounded-2xl flex items-center justify-center mb-2 shadow-sm">
                                    <Github className="h-8 w-8 text-text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Connect GitHub</h2>
                                    <p className="text-text-secondary max-w-sm mx-auto">Connect GitHub to start automating your pipelines and reviewing pull requests.</p>
                                </div>

                                <div className="w-full max-w-md pt-4">
                                    <Button variant="primary" className="w-full py-6 text-lg gap-3" onClick={handleNext}>
                                        <Github className="h-5 w-5" /> Connect GitHub
                                    </Button>
                                    <button onClick={handleNext} className="mt-6 text-sm text-text-secondary hover:text-text-primary transition-colors">
                                        Skip for now
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold mb-2">What would you like to automate first?</h2>
                                    <p className="text-text-secondary">Select a template to kickstart your first workflow.</p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'deploy', icon: Rocket, title: 'Deploy Pipeline', desc: 'Auto-deploy on merge to main' },
                                        { id: 'review', icon: Zap, title: 'Code Review Automation', desc: 'AI reviews for every PR' },
                                        { id: 'notes', icon: FileText, title: 'Release Notes Generator', desc: 'Auto-draft release notes' },
                                    ].map((tpl) => (
                                        <Card
                                            key={tpl.id}
                                            hoverEffect
                                            onClick={() => setSelectedWorkflow(tpl.id)}
                                            className={`p-5 cursor-pointer flex flex-col items-center text-center transition-all ${selectedWorkflow === tpl.id ? 'border-primary ring-1 ring-primary shadow-glow-primary' : ''
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${selectedWorkflow === tpl.id ? 'bg-primary/20 text-primary' : 'bg-surface-2 text-text-secondary'
                                                }`}>
                                                <tpl.icon className="h-6 w-6" />
                                            </div>
                                            <h3 className="font-semibold text-sm mb-1">{tpl.title}</h3>
                                            <p className="text-xs text-text-secondary">{tpl.desc}</p>
                                        </Card>
                                    ))}
                                </div>

                                <div className="pt-8 flex justify-center">
                                    <Button size="lg" onClick={handleComplete} disabled={!selectedWorkflow}>
                                        Create my first workflow
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
