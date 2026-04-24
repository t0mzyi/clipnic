import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pointer-events-auto min-w-[320px] bg-[#0D0D0D]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-white/5 ${
                                toast.type === 'success' ? 'text-emerald-400' : 
                                toast.type === 'error' ? 'text-red-400' : 'text-blue-400'
                            }`}>
                                {toast.type === 'success' && <CheckCircle2 size={18} />}
                                {toast.type === 'error' && <XCircle size={18} />}
                                {toast.type === 'info' && <Info size={18} />}
                            </div>
                            <p className="text-sm font-medium text-white/90">{toast.message}</p>
                        </div>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="text-white/20 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
