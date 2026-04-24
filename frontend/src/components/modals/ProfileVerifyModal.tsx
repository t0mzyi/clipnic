import { motion } from 'framer-motion';
import { X, Loader2, Play, Camera, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Toast } from '../../lib/swal';

interface ProfileVerifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    verifyCode: string;
    onSync: () => Promise<void>;
}

const TikTokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.63-.11.45-.12.92-.01 1.37.11.83.63 1.57 1.35 1.97.66.36 1.45.41 2.18.23.69-.15 1.3-.57 1.69-1.16.27-.42.41-.9.44-1.39-.03-3.9-.01-7.8-.02-11.7z" /></svg>
);

export const ProfileVerifyModal = ({ isOpen, onClose, verifyCode, onSync }: ProfileVerifyModalProps) => {
    const { user, token } = useAuthStore();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedSocial, setSelectedSocial] = useState('');
    const [handle, setHandle] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [showCode, setShowCode] = useState(false);

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
                            onClick={() => {
                                if (user?.discordVerified) {
                                    setStep(2);
                                } else {
                                    Toast.fire({ title: 'Discord Required', text: 'Please link your Discord first to unlock other platforms.', icon: 'warning' });
                                }
                            }} 
                            className="w-full text-[10px] text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            Skip to Socials
                            {!user?.discordVerified && <ShieldCheck size={10} className="text-white/20" />}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Social Platforms</h2>
                            <p className="text-sm text-white/40">Choose a platform to link.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => setSelectedSocial('youtube')} className={`p-4 rounded-2xl border ${selectedSocial === 'youtube' ? 'border-red-500/50 bg-red-500/10' : 'border-white/5 bg-white/5'}`}><Play /></button>
                            <button onClick={() => setSelectedSocial('instagram')} className={`p-4 rounded-2xl border ${selectedSocial === 'instagram' ? 'border-pink-500/50 bg-pink-500/10' : 'border-white/5 bg-white/5'}`}><Camera /></button>
                            <button onClick={() => setSelectedSocial('tiktok')} className={`p-4 rounded-2xl border ${selectedSocial === 'tiktok' ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/5 bg-white/5'}`}><TikTokIcon /></button>
                        </div>
                        {selectedSocial && (
                            <div className="space-y-4 pt-4">
                                <input type="text" placeholder="Handle..." value={handle} onChange={e => setHandle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                                {showCode && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Bio Code</p>
                                        <p className="font-mono text-white text-lg font-bold">{verifyCode}</p>
                                    </div>
                                )}
                                <Button onClick={handleManualVerify} disabled={isVerifying} className="w-full py-4 rounded-2xl bg-white text-black text-xs font-bold uppercase">{isVerifying ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : showCode ? 'Verify Now' : 'Link Account'}</Button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
