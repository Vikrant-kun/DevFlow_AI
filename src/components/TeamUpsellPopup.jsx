import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const TeamUpsellPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isDismissed) return;
        const timer = setTimeout(() => setIsVisible(true), 3500);
        return () => clearTimeout(timer);
    }, [isDismissed]);
    if (isDismissed) return null;
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-[calc(100%-3rem)] md:w-[340px] bg-[#111] border border-[#222] shadow-2xl z-[100] rounded-xl overflow-hidden"
                >
                    <div className="h-0.5 w-full bg-[#6EE7B7]" />
                    <div className="p-5">
                        <button onClick={() => { setIsVisible(false); setIsDismissed(true); navigate('/dashboard'); }} className="absolute top-3 right-3 text-[#64748B] hover:text-[#F1F5F9] transition-colors p-1">
                            <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-2 mb-3">
                            <Terminal className="w-4 h-4 text-[#F87171]" />
                            <span className="font-mono text-xs text-[#F87171] font-bold uppercase tracking-widest">ERR_UNAUTHORIZED</span>
                        </div>
                        <p className="font-mono text-[10px] md:text-xs text-[#64748B] mb-5 leading-relaxed">
                            {`> Access to multiplayer workspace denied.`}<br />
                            {`> Upgrade to Team tier to invite members and unlock shared execution logs.`}
                        </p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/upgrade')} className="flex-1 bg-[#6EE7B7] text-[#080808] hover:bg-[#34D399] font-mono text-[10px] md:text-xs font-bold py-2.5 transition-colors flex items-center justify-center gap-1.5 rounded-xl">
                                sudo upgrade <ArrowRight className="w-3 h-3" />
                            </button>
                            <button onClick={() => { setIsVisible(false); setIsDismissed(true); navigate('/dashboard'); }} className="px-3 py-2.5 border border-[#222] font-mono text-[10px] md:text-xs text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1A1A1A] transition-colors rounded-xl">
                                cd /home
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
