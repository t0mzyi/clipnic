import { motion } from 'framer-motion';
import { ShieldCheck, Wallet, Trophy, Loader2, CheckCircle2, TrendingUp, Play, Camera, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useEffect, useCallback } from 'react';
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
    const [discordLoading, setDiscordLoading] = useState(false);

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
                    tiktokHandle: result.data.tiktok_handle,
                    youtubeChannels: result.data.youtube_channels || []
                });
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteSocial = async (platform: string, id?: string) => {
        const { isConfirmed } = await GlobalSwal.fire({
            title: 'Disconnect Platform?',
            text: `Are you sure you want to remove this ${platform} connection?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Disconnect',
            confirmButtonColor: '#ef4444'
        });

        if (isConfirmed) {
            try {
                let url = `${import.meta.env.VITE_API_URL}/auth/${platform}`;
                if (id) url += `/${id}`;

                const res = await fetch(url, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    Toast.fire({ title: 'Disconnected!', icon: 'success' });
                    handleSync();
                } else {
                    throw new Error(json.error);
                }
            } catch (err: any) {
                Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
            }
        }
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

    const handleDiscordLink = async () => {
        if (user?.discordVerified || discordLoading) return;
        setDiscordLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/discord`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (res.ok && json.url) {
                window.location.href = json.url;
            } else {
                throw new Error(json.error || 'Failed to initialize Discord session.');
            }
        } catch (err: any) { 
            console.error('[DiscordConnect]', err);
            Toast.fire({ 
                title: 'Link Error', 
                text: err.message.includes('fetch') ? 'Backend server unreachable. Ensure port 5000 is open.' : err.message, 
                icon: 'error' 
            });
            setDiscordLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
            <div className="pb-6 border-b border-white/[0.08]">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">My Profile</h1>
                <p className="text-white/40 text-lg">Manage your account and earnings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Header */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center">
                        <div className="relative group">
                            <img 
                                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
                                className="w-24 h-24 rounded-2xl object-cover border border-white/10" 
                                alt={user?.name} 
                            />
                            {user?.discordVerified && (
                                 <div className="absolute -bottom-2 -right-2 p-1.5 bg-[#5865F2] rounded-lg border-2 border-[#0c0c0c]">
                                    <CheckCircle2 size={12} className="text-white" />
                                 </div>
                            )}
                        </div>

                        <div className="mt-6 text-center space-y-1">
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">{user?.name || 'Anonymous'}</h2>
                            <p className="text-[11px] text-white/30 font-mono truncate max-w-[200px]">{user?.email}</p>
                        </div>

                        <div className="w-full mt-8 pt-8 border-t border-white/[0.05] space-y-4">
                            <Button 
                                variant="secondary" 
                                onClick={logout} 
                                className="w-full rounded-xl py-3.5 text-[10px] font-bold uppercase tracking-widest bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500/10"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
                        <div className="flex items-center gap-3 text-white/40">
                            <Wallet className="w-5 h-5 opacity-80" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Withdraw Funds</h3>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Available Balance</p>
                            <p className="text-3xl font-mono font-bold text-white">${stats.pendingPayout.toFixed(2)}</p>
                        </div>
                        <Button 
                            disabled={stats.pendingPayout < 5 || withdrawLoading} 
                            onClick={handleWithdraw}
                            className="w-full rounded-xl py-4 bg-emerald-500 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-400 shadow-2xl disabled:opacity-30"
                        >
                            {withdrawLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Request Payout'}
                        </Button>
                        <p className="text-[9px] text-white/20 text-center uppercase tracking-widest font-medium italic">Min. Withdrawal $5.00</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Total Earned', value: `$${stats.totalEarned.toFixed(2)}`, icon: Wallet, color: 'text-emerald-400' },
                            { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: TrendingUp, color: 'text-cyan-400' },
                            { label: 'Campaigns', value: stats.missionsJoined, icon: Trophy, color: 'text-amber-400' }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{stat.label}</p>
                                <p className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Social Verification */}
                    <div id="profile-socials-step" className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Social Verification</h3>
                            <Button 
                                variant="secondary" 
                                onClick={() => setIsVerifyOpen(true)} 
                                className="rounded-xl px-5 py-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10"
                            >
                                Manage Links
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {/* Discord Status */}
                             <div 
                                id="profile-discord-step" 
                                onClick={(e) => {
                                    if (user?.discordVerified) {
                                        setIsVerifyOpen(true);
                                    } else {
                                        handleDiscordLink();
                                    }
                                }}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${user?.discordVerified ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/[0.02] border-white/[0.05] hover:border-indigo-500/30 hover:bg-indigo-500/5'}`}
                             >
                                <div className="flex items-center justify-between mb-3 relative z-10">
                                    {discordLoading ? (
                                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className={`w-5 h-5 ${user?.discordVerified ? 'text-indigo-400' : 'text-white/20 group-hover:text-indigo-400'}`} />
                                    )}
                                    {user?.discordVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Discord</h4>
                                    <p className="text-xs text-white/30 font-mono truncate">{user?.discordVerified ? 'Verified Account' : (discordLoading ? 'Connecting...' : 'Click to Connect')}</p>
                                </div>
                                
                                {!user?.discordVerified && !discordLoading && (
                                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                )}
                            </div>

                            {/* YouTube Status */}
                            <div 
                                onClick={() => setIsVerifyOpen(true)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer group ${user?.youtubeVerified ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/[0.05] hover:border-red-500/30 hover:bg-red-500/5'} sm:col-span-2`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Play className={`w-5 h-5 ${user?.youtubeVerified ? 'text-red-500' : 'text-white/20 group-hover:text-red-500'}`} />
                                        <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">YouTube</h4>
                                    </div>
                                    {user?.youtubeVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                </div>
                                
                                <div className="space-y-3">
                                    {user?.youtubeChannels && user.youtubeChannels.length > 0 ? (
                                        user.youtubeChannels.map((ch: any) => (
                                            <div key={ch.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold">{ch.handle?.[0]?.toUpperCase() || 'Y'}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{ch.title}</p>
                                                        <p className="text-[10px] text-white/40 font-mono">{ch.handle}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSocial('youtube', ch.id);
                                                    }}
                                                    className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-white/20 italic p-2">No channels linked</p>
                                    )}
                                </div>
                            </div>

                            {/* Instagram Status */}
                            <div 
                                onClick={() => setIsVerifyOpen(true)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer group ${user?.instagramVerified ? 'bg-pink-500/5 border-pink-500/20' : 'bg-white/[0.02] border-white/[0.05] hover:border-pink-500/30 hover:bg-pink-500/5'}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <Camera className={`w-5 h-5 ${user?.instagramVerified ? 'text-pink-500' : 'text-white/20 group-hover:text-pink-500'}`} />
                                    <div className="flex items-center gap-2">
                                        {user?.instagramVerified && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSocial('instagram');
                                                }}
                                                className="p-1.5 text-white/20 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        {user?.instagramVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                </div>
                                <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Instagram</h4>
                                <p className="text-xs text-white/30 font-mono truncate">{user?.instagramHandle || 'No Link Found'}</p>
                            </div>

                            {/* TikTok Status */}
                            <div 
                                onClick={() => setIsVerifyOpen(true)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer group ${user?.tiktokVerified ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-white/[0.02] border-white/[0.05] hover:border-cyan-500/30 hover:bg-cyan-500/5'}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <TikTokIcon />
                                    <div className="flex items-center gap-2">
                                        {user?.tiktokVerified && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSocial('tiktok');
                                                }}
                                                className="p-1.5 text-white/20 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        {user?.tiktokVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                </div>
                                <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">TikTok</h4>
                                <p className="text-xs text-white/30 font-mono truncate">{user?.tiktokHandle || 'No Link Found'}</p>
                            </div>
                        </div>
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
