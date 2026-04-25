import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';

interface EarningsData {
    totalEarnings: number;
    availableBalance: number;
    pendingPayout: number;
    claimableBalance: number;
    claimed: number;
    breakdown: any[];
}

export const Earnings = () => {
    const { token } = useAuthStore();
    const [data, setData] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    useEffect(() => {
        if (token) {
            fetchEarnings();
            // Auto-refresh every 10 seconds
            const interval = setInterval(fetchEarnings, 10000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const fetchEarnings = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/earnings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (err) {
            console.error('Failed to fetch earnings:', err);
        } finally {
            setLoading(false);
        }
    };


    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'pending_verification': return <Clock className="w-4 h-4 text-amber-500/50" />;
            case 'accumulating': return <Clock className="w-4 h-4 text-emerald-500" />;
            case 'ready_to_claim_after_end': return <CheckCircle2 className="w-4 h-4 text-amber-500" />;
            case 'claimable': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'claimed': return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
            case 'failed': return <AlertCircle className="w-4 h-4 text-red-500/50" />;
            case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-white/30" />;
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'pending_verification': return 'In Review';
            case 'accumulating': return 'Accumulating';
            case 'ready_to_claim_after_end': return 'Reqs Met (Wait for End)';
            case 'claimable': return 'Ready to Claim';
            case 'claimed': return 'Paid';
            case 'rejected': return 'Rejected';
            case 'failed': return 'Goal Not Met';
            default: return category;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'pending_verification': return 'text-amber-500/50';
            case 'accumulating': return 'text-emerald-500';
            case 'ready_to_claim_after_end': return 'text-amber-500';
            case 'claimable': return 'text-emerald-500';
            case 'claimed': return 'text-purple-500';
            case 'rejected': return 'text-red-500';
            case 'failed': return 'text-red-500/50';
            default: return 'text-white/40';
        }
    };

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
                        <p className="text-white/40 text-lg font-light tracking-tight">Track your revenue and withdrawals in real-time.</p>
                    </div>

                    <Button 
                        onClick={() => setIsWithdrawOpen(true)}
                        variant="primary" 
                        className="rounded-2xl px-8 py-4 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest text-xs shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all active:scale-95"
                    >
                        Withdraw Request
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white animate-spin" />
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Available Balance (Goal Met but Active) */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-500">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2.5 text-blue-400">
                                    <TrendingUp className="w-5 h-5 opacity-80" />
                                    Available Balance
                                </p>
                            </div>
                            <p className="text-4xl font-mono tracking-tight font-medium text-white/90">
                                ${(data?.pendingPayout ?? 0).toFixed(2)}
                            </p>
                            <p className="text-[9px] mt-2 uppercase tracking-widest text-white/20">Requirements Met (Campaign Active)</p>
                        </motion.div>

                        {/* Ready to Claim (Mission Ended) */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-3xl bg-white text-black border-white/20 hover:bg-white/90 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2.5 text-black/50">
                                    <Wallet className="w-5 h-5 opacity-80" />
                                    Ready to Claim
                                </p>
                            </div>
                            <p className="text-4xl font-mono tracking-tight font-black text-black">
                                ${(data?.claimableBalance ?? 0).toFixed(2)}
                            </p>
                            <p className="text-[9px] mt-2 uppercase tracking-widest text-black/30">Campaign Concluded</p>
                        </motion.div>

                        {/* Total Paid */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-500">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2.5 text-emerald-500">
                                    <CheckCircle2 className="w-5 h-5 opacity-80" />
                                    Paid Out
                                </p>
                            </div>
                            <p className="text-4xl font-mono tracking-tight font-medium text-white/90">
                                ${(data?.claimed ?? 0).toFixed(2)}
                            </p>
                            <p className="text-[9px] mt-2 uppercase tracking-widest text-white/20">Total Received</p>
                        </motion.div>

                    </div>

                    {/* Breakdown Table */}
                    <div className="p-4 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-medium tracking-tight text-white/90">Earnings Breakdown</h3>
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{data?.breakdown?.length || 0} submissions</span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-3">
                                <thead>
                                    <tr className="text-[9px] sm:text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                                        <th className="pb-3 pl-6 text-left">Campaign</th>
                                        <th className="pb-3 text-left min-w-[70px] sm:min-w-[80px]">Views</th>
                                        <th className="pb-3 text-left min-w-[80px] sm:min-w-[100px]">
                                            <span className="hidden sm:inline">Min Views</span>
                                            <span className="sm:hidden">Min</span>
                                        </th>
                                        <th className="pb-3 text-left min-w-[90px] sm:min-w-[100px]">Earnings</th>
                                        <th className="pb-3 text-left">Status</th>
                                        <th className="pb-3 pr-6 text-left">Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!data?.breakdown || data.breakdown.length === 0) ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-[10px] uppercase tracking-widest text-white/30">
                                                No earnings data yet. Submit clips to start earning.
                                            </td>
                                        </tr>
                                    ) : data.breakdown.map((item: any) => (
                                        <tr key={item.id} className="group bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
                                            <td className="py-4 pl-6 rounded-l-2xl border-y border-l border-white/[0.05]">
                                                <p className="text-sm font-medium text-white/90">{item.campaignTitle}</p>
                                                <p className="text-[10px] text-white/30 mt-0.5 truncate max-w-[180px]">{item.url}</p>
                                            </td>
                                            <td className="py-4 border-y border-white/[0.05] font-mono text-sm text-white/60">
                                                {item.views?.toLocaleString() || 0}
                                            </td>
                                            <td className="py-4 border-y border-white/[0.05] font-mono text-sm text-white/40">
                                                {item.minViews?.toLocaleString() || '—'}
                                            </td>
                                            <td className="py-4 border-y border-white/[0.05] font-mono text-sm font-bold text-white/90">
                                                ${item.earnings.toFixed(2)}
                                            </td>
                                            <td className="py-4 border-y border-white/[0.05]">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 ${
                                                    item.status === 'Verified' ? 'text-emerald-500' : 
                                                    item.status === 'Paid' ? 'text-purple-500' :
                                                    item.status === 'Pending' ? 'text-amber-500' : 'text-red-500'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-6 rounded-r-2xl border-y border-r border-white/[0.05]">
                                                <div className="flex items-center gap-2">
                                                    {getCategoryIcon(item.earningCategory)}
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${getCategoryColor(item.earningCategory)}`}>
                                                        {getCategoryLabel(item.earningCategory)}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Withdraw Modal */}
            <AnimatePresence>
                {isWithdrawOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ y: 20, scale: 0.97, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 20, scale: 0.97, opacity: 0 }}
                            className="bg-[#0D0D0D] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative shadow-[0_32px_64px_-16px_rgba(0,0,0,1)]"
                        >
                            <button
                                onClick={() => setIsWithdrawOpen(false)}
                                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>

                            <div className="space-y-6 text-center py-4">
                                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20 mx-auto">
                                    <Wallet className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold tracking-tight text-white">Withdraw Funds</h2>
                                    <p className="text-sm text-white/40 leading-relaxed px-4">
                                        To process your payout, please <strong className="text-white/60">contact an admin</strong> or <strong className="text-white/60">open a ticket</strong> in our Discord server.
                                    </p>
                                </div>
                                <div className="pt-4 flex flex-col gap-3">
                                    <a 
                                        href="https://discord.gg/zWygCBNUY" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                    >
                                        Open Ticket on Discord
                                    </a>
                                    <Button 
                                        variant="outline" 
                                        className="w-full rounded-2xl py-4 text-xs border-white/10 text-white/50 hover:bg-white/5" 
                                        onClick={() => setIsWithdrawOpen(false)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
