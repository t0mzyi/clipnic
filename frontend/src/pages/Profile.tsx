import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Mail, CreditCard, ExternalLink, Scissors, Eye, Wallet } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

export const Profile = () => {
    const { user, token, login } = useAuthStore();
    
    // Mock user stats (to be connected in later modules)
    const stats = {
        totalClips: '0',
        totalViews: '0',
        currentBalance: '$0.00',
    };

    // Modal state
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    const [verifyStep, setVerifyStep] = useState<1 | 2>(1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Discord state
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    
    const [searchParams, setSearchParams] = useSearchParams();

    // Re-sync with backend (useful after OAuth redirects)
    const fetchSync = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                const userData = {
                    ...result.data,
                    avatarUrl: result.data.avatar_url,
                    discordVerified: result.data.discord_verified,
                    discordId: result.data.discord_id,
                    youtubeVerified: result.data.youtube_verified,
                    youtubeHandle: result.data.youtube_handle,
                    instagramVerified: result.data.instagram_verified,
                    instagramHandle: result.data.instagram_handle
                };
                login(userData, token);
            }
        } catch(e) {
            console.error(e);
        }
    }, [token, login]);

    useEffect(() => {
        const dError = searchParams.get('discord_error');
        const dSuccess = searchParams.get('discord_success');
        const iError = searchParams.get('instagram_error');
        const iSuccess = searchParams.get('instagram_success');
        
        if (dError) {
            setVerifyError(`Discord Error: ${dError.replace(/_/g, ' ')}`);
            setIsVerifyOpen(true);
            setVerifyStep(1);
            setSearchParams({}, { replace: true });
        } else if (dSuccess) {
            fetchSync(); 
            setIsVerifyOpen(true);
            setVerifyStep(2);
            setSearchParams({}, { replace: true });
        } else if (iError) {
            setVerifyError(`Instagram Error: ${iError.replace(/_/g, ' ')}`);
            setIsVerifyOpen(true);
            setVerifyStep(2);
            setSelectedSocial('instagram');
            setSearchParams({}, { replace: true });
        } else if (iSuccess) {
            fetchSync();
            setIsVerifyOpen(true);
            setVerifyStep(2);
            setSelectedSocial('instagram');
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams, fetchSync]);
    
    // Social state
    const [selectedSocial, setSelectedSocial] = useState('');
    const [socialUser, setSocialUser] = useState('');
    const [showCode, setShowCode] = useState(false);
    const [verifyCode] = useState(() => 'CLPNIC-' + Math.random().toString(36).substring(2, 8).toUpperCase());

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
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
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
                                    <h1 className="text-4xl font-bold tracking-tight text-white/90">Account Profile</h1>
                                    {user?.discordVerified && user?.youtubeVerified ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1 self-end mb-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Verified Creator</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1 self-end mb-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Unverified</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-white/40 text-lg font-light tracking-tight mt-1">Manage identity and payouts.</p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => setIsSettingsOpen(true)}
                            variant="outline" 
                            className="rounded-2xl border-white/10 hover:bg-white/5 text-white/70 h-12 px-6 text-sm font-bold uppercase tracking-wider"
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
                    <div className="p-8 rounded-3xl bg-white text-black relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-5 opacity-10">
                            <Wallet className="w-10 h-10" />
                        </div>
                        <p className="text-black/50 text-xs font-semibold uppercase tracking-widest mb-2.5">
                            Balance
                        </p>
                        <p className="text-4xl font-mono tracking-tight font-bold">{stats.currentBalance}</p>
                        <button className="mt-6 w-full py-3 bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-black/90 transition-colors">
                            Withdraw
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-8 w-full">
                    {/* Verification Box - Full Width */}
                    <div className="w-full p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2.5">
                                <ShieldCheck className="w-5 h-5 text-white/40" />
                                Premium Verification
                            </h3>
                            {user?.discordVerified && user?.youtubeVerified && user?.instagramVerified ? (
                                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">Verified</span>
                            ) : (
                                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-wider">Pending</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-2">
                            {/* Step 1: Discord */}
                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                    <Button variant="secondary" onClick={() => { setVerifyStep(1); setShowCode(false); setIsVerifyOpen(true); }} className="w-full md:w-auto px-8 text-xs hover:bg-white/10 shrink-0">Start Step 1</Button>
                                )}
                            </div>

                            {/* Step 2: Link Socials */}
                            <div className={`p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden transition-opacity ${!user?.discordVerified ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span>
                                            Link Socials
                                        </h4>
                                        <p className="text-xs text-white/40 mb-6">Connect your primary platform to unlock paid campaign tracking.</p>
                                        
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => { setSelectedSocial('youtube'); setVerifyStep(2); setShowCode(false); setIsVerifyOpen(true); }}
                                                className="w-14 h-14 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/20 flex flex-col items-center justify-center text-[#FF0000] hover:bg-[#FF0000]/20 transition-all shadow-[0_8px_16px_-8px_rgba(255,0,0,0.15)] group/icon"
                                            >
                                                <svg className="w-6 h-6 group-hover/icon:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Coming Soon!',
                                                        text: 'Instagram integration will be available shortly.',
                                                        icon: 'info',
                                                        background: '#0c0c0c',
                                                        color: '#fff',
                                                        confirmButtonColor: '#E1306C'
                                                    });
                                                }}
                                                className="w-14 h-14 rounded-2xl bg-[#E1306C]/10 border border-[#E1306C]/20 flex flex-col items-center justify-center text-[#E1306C] hover:bg-[#E1306C]/20 transition-all opacity-50 group/icon"
                                            >
                                                <svg className="w-6 h-6 group-hover/icon:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Coming Soon!',
                                                        text: 'TikTok integration will be available shortly.',
                                                        icon: 'info',
                                                        background: '#0c0c0c',
                                                        color: '#fff',
                                                        confirmButtonColor: '#00f2fe'
                                                    });
                                                }}
                                                className="w-14 h-14 rounded-2xl bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex flex-col items-center justify-center text-[#00f2fe] hover:bg-[#00f2fe]/20 transition-all shadow-[0_8px_16px_-8px_rgba(0,242,254,0.15)] opacity-50 group/icon"
                                            >
                                                <svg className="w-6 h-6 group-hover/icon:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {user?.youtubeVerified && (
                                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                            <ShieldCheck className="w-3 h-3" /> YouTube: {user.youtubeHandle}
                                        </div>
                                    )}
                                    {user?.instagramVerified && (
                                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                            <ShieldCheck className="w-3 h-3" /> IG: {user.instagramHandle}
                                        </div>
                                    )}
                                </div>
                                {(!user?.discordVerified) && (
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-6">Complete Step 1 first to unlock platforms.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payouts Box - Full Width */}
                    <div className="w-full p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] space-y-6 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2.5">
                                <CreditCard className="w-5 h-5 text-white/40" />
                                Payouts
                            </h3>
                            <p className="text-sm text-white/30 leading-relaxed mt-2 max-w-sm">Manage where your campaign earnings are deposited. Connecting Stripe allows instant bulk payouts.</p>
                        </div>
                        <div className="space-y-4 md:w-1/2">
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-xs font-bold">P</div>
                                    <div>
                                        <p className="text-sm font-medium text-white/90">PayPal</p>
                                        <p className="text-xs text-white/30">john@clipnic.com</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors">Del</button>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-dashed border-dashed opacity-30 hover:opacity-100 transition-opacity cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs font-bold">S</div>
                                    <p className="text-sm font-medium text-white/50">Connect Stripe</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-white/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Verification Modal */}
            <AnimatePresence>
                {isVerifyOpen && (
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
                                onClick={() => setIsVerifyOpen(false)}
                                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                            
                            {verifyStep === 1 ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold tracking-tight">Discord Registration</h2>
                                        <p className="text-xs text-white/40 leading-relaxed">Join the official server (`https://discord.gg/rzhvv9Rf42`) and verify your Discord User ID below.</p>
                                    </div>
                                    
                                    <a href="https://discord.gg/rzhvv9Rf42" target="_blank" rel="noreferrer" className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 rounded-2xl py-4 text-xs font-bold uppercase tracking-[0.1em] flex items-center justify-center gap-2.5 shadow-[0_8px_24px_-4px_rgba(88,101,242,0.4)] transition-all active:scale-[0.98]">
                                        <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.07-11.41,6.88,6.88,0,0,0-4.69-3.22,74.81,74.81,0,0,1-10.33-4.9,6.61,6.61,0,0,1-.12-11c.76-.58,1.56-1.11,2.44-1.63a70.84,70.84,0,0,1,34-11,70.06,70.06,0,0,1,34,11c.8.52,1.6,1.05,2.44,1.63a6.61,6.61,0,0,1-.12,11,74.44,74.44,0,0,1-10.33,4.9,6.88,6.88,0,0,0-4.69,3.22,77.7,77.7,0,0,0,7.07,11.41,105.73,105.73,0,0,0,32.77-16.15C129,56.6,124.47,32.65,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.08-12.69,11.41-12.69S54,46,54,53,48.82,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.08-12.69,11.44-12.69S96.14,46,96.14,53,91,65.69,84.69,65.69Z"/></svg>
                                        Join Discord
                                    </a>

                                    <div className="space-y-4 pt-4 border-t border-white/5 mt-6">
                                        {verifyError && (
                                            <p className="text-xs text-red-500 font-medium">{verifyError}</p>
                                        )}
                                        <Button 
                                            variant="primary" 
                                            disabled={isVerifying}
                                            className="w-full rounded-2xl py-4 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-xl disabled:opacity-50 mt-4"
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
                                                        // Attempt to parse json failure
                                                        let errText = 'Failed to start verification';
                                                        try {
                                                            const json = await res.json();
                                                            errText = json.error || errText;
                                                        } catch(e) {}
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
                                            {isVerifying ? 'Redirecting...' : 'Verify'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {selectedSocial === 'instagram' && user?.instagramVerified && !showCode ? (
                                        <div className="space-y-6 flex flex-col items-center justify-center py-4">
                                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20">
                                                <ShieldCheck className="w-8 h-8" />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h2 className="text-xl font-bold tracking-tight text-white">Instagram Linked</h2>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Connected as <span className="text-white font-mono">{user.instagramHandle}</span>.
                                                </p>
                                            </div>
                                            <div className="w-full pt-4 space-y-3 flex flex-col items-center">
                                                <Button variant="secondary" className="w-full rounded-2xl py-3 text-xs bg-white/10 hover:bg-white/20" onClick={() => setIsVerifyOpen(false)}>Close</Button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedSocial('');
                                                        setShowCode(false);
                                                    }} 
                                                    className="text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-colors pt-2"
                                                >
                                                    Change Account
                                                </button>
                                            </div>
                                        </div>
                                    ) : selectedSocial === 'youtube' && user?.youtubeVerified && !showCode ? (
                                        <div className="space-y-6 flex flex-col items-center justify-center py-4">
                                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20">
                                                <ShieldCheck className="w-8 h-8" />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h2 className="text-xl font-bold tracking-tight text-white">YouTube Linked</h2>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Connected as <span className="text-white font-mono">{user.youtubeHandle}</span>.
                                                </p>
                                                <p className="text-[10px] text-emerald-500/80 font-medium mt-1">Verification complete! You can now remove the code from your bio.</p>
                                            </div>
                                            <div className="w-full pt-4 space-y-3 flex flex-col items-center">
                                                <Button variant="secondary" className="w-full rounded-2xl py-3 text-xs bg-white/10 hover:bg-white/20" onClick={() => setIsVerifyOpen(false)}>Close</Button>
                                                <button 
                                                    onClick={() => {
                                                        setSocialUser('');
                                                        setShowCode(false);
                                                        setSelectedSocial('');
                                                    }} 
                                                    className="text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-colors pt-2"
                                                >
                                                    Change Channel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <h2 className="text-xl font-bold tracking-tight">Platform Linkage</h2>
                                                <p className="text-xs text-white/40 leading-relaxed">Choose your primary content channel for views monitoring.</p>
                                            </div>
                                            
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Platform</label>
                                                <select 
                                                    value={selectedSocial}
                                                    onChange={(e) => {
                                                        setSelectedSocial(e.target.value);
                                                        setShowCode(false);
                                                    }}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="" disabled>Select network</option>
                                                    <option value="youtube">YouTube</option>
                                                    <option value="instagram">Instagram</option>
                                                    <option value="tiktok">TikTok</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {selectedSocial === 'youtube' && !showCode && !user?.youtubeVerified && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4 pt-4"
                                        >
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">YouTube Handle (Not Name)</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="@your_handle"
                                                    value={socialUser}
                                                    onChange={(e) => setSocialUser(e.target.value)}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all font-mono" 
                                                />
                                                <p className="text-[10px] text-white/20 ml-1">Example: @clipnic_official</p>
                                            </div>
                                            <Button 
                                                variant="secondary" 
                                                className="w-full rounded-2xl py-3 text-xs font-bold uppercase tracking-widest bg-white/10 text-white hover:bg-white/15"
                                                onClick={() => setShowCode(true)}
                                            >
                                                Generate Link Code
                                            </Button>
                                        </motion.div>
                                    )}

                                    {selectedSocial === 'instagram' && !user?.instagramVerified && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-6 pt-6 flex flex-col items-center"
                                        >
                                            <div className="w-16 h-16 rounded-3xl bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C] border border-[#E1306C]/20 mb-2">
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                            </div>
                                            <div className="text-center space-y-2 mb-4">
                                                <p className="text-xs text-white/40 px-4 leading-relaxed">Identity verification for Instagram uses official secure login to confirm your account handle.</p>
                                            </div>
                                            {verifyError && (
                                                <p className="text-xs text-red-500 font-medium text-center mb-2">{verifyError}</p>
                                            )}
                                            <Button 
                                                variant="primary" 
                                                disabled={isVerifying}
                                                className="w-full rounded-2xl py-3.5 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-90 shadow-[0_12px_24px_-8px_rgba(253,29,29,0.3)] disabled:opacity-50"
                                                onClick={async () => {
                                                    setIsVerifying(true);
                                                    setVerifyError('');
                                                    try {
                                                        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/instagram`, {
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
                                                {isVerifying ? 'Redirecting...' : 'Link with Instagram'}
                                            </Button>
                                        </motion.div>
                                    )}

                                    {showCode && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-4 pt-4"
                                        >
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-3">
                                                <p className="text-[10px] text-white/40 font-medium leading-relaxed">Place this unique ID in your channel description or bio to prove ownership:</p>
                                                <div className="relative group">
                                                    <p className="font-mono text-lg tracking-[0.2em] font-bold text-white bg-black border border-white/20 p-4 rounded-xl selection:bg-white selection:text-black">
                                                        {verifyCode}
                                                    </p>
                                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl blur-md" />
                                                </div>
                                            </div>
                                            {verifyError && (
                                                <p className="text-xs text-red-500 font-medium text-center">{verifyError}</p>
                                            )}
                                            <Button 
                                                variant="primary" 
                                                disabled={isVerifying}
                                                className="w-full rounded-2xl py-3 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-[0_12px_24px_-8px_rgba(255,255,255,0.3)] disabled:opacity-50"
                                                onClick={async () => {
                                                    setIsVerifying(true);
                                                    setVerifyError('');
                                                    try {
                                                        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-youtube`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                            body: JSON.stringify({ handle: socialUser, code: verifyCode })
                                                        });
                                                        const result = await res.json();
                                                        if (!res.ok) throw new Error(result.error);
                                                        
                                                        await fetchSync();
                                                        setIsVerifyOpen(false);
                                                    } catch (err: any) {
                                                        setVerifyError(err.message);
                                                    } finally {
                                                        setIsVerifying(false);
                                                    }
                                                }}
                                            >
                                                {isVerifying ? 'Scanning Profile...' : 'Verify Connection'}
                                            </Button>
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
                            className="bg-[#0D0D0D] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative shadow-[0_32px_64px_-16px_rgba(0,0,0,1)]"
                        >
                            <button 
                                onClick={() => setIsSettingsOpen(false)}
                                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                            
                            <div className="space-y-6">
                                <div className="space-y-2 pt-2">
                                    <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
                                    <p className="text-xs text-white/40 leading-relaxed">Update your public identity and bio.</p>
                                </div>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Display Name</label>
                                        <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-white/30 transition-all font-medium" defaultValue={user?.name || ''} placeholder="Set your display name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Email</label>
                                        <div className="relative">
                                            <input type="email" readOnly className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-base text-white/40 cursor-not-allowed focus:outline-none font-medium" value={user?.email || ''} />
                                            <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Bio</label>
                                        <textarea className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-white/30 transition-all resize-none h-28 font-medium" placeholder="Tell us about your content style..." />
                                    </div>
                                    <Button 
                                        variant="primary" 
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="w-full bg-white text-black hover:bg-white/90 rounded-2xl py-4 text-xs font-bold uppercase tracking-widest shadow-xl"
                                    >
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
