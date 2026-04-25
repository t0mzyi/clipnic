import { motion } from 'framer-motion';
import { X, Loader2, Play, Camera, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Toast } from '../../lib/swal';

interface JoinCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: any;
    onJoined: (handle?: string) => void;
    verifyCode: string;
}

const TikTokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
);

export const JoinCampaignModal = ({ isOpen, onClose, campaign, onJoined, verifyCode }: JoinCampaignModalProps) => {
    const { user, token, updateUser } = useAuthStore();
    const [step, setStep] = useState(1);
    const [selectedSocial, setSelectedSocial] = useState('');
    const [linkedHandle, setLinkedHandle] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [showYtCode] = useState(false);
    const [showIgCode, setShowIgCode] = useState(false);
    const [showTtCode, setShowTtCode] = useState(false);

    if (!isOpen) return null;

    const handleSync = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                updateUser({
                    discordVerified: result.data.discord_verified,
                    youtubeVerified: result.data.youtube_verified,
                    youtubeHandle: result.data.youtube_handle,
                    instagramVerified: result.data.instagram_verified,
                    instagramHandle: result.data.instagram_handle,
                    youtubeChannels: result.data.youtube_channels,
                    tiktokVerified: result.data.tiktok_verified,
                    tiktokHandle: result.data.tiktok_handle
                });
                return result.data;
            }
        } catch (e) { console.error(e); }
    };

    const handleYouTubeVerify = async () => {
        if (!linkedHandle) return;
        setIsVerifying(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-youtube-bio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ handle: linkedHandle, code: verifyCode })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);

            Toast.fire({ title: 'Verified!', text: 'YouTube account linked.', icon: 'success' });
            await handleSync();
            onJoined(linkedHandle);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleYouTubeOAuth = async () => {
        setIsVerifying(true);
        try {
            const returnUrl = encodeURIComponent(window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'youtube_success=true');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/youtube?redirectTo=${returnUrl}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            window.location.href = json.url;
        } catch (err: any) {
            setError(err.message);
            setIsVerifying(false);
        }
    };

    const handleInstagramVerify = async () => {
        if (!linkedHandle) return;
        if (!showIgCode) { setShowIgCode(true); return; }
        setIsVerifying(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-instagram-bio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ handle: linkedHandle, code: verifyCode })
            });
            const json = await res.json();
            if (!json.success) throw json;
            Toast.fire({ title: 'Success!', icon: 'success' });
            await handleSync();
            onJoined(linkedHandle);
        } catch (err: any) {
            setError(err.error || err.message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleTiktokVerify = async () => {
        if (!linkedHandle) return;
        if (!showTtCode) { setShowTtCode(true); return; }
        setIsVerifying(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-tiktok-bio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ handle: linkedHandle, code: verifyCode })
            });
            const json = await res.json();
            if (!json.success) throw json;
            Toast.fire({ title: 'Success!', icon: 'success' });
            await handleSync();
            onJoined(linkedHandle);
        } catch (err: any) {
            setError(err.error || err.message);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div 
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                className="bg-[#0D0D0D] border border-white/10 rounded-[32px] p-8 max-w-lg w-full relative shadow-2xl"
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                    <X size={20} />
                </button>

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Mission Briefing</h2>
                            <p className="text-sm text-white/40">Review the guidelines before joining the campaign.</p>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {campaign.rules?.map((rule: string, i: number) => (
                                <div key={i} className="flex gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <p className="text-xs text-white/70 leading-relaxed">{rule}</p>
                                </div>
                            ))}
                        </div>
                        <Button variant="primary" onClick={() => setStep(2)} className="w-full rounded-2xl py-4 font-bold uppercase tracking-widest text-xs bg-emerald-500 text-white hover:bg-emerald-400">Understood, Continue</Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Identity Verification</h2>
                            <p className="text-sm text-white/40">Connect your account to start earning.</p>
                        </div>

                        {!user?.discordVerified ? (
                            <div className="space-y-4 text-center py-4">
                                <div className="w-16 h-16 bg-[#5865F2]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#5865F2]/20 mb-2">
                                    <ShieldCheck className="w-8 h-8 text-[#5865F2]" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white">Discord Required</p>
                                    <p className="text-xs text-white/40">Connect your Discord to join this mission.</p>
                                </div>
                                <Button 
                                    variant="primary" 
                                    onClick={async () => {
                                        setIsVerifying(true);
                                        try {
                                            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/discord`, {
                                                headers: { 'Authorization': `Bearer ${token}` }
                                            });
                                            const json = await res.json();
                                            window.location.href = json.url;
                                        } catch (err) { setIsVerifying(false); }
                                    }} 
                                    disabled={isVerifying}
                                    className="w-full py-4 rounded-2xl bg-[#5865F2] text-white font-bold uppercase tracking-widest text-xs"
                                >
                                    {isVerifying ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Link Discord'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Select Platform</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <button onClick={() => setSelectedSocial('youtube')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedSocial === 'youtube' ? 'bg-[#FF0000]/10 border-[#FF0000]/40 text-[#FF0000]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                                        <Play size={20} />
                                        <span className="text-[8px] font-bold uppercase">YouTube</span>
                                    </button>
                                    <button onClick={() => setSelectedSocial('instagram')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedSocial === 'instagram' ? 'bg-[#E1306C]/10 border-[#E1306C]/40 text-[#E1306C]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                                        <Camera size={20} />
                                        <span className="text-[8px] font-bold uppercase">Instagram</span>
                                    </button>
                                    <button onClick={() => setSelectedSocial('tiktok')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedSocial === 'tiktok' ? 'bg-[#00f2fe]/10 border-[#00f2fe]/40 text-[#00f2fe]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                                        <TikTokIcon />
                                        <span className="text-[8px] font-bold uppercase">TikTok</span>
                                    </button>
                                </div>

                                {selectedSocial && (
                                    <div className="pt-4 space-y-4">
                                        {selectedSocial === 'youtube' && user?.youtubeVerified ? (
                                            <Button variant="primary" onClick={() => onJoined(user.youtubeHandle)} className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold uppercase tracking-widest text-xs">Join with {user.youtubeHandle}</Button>
                                        ) : selectedSocial === 'instagram' && user?.instagramVerified ? (
                                            <Button variant="primary" onClick={() => onJoined(user.instagramHandle)} className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold uppercase tracking-widest text-xs">Join with {user.instagramHandle}</Button>
                                        ) : selectedSocial === 'tiktok' && user?.tiktokVerified ? (
                                            <Button variant="primary" onClick={() => onJoined(user.tiktokHandle)} className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold uppercase tracking-widest text-xs">Join with {user.tiktokHandle}</Button>
                                        ) : (
                                            <div className="space-y-4">
                                                <input 
                                                    type="text" 
                                                    placeholder={`Enter ${selectedSocial} handle...`}
                                                    value={linkedHandle}
                                                    onChange={(e) => setLinkedHandle(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-all"
                                                />
                                                {(showIgCode || showYtCode || showTtCode) && (
                                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                                                        <p className="text-[10px] text-emerald-500 font-bold uppercase">Verification Code</p>
                                                        <p className="text-xl font-mono font-bold text-white tracking-widest">{verifyCode}</p>
                                                        <p className="text-[10px] text-white/40">Add this to your bio and click verify.</p>
                                                    </div>
                                                )}
                                                <Button 
                                                    variant="primary" 
                                                    disabled={isVerifying || !linkedHandle}
                                                    onClick={selectedSocial === 'youtube' ? handleYouTubeVerify : selectedSocial === 'instagram' ? handleInstagramVerify : handleTiktokVerify}
                                                    className="w-full py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-xs"
                                                >
                                                    {isVerifying ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : (showIgCode || showYtCode || showTtCode) ? 'Verify Now' : 'Link Account'}
                                                </Button>
                                                {selectedSocial === 'youtube' && !showYtCode && (
                                                    <button onClick={handleYouTubeOAuth} className="w-full text-[10px] text-white/30 uppercase font-bold tracking-widest hover:text-white transition-colors">Or Link via Google</button>
                                                )}
                                            </div>
                                        )}
                                        {error && <p className="text-[10px] text-red-500 text-center font-bold uppercase">{error}</p>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
