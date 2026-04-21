import { motion } from 'framer-motion';
import { Wallet, ArrowDownRight, ArrowUpRight, Landmark, CreditCard, History, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Earnings = () => {
    const stats = [
        { label: 'Available Balance', value: '$1,240.50', icon: Wallet, color: 'text-emerald-500' },
        { label: 'Pending Payout', value: '$450.00', icon: History, color: 'text-amber-500' },
        { label: 'Total Earned', value: '$8,920.00', icon: TrendingUp, color: 'text-blue-500' },
        { label: 'Paid This Month', value: '$2,100.00', icon: Landmark, color: 'text-purple-500' },
    ];

    const transactions = [
        { id: 1, type: 'payout', amount: '$450.00', status: 'Pending', date: '2024-04-20', method: 'PayPal' },
        { id: 2, type: 'earning', amount: '$120.40', status: 'Completed', date: '2024-04-18', campaign: 'Cyberpunk Challenge' },
        { id: 3, type: 'earning', amount: '$85.20', status: 'Completed', date: '2024-04-17', campaign: 'Retro Gaming' },
        { id: 4, type: 'payout', amount: '$1,200.00', status: 'Completed', date: '2024-04-10', method: 'Stripe' },
        { id: 5, type: 'earning', amount: '$310.00', status: 'Completed', date: '2024-04-05', campaign: 'Crypto Review' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
        >
            <div className="pb-6 border-b border-white/[0.08] relative">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-32 bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 mb-2">Earnings</h1>
                        <p className="text-white/40 text-lg font-light tracking-tight">Manage your payouts and revenue streams.</p>
                    </div>
                    <Button variant="primary" className="rounded-2xl px-6 py-3 flex items-center gap-2 group">
                        <CreditCard className="w-4 h-4" />
                        Request Payout
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                            <div className="flex items-center justify-between mb-5 font-mono">
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2.5">
                                    <Icon className={`w-5 h-5 ${stat.color} opacity-80`} />
                                    {stat.label}
                                </p>
                            </div>
                            <p className="text-4xl font-mono tracking-tight font-medium text-white/90">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Area (Dummy SVG) */}
                <div className="lg:col-span-2 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-medium tracking-tight text-white/90">Revenue Over Time</h3>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Growth</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full bg-white/[0.01] rounded-2xl border border-white/[0.03] flex items-center justify-center relative overflow-hidden">
                        {/* Dummy SVG Chart */}
                        <svg className="w-full h-full p-4 overflow-visible" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path 
                                d="M0,180 Q50,150 100,160 T200,100 T300,80 T400,20 L400,200 L0,200 Z" 
                                fill="url(#chartGradient)"
                            />
                            <path 
                                d="M0,180 Q50,150 100,160 T200,100 T300,80 T400,20" 
                                fill="none" 
                                stroke="#3b82f6" 
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px] bg-black/5">
                            <TrendingUp className="w-12 h-12 text-white/10" />
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-medium tracking-tight text-white/90">Activity</h3>
                        <History className="w-5 h-5 text-white/20" />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'payout' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {tx.type === 'payout' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/90 uppercase tracking-tight">{tx.type === 'payout' ? 'Payout' : 'Earning'}</p>
                                        <p className="text-[10px] text-white/40 font-mono tracking-tighter">{tx.date} • {tx.method || tx.campaign}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono font-bold text-white/90">{tx.amount}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${tx.status === 'Pending' ? 'text-amber-500/80' : 'text-emerald-500/80'}`}>{tx.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
