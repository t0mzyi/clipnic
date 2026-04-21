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

                <div className="mt-10 overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-4">
                                <th className="pb-4 pl-6">Campaign</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Views</th>
                                <th className="pb-4">Earnings</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {[
                                { id: 1, campaign: 'Cyberpunk Challenge', status: 'Approved', views: '45.2K', earnings: '$120.40', date: '2024-04-18', color: 'text-emerald-500' },
                                { id: 2, campaign: 'Retro Gaming Mods', status: 'Pending', views: '12.8K', earnings: '$32.10', date: '2024-04-19', color: 'text-amber-500' },
                                { id: 3, campaign: 'Tech Review 2024', status: 'Rejected', views: '0', earnings: '$0.00', date: '2024-04-15', color: 'text-red-500' },
                                { id: 4, campaign: 'Crypto Analysis', status: 'Approved', views: '112.5K', earnings: '$450.00', date: '2024-04-10', color: 'text-emerald-500' },
                            ].map((sub) => (
                                <tr key={sub.id} className="group bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                                    <td className="py-5 pl-6 rounded-l-2xl border-y border-l border-white/[0.05]">
                                        <p className="text-sm font-medium text-white/90">{sub.campaign}</p>
                                    </td>
                                    <td className="py-5 border-y border-white/[0.05]">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 ${sub.color}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="py-5 border-y border-white/[0.05] font-mono text-sm text-white/60">
                                        {sub.views}
                                    </td>
                                    <td className="py-5 border-y border-white/[0.05] font-mono text-sm font-bold text-white/90">
                                        {sub.earnings}
                                    </td>
                                    <td className="py-5 border-y border-white/[0.05] text-[11px] text-white/30 font-medium">
                                        {sub.date}
                                    </td>
                                    <td className="py-5 pr-6 rounded-r-2xl border-y border-r border-white/[0.05] text-right">
                                        <button className="text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-white transition-colors">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};
