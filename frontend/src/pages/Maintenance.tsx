import { motion } from 'framer-motion';
import { Hammer, Clock, ShieldCheck } from 'lucide-react';

const Maintenance = () => {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="max-w-xl w-full space-y-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative inline-block"
                >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/[0.03] rounded-[40px] flex items-center justify-center border border-white/10 shadow-2xl relative z-10 backdrop-blur-xl">
                        <Hammer size={48} className="text-emerald-500 animate-bounce" />
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-emerald-500/20 blur-3xl -z-10 rounded-full"
                    />
                </motion.div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter uppercase glassy-text">Systems Down</h1>
                        <p className="text-emerald-500 text-xs font-bold uppercase tracking-[0.3em]">Scheduled Maintenance</p>
                    </div>
                    
                    <p className="text-white/40 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-light">
                        Clipnic is currently undergoing a critical infrastructure update to improve your experience. We'll be back online shortly.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">ETA</p>
                            <p className="text-xs text-white/70 font-medium">Coming Soon</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Status</p>
                            <p className="text-xs text-white/70 font-medium">Upgrading</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <a 
                        href="https://discord.gg/m4d6QA6w3" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                    >
                        Check Updates on Discord
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
