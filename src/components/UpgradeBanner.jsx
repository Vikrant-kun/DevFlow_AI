import { motion } from 'framer-motion';
import { Shield, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UpgradeBanner = ({ onClose }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // FIXED: Use inset-x-4 for mobile stability and md:left-1/2 for desktop centering
            className="fixed bottom-6 inset-x-4 md:bottom-8 md:left-1/2 md:-translate-x-1/2 z-[300] md:w-full md:max-w-2xl"
        >
            <div className="bg-[#111] border border-[#A78BFA]/30 rounded-2xl p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden relative">
                {/* Visual Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A78BFA] via-[#8B5CF6] to-[#A78BFA]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6">
                    {/* Content Section */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#A78BFA]" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-mono text-xs md:text-sm font-bold text-[#F1F5F9] uppercase tracking-widest">protocol_restricted</h3>
                            <p className="font-mono text-[10px] md:text-xs text-[#64748B] mt-0.5">Multi-user collaboration requires a Pro subscription.</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-[#222] font-mono text-[9px] md:text-[10px] font-bold text-[#444] hover:text-[#F1F5F9] transition-all uppercase"
                        >
                            dismiss
                        </button>
                        <button
                            onClick={() => navigate('/upgrade')}
                            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#A78BFA] text-[#080808] font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-[#8B5CF6] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(167,139,250,0.2)]"
                        >
                            <Zap className="w-3 h-3" />
                            elevate_access
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};