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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.63-.11.45-.12.92-.01 1.37.11.83.63 1.57 1.35 1.97.66.36 1.45.41 2.18.23.69-.15 1.3-.57 1.69-1.16.27-.42.41-.9.44-1.39-.03-3.9-.01-7.8-.02-11.7z" /></svg>
);

const YoutubeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);

const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

export const JoinCampaignModal = ({ isOpen, onClose, campaign, onJoined, verifyCode }: JoinCampaignModalProps) => {
    const { user, token, updateUser, settings } = useAuthStore();
    const [step, setStep] = useState(1);
    const [selectedSocial, setSelectedSocial] = useState('');
    const [linkedHandle, setLinkedHandle] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [showYtCode] = useState(false);
    const [showIgCode, setShowIgCode] = useState(false);
    const [showTtCode, setShowTtCode] = useState(false);
    const [linkMode, setLinkMode] = useState<'select' | 'new'>('select');

    if (!isOpen) return null;

    const allowed = campaign?.allowed_platforms || [];
    const linkedAccounts = [
        { type: 'youtube', verified: user?.youtubeVerified, handle: user?.youtubeHandle, icon: YoutubeIcon, color: 'text-red-500' },
        { type: 'instagram', verified: user?.instagramVerified, handle: user?.instagramHandle, icon: InstagramIcon, color: 'text-pink-500' },
        { type: 'tiktok', verified: user?.tiktokVerified, handle: user?.tiktokHandle, icon: TikTokIcon, color: 'text-cyan-400' }
    ].filter(acc => acc.verified && allowed.includes(acc.type));

    const needsDedicated = campaign?.requires_dedicated_social;

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
                        <Button 
                            variant="primary" 
                            onClick={() => {
                                // If they have linked socials AND it's not a dedicated campaign, they can theoretically auto-join,
                                // but the user wants them to be able to select or link new. So we always go to Step 2 if not Discord-verified.
                                if (!user?.discordVerified || linkedAccounts.length === 0 || needsDedicated) {
                                    setStep(2);
                                } else {
                                    // Even if they have linked accounts, let them select or link new
                                    setStep(2);
                                }
                            }} 
                            className="w-full rounded-2xl py-4 font-bold uppercase tracking-widest text-xs bg-emerald-500 text-white hover:bg-emerald-400"
                        >
                            Understood, Continue
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Identity Verification</h2>
                            <p className="text-sm text-white/40">
                                {needsDedicated ? 'This campaign requires a dedicated account.' : 'Connect your account to start earning.'}
                            </p>
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
                            <div className="space-y-6">
                                {linkedAccounts.length > 0 && !needsDedicated && linkMode === 'select' ? (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Select Linked Account</p>
                                        <div className="space-y-2">
                                            {linkedAccounts.map((acc, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={() => onJoined(acc.handle || '')}
                                                    className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/5 transition-all flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${acc.color}`}>
                                                            <acc.icon />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-xs font-bold text-white">{acc.handle}</p>
                                                            <p className="text-[10px] text-white/20 uppercase tracking-widest">{acc.type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => setLinkMode('new')}
                                            className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                                        >
                                            + Link a new account
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Link New Account</p>
                                            {linkedAccounts.length > 0 && !needsDedicated && (
                                                <button onClick={() => setLinkMode('select')} className="text-[9px] font-bold text-emerald-400 hover:underline uppercase tracking-widest">Back to selection</button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button onClick={() => setSelectedSocial('youtube')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedSocial === 'youtube' ? 'bg-[#FF0000]/10 border-[#FF0000]/40 text-[#FF0000]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                                                <YoutubeIcon />
                                                <span className="text-[8px] font-bold uppercase">YouTube</span>
                                            </button>
                                            <button onClick={() => setSelectedSocial('instagram')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedSocial === 'instagram' ? 'bg-[#E1306C]/10 border-[#E1306C]/40 text-[#E1306C]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                                                <InstagramIcon />
                                                <span className="text-[8px] font-bold uppercase">Instagram</span>
                                            </button>
                                            <button onClick={() => setSelectedSocial('tiktok')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedSocial === 'tiktok' ? 'bg-[#00f2fe]/10 border-[#00f2fe]/40 text-[#00f2fe]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                                                <TikTokIcon />
                                                <span className="text-[8px] font-bold uppercase">TikTok</span>
                                            </button>
                                        </div>

                                        {selectedSocial && (
                                            <div className="pt-2 space-y-4">
                                                {selectedSocial === 'youtube' && (settings?.youtube_auth_mode === 'oauth' || !settings?.youtube_auth_mode) ? (
                                                    <div className="space-y-4">
                                                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
                                                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20 text-red-500">
                                                                <YoutubeIcon />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">1-Click Verification</p>
                                                                <p className="text-xs text-white/40">Link your channel directly via Google.</p>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            variant="primary" 
                                                            onClick={handleYouTubeOAuth}
                                                            disabled={isVerifying}
                                                            className="w-full py-5 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg shadow-white/5"
                                                        >
                                                            {isVerifying ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Continue with Google'}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
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
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {error && <p className="text-[10px] text-red-500 text-center font-bold uppercase">{error}</p>}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
