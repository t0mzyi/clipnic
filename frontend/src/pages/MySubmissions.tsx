import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Search, Filter, Calendar, Layers, CheckCircle2, Eye, Wallet, Inbox } from 'lucide-react';

export const MySubmissions = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 pb-8"
        >
            <div className="pb-6 border-b border-white/[0.08] relative">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-32 bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />
                <div className="flex items-end justify-between relative z-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 mb-2">My Submissions</h1>
                        <p className="text-white/40 text-lg font-light tracking-tight">Track and manage your clips.</p>
                    </div>
                </div>
            </div>

            {/* KPIs - Premium Design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                    <p className="text-xs text-white/40 mb-3 uppercase tracking-widest font-semibold flex items-center gap-2.5">
                        <Layers className="w-5 h-5" />
                        Total Clips
                    </p>
                    <p className="text-4xl font-mono tabular-metrics text-white/90">0</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                    <p className="text-xs text-white/40 mb-3 uppercase tracking-widest font-semibold flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-green-500/50" />
                        Approved
                    </p>
                    <p className="text-4xl font-mono tabular-metrics text-white/90">0</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                    <p className="text-xs text-white/40 mb-3 uppercase tracking-widest font-semibold flex items-center gap-2.5">
                        <Eye className="w-5 h-5 text-white/30" />
                        Views
                    </p>
                    <p className="text-4xl font-mono tabular-metrics text-white/90">0</p>
                </div>
                <div className="p-6 rounded-3xl bg-white text-black shadow-2xl group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/[0.05] to-transparent pointer-events-none" />
                    <p className="text-black/50 text-xs mb-3 uppercase tracking-widest font-bold flex items-center gap-2.5 relative z-10">
                        <Wallet className="w-5 h-5" />
                        Earnings
                    </p>
                    <p className="text-4xl font-mono tabular-metrics font-bold relative z-10">$0.00</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="relative w-full lg:w-auto lg:flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="Search submissions..." 
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-12 py-4 text-base text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                        />
                    </div>
                    <div className="flex flex-wrap w-full lg:w-auto items-center gap-3">
                        <div className="relative group">
                            <select className="bg-white/[0.03] border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-sm font-medium text-white/50 focus:outline-none focus:border-white/20 appearance-none cursor-pointer hover:bg-white/[0.05] transition-all">
                                <option>All Campaigns</option>
                            </select>
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        </div>
                        <div className="relative group">
                            <select className="bg-white/[0.03] border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-sm font-medium text-white/50 focus:outline-none focus:border-white/20 appearance-none cursor-pointer hover:bg-white/[0.05] transition-all">
                                <option>All Platforms</option>
                            </select>
                            <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        </div>
                        <div className="relative group">
                            <select className="bg-white/[0.03] border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-sm font-medium text-white/50 focus:outline-none focus:border-white/20 appearance-none cursor-pointer hover:bg-white/[0.05] transition-all">
                                <option>Sort: Newest</option>
                            </select>
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="mt-10 py-20 text-center border-t border-white/[0.03] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10 mb-5">
                        <Inbox className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-medium text-white/80 mb-2">No submissions yet</h3>
                    <p className="text-base text-white/30 mb-8 max-w-[300px] mx-auto">Upload content links to active campaigns to start earning.</p>
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-2xl text-xs px-8 py-3.5 uppercase font-bold tracking-widest">
                        Explore Campaigns
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
