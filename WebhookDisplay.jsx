import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Copy, Check, Terminal, X } from 'lucide-react';

const webhookUrl = "https://api.devflow.ai/v1/hooks/wh_live_a9x8b7c6d5";
const curlCommand = `curl -X POST ${webhookUrl} \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer dev_sec_88f29a..." \\\n  -d '{"event": "trigger"}'`;

const WebhookDisplay = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedCurl, setCopiedCurl] = useState(false);

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        if (type === 'url') {
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } else {
            setCopiedCurl(true);
            setTimeout(() => setCopiedCurl(false), 2000);
        }
    };

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 12 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 12 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="relative w-full max-w-lg bg-[#0D0D0D] border border-[#222] rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222] bg-[#111]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 flex items-center justify-center shrink-0">
                                    <Link2 className="w-4 h-4 text-[#6EE7B7]" />
                                </div>
                                <div>
                                    <h3 className="font-mono text-xs font-bold text-[#F1F5F9] uppercase tracking-widest">Webhook_Config</h3>
                                    <span className="font-mono text-[9px] text-[#64748B] lowercase">v1.0 rest_endpoint</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center bg-[#1A1A1A] hover:bg-[#222] rounded-xl text-[#64748B] hover:text-[#F1F5F9] transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-5">
                            {/* URL */}
                            <div className="space-y-2">
                                <label className="font-mono text-[9px] text-[#64748B] uppercase tracking-[0.2em] font-bold block">
                                    Endpoint URL
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-[#111] border border-dashed border-[#222] rounded-xl px-4 py-3 font-mono text-[10px] md:text-xs text-[#F1F5F9] truncate select-all">
                                        {webhookUrl}
                                    </div>
                                    <button onClick={() => handleCopy(webhookUrl, 'url')}
                                        className="w-10 h-10 shrink-0 flex items-center justify-center bg-[#1A1A1A] border border-[#222] hover:border-[#6EE7B7] text-[#64748B] hover:text-[#6EE7B7] rounded-xl transition-all active:scale-95">
                                        {copiedUrl ? <Check className="w-4 h-4 text-[#6EE7B7]" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* cURL */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="font-mono text-[9px] text-[#64748B] uppercase tracking-[0.2em] font-bold flex items-center gap-1.5">
                                        <Terminal className="w-3 h-3" /> cURL Template
                                    </label>
                                    <button onClick={() => handleCopy(curlCommand, 'curl')}
                                        className="font-mono text-[10px] text-[#6EE7B7] hover:underline transition-all">
                                        {copiedCurl ? 'Copied ✓' : 'Copy Code'}
                                    </button>
                                </div>
                                <div className="bg-[#080808] border border-dashed border-[#222] rounded-xl p-4 overflow-x-auto">
                                    <pre className="font-mono text-[10px] md:text-[11px] leading-relaxed text-[#9CA3AF] whitespace-pre">
                                        <span className="text-[#6EE7B7]">curl</span> -X POST {webhookUrl} \{'\n'}
                                        {'  '}-H <span className="text-[#F59E0B]">"Content-Type: application/json"</span> \{'\n'}
                                        {'  '}-H <span className="text-[#F59E0B]">"Authorization: Bearer dev_sec..."</span> \{'\n'}
                                        {'  '}-d <span className="text-[#F59E0B]">{'\'{"event": "trigger"}\''}</span>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center h-8 px-3 bg-[#111] hover:bg-[#1A1A1A] border border-[#222] hover:border-[#6EE7B7]/40 text-[#64748B] hover:text-[#F1F5F9] rounded-xl font-mono text-[10px] md:text-xs transition-all shrink-0 active:scale-95 gap-1.5"
            >
                <Link2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Webhook</span>
            </button>

            {/* Portal renders modal at document.body level — escapes header z-index/overflow */}
            {createPortal(modal, document.body)}
        </>
    );
};

export default WebhookDisplay;