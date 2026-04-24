import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Wallet, Upload, Trophy, Globe, Loader2, ChevronRight, AlertCircle, Copy, CheckCircle2, TrendingUp, Star, Award, Zap, Instagram, Youtube } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Toast, GlobalSwal } from '../lib/swal';
import { ProfileVerifyModal } from '../components/modals/ProfileVerifyModal';

const TikTokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.63-.11.45-.12.92-.01 1.37.11.83.63 1.57 1.35 1.97.66.36 1.45.41 2.18.23.69-.15 1.3-.57 1.69-1.16.27-.42.41-.9.44-1.39-.03-3.9-.01-7.8-.02-11.7z"/></svg>
);

export const Profile = () => {
    const { user, token, updateUser, logout } = useAuthStore();
    const [stats, setStats] = useState({ totalEarned: 0, totalViews: 0, pendingPayout: 0, missionsJoined: 0 });
    const [loading, setLoading] = useState(true);
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/stats/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setStats(json.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [token]);

    const handleSync = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                updateUser({
                    ...result.data,
                    avatarUrl: result.data.avatar_url,
                    discordVerified: result.data.discord_verified,
                    youtubeVerified: result.data.youtube_verified,
                    youtubeHandle: result.data.youtube_handle,
                    instagramVerified: result.data.instagram_verified,
                    instagramHandle: result.data.instagram_handle,
                    tiktokVerified: result.data.tiktok_verified,
                    tiktokHandle: result.data.tiktok_handle
                });
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchStats();
        handleSync();
    }, [fetchStats]);

    const handleWithdraw = async () => {
        if (stats.pendingPayout < 5) {
            Toast.fire({ title: 'Minimum $5 Required', icon: 'error' });
            return;
        }

        const { isConfirmed } = await GlobalSwal.fire({
            title: 'Confirm Withdrawal',
            text: `You are about to withdraw $${stats.pendingPayout.toFixed(2)}. This will be sent to your linked payment method.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Withdraw'
        });

        if (isConfirmed) {
            setWithdrawLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/payouts/request`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    Toast.fire({ title: 'Withdrawal Requested!', icon: 'success' });
                    fetchStats();
                } else {
                    throw new Error(json.error);
                }
            } catch (err: any) {
                Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
            } finally { setWithdrawLoading(false); }
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header / Profile Card */}
            <div className="relative p-10 rounded-[40px] bg-[#0c0c0c] border border-white/10 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap size={160} className="text-white" />
                </div>
                
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-[32px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img 
                            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
                            className="relative w-32 h-32 rounded-[32px] object-cover border-2 border-white/10 shadow-2xl" 
                            alt={user?.name} 
                        />
                        {user?.discordVerified && (
                             <div className="absolute -bottom-2 -right-2 p-2 bg-[#5865F2] rounded-xl border-4 border-[#0c0c0c] shadow-xl">
                                <CheckCircle2 size={16} className="text-white" />
                             </div>
                        )}
                    </div>

                    <div className="text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3 justify-center md:justify-start">
                                {user?.name}
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40">Clipper</span>
                            </h1>
                            <div className="flex items-center gap-3 text-white/30 text-sm justify-center md:justify-start">
                                <Mail size={14} />
                                {user?.email}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                             <Button variant="secondary" onClick={() => setIsVerifyOpen(true)} className="rounded-2xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10">Manage Socials</Button>
                             <Button variant="secondary" onClick={logout} className="rounded-2xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20">Logout</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Earned', value: `$${stats.totalEarned.toFixed(2)}`, icon: Wallet, color: 'text-emerald-400' },
                    { label: 'Qualified Views', value: stats.totalViews.toLocaleString(), icon: TrendingUp, color: 'text-cyan-400' },
                    { label: 'Missions Joined', value: stats.missionsJoined, icon: Trophy, color: 'text-amber-400' },
                    { label: 'Pending Payout', value: `$${stats.pendingPayout.toFixed(2)}`, icon: Zap, color: 'text-white' }
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-[#0c0c0c] border border-white/5 space-y-3 group hover:border-white/20 transition-all shadow-lg">
                        <div className="flex items-center gap-2 text-white/20">
                            <stat.icon size={16} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Action Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-10 rounded-[40px] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Withdraw Funds</h3>
                        <p className="text-sm text-white/40 leading-relaxed">Cash out your earnings directly to your linked payment method. Minimum withdrawal is $5.00.</p>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Available Balance</p>
                            <p className="text-4xl font-mono font-bold text-white">${stats.pendingPayout.toFixed(2)}</p>
                        </div>
                        <Button 
                            disabled={stats.pendingPayout < 5 || withdrawLoading} 
                            onClick={handleWithdraw}
                            className="rounded-2xl px-10 py-5 bg-emerald-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 shadow-2xl disabled:opacity-30"
                        >
                            {withdrawLoading ? <Loader2 className="animate-spin" size={18} /> : 'Withdraw Now'}
                        </Button>
                    </div>
                 </div>

                 <div className="p-10 rounded-[40px] bg-[#0c0c0c] border border-white/10 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Linked Socials</h3>
                        <p className="text-sm text-white/40">Status of your content distribution channels.</p>
                    </div>
                    <div className="space-y-3">
                         {user?.discordVerified && (
                             <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#5865F2]/20 text-[#5865F2] rounded-lg"><CheckCircle2 size={16} /></div>
                                    <span className="text-sm font-bold text-white/60">Discord Linked</span>
                                </div>
                                <ShieldCheck size={16} className="text-emerald-500" />
                             </div>
                         )}
                         {user?.youtubeVerified && (
                             <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 text-red-500 rounded-lg"><Youtube size={16} /></div>
                                    <span className="text-sm font-bold text-white/60">{user.youtubeHandle}</span>
                                </div>
                                <ShieldCheck size={16} className="text-emerald-500" />
                             </div>
                         )}
                         {user?.instagramVerified && (
                             <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-500/20 text-pink-500 rounded-lg"><Instagram size={16} /></div>
                                    <span className="text-sm font-bold text-white/60">{user.instagramHandle}</span>
                                </div>
                                <ShieldCheck size={16} className="text-emerald-500" />
                             </div>
                         )}
                         {user?.tiktokVerified && (
                             <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500/20 text-cyan-500 rounded-lg"><TikTokIcon /></div>
                                    <span className="text-sm font-bold text-white/60">{user.tiktokHandle}</span>
                                </div>
                                <ShieldCheck size={16} className="text-emerald-500" />
                             </div>
                         )}
                    </div>
                 </div>
            </div>

            <ProfileVerifyModal 
                isOpen={isVerifyOpen} 
                onClose={() => setIsVerifyOpen(false)} 
                verifyCode="CLPNIC-VERIFY" 
                onSync={handleSync} 
            />
        </motion.div>
    );
};
