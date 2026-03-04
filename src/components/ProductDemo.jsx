import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Zap, Sparkles, Bell, CheckCircle2 } from 'lucide-react';

const fullText = "When a PR is merged to main, run tests, generate release notes, and notify the team on Slack";

const ProductDemo = () => {
    const [phase, setPhase] = useState('typing'); // typing, thinking, building, running, success
    const [typedText, setTypedText] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const [completedNodes, setCompletedNodes] = useState([0]);

    // Animation progress trackers
    const phaseRef = useRef('typing');
    const textIndexRef = useRef(0);
    const timeoutRefs = useRef([]);
    const pauseRef = useRef(false);

    const clearTimeouts = () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
    };

    const addTimeout = (fn, delay) => {
        const id = setTimeout(() => {
            if (!pauseRef.current) fn();
            // If paused, the timeout still fires but fn() does nothing. 
            // We'd need a more complex pause mechanic for exact resume, 
            // but for a looping demo, simpler is often enough, or we handle it via CSS.
            // For true JS pause, we'll keep it simple: pause stops state progression.
        }, delay);
        timeoutRefs.current.push(id);
        return id;
    };

    const startSequence = () => {
        clearTimeouts();
        setPhase('typing');
        phaseRef.current = 'typing';
        setTypedText('');
        textIndexRef.current = 0;
        setCompletedNodes([0]);

        typeCharacter();
    };

    const typeCharacter = () => {
        if (pauseRef.current) {
            addTimeout(typeCharacter, 100);
            return;
        }

        if (textIndexRef.current < fullText.length) {
            setTypedText(fullText.substring(0, textIndexRef.current + 1));
            textIndexRef.current++;
            // Random variance between 30ms and 70ms
            const delay = Math.random() * 40 + 30;
            addTimeout(typeCharacter, delay);
        } else {
            // Typing finished, wait, then click button
            addTimeout(() => {
                setPhase('thinking');
                phaseRef.current = 'thinking';

                // Thinking takes 1.5s
                addTimeout(() => {
                    setPhase('building');
                    phaseRef.current = 'building';

                    // Building takes ~1.5s for nodes to appear
                    addTimeout(() => {
                        setPhase('running');
                        phaseRef.current = 'running';
                        setCompletedNodes([0]);

                        addTimeout(() => setCompletedNodes((prev) => [...prev, 1]), 800);
                        addTimeout(() => setCompletedNodes((prev) => [...prev, 2]), 1600);
                        addTimeout(() => setCompletedNodes((prev) => [...prev, 3]), 2400);

                        // Success happens 400ms after the 4th node lights green
                        addTimeout(() => {
                            setPhase('success');
                            phaseRef.current = 'success';

                            // Success holds for 3s then loops
                            addTimeout(() => {
                                startSequence();
                            }, 3000);
                        }, 2800);
                    }, 2000); // Wait for nodes to build
                }, 1500); // Thinking duration
            }, 800); // Button click delay
        }
    };

    useEffect(() => {
        startSequence();
        return clearTimeouts;
    }, []);

    useEffect(() => {
        pauseRef.current = isPaused;
    }, [isPaused]);

    const togglePause = () => setIsPaused(!isPaused);

    // Node configuration
    const nodes = [
        { id: '1', label: 'PR Merged', icon: <GitBranch className="w-4 h-4 text-primary" />, color: 'primary', delay: 0 },
        { id: '2', label: 'Run Tests', icon: <Zap className="w-4 h-4 text-text-secondary" />, color: 'slate', delay: 300 },
        { id: '3', label: 'Generate Release Notes', icon: <Sparkles className="w-4 h-4 text-ai" />, color: 'ai', delay: 600 },
        { id: '4', label: 'Notify Slack', icon: <Bell className="w-4 h-4 text-[#F59E0B]" />, color: 'amber', delay: 900 }
    ];

    const getBorderClass = (color) => {
        switch (color) {
            case 'primary': return 'border-primary shadow-glow-primary bg-primary/10';
            case 'slate': return 'border-text-secondary shadow-[0_0_15px_rgba(100,116,139,0.2)] bg-text-secondary/10';
            case 'ai': return 'border-ai shadow-[0_0_15px_rgba(167,139,250,0.2)] bg-ai/10';
            case 'amber': return 'border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-[#F59E0B]/10';
            default: return 'border-border';
        }
    };

    return (
        <section className="py-24 bg-background w-full">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="max-w-5xl mx-auto px-6"
            >
                <div className="text-center mb-10">
                    <h3 className="text-primary font-bold text-sm tracking-widest uppercase mb-4">See it in action</h3>
                    <h2 className="text-3xl md:text-4xl font-bold">From plain English to automated pipeline — in seconds</h2>
                </div>

                <div
                    className="w-full max-w-[800px] mx-auto bg-[#0D0D0D] border border-[#222222] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer selection:bg-transparent"
                    onClick={togglePause}
                >
                    {/* Window Top Bar */}
                    <div className="h-10 bg-[#111] border-b border-[#222] flex items-center px-4 relative">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 font-mono text-xs text-text-secondary">
                            DevFlow AI — Workflow Builder
                        </div>
                        {isPaused && (
                            <div className="absolute right-4 text-xs font-mono text-error animate-pulse">
                                PAUSED
                            </div>
                        )}
                    </div>

                    {/* Progress Bar (Thinking Phase) */}
                    <div className="h-1 w-full bg-[#111] relative">
                        <AnimatePresence>
                            {phase === 'thinking' && (
                                <motion.div
                                    className="absolute top-0 left-0 h-full bg-primary shadow-glow-primary"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-8">
                        {/* Part 1: Input Area */}
                        <div className={`transition-opacity duration-500 ${phase !== 'typing' ? 'opacity-50' : 'opacity-100'}`}>
                            <label className="block text-xs text-text-secondary font-mono mb-2">Describe your workflow</label>
                            <div className="w-full bg-[#1A1A1A] border border-[#222] rounded-lg p-4 min-h-[100px] relative font-mono text-sm leading-relaxed text-[#F1F5F9]">
                                {typedText}
                                {phase === 'typing' && <span className="inline-block w-2.5 h-4 bg-primary ml-1 animate-pulse align-middle"></span>}

                                <AnimatePresence>
                                    {(phase === 'typing' && typedText === fullText) || phase !== 'typing' ? (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`absolute bottom-4 right-4 bg-primary text-background font-semibold px-4 py-2 rounded-md text-sm transition-all shadow-glow-primary ${phase === 'thinking' ? 'scale-95 shadow-[0_0_30px_rgba(110,231,183,0.6)] brightness-125' : ''}`}
                                        >
                                            Generate Pipeline →
                                        </motion.button>
                                    ) : null}
                                </AnimatePresence>
                            </div>

                            {/* AI Thinking State UI */}
                            <div className="h-8 mt-2 flex items-center">
                                <AnimatePresence>
                                    {phase === 'thinking' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-xs text-ai font-mono flex items-center gap-2"
                                        >
                                            <Sparkles className="w-3 h-3 animate-pulse" />
                                            AI is building your pipeline...
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Part 3: Pipeline Display */}
                        <div className="mt-8 border-t border-[#222] pt-12 relative min-h-[200px]">
                            {/* Pipeline Ready Badge */}
                            <AnimatePresence>
                                {completedNodes.includes(3) && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute top-4 right-0 bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-glow-primary"
                                    >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Pipeline ready — 4 steps
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center justify-between relative w-[560px] mx-auto z-10">
                                {/* Nodes & Segments in Flex Layout */}
                                {nodes.map((node, i) => {
                                    const showNode = phase === 'building' || phase === 'running' || phase === 'success';
                                    const isBuilding = phase === 'building';
                                    const segmentDelays = [0, 0.8, 1.6];

                                    return (
                                        <React.Fragment key={node.id}>
                                            <AnimatePresence>
                                                {showNode && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: isBuilding ? node.delay / 1000 : 0 }}
                                                        className="flex flex-col items-center relative w-16"
                                                    >
                                                        <div
                                                            className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all duration-300 relative z-10 shrink-0
                                                                ${completedNodes.includes(i) || phase === 'success' ? getBorderClass('primary') : getBorderClass(node.color)}
                                                                ${completedNodes.includes(i) && phase === 'running' ? `animate-[nodeGlow_1s_ease-out]` : ''}
                                                            `}
                                                        >
                                                            {completedNodes.includes(i) || phase === 'success' ? <CheckCircle2 className="w-5 h-5 text-primary" /> : node.icon}
                                                        </div>
                                                        <span className="text-[11px] leading-tight font-mono text-text-secondary absolute top-[76px] w-20 text-center left-1/2 -translate-x-1/2">{node.label}</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Line Segment between nodes */}
                                            {i < nodes.length - 1 && (
                                                <div className="flex-1 relative h-[2px] mx-2 flex items-center">
                                                    {/* Base Dashed Line Segment */}
                                                    <div className="absolute w-full border-t border-dashed border-[#333] -z-10"></div>

                                                    {/* Animated Running Line Segment */}
                                                    <AnimatePresence>
                                                        {(phase === 'running' || phase === 'success') && (
                                                            <motion.div
                                                                className="absolute h-[2px] w-full bg-primary origin-left shadow-glow-primary z-0"
                                                                initial={{ scaleX: 0 }}
                                                                animate={{ scaleX: phase === 'success' ? 1 : 1 }}
                                                                transition={{ delay: segmentDelays[i], duration: 0.7, ease: "linear" }}
                                                            >
                                                                {phase === 'running' && (
                                                                    <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-glow-primary"></div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* Success Message */}
                            <div className="h-10 mt-12 flex justify-center">
                                <AnimatePresence>
                                    {phase === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm font-medium text-primary flex items-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Workflow executed successfully
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Stat Pills underneath */}
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    {["⚡ Built in 4 seconds", "🔗 4 steps automated", "✓ Zero code written"].map((pill, i) => (
                        <div key={i} className="bg-[#111111] border border-[#222] px-4 py-1.5 rounded-full text-sm font-medium text-text-secondary">
                            {pill}
                        </div>
                    ))}
                </div>
            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes nodeGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(110, 231, 183, 0.1); transform: scale(1); filter: brightness(1); }
                    30% { box-shadow: 0 0 30px rgba(110, 231, 183, 0.8); transform: scale(1.1); filter: brightness(1.5); }
                }
            `}} />
        </section>
    );
};

export default ProductDemo;
