import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-6 text-center text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-2xl w-full space-y-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10 shadow-2xl rotate-3"
                >
                    <Construction size={40} className="text-emerald-400" />
                </motion.div>

                <div className="space-y-6">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display text-5xl md:text-7xl tracking-tighter leading-none uppercase italic"
                    >
                        Protocol <br /> 
                        <span className="text-emerald-400">Under Development</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-sans opacity-40 text-lg md:text-xl font-light max-w-md mx-auto leading-relaxed"
                    >
                        This sector of the Clipnic ecosystem is currently being synchronized. Access will be granted in a future transmission.
                    </motion.p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pt-8 flex flex-col sm:flex-row justify-center gap-6"
                >
                    <button 
                        onClick={() => navigate(-1)}
                        className="group px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-sans font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Return to Feed
                    </button>
                    <button 
                        onClick={() => window.location.href = 'https://discord.gg/rzhvv9Rf42'}
                        className="px-8 py-4 rounded-2xl bg-emerald-500 text-black font-sans font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                    >
                        <Zap size={18} fill="currentColor" />
                        Join Discord
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default ComingSoon;
