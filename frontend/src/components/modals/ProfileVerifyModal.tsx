import { motion } from 'framer-motion';
import { X, Loader2, Play, Camera, Youtube } from 'lucide-react';
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

const TikTokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.63-.11.45-.12.92-.01 1.37.11.83.63 1.57 1.35 1.97.66.36 1.45.41 2.18.23.69-.15 1.3-.57 1.69-1.16.27-.42.41-.9.44-1.39-.03-3.9-.01-7.8-.02-11.7z" /></svg>
);

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
                            <h2 className="text-2xl font-bold tracking-tight">Discord Link</h2>
                            <p className="text-sm text-white/40">Connect your Discord.</p>
                        </div>
                        <Button variant="primary" onClick={handleDiscordLink} disabled={isVerifying} className="w-full py-4 rounded-2xl bg-[#5865F2] text-white">
                            {isVerifying ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Link Discord'}
                        </Button>
                        <button 
                            onClick={() => setStep(2)} 
                            className="w-full text-[10px] text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors"
                        >
                            Skip to Socials
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Social Platforms</h2>
                            <p className="text-sm text-white/40">Choose a platform to link.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <button 
                                onClick={() => setSelectedSocial('youtube')} 
                                className={`h-24 rounded-[28px] border transition-all duration-500 flex items-center justify-center group ${selectedSocial === 'youtube' ? 'border-red-500/40 bg-red-500/5 text-white shadow-[0_15px_30px_rgba(239,68,68,0.1)]' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-white/10 hover:bg-white/[0.04]'}`}
                            >
                                <Play size={28} className={`transition-transform duration-500 ${selectedSocial === 'youtube' ? 'scale-110' : 'group-hover:scale-105 group-hover:text-white/40'}`} />
                            </button>
                            <button 
                                onClick={() => setSelectedSocial('instagram')} 
                                className={`h-24 rounded-[28px] border transition-all duration-500 flex items-center justify-center group ${selectedSocial === 'instagram' ? 'border-pink-500/40 bg-pink-500/5 text-white shadow-[0_15px_30px_rgba(236,72,153,0.1)]' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-white/10 hover:bg-white/[0.04]'}`}
                            >
                                <Camera size={28} className={`transition-transform duration-500 ${selectedSocial === 'instagram' ? 'scale-110' : 'group-hover:scale-105 group-hover:text-white/40'}`} />
                            </button>
                            <button 
                                onClick={() => setSelectedSocial('tiktok')} 
                                className={`h-24 rounded-[28px] border transition-all duration-500 flex items-center justify-center group ${selectedSocial === 'tiktok' ? 'border-cyan-500/40 bg-cyan-500/5 text-white shadow-[0_15px_30px_rgba(6,182,212,0.1)]' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-white/10 hover:bg-white/[0.04]'}`}
                            >
                                <div className={`transition-transform duration-500 ${selectedSocial === 'tiktok' ? 'scale-110' : 'group-hover:scale-105 group-hover:text-white/40'}`}>
                                    <TikTokIcon />
                                </div>
                            </button>
                        </div>
                        
                        {selectedSocial && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                                {isYoutubeOAuth ? (
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20 text-red-500">
                                            <Youtube size={20} />
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
