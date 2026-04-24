import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';

interface BugReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuthStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/monitor/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    userEmail: user?.email,
                    userName: user?.name
                })
            });

            if (res.ok) {
                Swal.fire({
                    title: 'Report Sent!',
                    text: 'Our administrators have been notified. Thank you for helping us improve Clipnic.',
                    icon: 'success',
                    background: '#0D0D0D',
                    color: '#fff',
                    confirmButtonColor: '#10b981'
                });
                onClose();
                setTitle('');
                setDescription('');
            } else {
                throw new Error('Failed to send report');
            }
        } catch (err) {
            Swal.fire({
                title: 'Submission Failed',
                text: 'Could not send the report. Please try again later.',
                icon: 'error',
                background: '#0D0D0D',
                color: '#fff'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-3xl p-8 shadow-2xl"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                                <Bug className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Report a Bug</h3>
                                <p className="text-sm text-white/40">Help us crush issues in the system.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Issue Summary</label>
                                <input 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Briefly, what's wrong?"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/10"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Detailed Description</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the steps to reproduce the issue..."
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/10 h-32 resize-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !title || !description}
                                className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
