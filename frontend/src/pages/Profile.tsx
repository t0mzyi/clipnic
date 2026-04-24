import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Mail, Scissors, Eye, Wallet, Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Dropdown } from '../components/Dropdown';

const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#0D0D0D',
    color: '#fff',
    customClass: {
        popup: 'rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md bg-[#0D0D0D]/95',
        title: 'text-sm font-bold',
    },
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

const GlobalSwal = Swal.mixin({
    background: '#0D0D0D',
    color: '#fff',
    customClass: {
        popup: 'rounded-[32px] border border-white/10 shadow-2xl bg-[#0D0D0D]',
        title: 'text-2xl font-bold tracking-tight pt-4',
        htmlContainer: 'text-sm text-white/40 leading-relaxed px-6',
        confirmButton: 'bg-white text-black px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-all mx-2',
        cancelButton: 'bg-transparent border border-white/10 text-white/50 px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all mx-2',
        actions: 'pb-6'
    },
    buttonsStyling: false
});

export const Profile = () => {
    const { user, token, login } = useAuthStore();

    // Member since date
    const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'April 2024';

    const [stats, setStats] = useState({
        totalClips: 0,
        totalViews: 0,
        currentBalance: '$0.00',
    });

    // Modal state
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [verifyStep, setVerifyStep] = useState<1 | 2>(1);
    const [isLinkingNew, setIsLinkingNew] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Discord state
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [verifyError, setVerifyError] = useState('');

    const [searchParams, setSearchParams] = useSearchParams();

    const fetchStats = useCallback(async (force = false) => {
        if (!token) return;
        
        // 1. Try cache first
        const cacheKey = `clipnic_stats_${user?.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached && !force) {
            try {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < 600000) { // 10 mins cache
                    setStats(data);
                }
            } catch (e) { localStorage.removeItem(cacheKey); }
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/earnings?t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                const newStats = {
                    totalClips: json.data.breakdown.length,
                    totalViews: json.data.breakdown.reduce((sum: number, s: any) => sum + (s.views || 0), 0),
                    currentBalance: `$${json.data.claimableBalance.toFixed(2)}`
                };
                setStats(newStats);
                localStorage.setItem(cacheKey, JSON.stringify({ data: newStats, timestamp: Date.now() }));
            }
        } catch (err) {
            console.error('Failed to fetch profile stats:', err);
        }
    }, [token, user?.id]);

    // Re-sync with backend (useful after OAuth redirects)
    const fetchSync = useCallback(async (force = false) => {
        if (!token) return;
        
        // Only fetch stats if forced or not in cache
        fetchStats(force);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                const userData = {
                    ...result.data,
                    // Auto-sync name if Discord name is available and different
                    name: result.data.discord_name || result.data.name,
                    avatarUrl: result.data.avatar_url,
                    discordVerified: result.data.discord_verified,
                    discordId: result.data.discord_id,
                    youtubeVerified: result.data.youtube_verified,
                    youtubeHandle: result.data.youtube_handle,
                    youtubeChannels: result.data.youtube_channels,
                    instagramVerified: result.data.instagram_verified,
                    instagramHandle: result.data.instagram_handle,
                    instagramHandles: result.data.instagram_handles || (result.data.instagram_handle ? [result.data.instagram_handle] : []),
                    tiktokVerified: result.data.tiktok_verified,
                    tiktokHandle: result.data.tiktok_handle
                };
                // Merge metadata to prevent state flicker
                const { user: currentUser, updateUser } = useAuthStore.getState();
                if (currentUser && currentUser.id === userData.id) {
                    updateUser(userData);
                } else {
                    login(userData, token);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, [token, login, fetchStats]);

    useEffect(() => {
        if (token) {
            fetchSync();
            // Auto-refresh every 30 seconds (increased from 10s for optimization)
            const interval = setInterval(() => {
                fetchStats(true); // Background refresh
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [token, fetchSync, fetchStats]);

    useEffect(() => {
        const dError = searchParams.get('discord_error');
        const dSuccess = searchParams.get('discord_success');
        const iError = searchParams.get('instagram_error');
        const iSuccess = searchParams.get('instagram_success');
        const yError = searchParams.get('youtube_error');
        const ySuccess = searchParams.get('youtube_success');

        if (dError) {
            setVerifyError(decodeURIComponent(dError));
            Toast.fire({ title: 'Discord Error', text: decodeURIComponent(dError), icon: 'error' });
            searchParams.delete('discord_error');
            setSearchParams(searchParams);
        }
        if (dSuccess) {
            Toast.fire({ title: 'Success!', text: 'Discord account linked successfully.', icon: 'success' });
            fetchSync();
            searchParams.delete('discord_success');
            setSearchParams(searchParams);
        }
        if (iError) {
            Toast.fire({ title: 'Instagram Error', text: decodeURIComponent(iError), icon: 'error' });
            searchParams.delete('instagram_error');
            setSearchParams(searchParams);
        }
        if (iSuccess) {
            Toast.fire({ title: 'Success!', text: 'Instagram account linked successfully.', icon: 'success' });
            fetchSync();
            searchParams.delete('instagram_success');
            setSearchParams(searchParams);
        }
        if (yError) {
            Toast.fire({ title: 'YouTube Link Failed', text: decodeURIComponent(yError), icon: 'error' });
            searchParams.delete('youtube_error');
            setSearchParams(searchParams);
        }
        if (ySuccess) {
            Toast.fire({ title: 'Success!', text: 'YouTube channel safely linked.', icon: 'success' });
            setIsVerifyOpen(true); // Open it so they can see their new connected channel layout!
            fetchSync();
            searchParams.delete('youtube_success');
            setSearchParams(searchParams);
        }
    }, [searchParams, setSearchParams, fetchSync]);

    // Social state
    const [selectedSocial, setSelectedSocial] = useState('');
    const { settings } = useAuthStore();
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [instagramHandle, setInstagramHandle] = useState('');
    const [showIgCode, setShowIgCode] = useState(false);
    const [tiktokHandle, setTiktokHandle] = useState('');
    const [showTiktokCode, setShowTiktokCode] = useState(false);
    const [showYtCode, setShowYtCode] = useState(false);

    // Verification code based on user ID (consistent)
    const verifyCode = `CLPNIC-${user?.id?.slice(0, 6).toUpperCase()}`;

    const handleManualVerify = async () => {
        if (!youtubeUrl) {
            Toast.fire({ title: 'Error', text: 'Please enter your YouTube Handle or URL', icon: 'error' });
            return;
        }
        setIsVerifying(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-youtube`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    handle: youtubeUrl,
                    code: verifyCode
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            Toast.fire({ title: 'Success', text: 'YouTube channel verified via bio!', icon: 'success' });
            setShowYtCode(false);
            setYoutubeUrl('');
            fetchSync();
        } catch (error: any) {
            setVerifyError(error.message);
            setIsVerifying(false);
        }
    };

    const handleManualInstagramVerify = async () => {
        if (!instagramHandle) {
            Toast.fire({ title: 'Error', text: 'Please enter your Instagram handle', icon: 'error' });
            return;
        }

        if (!showIgCode) {
            setShowIgCode(true);
            return;
        }

        setIsVerifying(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-instagram-bio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    handle: instagramHandle,
                    code: verifyCode
                })
            });

            const data = await res.json();
            if (!res.ok) throw data;

            Toast.fire({ title: 'Success', text: 'Instagram account verified!', icon: 'success' });
            setShowIgCode(false);
            setInstagramHandle('');
            fetchSync();
        } catch (err: any) {
            setVerifyError(err.details || err.error || err.message || 'Verification failed');
            Toast.fire({ title: 'Error', text: err.error || err.message || 'Verification failed', icon: 'error' });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleManualTiktokVerify = async () => {
        if (!tiktokHandle) {
            Toast.fire({ title: 'Error', text: 'Please enter your TikTok handle', icon: 'error' });
            return;
        }

        if (!showTiktokCode) {
            setShowTiktokCode(true);
            return;
        }

        setIsVerifying(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-tiktok-bio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    handle: tiktokHandle,
                    code: verifyCode
                })
            });

            const data = await res.json();
            if (!res.ok) throw data;

            Toast.fire({ title: 'Success', text: 'TikTok account verified!', icon: 'success' });
            setShowTiktokCode(false);
            setTiktokHandle('');
            fetchSync();
        } catch (err: any) {
            setVerifyError(err.details || err.error || err.message || 'Verification failed');
            Toast.fire({ title: 'Error', text: err.error || err.message || 'Verification failed', icon: 'error' });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRemoveInstagram = async (handle?: string) => {
        const result = await GlobalSwal.fire({
            title: 'Disconnect Instagram?',
            text: `Are you sure you want to remove ${handle || 'your Instagram account'}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, disconnect',
        });

        if (result.isConfirmed) {
            setIsVerifying(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/instagram`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ handle })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                Toast.fire({ title: 'Disconnected', text: 'Instagram account removed.', icon: 'success' });
                fetchSync();

                if (user?.instagramHandles?.length === 1) {
                    setIsVerifyOpen(false);
                }
            } catch (err: any) {
                Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
            } finally {
                setIsVerifying(false);
            }
        }
    };

    const handleRemoveTiktok = async () => {
        const result = await GlobalSwal.fire({
            title: 'Disconnect TikTok?',
            text: "This will stop view tracking for your TikTok clips.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, disconnect'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/tiktok`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    Toast.fire({ title: 'Disconnected', icon: 'success' });
                    fetchSync();
                }
            } catch (e) {
                Toast.fire({ title: 'Error', text: 'Failed to disconnect', icon: 'error' });
            }
        }
    };

    const handleRemoveDiscord = async () => {
        const result = await GlobalSwal.fire({
            title: 'Disconnect Discord?',
            text: 'Are you sure you want to remove your Discord account?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, disconnect',
        });

        if (result.isConfirmed) {
            setIsVerifying(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/discord`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                Toast.fire({ title: 'Disconnected', text: 'Discord account removed.', icon: 'success' });
                fetchSync();
                setIsVerifyOpen(false);
            } catch (err: any) {
                Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
            } finally {
                setIsVerifying(false);
            }
        }
    };

    const handleRemoveChannel = async (channelId: string, handle: string) => {
        const result = await GlobalSwal.fire({
            title: 'Disconnect Channel?',
            text: `Are you sure you want to remove ${handle}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, disconnect',
        });

        if (result.isConfirmed) {
            setIsVerifying(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/youtube/${channelId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                Toast.fire({ title: 'Disconnected', text: `${handle} has been removed.`, icon: 'success' });

                // Close modal if that was the last channel causing them to become unverified
                if (user?.youtubeChannels?.length === 1) {
                    setIsVerifyOpen(false);
                }

                fetchSync();
            } catch (error: any) {
                Toast.fire({ title: 'Error', text: error.message, icon: 'error' });
            } finally {
                setIsVerifying(false);
            }
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto space-y-8 pb-12"
            >
                <div className="pb-8 border-b border-white/[0.08] relative">
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-32 bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4 sm:gap-6">
                            {/* Avatar */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] shrink-0">
                                {user?.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name || 'User'}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-white/10 via-white/5 to-transparent flex items-center justify-center">
                                        <span className="text-3xl font-bold tracking-tighter text-white/40">
                                            {user?.name?.[0] || user?.email?.[0].toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-4">
                                    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white/90">Account Profile</h1>
                                    {user?.discordVerified ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Verified Clipper</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-200 text-red-500 shrink-0">
                                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Unverified</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-white/40 text-base sm:text-lg font-light tracking-tight mt-1">Creator since {memberSince}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsSettingsOpen(true)}
                            variant="outline"
                            className="w-full md:w-auto rounded-2xl border-white/10 hover:bg-white/5 text-white/70 h-12 px-6 text-sm font-bold uppercase tracking-wider mt-4 md:mt-0"
                        >
                            Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Core Metrics - Bento Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Scissors className="w-10 h-10" />
                        </div>
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-2">
                            Total Clips
                        </p>
                        <p className="text-4xl font-mono tracking-tight font-medium text-white/90">{stats.totalClips}</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Eye className="w-10 h-10" />
                        </div>
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-2">
                            Total Views
                        </p>
                        <p className="text-4xl font-mono tracking-tight font-medium text-white/90">{stats.totalViews}</p>
                    </div>
                    {parseFloat(stats.currentBalance.replace('$', '')) > 0 && (
                        <div className="p-8 rounded-3xl bg-white text-zinc-950 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-5 opacity-10">
                                <Wallet className="w-10 h-10" />
                            </div>
                            <p className="text-black/50 text-xs font-semibold uppercase tracking-widest mb-2.5">
                                Balance
                            </p>
                            <p className="text-4xl font-mono tracking-tight font-bold">{stats.currentBalance}</p>
                            <button
                                onClick={() => setIsWithdrawOpen(true)}
                                className="mt-6 w-full py-3 bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-black/90 transition-colors"
                            >
                                Withdraw
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-8 w-full">
                    {/* Verification Box - Full Width */}
                    <div className="w-full p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2.5">
                                <ShieldCheck className="w-5 h-5 text-white/40" />
                                Verification
                            </h3>
                            {user?.discordVerified ? (
                                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">Verified</span>
                            ) : (
                                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-wider">Pending</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-2">
                            {/* Step 1: Discord */}
                            <div id="profile-discord-step" className="p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
                                        Discord Verification
                                    </h4>
                                    <p className="text-xs text-white/40">Join our server to confirm your creator identity.</p>
                                </div>

                                {user?.discordVerified ? (
                                    <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium px-4">
                                        <ShieldCheck className="w-4 h-4" /> Verified
                                    </div>
                                ) : (
                                    <Button variant="secondary" onClick={() => { setVerifyStep(1); setIsVerifyOpen(true); }} className="w-full md:w-auto px-8 text-xs hover:bg-white/10 shrink-0">Start Step 1</Button>
                                )}
                            </div>

                            {/* Step 2: Link Socials */}
                            <div id="profile-socials-step" className={`p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden transition-opacity ${!user?.discordVerified ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span>
                                            Link Socials
                                        </h4>
                                        <p className="text-xs text-white/40 mb-6">Connect your primary platform to unlock paid campaign tracking.</p>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => { setSelectedSocial('youtube'); setVerifyStep(2); setIsVerifyOpen(true); }}
                                                className="w-14 h-14 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/20 flex flex-col items-center justify-center text-[#FF0000] hover:bg-[#FF0000]/20 transition-all shadow-[0_8px_16px_-8px_rgba(255,0,0,0.15)] group/icon"
                                            >
                                                <svg className="w-6 h-6 group-hover/icon:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => { setSelectedSocial('instagram'); setVerifyStep(2); setIsVerifyOpen(true); }}
                                                className="w-14 h-14 rounded-2xl bg-[#E1306C]/10 border border-[#E1306C]/20 flex flex-col items-center justify-center text-[#E1306C] hover:bg-[#E1306C]/20 transition-all group/icon shadow-[0_8px_16px_-8px_rgba(225,48,108,0.15)]"
                                            >
                                                <svg className="w-6 h-6 group-hover/icon:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                            </button>
                                            <button
                                                onClick={() => { setSelectedSocial('tiktok'); setVerifyStep(2); setIsVerifyOpen(true); }}
                                                className="w-14 h-14 rounded-2xl bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex flex-col items-center justify-center text-[#00f2fe] hover:bg-[#00f2fe]/20 transition-all shadow-[0_8px_16px_-8px_rgba(0,242,254,0.15)] group/icon"
                                            >
                                                <svg className="w-6 h-6 group-hover/icon:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {user?.youtubeVerified && (
                                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                            <ShieldCheck className="w-3 h-3" /> YouTube: {user.youtubeHandle}
                                        </div>
                                    )}
                                    {user?.instagramVerified && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[10px] font-bold uppercase tracking-widest">
                                            <ShieldCheck className="w-3 h-3" /> IG: {user.instagramHandle}
                                        </div>
                                    )}
                                    {user?.tiktokVerified && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-bold uppercase tracking-widest">
                                            <ShieldCheck className="w-3 h-3" /> TT: {user.tiktokHandle}
                                        </div>
                                    )}
                                </div>
                                {(!user?.discordVerified) && (
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-6">Complete Step 1 first to unlock platforms.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

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
                            id="withdraw-modal"
                            initial={{ y: 20, scale: 0.97, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 20, scale: 0.97, opacity: 0 }}
                            className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-5 sm:p-8 max-w-md w-full relative shadow-[0_32px_64px_-16px_rgba(0,0,0,1)]"
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
                                        href="https://discord.com/channels/1298616616459702282/1495081184118444265"
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

            {/* Verification Modal */}
            <AnimatePresence>
                {isVerifyOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    >
                        <motion.div
                            id="verification-modal"
                            initial={{ y: 20, scale: 0.97, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 20, scale: 0.97, opacity: 0 }}
                            className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-5 sm:p-8 max-w-md w-full relative shadow-[0_32px_64px_-16px_rgba(0,0,0,1)]"
                        >
                            <button
                                onClick={() => { setIsVerifyOpen(false); setIsLinkingNew(false); }}
                                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>

                            {verifyStep === 1 ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold tracking-tight">Discord Registration</h2>
                                        <p className="text-xs text-white/40 leading-relaxed">Join the official server (`https://discord.gg/rzhvv9Rf42`) and verify your Discord User ID below.</p>
                                    </div>

                                    <a href="https://discord.gg/rzhvv9Rf42" target="_blank" rel="noreferrer" className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 rounded-2xl py-4 text-xs font-bold uppercase tracking-[0.1em] flex items-center justify-center gap-2.5 shadow-[0_8px_24px_-4px_rgba(88,101,242,0.4)] transition-all active:scale-[0.98]">
                                        <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.07-11.41,6.88,6.88,0,0,0-4.69-3.22,74.81,74.81,0,0,1-10.33-4.9,6.61,6.61,0,0,1-.12-11c.76-.58,1.56-1.11,2.44-1.63a70.84,70.84,0,0,1,34-11,70.06,70.06,0,0,1,34,11c.8.52,1.6,1.05,2.44,1.63a6.61,6.61,0,0,1-.12,11,74.44,74.44,0,0,1-10.33,4.9,6.88,6.88,0,0,0-4.69,3.22,77.7,77.7,0,0,0,7.07,11.41,105.73,105.73,0,0,0,32.77-16.15C129,56.6,124.47,32.65,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.08-12.69,11.41-12.69S54,46,54,53,48.82,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.08-12.69,11.44-12.69S96.14,46,96.14,53,91,65.69,84.69,65.69Z" /></svg>
                                        Join Discord
                                    </a>

                                    <div className="space-y-4 pt-4 border-t border-white/5 mt-6">
                                        {verifyError && (
                                            <p className="text-xs text-red-500 font-medium">{verifyError}</p>
                                        )}
                                        <Button
                                            variant="primary"
                                            disabled={isVerifying}
                                            className="w-full rounded-2xl py-4 text-xs font-bold uppercase tracking-widest bg-white text-zinc-950 hover:bg-white/90 shadow-xl disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                                            onClick={async () => {
                                                if (user?.discordVerified) {
                                                    setVerifyStep(2);
                                                    return;
                                                }
                                                setIsVerifying(true);
                                                setVerifyError('');
                                                try {
                                                    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/discord`, {
                                                        headers: {
                                                            'Authorization': `Bearer ${token}`
                                                        }
                                                    });

                                                    if (!res.ok) {
                                                        let errText = 'Failed to start verification';
                                                        try {
                                                            const json = await res.json();
                                                            errText = json.error || errText;
                                                        } catch (e) { }
                                                        throw new Error(errText);
                                                    }

                                                    const json = await res.json();
                                                    window.location.href = json.url;
                                                } catch (err: any) {
                                                    setVerifyError(err.message === "Failed to fetch" ? "Failed to connect to the backend server. Is it running?" : err.message);
                                                    setIsVerifying(false);
                                                }
                                            }}
                                        >
                                            {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {isVerifying ? 'Redirecting...' : 'Verify'}
                                        </Button>

                                        {user?.discordVerified && (
                                            <button
                                                onClick={handleRemoveDiscord}
                                                className="w-full text-[10px] text-red-500/40 uppercase tracking-widest hover:text-red-500 transition-colors pt-2 flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-3 h-3" /> Disconnect Discord
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {selectedSocial === 'instagram' && user?.instagramVerified && !isLinkingNew ? (
                                        <div className="space-y-6 flex flex-col py-4 w-full">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20">
                                                    <ShieldCheck className="w-8 h-8" />
                                                </div>
                                                <div className="text-center space-y-2">
                                                    <h2 className="text-xl font-bold tracking-tight text-white">Instagram Accounts Linked</h2>
                                                </div>
                                            </div>

                                            <div className="w-full space-y-3 mt-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                                {user?.instagramHandles && user.instagramHandles.length > 0 ? (
                                                    user.instagramHandles.map((handle: string, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl group">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                                                </div>
                                                                <span className="text-white text-sm font-mono">{handle}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                                    <ShieldCheck className="w-3 h-3" /> Verified
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveInstagram(handle)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all focus:opacity-100"
                                                                    title="Disconnect Account"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl group">
                                                        <span className="text-white text-sm font-mono">{user?.instagramHandle}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                                <ShieldCheck className="w-3 h-3" /> Verified
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveInstagram(user?.instagramHandle)}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all focus:opacity-100"
                                                                title="Disconnect Legacy Account"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-full pt-4 space-y-3 flex flex-col items-center">
                                                <Button
                                                    variant="secondary"
                                                    className="w-full rounded-2xl py-3 text-xs bg-white/10 text-white hover:bg-white/20"
                                                    onClick={() => setIsLinkingNew(true)}
                                                >
                                                    + Link Another Account
                                                </Button>
                                                <Button variant="secondary" className="w-full rounded-2xl py-3 text-xs bg-transparent border border-white/10 text-white/50 hover:bg-white/5" onClick={() => { setIsVerifyOpen(false); setIsLinkingNew(false); }}>Close</Button>
                                            </div>
                                        </div>
                                    ) : selectedSocial === 'tiktok' && user?.tiktokVerified ? (
                                        <div className="space-y-6 flex flex-col py-4 w-full text-center">
                                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20 mx-auto">
                                                <ShieldCheck className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-2">
                                                <h2 className="text-xl font-bold tracking-tight text-white">TikTok Verified</h2>
                                                <p className="text-sm text-white/40 font-mono">{user.tiktokHandle}</p>
                                            </div>
                                            <div className="pt-4 space-y-3">
                                                <Button variant="secondary" className="w-full rounded-2xl py-3 text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20" onClick={handleRemoveTiktok}>Disconnect Account</Button>
                                                <Button variant="secondary" className="w-full rounded-2xl py-3 text-xs bg-transparent border border-white/10 text-white/50 hover:bg-white/5" onClick={() => { setIsVerifyOpen(false); setIsLinkingNew(false); }}>Close</Button>
                                            </div>
                                        </div>
                                    ) : selectedSocial === 'youtube' && user?.youtubeVerified ? (
                                        <div className="space-y-6 flex flex-col py-4 w-full">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20">
                                                    <ShieldCheck className="w-8 h-8" />
                                                </div>
                                                <div className="text-center space-y-2">
                                                    <h2 className="text-xl font-bold tracking-tight text-white">YouTube Channels Linked</h2>
                                                </div>
                                            </div>

                                            <div className="w-full space-y-3 mt-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                                {user?.youtubeChannels && user.youtubeChannels.length > 0 ? (
                                                    user.youtubeChannels.map((channel: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl group">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-[#FF0000]/20 flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                                                </div>
                                                                <span className="text-white text-sm font-mono">{channel.handle}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                                    <ShieldCheck className="w-3 h-3" /> Verified
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveChannel(channel.channelId, channel.handle)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all focus:opacity-100"
                                                                    title="Disconnect Channel"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl group">
                                                        <span className="text-white text-sm font-mono">{user?.youtubeHandle}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                                <ShieldCheck className="w-3 h-3" /> Verified
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveChannel('legacy', user?.youtubeHandle || 'Old Account')}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all focus:opacity-100"
                                                                title="Disconnect Legacy Account"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-full pt-4 space-y-3 flex flex-col items-center">
                                                <Button
                                                    disabled={isVerifying}
                                                    variant="secondary"
                                                    className="w-full rounded-2xl py-3 text-xs bg-white/10 text-white hover:bg-white/20 flex flex-row items-center justify-center gap-2"
                                                    onClick={async () => {
                                                        setIsVerifying(true);
                                                        setVerifyError('');
                                                        try {
                                                            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/youtube`, {
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                            });
                                                            const json = await res.json();
                                                            if (!res.ok) throw new Error(json.error);
                                                            window.location.href = json.url;
                                                        } catch (err: any) {
                                                            setVerifyError(err.message === "Failed to fetch" ? "Backend unreachable" : err.message);
                                                            setIsVerifying(false);
                                                        }
                                                    }}>
                                                    {isVerifying ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                                    {isVerifying ? 'Redirecting...' : '+ Link Another Channel'}
                                                </Button>
                                                <Button variant="secondary" className="w-full rounded-2xl py-3 text-xs bg-transparent border border-white/10 text-white/50 hover:bg-white/5" onClick={() => { setIsVerifyOpen(false); setIsLinkingNew(false); }}>Close</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <h2 className="text-xl font-bold tracking-tight">Platform Linkage</h2>
                                                <p className="text-xs text-white/40 leading-relaxed">Choose your primary content channel for views monitoring.</p>
                                            </div>

                                            <div className="space-y-1.5 min-w-[200px]">
                                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Platform</label>
                                                <Dropdown
                                                    value={selectedSocial}
                                                    onChange={setSelectedSocial}
                                                    placeholder="Select network"
                                                    options={[
                                                        { label: 'YouTube', value: 'youtube', icon: <div className="w-2 h-2 rounded-full bg-red-600" /> },
                                                        { label: 'Instagram', value: 'instagram', icon: <div className="w-2 h-2 rounded-full bg-pink-500" /> },
                                                        { label: 'TikTok', value: 'tiktok', icon: <div className="w-2 h-2 rounded-full bg-cyan-400" /> },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {selectedSocial === 'youtube' && !user?.youtubeVerified && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-6 pt-4 flex flex-col items-center w-full"
                                        >
                                            <div className="w-16 h-16 rounded-3xl bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000] border border-[#FF0000]/20 mb-2">
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                            </div>

                                            {settings?.youtube_auth_mode === 'manual' ? (
                                                <div className="w-full space-y-6">
                                                    {!showYtCode ? (
                                                        <div className="space-y-4">
                                                            <div className="text-center space-y-2 mb-4">
                                                                <h3 className="font-bold text-white uppercase text-[10px] tracking-widest">Manual Verification</h3>
                                                                <p className="text-xs text-white/40 px-4 leading-relaxed">Enter your channel handle to begin manual verification.</p>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">YouTube Handle</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="@yourhandle"
                                                                    value={youtubeUrl}
                                                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                                                                />
                                                            </div>
                                                            <Button
                                                                className="w-full rounded-2xl py-3 text-xs bg-white text-zinc-950 hover:bg-white/90"
                                                                onClick={() => {
                                                                    if (!youtubeUrl) return Toast.fire({ title: 'Error', text: 'Enter handle first', icon: 'error' });
                                                                    setShowYtCode(true);
                                                                }}
                                                            >
                                                                Next: Generate Code
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center space-y-3">
                                                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Add to your channel bio</p>
                                                                <div className="bg-black/40 border border-white/5 p-3 rounded-xl font-mono text-emerald-500 text-lg tracking-wider">
                                                                    {verifyCode}
                                                                </div>
                                                                <p className="text-[10px] text-white/40 leading-relaxed italic">Add this code anywhere in your channel bio, then click verify.</p>
                                                            </div>
                                                            <div className="flex gap-3 pt-2">
                                                                <Button variant="secondary" className="flex-1 rounded-2xl py-3 text-xs bg-white/10 border border-white/10 hover:bg-white/20" onClick={() => setShowYtCode(false)}>Back</Button>
                                                                <Button
                                                                    disabled={isVerifying}
                                                                    className="flex-[2] rounded-2xl py-3 text-xs bg-white text-zinc-950 hover:bg-white/90"
                                                                    onClick={handleManualVerify}
                                                                >
                                                                    {isVerifying ? 'Verifying...' : 'Check Bio Now'}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-full space-y-6">
                                                    <div className="text-center space-y-2 mb-4">
                                                        <p className="text-xs text-white/40 px-4 leading-relaxed">Link your channel instantly and securely through your Google Account.</p>
                                                    </div>
                                                    <Button
                                                        disabled={isVerifying}
                                                        className="w-full rounded-2xl py-3 text-xs bg-white text-zinc-950 hover:bg-white/90 flex flex-row items-center justify-center gap-2"
                                                        onClick={async () => {
                                                            setIsVerifying(true);
                                                            setVerifyError('');
                                                            try {
                                                                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/youtube`, {
                                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                                });
                                                                const json = await res.json();
                                                                if (!res.ok) throw new Error(json.error);
                                                                window.location.href = json.url;
                                                            } catch (err: any) {
                                                                setVerifyError(err.message === "Failed to fetch" ? "Backend unreachable" : err.message);
                                                                setIsVerifying(false);
                                                            }
                                                        }}
                                                    >
                                                        {isVerifying && <Loader2 className="w-3 h-3 animate-spin" />}
                                                        {isVerifying ? 'Redirecting...' : 'Securely Link Channel'}
                                                    </Button>
                                                </div>
                                            )}

                                            {verifyError && (
                                                <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center animate-pulse">
                                                    {verifyError}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setSelectedSocial('');
                                                    setShowYtCode(false);
                                                }}
                                                className="text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-colors pt-2"
                                            >
                                                Cancel
                                            </button>
                                        </motion.div>
                                    )}

                                    {selectedSocial === 'instagram' && (!user?.instagramVerified || isLinkingNew) && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-6 pt-6 flex flex-col items-center w-full"
                                        >
                                            <div className="w-16 h-16 rounded-3xl bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C] border border-[#E1306C]/20 mb-2">
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                            </div>

                                            <div className="w-full space-y-4">
                                                {!showIgCode ? (
                                                    <div className="space-y-4">
                                                        <div className="text-center space-y-2 mb-4">
                                                            <h3 className="font-bold text-white uppercase text-[10px] tracking-widest">Link Instagram</h3>
                                                            <p className="text-xs text-white/40 px-4 leading-relaxed">Enter your Instagram handle to link your account.</p>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Instagram Handle</label>
                                                            <input
                                                                type="text"
                                                                placeholder="@yourhandle"
                                                                value={instagramHandle}
                                                                onChange={(e) => setInstagramHandle(e.target.value)}
                                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                                                            />
                                                        </div>
                                                        <Button
                                                            className="w-full rounded-2xl py-3 text-xs bg-white text-zinc-950 hover:bg-white/90"
                                                            onClick={() => {
                                                                if (!instagramHandle) return Toast.fire({ title: 'Error', text: 'Enter handle first', icon: 'error' });
                                                                setShowIgCode(true);
                                                            }}
                                                        >
                                                            Next: Generate Code
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center space-y-3">
                                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Add to your profile bio</p>
                                                            <p className="text-[9px] text-pink-500 font-bold uppercase tracking-widest">Must be a Public Profile</p>
                                                            <div className="bg-black/40 border border-white/5 p-3 rounded-xl font-mono text-emerald-400 text-lg tracking-wider">
                                                                {verifyCode}
                                                            </div>
                                                            <p className="text-[10px] text-white/40 leading-relaxed italic">Add this code to your Instagram bio, then click verify.</p>
                                                        </div>
                                                        <div className="flex gap-3 pt-2">
                                                            <Button variant="secondary" className="flex-1 rounded-2xl py-3 text-xs bg-white/10 border border-white/10 hover:bg-white/20" onClick={() => setShowIgCode(false)}>Back</Button>
                                                            <Button
                                                                disabled={isVerifying}
                                                                className="flex-[2] rounded-2xl py-3 text-xs bg-white text-zinc-950 hover:bg-white/90 flex items-center justify-center gap-2"
                                                                onClick={handleManualInstagramVerify}
                                                            >
                                                        {isVerifying && <Loader2 className="w-3 h-3 animate-spin" />}
                                                                {isVerifying ? 'Verifying...' : 'Check Bio Now'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedSocial('');
                                                    setShowYtCode(false);
                                                }}
                                                className="text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-colors pt-2"
                                            >
                                                Cancel
                                            </button>
                                        </motion.div>
                                    )}

                                    {selectedSocial === 'tiktok' && (!user?.tiktokVerified || isLinkingNew) && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-6 pt-6 flex flex-col items-center w-full"
                                        >
                                            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20 mb-2">
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.63-.11.45-.12.92-.01 1.37.11.83.63 1.57 1.35 1.97.66.36 1.45.41 2.18.23.69-.15 1.3-.57 1.69-1.16.27-.42.41-.9.44-1.39-.03-3.9-.01-7.8-.02-11.7z"/></svg>
                                            </div>

                                            <div className="w-full space-y-4">
                                                {!showTiktokCode ? (
                                                    <div className="space-y-4">
                                                        <div className="text-center space-y-2 mb-4">
                                                            <h3 className="font-bold text-white uppercase text-[10px] tracking-widest">Link TikTok</h3>
                                                            <p className="text-xs text-white/40 px-4 leading-relaxed">Enter your TikTok handle to link your account.</p>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">TikTok Handle</label>
                                                            <input
                                                                type="text"
                                                                placeholder="@yourhandle"
                                                                value={tiktokHandle}
                                                                onChange={(e) => setTiktokHandle(e.target.value)}
                                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                                                            />
                                                        </div>
                                                        <Button
                                                            className="w-full rounded-2xl py-3 text-xs bg-white text-zinc-950 hover:bg-white/90"
                                                            onClick={() => {
                                                                if (!tiktokHandle) return Toast.fire({ title: 'Error', text: 'Enter handle first', icon: 'error' });
                                                                setShowTiktokCode(true);
                                                            }}
                                                        >
                                                            Next: Generate Code
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center space-y-3">
                                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Add to your profile bio</p>
                                                            <div className="bg-black/40 border border-white/5 p-3 rounded-xl font-mono text-cyan-400 text-lg tracking-wider">
                                                                {verifyCode}
                                                            </div>
                                                            <p className="text-[10px] text-white/40 leading-relaxed italic">Add this code to your TikTok bio, then click verify.</p>
                                                        </div>
                                                        <div className="flex gap-3 pt-2">
                                                            <Button variant="secondary" className="flex-1 rounded-2xl py-3 text-xs bg-white/10 border border-white/10 hover:bg-white/20" onClick={() => setShowTiktokCode(false)}>Back</Button>
                                                            <Button
                                                                disabled={isVerifying}
                                                                className="flex-[2] rounded-2xl py-3 text-xs bg-white text-zinc-950 hover:bg-white/90 flex items-center justify-center gap-2"
                                                                onClick={handleManualTiktokVerify}
                                                            >
                                                                {isVerifying && <Loader2 className="w-3 h-3 animate-spin" />}
                                                                {isVerifying ? 'Verifying...' : 'Check Bio Now'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedSocial('');
                                                    setShowTiktokCode(false);
                                                }}
                                                className="text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-colors pt-2"
                                            >
                                                Cancel
                                            </button>
                                        </motion.div>
                                    )}

                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Settings Modal */}
            <AnimatePresence>
                {isSettingsOpen && (
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
                            className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 max-w-sm w-full relative shadow-[0_32px_64px_-16px_rgba(0,0,0,1)]"
                        >
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>

                            <div className="space-y-6">
                                <div className="space-y-2 pt-2">
                                    <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
                                    <p className="text-xs text-white/40 leading-relaxed">Update your public identity and bio.</p>
                                </div>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Display Name</label>
                                        <div className="relative flex items-center">
                                            <input 
                                                type="text" 
                                                readOnly 
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-base text-white/40 cursor-not-allowed focus:outline-none font-medium" 
                                                value={user?.name || ''} 
                                            />
                                            <ShieldCheck className="absolute right-5 w-4 h-4 text-white/20" />
                                        </div>
                                        <p className="text-[9px] text-white/20 px-1 italic">Synced with your verified identity (Google/Discord)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Email</label>
                                        <div className="relative flex items-center">
                                            <input type="email" readOnly className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 pr-12 text-base text-white/40 cursor-not-allowed focus:outline-none font-medium" value={user?.email || ''} />
                                            <Mail className="absolute right-5 w-4 h-4 text-white/20" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Bio</label>
                                        <textarea className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-white/30 transition-all resize-none h-28 font-medium" placeholder="Tell us about your content style..." />
                                    </div>
                                    <Button
                                        variant="primary"
                                        disabled={isSaving}
                                        onClick={async () => {
                                            setIsSaving(true);
                                            try {
                                                const bioValue = (document.querySelector('textarea') as HTMLTextAreaElement).value;
                                                const { error } = await supabase
                                                    .from('users')
                                                    .update({ bio: bioValue })
                                                    .eq('id', user?.id);
                                                
                                                if (error) throw error;
                                                
                                                Toast.fire({ title: 'Profile Updated', icon: 'success' });
                                                setIsSettingsOpen(false);
                                                fetchSync(true);
                                            } catch (err) {
                                                Toast.fire({ title: 'Error', text: 'Failed to update bio', icon: 'error' });
                                            } finally {
                                                setIsSaving(false);
                                            }
                                        }}
                                        className="w-full bg-white text-zinc-950 hover:bg-white/90 rounded-2xl py-4 text-xs font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                                    >
                                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
