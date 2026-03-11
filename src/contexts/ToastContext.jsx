import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

const TOAST_DURATION = { success: 3000, error: 5000, info: 3000 };

const toastStyles = {
    success: { border: '#6EE7B7', text: '#6EE7B7', icon: CheckCircle2 },
    error: { border: '#F87171', text: '#F87171', icon: AlertCircle },
    info: { border: '#A78BFA', text: '#A78BFA', icon: Info },
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        setToasts(prev => {
            if (prev.length > 0 && prev[prev.length - 1].message === message) return prev;
            const id = Date.now() + Math.random();
            setTimeout(() => {
                setToasts(p => p.filter(t => t.id !== id));
            }, TOAST_DURATION[type] || 3000);
            return [...prev.slice(-4), { id, message, type }];
        });
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Responsive Container:
                Mobile: Top-Center (top-6 left-1/2 -translate-x-1/2)
                Desktop: Bottom-Right (md:top-auto md:bottom-6 md:right-6 md:left-auto md:translate-x-0)
            */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 md:top-auto md:bottom-6 md:right-6 md:left-auto md:translate-x-0 z-[999] flex flex-col gap-2 max-w-[90vw] sm:max-w-[320px] w-full pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => {
                        const style = toastStyles[toast.type] || toastStyles.success;
                        const Icon = style.icon;

                        // Detect mobile for animation direction
                        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

                        return (
                            <motion.div key={toast.id}
                                layout
                                // On mobile: Enter from top (-20). On Desktop: Enter from bottom (20).
                                initial={{ opacity: 0, y: isMobile ? -20 : 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl font-mono text-xs border bg-[#0D0D0D]/90 backdrop-blur-md shadow-2xl"
                                style={{ borderColor: `${style.border}40`, color: style.text, boxShadow: `0 10px 30px rgba(0,0,0,0.5)` }}>
                                <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span className="flex-1 leading-relaxed" style={{ color: '#F1F5F9' }}>{toast.message}</span>
                                <button onClick={() => dismiss(toast.id)}
                                    className="shrink-0 opacity-40 hover:opacity-100 transition-opacity"
                                    style={{ color: style.text }}>
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};