import { motion } from 'framer-motion';
import { ShieldCheck, Wallet, Trophy, Loader2, CheckCircle2, TrendingUp, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Toast, GlobalSwal } from '../lib/swal';
import { ProfileVerifyModal } from '../components/modals/ProfileVerifyModal';
import { DiscordInfoModal } from '../components/modals/DiscordInfoModal';

import { YoutubeIcon, TikTokIcon, InstagramIcon } from '../components/ui/SocialIcons';

import { generateVerificationCode } from '../utils/verification';

export const Profile = () => {
    const { user, token, updateUser, logout } = useAuthStore();
    const [stats, setStats] = useState({ totalEarned: 0, totalViews: 0, pendingPayout: 0, missionsJoined: 0 });
    const [loading, setLoading] = useState(true);
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    const [isDiscordInfoOpen, setIsDiscordInfoOpen] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [discordLoading, setDiscordLoading] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [verifyCode, setVerifyCode] = useState(generateVerificationCode());

    useEffect(() => {
        if (isVerifyOpen) {
            setVerifyCode(generateVerificationCode());
        }
    }, [isVerifyOpen]);

    const fetchStats = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/stats/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const json = await res.json();
                    if (json.success) setStats(json.data);
                }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [token]);

    const handleSync = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
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
                }
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
                    <div id="profile-socials-step" className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Social Verification</h3>
                                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Manage Linked Platforms</p>
                            </div>
                            <ShieldCheck className="w-6 h-6 text-emerald-500 opacity-50" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Discord Status */}
                            <div
                                id="profile-discord-step"
                                onClick={() => {
                                    if (user?.discordVerified) {
                                        setIsDiscordInfoOpen(true);
                                    } else {
                                        handleDiscordLink();
                                    }
                                }}
                                className={`p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${user?.discordVerified ? 'bg-[#5865F2]/5 border-[#5865F2]/20' : 'bg-white/[0.02] border-white/[0.05] hover:border-[#5865F2]/30 hover:bg-[#5865F2]/5'}`}
                            >
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${user?.discordVerified ? 'bg-[#5865F2]/10 text-[#5865F2]' : 'bg-white/5 text-white/20 group-hover:text-[#5865F2]'}`}>
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.874.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                                    </div>
                                    {user?.discordVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Discord</h4>
                                    <p className="text-xs text-white/30 font-mono truncate">{user?.discordVerified ? 'Connected' : (discordLoading ? 'Connecting...' : 'Link Discord')}</p>
                                </div>
                            </div>

                            {/* TikTok Status */}
                            <div
                                onClick={() => {
                                    setSelectedPlatform('tiktok');
                                    setIsVerifyOpen(true);
                                }}
                                className={`p-6 rounded-2xl border transition-all cursor-pointer group ${user?.tiktokVerified ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-white/[0.02] border-white/[0.05] hover:border-cyan-500/30 hover:bg-cyan-500/5'}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${user?.tiktokVerified ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-white/20 group-hover:text-cyan-400'}`}>
                                        <TikTokIcon className="w-5 h-5" />
                                    </div>
                                    {user?.tiktokVerified && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSocial('tiktok');
                                            }}
                                            className="p-1.5 text-white/10 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">TikTok</h4>
                                <p className="text-xs text-white/30 font-mono truncate">{user?.tiktokHandle || 'Not Linked'}</p>
                            </div>

                            {/* YouTube Status */}
                            <div
                                onClick={() => {
                                    setSelectedPlatform('youtube');
                                    setIsVerifyOpen(true);
                                }}
                                className={`p-6 rounded-2xl border transition-all cursor-pointer group sm:col-span-2 ${user?.youtubeVerified ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/[0.05] hover:border-red-500/30 hover:bg-red-500/5'}`}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${user?.youtubeVerified ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/20 group-hover:text-red-500'}`}>
                                            <YoutubeIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">YouTube</h4>
                                            <p className="text-[10px] text-white/30 uppercase font-mono tracking-widest">{user?.youtubeVerified ? 'Connected Channels' : 'Click to Link'}</p>
                                        </div>
                                    </div>
                                    {user?.youtubeVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {user?.youtubeChannels && user.youtubeChannels.length > 0 ? (
                                        user.youtubeChannels.map((ch: any) => (
                                            <div key={ch.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] group/item">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold">{ch.handle?.[0]?.toUpperCase() || 'Y'}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{ch.title}</p>
                                                        <p className="text-[10px] text-white/20 font-mono">{ch.handle}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSocial('youtube', ch.id);
                                                    }}
                                                    className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover/item:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 text-center py-4 border border-dashed border-white/10 rounded-xl">
                                            <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">No Channels Linked</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Instagram Status */}
                            <div
                                onClick={() => {
                                    setSelectedPlatform('instagram');
                                    setIsVerifyOpen(true);
                                }}
                                className={`p-6 rounded-2xl border transition-all cursor-pointer group sm:col-span-2 ${user?.instagramVerified ? 'bg-pink-500/5 border-pink-500/20' : 'bg-white/[0.02] border-white/[0.05] hover:border-pink-500/30 hover:bg-pink-500/5'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${user?.instagramVerified ? 'bg-pink-500/10 text-pink-500' : 'bg-white/5 text-white/20 group-hover:text-pink-500'}`}>
                                            <InstagramIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Instagram</h4>
                                            <p className="text-xs text-white/30 font-mono">{user?.instagramHandle || 'Not Connected'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {user?.instagramVerified && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSocial('instagram');
                                                }}
                                                className="p-2 text-white/10 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        {user?.instagramVerified && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ProfileVerifyModal
                isOpen={isVerifyOpen}
                onClose={() => setIsVerifyOpen(false)}
                verifyCode={verifyCode}
                onSync={handleSync}
                initialSocial={selectedPlatform}
            />

            <DiscordInfoModal
                isOpen={isDiscordInfoOpen}
                onClose={() => setIsDiscordInfoOpen(false)}
                username={user?.name || ''}
            />
        </motion.div>
    );
};
