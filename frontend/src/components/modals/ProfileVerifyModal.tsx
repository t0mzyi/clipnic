import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { YoutubeIcon, TikTokIcon, InstagramIcon } from '../ui/SocialIcons';
import { Button } from '../ui/Button';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Toast } from '../../lib/swal';

interface ProfileVerifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    verifyCode: string;
    onSync: () => Promise<void>;
    initialSocial?: string;
}


export const ProfileVerifyModal = ({ isOpen, onClose, verifyCode, onSync, initialSocial = '' }: ProfileVerifyModalProps) => {
    const { user, token, settings } = useAuthStore();
    const [step, setStep] = useState<1 | 2>(user?.discordVerified ? 2 : 1);
    const [selectedSocial, setSelectedSocial] = useState(initialSocial);
    const [handle, setHandle] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [showCode, setShowCode] = useState(false);

    // Sync step and social when modal opens or user verification changes
    useEffect(() => {
        if (isOpen) {
            if (user?.discordVerified) {
                setStep(2);
            }
            if (initialSocial) {
                setSelectedSocial(initialSocial);
            }
        }
    }, [isOpen, user?.discordVerified, initialSocial]);

    if (!isOpen) return null;

    const handleDiscordLink = async () => {
        setIsVerifying(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/discord`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            window.location.href = json.url;
        } catch (err) { setIsVerifying(false); }
    };

    const handleYoutubeOAuth = async () => {
        setIsVerifying(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/youtube`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.url) {
                window.location.href = json.url;
            } else {
                throw new Error(json.error || 'Failed to get auth URL');
            }
        } catch (err: any) {
            Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
            setIsVerifying(false);
        }
    };

    const handleManualVerify = async () => {
        if (!handle) return;
        if (!showCode) { setShowCode(true); return; }
        setIsVerifying(true);
        try {
            const endpoint = selectedSocial === 'youtube' ? 'verify-youtube-bio' : selectedSocial === 'instagram' ? 'verify-instagram-bio' : 'verify-tiktok-bio';
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ handle, code: verifyCode })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            Toast.fire({ title: 'Verified!', icon: 'success' });
            await onSync();
            onClose();
        } catch (err: any) {
            Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
        } finally { setIsVerifying(false); }
    };

    const isYoutubeOAuth = selectedSocial === 'youtube' && (settings?.youtube_auth_mode === 'oauth' || !settings?.youtube_auth_mode);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
            <motion.div 
                initial={{ y: 20, opacity: 0, scale: 0.95 }} 
                animate={{ y: 0, opacity: 1, scale: 1 }} 
                className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative shadow-2xl overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 blur-[80px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/5 blur-[80px] rounded-full" />

                <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full z-10"><X size={20} /></button>

                {step === 1 ? (
                    <div className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#5865F2] mb-2">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.874.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
                                {initialSocial ? 'Link Discord First' : 'Discord Link'}
                            </h2>
                            <p className="text-sm text-white/40 leading-relaxed">
                                {initialSocial 
                                    ? `Please connect Discord before linking your ${initialSocial}.` 
                                    : 'Connect your Discord to get started with verification.'}
                            </p>
                        </div>
                        <Button variant="primary" onClick={handleDiscordLink} disabled={isVerifying} className="w-full py-5 rounded-[20px] bg-[#5865F2] text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-[#5865F2]/20">
                            {isVerifying ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Link Discord'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8 relative z-10">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
                                Identity Verification
                            </h2>
                            <p className="text-sm text-white/40 leading-relaxed">
                                Connect your account to start earning.
                            </p>
                        </div>
                        
                        {!initialSocial && !selectedSocial && (
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Select Platform</p>
                                <div className="grid grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => setSelectedSocial('youtube')} 
                                        className="h-24 rounded-[28px] border border-white/5 bg-white/[0.02] text-white/20 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500 transition-all duration-300 flex items-center justify-center group"
                                    >
                                        <YoutubeIcon className="w-8 h-8 transition-transform group-hover:scale-110" />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedSocial('instagram')} 
                                        className="h-24 rounded-[28px] border border-white/5 bg-white/[0.02] text-white/20 hover:border-pink-500/30 hover:bg-pink-500/5 hover:text-pink-500 transition-all duration-300 flex items-center justify-center group"
                                    >
                                        <InstagramIcon className="w-8 h-8 transition-transform group-hover:scale-110" />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedSocial('tiktok')} 
                                        className="h-24 rounded-[28px] border border-white/5 bg-white/[0.02] text-white/20 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-400 transition-all duration-300 flex items-center justify-center group"
                                    >
                                        <TikTokIcon className="w-8 h-8 transition-transform group-hover:scale-110" />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {selectedSocial && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Link New Account</p>
                                        {!initialSocial && (
                                            <button onClick={() => { setSelectedSocial(''); setShowCode(false); setHandle(''); }} className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Change</button>
                                        )}
                                    </div>

                                    {showCode ? (
                                        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6 text-center relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                {selectedSocial === 'instagram' && <InstagramIcon className="w-12 h-12" />}
                                                {selectedSocial === 'youtube' && <YoutubeIcon className="w-12 h-12" />}
                                                {selectedSocial === 'tiktok' && <TikTokIcon className="w-12 h-12" />}
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-white uppercase tracking-widest opacity-40 capitalize">{selectedSocial}</p>
                                                <p className="text-xl font-bold text-white tracking-tight">@{handle}</p>
                                            </div>

                                            <div className="space-y-3 pt-2">
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Verification Code</p>
                                                <div className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 relative group/code cursor-pointer active:scale-95 transition-transform" onClick={() => {
                                                    navigator.clipboard.writeText(verifyCode);
                                                    Toast.fire({ title: 'Code Copied!', icon: 'success' });
                                                }}>
                                                    <p className="text-2xl font-mono font-bold text-white tracking-[0.2em]">{verifyCode}</p>
                                                </div>
                                                <p className="text-[10px] text-white/40 font-medium">Add this to your bio and click verify.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {isYoutubeOAuth ? (
                                                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20 text-red-500">
                                                        <YoutubeIcon className="w-8 h-8" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-lg font-bold text-white">1-Click Verification</p>
                                                        <p className="text-xs text-white/40 leading-relaxed">Link your YouTube channel securely via Google OAuth.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative group">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors">
                                                        {selectedSocial === 'instagram' && <InstagramIcon className="w-5 h-5" />}
                                                        {selectedSocial === 'youtube' && <YoutubeIcon className="w-5 h-5" />}
                                                        {selectedSocial === 'tiktok' && <TikTokIcon className="w-5 h-5" />}
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        autoFocus
                                                        placeholder={selectedSocial === 'youtube' ? "@handle (e.g. @username)" : "Account Handle"} 
                                                        value={handle} 
                                                        onChange={e => setHandle(e.target.value)} 
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all" 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <Button 
                                    onClick={isYoutubeOAuth ? handleYoutubeOAuth : handleManualVerify} 
                                    disabled={isVerifying || (!handle && !isYoutubeOAuth)} 
                                    className="w-full py-5 rounded-[20px] bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/90 active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                                >
                                    {isVerifying ? (
                                        <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                                    ) : (
                                        showCode ? 'Verify Now' : isYoutubeOAuth ? 'Continue with Google' : 'Link Account'
                                    )}
                                </Button>

                                {selectedSocial === 'instagram' && !showCode && (
                                    <p className="text-[10px] text-amber-400/60 font-medium text-center italic">
                                        Note: Instagram verification can take up to 2 minutes.
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

