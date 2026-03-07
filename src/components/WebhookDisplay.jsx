import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Copy, Check, Terminal, X } from 'lucide-react';

const WebhookDisplay = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedCurl, setCopiedCurl] = useState(false);

    const webhookUrl = "https://api.devflow.ai/v1/hooks/wh_live_a9x8b7c6d5";
    const curlCommand = `curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer dev_sec_88f29a..." \\
  -d '{"event": "external_trigger", "workflow_name": "PR Auto-test"}'`;

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

    return (
        <>
            {/* The Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-9 h-9 md:w-auto md:px-3 md:py-1.5 bg-[#111] hover:bg-[#1A1A1A] border border-[#222] hover:border-[#6EE7B7]/40 text-[#64748B] hover:text-[#F1F5F9] rounded-xl font-mono text-xs transition-all shrink-0 shadow-lg"
            >
                <Link2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                <span className="hidden md:inline ml-2">Get Webhook</span>
            </button>

            {/* THE FIX: Moved to portal-like fixed positioning at the highest z-index */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center pointer-events-none">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Content Card */}
                        <motion.div
                            className="relative w-full md:max-w-lg bg-[#0D0D0D] border-t md:border border-[#222] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] md:shadow-2xl overflow-hidden flex flex-col pointer-events-auto rounded-t-[32px] md:rounded-2xl max-h-[90vh]"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-[#222] bg-[#111] shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#6EE7B7]/10 flex items-center justify-center border border-[#6EE7B7]/20">
                                        <Link2 className="w-5 h-5 text-[#6EE7B7]" />
                                    </div>
                                    <div>
                                        <h3 className="font-mono text-sm font-bold text-[#F1F5F9]">Webhook Config</h3>
                                        <p className="font-mono text-[10px] text-[#64748B]">REST API trigger endpoint</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="bg-[#1A1A1A] p-2 rounded-full text-[#64748B] hover:text-[#F1F5F9] transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-8 overflow-y-auto hidden-scrollbar">
                                {/* URL Section */}
                                <div className="space-y-3">
                                    <label className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest font-bold">Endpoint</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 font-mono text-xs text-[#F1F5F9] truncate">
                                            {webhookUrl}
                                        </div>
                                        <button
                                            onClick={() => handleCopy(webhookUrl, 'url')}
                                            className="flex items-center justify-center w-12 h-12 shrink-0 bg-[#6EE7B7] hover:bg-[#34D399] text-[#080808] rounded-xl transition-all active:scale-95"
                                        >
                                            {copiedUrl ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* cURL Section */}
                                <div className="space-y-3 pb-4">
                                    <div className="flex items-center justify-between">
                                        <label className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest font-bold flex items-center gap-2">
                                            <Terminal className="w-3.5 h-3.5" /> Terminal Snippet
                                        </label>
                                        <button
                                            onClick={() => handleCopy(curlCommand, 'curl')}
                                            className="font-mono text-[10px] text-[#6EE7B7] hover:underline"
                                        >
                                            {copiedCurl ? 'Copied to clipboard' : 'Copy cURL'}
                                        </button>
                                    </div>
                                    <div className="bg-[#080808] border border-[#222] rounded-2xl p-5 overflow-x-auto border-dashed">
                                        <pre className="font-mono text-[11px] leading-relaxed text-[#9CA3AF] whitespace-pre">
                                            <span className="text-[#6EE7B7]">curl</span> -X POST {webhookUrl} \{"\n"}
                                            {'  '}-H <span className="text-[#F59E0B]">"Content-Type: application/json"</span> \{"\n"}
                                            {'  '}-H <span className="text-[#F59E0B]">"Authorization: Bearer dev_sec..."</span> \{"\n"}
                                            {'  '}-d <span className="text-[#F59E0B]">'{"{"}"event": "trigger"{"}"}'</span>
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default WebhookDisplay;