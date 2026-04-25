import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, MessageSquare, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface JoinSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignTitle: string;
    discordLink: string;
}

export const JoinSuccessModal = ({ isOpen, onClose, campaignTitle, discordLink }: JoinSuccessModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        {/* Success Header with Particle-like glow */}
                        <div className="h-48 relative flex flex-col items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent" />
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 12, delay: 0.1 }}
                                className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                            >
                                <CheckCircle size={40} className="text-white" />
                            </motion.div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full" />
                        </div>

                        <div className="px-8 pb-10 pt-4 text-center space-y-8">
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
                                    You're In! 🎉
                                </h2>
                                <p className="text-white/40 text-sm leading-relaxed max-w-[320px] mx-auto">
                                    You have successfully joined <span className="text-white/90 font-bold">{campaignTitle}</span>. 
                                    It's time to start clipping and earning.
                                </p>
                            </div>

                            {/* Discord Resources Card */}
                            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] group hover:border-[#5865F2]/40 transition-all text-left space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#5865F2]/10 flex items-center justify-center text-[#5865F2]">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#5865F2] uppercase tracking-[0.2em]">Campaign Resources</p>
                                            <h4 className="text-sm font-bold text-white/90">Discord Assets Channel</h4>
                                        </div>
                                    </div>
                                    <a 
                                        href={discordLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:bg-[#5865F2] group-hover:text-white transition-all"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                                <p className="text-[11px] text-white/20 leading-relaxed">
                                    Join the dedicated channel to access raw footage, brand kits, and connect with other clippers.
                                </p>
                                <Button
                                    onClick={() => window.open(discordLink, '_blank')}
                                    className="w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    Join Channel <ArrowRight size={14} />
                                </Button>
                            </div>

                            <button 
                                onClick={onClose}
                                className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white/40 transition-colors"
                            >
                                Continue to Dashboard
                            </button>
                        </div>

                        <button 
                            onClick={onClose} 
                            className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full z-20"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
