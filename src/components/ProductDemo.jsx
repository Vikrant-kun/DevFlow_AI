import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Zap, Sparkles, Bell, CheckCircle2 } from 'lucide-react';
const fullText = "When a PR is merged, generate a changelog using AI and post it to Slack";

const ProductDemo = () => {
    const [phase, setPhase] = useState('typing');
    const [typedText, setTypedText] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const [completedNodes, setCompletedNodes] = useState([0]);
    const phaseRef = useRef('typing');
    const textIndexRef = useRef(0);
    const timeoutRefs = useRef([]);
    const pauseRef = useRef(false);

    const clearTimeouts = () => { timeoutRefs.current.forEach(clearTimeout); timeoutRefs.current = []; };
    const addTimeout = (fn, delay) => {
        const id = setTimeout(() => { if (!pauseRef.current) fn(); }, delay);
        timeoutRefs.current.push(id);
        return id;
    };
    const startSequence = () => {
        clearTimeouts();
        setPhase('typing'); phaseRef.current = 'typing';
        setTypedText(''); textIndexRef.current = 0;
        setCompletedNodes([0]);
        typeCharacter();
    };
    const typeCharacter = () => {
        if (pauseRef.current) { addTimeout(typeCharacter, 100); return; }
        if (textIndexRef.current < fullText.length) {
            setTypedText(fullText.substring(0, textIndexRef.current + 1));
            textIndexRef.current++;
            // 25% faster: was 60-140ms, now 45-105ms
            addTimeout(typeCharacter, Math.random() * 60 + 45);
        } else {
            // Reduced delay from 1600ms to 800ms before showing "thinking"
            addTimeout(() => {
                setPhase('thinking'); phaseRef.current = 'thinking';
                // Reduced from 3000ms to 2000ms before "building"
                addTimeout(() => {
                    setPhase('building'); phaseRef.current = 'building';
                    // Reduced from 4000ms to 300ms before "running"
                    addTimeout(() => {
                        setPhase('running'); phaseRef.current = 'running';
                        setCompletedNodes([0]);
                        // Node completion is now tied to when the animated line REACHES the node
                        // Line segment duration: 0.5s each. Delays: 0, 0.6, 1.2 (matching segmentDelays below)
                        addTimeout(() => setCompletedNodes(p => [...p, 1]), 1100); // segment 0 done at 0.5s + a tiny buffer
                        addTimeout(() => setCompletedNodes(p => [...p, 2]), 1700); // segment 1 done at 0.5+0.6=1.1s
                        addTimeout(() => setCompletedNodes(p => [...p, 3]), 2300); // segment 2 done at 0.5+1.2=1.7s
                        addTimeout(() => {
                            setPhase('success'); phaseRef.current = 'success';
                            addTimeout(startSequence, 5000);
                        }, 3200);
                    }, 300);
                }, 2000);
            }, 800);
        }
    };
    useEffect(() => { startSequence(); return clearTimeouts; }, []);
    useEffect(() => { pauseRef.current = isPaused; }, [isPaused]);

    const nodes = [
        { id: '1', label: 'PR Merged', icon: <GitBranch className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#6EE7B7]" />, color: 'primary', delay: 0 },
        { id: '2', label: 'Run Tests', icon: <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#64748B]" />, color: 'slate', delay: 200 },
        { id: '3', label: 'Rel. Notes', icon: <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#F1F5F9]" />, color: 'ai', delay: 400 },
        { id: '4', label: 'Notify Slack', icon: <Bell className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#F59E0B]" />, color: 'amber', delay: 600 },
    ];
    const getBorderClass = (color) => ({
        primary: 'border-[#6EE7B7] bg-[#6EE7B7]/10',
        slate: 'border-[#64748B] bg-[#64748B]/10',
        ai: 'border-[#F1F5F9] bg-[#F1F5F9]/10',
        amber: 'border-[#F59E0B] bg-[#F59E0B]/10',
    }[color] || 'border-[#222]');

    // Segment animation delays — used for both the line AND node completion timing above
    const segmentDelays = [0, 0.6, 1.2];
    // Line segment duration (keep in sync with addTimeout node completion above)
    const segmentDuration = 0.5;

    return (
        <div className="w-full max-w-4xl mx-auto bg-[#0A0A0A] border border-[#222] rounded-2xl shadow-2xl overflow-hidden cursor-pointer" onClick={() => setIsPaused(p => !p)}>
            {/* Title Bar */}
            <div className="h-9 md:h-10 bg-[#111] border-b border-[#222] flex items-center px-3 md:px-4 relative shrink-0">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 font-mono text-[10px] md:text-xs text-[#64748B] whitespace-nowrap">
                    DevFlow AI — Workflow Builder
                </div>
            </div>

            {/* Progress line */}
            <div className="h-0.5 w-full bg-[#111] relative">
                <AnimatePresence>
                    {phase === 'thinking' && (
                        <motion.div className="absolute inset-0 bg-[#6EE7B7]" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 md:p-8">
                {/* Prompt box - fades to 40% opacity after typing */}
                <div className={`transition-opacity duration-500 max-w-3xl mx-auto ${phase !== 'typing' ? 'opacity-40' : 'opacity-100'}`}>
                    <div className="w-full bg-[#111] border border-[#222] rounded-2xl p-4 md:p-6 pb-12 md:pb-14 min-h-[80px] md:min-h-[110px] relative font-mono text-xs md:text-sm leading-relaxed text-[#F1F5F9]">
                        {typedText}
                        {phase === 'typing' && <span className="inline-block w-2 h-3.5 md:h-4 bg-[#6EE7B7] ml-0.5 animate-pulse align-middle" />}
                        <AnimatePresence>
                            {((phase === 'typing' && typedText === fullText) || phase !== 'typing') && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`absolute bottom-3 right-3 bg-[#6EE7B7] text-[#080808] font-mono font-bold px-3 py-1.5 rounded-lg text-[10px] md:text-xs`}>
                                    Generate →
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="h-6 mt-2 flex items-center">
                        <AnimatePresence>
                            {phase === 'thinking' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-[10px] md:text-xs text-[#F1F5F9] flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 animate-pulse text-[#6EE7B7]" /> AI is building your pipeline...
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Pipeline nodes — fixed height container prevents layout jump */}
                <div className="mt-6 md:mt-10 border-t border-[#222] pt-8 md:pt-12 relative min-h-[140px] md:min-h-[160px]">
                    <AnimatePresence>
                        {completedNodes.includes(3) && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="absolute top-[-36px] right-0 bg-[#6EE7B7]/10 border border-[#6EE7B7]/30 text-[#6EE7B7] px-3 py-1 rounded-full font-mono text-[10px] md:text-xs flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> 4 steps ready
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="max-w-2xl mx-auto px-2 md:px-0">
                        <div className="flex items-start w-full mt-2 min-h-[100px]">
                            {nodes.map((node, i) => {
                                const show = ['building', 'running', 'success'].includes(phase);
                                const done = completedNodes.includes(i) || phase === 'success';
                                return (
                                    <React.Fragment key={node.id}>
                                        <div className="flex flex-col items-center shrink-0 w-[56px] md:w-[72px]">
                                            <AnimatePresence>
                                                {show && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 14 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: phase === 'building' ? node.delay / 1000 : 0 }}
                                                        className="flex flex-col items-center w-full"
                                                    >
                                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-200 ${done ? 'border-[#6EE7B7] bg-[#6EE7B7]/10 shadow-[0_0_12px_rgba(110,231,183,0.35)]' : getBorderClass(node.color)}`}>
                                                            {done ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#6EE7B7]" /> : node.icon}
                                                        </div>
                                                        <span className="font-mono text-[9px] md:text-[10px] text-[#64748B] mt-2 text-center leading-tight w-full">
                                                            {node.label}
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        {i < nodes.length - 1 && (
                                            <div className="flex-1 relative flex items-center mt-6 md:mt-7 mx-1 md:mx-3">
                                                <div className="w-full border-t-2 border-dashed border-[#333]" />
                                                <AnimatePresence>
                                                    {['running', 'success'].includes(phase) && (
                                                        <motion.div
                                                            className="absolute top-0 left-0 h-0.5 w-full bg-[#6EE7B7] origin-left shadow-[0_0_8px_#6EE7B7]"
                                                            initial={{ scaleX: 0 }}
                                                            animate={{ scaleX: 1 }}
                                                            transition={{ delay: segmentDelays[i], duration: segmentDuration, ease: 'linear' }}
                                                        />
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProductDemo;