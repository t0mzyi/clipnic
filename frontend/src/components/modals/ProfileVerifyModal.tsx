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
            // Fix: endpoint for YouTube bio verification is verify-youtube
            const endpoint = selectedSocial === 'youtube' ? 'verify-youtube' : selectedSocial === 'instagram' ? 'verify-instagram-bio' : 'verify-tiktok-bio';
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#0D0D0D] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>

                {step === 1 ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {initialSocial ? 'Link Discord First' : 'Discord Link'}
                            </h2>
                            <p className="text-sm text-white/40">
                                {initialSocial 
                                    ? `Please connect Discord before linking your ${initialSocial}.` 
                                    : 'Connect your Discord to get started.'}
                            </p>
                        </div>
                        <Button variant="primary" onClick={handleDiscordLink} disabled={isVerifying} className="w-full py-4 rounded-2xl bg-[#5865F2] text-white">
                            {isVerifying ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Link Discord'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight capitalize">
                                {selectedSocial ? `${selectedSocial} Verification` : 'Social Platforms'}
                            </h2>
                            <p className="text-sm text-white/40">
                                {selectedSocial ? `Link your ${selectedSocial} account.` : 'Choose a platform to link.'}
                                {selectedSocial === 'instagram' && (
                                    <span className="block mt-1 text-[10px] text-amber-400/60 font-medium">
                                        Note: Instagram verification can take up to 2 minutes.
                                    </span>
                                )}
                            </p>
                        </div>
                        
                        {!initialSocial && (
                            <div className="grid grid-cols-3 gap-4">
                                <button 
                                    onClick={() => setSelectedSocial('youtube')} 
                                    className={`h-24 rounded-[28px] border transition-all duration-500 flex items-center justify-center group ${selectedSocial === 'youtube' ? 'border-red-500/40 bg-red-500/5 text-white shadow-[0_15px_30px_rgba(239,68,68,0.1)]' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-white/10 hover:bg-white/[0.04]'}`}
                                >
                                    <div className={`transition-transform duration-500 ${selectedSocial === 'youtube' ? 'scale-110 text-red-500' : 'group-hover:scale-105 group-hover:text-white/40'}`}>
                                        <YoutubeIcon className="w-8 h-8" />
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setSelectedSocial('instagram')} 
                                    className={`h-24 rounded-[28px] border transition-all duration-500 flex items-center justify-center group ${selectedSocial === 'instagram' ? 'border-pink-500/40 bg-pink-500/5 text-white shadow-[0_15px_30px_rgba(236,72,153,0.1)]' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-white/10 hover:bg-white/[0.04]'}`}
                                >
                                    <div className={`transition-transform duration-500 ${selectedSocial === 'instagram' ? 'scale-110 text-pink-500' : 'group-hover:scale-105 group-hover:text-white/40'}`}>
                                        <InstagramIcon className="w-8 h-8" />
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setSelectedSocial('tiktok')} 
                                    className={`h-24 rounded-[28px] border transition-all duration-500 flex items-center justify-center group ${selectedSocial === 'tiktok' ? 'border-cyan-500/40 bg-cyan-500/5 text-white shadow-[0_15px_30px_rgba(6,182,212,0.1)]' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-white/10 hover:bg-white/[0.04]'}`}
                                >
                                    <div className={`transition-transform duration-500 ${selectedSocial === 'tiktok' ? 'scale-110 text-cyan-400' : 'group-hover:scale-105 group-hover:text-white/40'}`}>
                                        <TikTokIcon className="w-8 h-8" />
                                    </div>
                                </button>
                            </div>
                        )}
                        
                        {selectedSocial && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                                {isYoutubeOAuth ? (
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20 text-red-500">
                                            <YoutubeIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">1-Click Verification</p>
                                            <p className="text-xs text-white/40">Link your channel directly via Google.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <input 
                                            type="text" 
                                            placeholder={selectedSocial === 'youtube' ? "Channel Handle (e.g. @username)" : "Account Handle"} 
                                            value={handle} 
                                            onChange={e => setHandle(e.target.value)} 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-white/20 transition-colors" 
                                        />
                                        {showCode && (
                                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Add this to your bio</p>
                                                <p className="font-mono text-white text-xl font-bold tracking-wider">{verifyCode}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                <Button 
                                    onClick={isYoutubeOAuth ? handleYoutubeOAuth : handleManualVerify} 
                                    disabled={isVerifying} 
                                    className="w-full py-5 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg shadow-white/5"
                                >
                                    {isVerifying ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : showCode ? 'Verify Now' : isYoutubeOAuth ? 'Continue with Google' : 'Link Account'}
                                </Button>
                            </motion.div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
