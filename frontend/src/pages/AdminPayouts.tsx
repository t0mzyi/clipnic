import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { 
    CheckCircle2, ArrowRight,
    Search,
    AlertCircle, Wallet, Calendar, DollarSign, Users
} from 'lucide-react';
import Swal from 'sweetalert2';

export const AdminPayouts = () => {
    const { token } = useAuthStore();
    const [eligible, setEligible] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'pending' ? 'eligible' : 'history';
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/payouts/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                if (activeTab === 'pending') setEligible(json.data);
                else setHistory(json.data);
            }
        } catch (err) {
            console.error('Failed to fetch payout data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayout = async (userId: string, userName: string, amount: number) => {
        const result = await Swal.fire({
            title: 'Confirm Payout',
            html: `You are about to pay <b class="text-emerald-400">$${amount.toFixed(2)}</b> to <b>${userName}</b>.<br/><span class="text-[10px] text-white/30 uppercase tracking-widest mt-2 block">This will mark all eligible submissions as Paid.</span>`,
            icon: 'info',
            input: 'textarea',
            inputPlaceholder: 'Add internal notes (optional)...',
            showCancelButton: true,
            confirmButtonColor: '#10b881',
            cancelButtonColor: '#27272a',
            confirmButtonText: 'Confirm & Mark Paid',
            background: '#0c0c0c',
            color: '#fff',
            customClass: {
                popup: 'rounded-[32px] border border-white/10 shadow-2xl',
                input: 'bg-white/[0.03] border-white/10 rounded-2xl text-sm focus:border-emerald-500/50'
            }
        });

        if (result.isConfirmed) {
            setIsProcessing(userId);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/payouts`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        userId, 
                        notes: result.value 
                    })
                });
                const json = await res.json();
                if (json.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Payout has been recorded and submissions updated.',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        background: '#0c0c0c',
                        color: '#fff'
                    });
                    fetchData();
                } else {
                    throw new Error(json.error || 'Failed to process payout');
                }
            } catch (err: any) {
                Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
            } finally {
                setIsProcessing(null);
            }
        }
    };

    const filteredPending = eligible.filter(u => 
        u.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPending = eligible.reduce((acc, curr) => acc + curr.totalClaimable, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-white/50" /> Payout Management
                    </h1>
                    <p className="text-white/40 mt-1">Review, validate, and process earnings for all clippers.</p>
                </div>

                <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Eligible
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        History
                    </button>
                </div>
            </header>

            {activeTab === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-3xl space-y-2">
                        <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase font-bold tracking-widest">
                            <Wallet className="w-3.5 h-3.5 text-emerald-500" /> Total Pending
                        </div>
                        <p className="text-3xl font-mono font-bold text-white">${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="glass-panel p-6 rounded-3xl space-y-2">
                        <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase font-bold tracking-widest">
                            <Users className="w-3.5 h-3.5 text-blue-400" /> Active Clippers
                        </div>
                        <p className="text-3xl font-mono font-bold text-white">{eligible.length}</p>
                    </div>
                    <div className="glass-panel p-6 rounded-3xl space-y-2">
                        <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase font-bold tracking-widest">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Avg. Payout
                        </div>
                        <p className="text-3xl font-mono font-bold text-white">${eligible.length > 0 ? (totalPending / eligible.length).toFixed(2) : '0.00'}</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'pending' ? "Search clippers to pay..." : "Search past payouts..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all font-mono"
                    />
                </div>

                <div className="rounded-3xl border border-white/[0.06] overflow-hidden">
                    {loading ? (
                        <div className="py-32 flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                            <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Analyzing Balances...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {activeTab === 'pending' ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.02] text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] border-b border-white/[0.04]">
                                            <th className="px-8 py-4">User</th>
                                            <th className="px-6 py-4">Submissions</th>
                                            <th className="px-6 py-4">Balance</th>
                                            <th className="px-8 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {filteredPending.map((item) => (
                                            <tr key={item.user.id} className="group hover:bg-white/[0.02] transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                                            {item.user.avatar_url ? (
                                                                <img src={item.user.avatar_url} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-white/20 font-bold uppercase">{item.user.name.charAt(0)}</div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-white/90">{item.user.name}</span>
                                                            <span className="text-[10px] text-white/30 font-mono">{item.user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-mono font-bold text-white/40">
                                                            {item.submissionIds.length} Verified Clips
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="text-lg font-mono font-bold text-emerald-400">${item.totalClaimable.toFixed(2)}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Button 
                                                        onClick={() => handleProcessPayout(item.user.id, item.user.name, item.totalClaimable)}
                                                        disabled={isProcessing === item.user.id}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2 px-6 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.1)] group"
                                                    >
                                                        {isProcessing === item.user.id ? 'Processing...' : (
                                                            <div className="flex items-center gap-2">
                                                                Pay Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                            </div>
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredPending.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                                        <CheckCircle2 size={40} />
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">All settled up.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.02] text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] border-b border-white/[0.04]">
                                            <th className="px-8 py-4">User</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-8 py-4 text-right">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {history.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                                            {item.users?.avatar_url ? (
                                                                <img src={item.users.avatar_url} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-white/20 font-bold uppercase">{item.users?.name?.charAt(0)}</div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-white/80">{item.users?.name}</span>
                                                            <span className="text-[10px] text-white/20 font-mono">{item.users?.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2 text-[11px] text-white/40 font-mono">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="text-base font-mono font-bold text-white/90">${Number(item.amount).toFixed(2)}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <p className="text-[10px] text-white/30 italic max-w-xs ml-auto line-clamp-1">{item.notes || '—'}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
