import { motion } from 'framer-motion';
import { X, Loader2, ShieldCheck, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dropdown } from '../Dropdown';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Toast } from '../../lib/swal';

interface JoinCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: any;
    onJoined: (handle?: string) => void;
    verifyCode: string;
    initialStep?: number;
}

const TikTokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
        <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
    </svg>
);

const YoutubeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 576 512" fill="currentColor">
        <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.781 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/>
    </svg>
);

const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.8 9.9 67.6 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
    </svg>
);

export const JoinCampaignModal = ({ isOpen, onClose, campaign, onJoined, verifyCode, initialStep = 1 }: JoinCampaignModalProps) => {
    const { user, token, updateUser, settings } = useAuthStore();
    const [step, setStep] = useState(initialStep);
    
    useEffect(() => {
        if (isOpen) setStep(initialStep);
    }, [isOpen, initialStep]);
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
            localStorage.setItem('pending_join_campaign_id', campaign.id);
            localStorage.setItem('pending_join_step', '2');
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
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full z-[100] group"
                >
                    <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Campaign Rules</h2>
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
                                if (!needsDedicated && linkedAccounts.length > 0) {
                                    onJoined();
                                    return;
                                }
                                setStep(2);
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
                                            localStorage.setItem('pending_join_campaign_id', campaign.id);
                                            localStorage.setItem('pending_join_step', '2');
                                            const currentUrl = window.location.href;
                                            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/discord?redirectTo=${encodeURIComponent(currentUrl)}`, {
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
                                {linkedAccounts.length > 0 && linkMode === 'select' ? (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <Dropdown
                                                label="Select Account"
                                                placeholder="Select an account..."
                                                value=""
                                                onChange={(val) => {
                                                    if (val === 'new') {
                                                        setLinkMode('new');
                                                    } else {
                                                        const acc = linkedAccounts.find(a => a.handle === val);
                                                        if (acc) onJoined(acc.handle || '');
                                                    }
                                                }}
                                                options={[
                                                    ...linkedAccounts.map(acc => ({
                                                        label: `${acc.handle} (${acc.type})`,
                                                        value: acc.handle || '',
                                                        icon: <div className={acc.color}><acc.icon /></div>
                                                    })),
                                                    { label: 'Link a new account...', value: 'new', icon: <Plus size={16} className="text-emerald-500" /> }
                                                ]}
                                            />
                                        </div>
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <p className="text-[10px] text-white/50 leading-relaxed">Selecting a linked account will instantly register you for this campaign.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Link New Account</p>
                                            {linkedAccounts.length > 0 && !needsDedicated && (
                                                <button onClick={() => setLinkMode('select')} className="text-[9px] font-bold text-emerald-400 hover:underline uppercase tracking-widest">Back to selection</button>
                                            )}
                                        </div>
                                        <div className={`grid gap-3 ${allowed.length === 1 ? 'grid-cols-1' : allowed.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                            {allowed.includes('youtube') && (
                                                <button onClick={() => setSelectedSocial('youtube')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedSocial === 'youtube' ? 'bg-[#FF0000]/10 border-[#FF0000]/40 text-[#FF0000]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                                                    <YoutubeIcon />
                                                    <span className="text-[8px] font-bold uppercase">YouTube</span>
                                                </button>
                                            )}
                                            {allowed.includes('instagram') && (
                                                <button onClick={() => setSelectedSocial('instagram')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedSocial === 'instagram' ? 'bg-[#E1306C]/10 border-[#E1306C]/40 text-[#E1306C]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                                                    <InstagramIcon />
                                                    <span className="text-[8px] font-bold uppercase">Instagram</span>
                                                </button>
                                            )}
                                            {allowed.includes('tiktok') && (
                                                <button onClick={() => setSelectedSocial('tiktok')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedSocial === 'tiktok' ? 'bg-[#00f2fe]/10 border-[#00f2fe]/40 text-[#00f2fe]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                                                    <TikTokIcon />
                                                    <span className="text-[8px] font-bold uppercase">TikTok</span>
                                                </button>
                                            )}
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
                                                                <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
                                    You're In
                                </h2>
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
