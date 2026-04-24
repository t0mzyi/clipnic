import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useState, useEffect } from 'react';
import { Shield, Eye, Clock, Target, Upload, ChevronLeft, X, CheckCircle, Globe, Trophy, Award, Medal, Trash2, AlertCircle } from 'lucide-react';
import { Dropdown } from '../components/Dropdown';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';

interface Campaign {
    id: string;
    title: string;
    description: string;
    discord_channel: string;
    source_link?: string;
    cpm_rate: number;
    total_budget: number;
    budget_used: number;
    min_views: number;
    end_date: string;
    banner_url?: string;
    requires_verification: boolean; // Legacy
    allowed_platforms: string[];
    requires_dedicated_social: boolean;
    requires_discord: boolean;
    rules: string[];
    status: string;
    view_progress: number;
    target_views: number;
    start_date?: string;
    auto_start?: boolean;
}

const FALLBACK_BANNERS = [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2000&auto=format&fit=crop',
];

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

export const CampaignDetails = () => {
    const { id } = useParams();
    const { token, user, settings } = useAuthStore();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);

    // Joint State
    const [isJoined, setIsJoined] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [joinStep, setJoinStep] = useState(1);
    const [isDiscordTransitioning, setIsDiscordTransitioning] = useState(false);
    const [linkedHandle, setLinkedHandle] = useState('');

    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [platform, setPlatform] = useState<'youtube' | 'instagram' | 'tiktok' | ''>('');

    const [submissions, setSubmissions] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifyingSocial, setIsVerifyingSocial] = useState(false);
    const [socialVerifyError, setSocialVerifyError] = useState('');
    const [verifyCode] = useState(() => 'CLPNIC-' + Math.random().toString(36).substring(2, 8).toUpperCase());
    const [showYtCode, setShowYtCode] = useState(false);
    const [showIgCode, setShowIgCode] = useState(false);
    const [showTtCode, setShowTtCode] = useState(false);

    const [isCheckingUrl, setIsCheckingUrl] = useState(false);
    const [isUrlValid, setIsUrlValid] = useState(true);
    const [urlError, setUrlError] = useState('');

    const now = new Date();
    const isComingSoon = campaign?.start_date && new Date(campaign.start_date) > now;

    const handleYouTubeVerify = async () => {
        if (!linkedHandle) return;
        setIsVerifyingSocial(true);
        setSocialVerifyError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-youtube-bio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ handle: linkedHandle, code: verifyCode })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);

            Toast.fire({ title: 'Verified!', text: 'YouTube account linked successfully.', icon: 'success' });
            setShowYtCode(false);
            setLinkedHandle(linkedHandle);
            // Refresh user data
            window.location.reload(); 
        } catch (err: any) {
            setSocialVerifyError(err.message);
        } finally {
            setIsVerifyingSocial(false);
        }
    };

    const handleYouTubeOAuth = async () => {
        setIsVerifyingSocial(true);
        setSocialVerifyError('');
        try {
            // Append success flag so modal re-opens on return
            const returnUrl = encodeURIComponent(window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'youtube_success=true');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/youtube?redirectTo=${returnUrl}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            
            // Redirect to Google OAuth
            window.location.href = json.url;
        } catch (err: any) {
            setSocialVerifyError(err.message);
            setIsVerifyingSocial(false);
        }
    };

    const handleTiktokVerify = async () => {
        if (!linkedHandle) return;
        setIsVerifyingSocial(true);
        setSocialVerifyError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-tiktok-bio`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ handle: linkedHandle, code: verifyCode })
            });
            const json = await res.json();
            if (!json.success) throw json;

            Toast.fire({ title: 'TikTok Linked!', icon: 'success' });
            fetchSync();
            setJoinStep(3);
        } catch (err: any) {
            setSocialVerifyError(err.details || err.error || err.message || 'Verification failed');
        } finally {
            setIsVerifyingSocial(false);
        }
    };

    const fetchSync = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                const { updateUser } = useAuthStore.getState();
                updateUser({
                    discordVerified: result.data.discord_verified,
                    youtubeVerified: result.data.youtube_verified,
                    youtubeHandle: result.data.youtube_handle,
                    instagramVerified: result.data.instagram_verified,
                    instagramHandle: result.data.instagram_handle,
                    instagramHandles: result.data.instagram_handle ? [result.data.instagram_handle] : [],
                    youtubeChannels: result.data.youtube_channels,
                    tiktokVerified: result.data.tiktok_verified,
                    tiktokHandle: result.data.tiktok_handle
                });
            }
        } catch (e) {
            console.error('Sync failed:', e);
        }
    };

    const fetchCampaign = async () => {
        if (!id) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${id}?t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setCampaign(json.data);
        } catch (err) {
            console.error('Failed to fetch campaign:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        if (!id || !token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/campaign/${id}/my?t=${Date.now()}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const json = await res.json();
                if (json.success) setSubmissions(json.data);
            } else {
                const text = await res.text();
                console.error('Failed to fetch submissions (non-JSON):', text.slice(0, 100));
            }
        } catch (err) { console.error('Failed to fetch my submissions:', err); }
    };

    const fetchLeaderboard = async () => {
        if (!id) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/campaign/${id}/leaderboard`);
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const json = await res.json();
                if (json.success) setLeaderboard(json.data);
            } else {
                const text = await res.text();
                console.error('Failed to fetch leaderboard (non-JSON):', text.slice(0, 100));
            }
        } catch (err) { console.error('Failed to fetch leaderboard:', err); }
    };

    const checkParticipation = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/participations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setIsJoined(json.data.includes(id));
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (id) {
            fetchCampaign();
            fetchSubmissions();
            fetchLeaderboard();

            // Auto-refresh every 10 seconds for real-time feel
            const interval = setInterval(() => {
                fetchCampaign();
                fetchSubmissions();
                fetchLeaderboard();
            }, 10000);

            if (token) {
                checkParticipation();
            }
            return () => clearInterval(interval);
        }
    }, [id, token]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const dSuccess = searchParams.get('discord_success');
        const iSuccess = searchParams.get('instagram_success');
        const ySuccess = searchParams.get('youtube_success');

        if (dSuccess || iSuccess || ySuccess) {
            setIsJoinModalOpen(true);
            if (dSuccess) {
                setJoinStep(2);
                Toast.fire({ title: 'Discord Linked!', icon: 'success' });
            }
            if (iSuccess || ySuccess) {
                setJoinStep(3);
                Toast.fire({ title: 'Social Linked!', icon: 'success' });
            }

            // Sync user data to get the new handles/channels
            fetchSync();

            // Clean up URL parameters without refreshing the page
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [token, id]); // Added id as dependency

    // Auto-detect platform from URL
    useEffect(() => {
        const url = submissionUrl.toLowerCase();
        if (url.includes('youtube.com') || url.includes('youtu.be')) setPlatform('youtube');
        else if (url.includes('instagram.com')) setPlatform('instagram');
        else if (url.includes('tiktok.com')) setPlatform('tiktok');
        else setPlatform('');
    }, [submissionUrl]);

    // Debounced URL Availability Check
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (submissionUrl && submissionUrl.length > 10) {
                setIsCheckingUrl(true);
                setUrlError('');
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/check-url?url=${encodeURIComponent(submissionUrl)}${platform ? `&platform=${platform}` : ''}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const json = await res.json();
                    if (json.success) {
                        setIsUrlValid(json.data.available);
                        if (!json.data.available) {
                            setUrlError('This video has already been submitted to Clipnic.');
                        }
                    }
                } catch (err) {
                    console.error('URL check failed:', err);
                } finally {
                    setIsCheckingUrl(false);
                }
            } else {
                setIsUrlValid(true);
                setUrlError('');
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [submissionUrl, token]);

    // Lock body scroll when any modal is open
    useEffect(() => {
        if (isJoinModalOpen || isSubmitModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isJoinModalOpen, isSubmitModalOpen]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
    );

    if (!campaign) return (
        <div className="text-center py-24">
            <p className="text-white/30 text-sm mb-6">Campaign not found.</p>
            <Link to="/campaigns" className="text-white/50 hover:text-white text-sm underline">Back to Campaigns</Link>
        </div>
    );

    const viewsPercent = campaign.target_views > 0
        ? Math.round((campaign.view_progress / campaign.target_views) * 100)
        : 0;
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000));
    const banner = campaign.banner_url || FALLBACK_BANNERS[0];

    const handleNextFromRules = () => {
        setIsDiscordTransitioning(true);
        setTimeout(() => {
            setIsDiscordTransitioning(false);
            setJoinStep(2);
        }, 800);
    };


    const handleNextFromDiscord = () => {
        setJoinStep(3);
    };


    const handleInstagramVerify = async () => {
        if (!linkedHandle) {
            Toast.fire({ title: 'Error', text: 'Please enter your Instagram handle', icon: 'error' });
            return;
        }

        if (!showIgCode) {
            setShowIgCode(true);
            return;
        }

        setIsVerifyingSocial(true);
        setSocialVerifyError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-instagram-bio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ handle: linkedHandle, code: verifyCode })
            });

            const data = await res.json();
            if (!res.ok) throw data;

            Toast.fire({ title: 'Success', text: 'Instagram account verified! You can now remove the code from your bio.', icon: 'success' });
            await fetchSync();
            handleJoinSubmit(); 
        } catch (err: any) {
            setSocialVerifyError(err.details || err.error || err.message || 'Verification failed');
        } finally {
            setIsVerifyingSocial(false);
        }
    };



    const handleJoinSubmit = async (handleOverride?: string) => {
        setIsSubmitting(true);
        try {
            const finalHandle = handleOverride || linkedHandle;

            if (campaign?.status !== 'Active') {
                throw new Error("This campaign is currently not accepting new participants.");
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${id}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkedHandle: finalHandle })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);

            setIsJoined(true);
            setJoinStep(4); // Success
            Toast.fire({ title: 'Welcome Aboard!', text: 'You are now part of this campaign.', icon: 'success' });
            
            // Sync: Refresh data immediately
            fetchCampaign();
            fetchSubmissions();
            fetchSync();
        } catch (err: any) {
            Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleSubmitClip = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!platform) {
            Toast.fire({ title: 'Invalid Link', text: 'Please provide a valid YouTube, Instagram, or TikTok link.', icon: 'error' });
            setIsSubmitting(false);
            return;
        }

        if (campaign?.allowed_platforms && !campaign.allowed_platforms.includes(platform)) {
            Toast.fire({ 
                title: 'Platform Not Allowed', 
                text: `This mission only accepts: ${campaign.allowed_platforms.map(p => p === 'youtube' ? 'YouTube Shorts' : p === 'instagram' ? 'Instagram Reels' : 'TikTok').join(', ')}`, 
                icon: 'error' 
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaign_id: id, url: submissionUrl, platform })
            });
            const json = await res.json();

            if (!json.success) throw new Error(json.error);

            Toast.fire({ title: 'Clip Submitted!', text: 'Your clip is now in review.', icon: 'success' });
            setSubmissions(prev => [json.data, ...prev]);
            
            // Sync: Re-fetch campaign data to update budget/views
            fetchCampaign();
            
            setIsSubmitModalOpen(false);
            setSubmissionUrl('');
        } catch (err: any) {
            Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSubmission = async (subId: string) => {
        const result = await GlobalSwal.fire({
            title: 'Delete Submission?',
            text: "This will remove the clip and deduct your earnings from the campaign stats.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
            background: '#0D0D0D',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/${subId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (!json.success) throw new Error(json.error);

                Toast.fire({ title: 'Deleted', text: 'Submission removed successfully.', icon: 'success' });
                setSubmissions(prev => prev.filter(s => s.id !== subId));
                fetchCampaign(); // Refresh stats
            } catch (err: any) {
                Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-6xl mx-auto space-y-8"
        >
            {/* Back Nav */}
            <Link to="/campaigns" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Campaigns
            </Link>

            {/* Banner */}
            <div className="relative h-[280px] sm:h-[320px] md:h-[420px] rounded-[32px] sm:rounded-[40px] overflow-hidden border border-white/10 group shadow-2xl">
                <img src={banner} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={campaign.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3 text-left">
                        <Badge status={campaign.status} />
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl glassy-text">{campaign.title}</h1>
                    </div>

                    <div className="flex gap-3 sm:gap-4 items-center">
                        <div className="bg-black/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl text-center min-w-[100px] sm:min-w-[140px]">
                            <p className="text-[8px] sm:text-[9px] text-white/40 mb-1 uppercase tracking-[0.3em] font-bold">CPM Rate</p>
                            <p className="text-2xl sm:text-4xl font-mono font-bold text-emerald-400">${campaign.cpm_rate.toFixed(2)}</p>
                        </div>

                        {/* Dynamic Top Button */}
                        {isJoined ? (
                            <Button variant="primary" onClick={() => setIsSubmitModalOpen(true)} className="flex items-center gap-2 bg-white text-zinc-950 hover:bg-white/90 font-bold uppercase tracking-widest px-6 py-4 sm:px-8 sm:py-6 rounded-2xl sm:rounded-3xl transition-all h-full shadow-2xl text-xs sm:text-base">
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                                Submit Clip
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                disabled={campaign?.status !== 'Active' || isComingSoon}
                                onClick={() => { setJoinStep(1); setIsJoinModalOpen(true); }}
                                className={`flex items-center gap-2 font-extrabold uppercase tracking-widest px-6 py-4 sm:px-8 sm:py-6 rounded-2xl sm:rounded-3xl transition-all h-full text-xs sm:text-base disabled:opacity-50 disabled:grayscale ${
                                    isComingSoon 
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                                        : 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-[0_0_40px_rgba(52,211,153,0.25)]'
                                }`}
                            >
                                {isComingSoon ? (
                                    <>
                                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Coming Soon
                                    </>
                                ) : (
                                    <>
                                        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                                        {campaign?.status === 'Active' ? 'Join Campaign' : 'Campaigns Paused'}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-2 text-white/30"><Target className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Budget Views</span></div>
                    <p className="text-2xl font-mono font-bold text-white">{(campaign.target_views || 0).toLocaleString()}</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-2 text-white/30"><Eye className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Views Remaining</span></div>
                    <p className="text-2xl font-mono font-bold text-emerald-400">
                        {Math.max(0, (campaign.target_views || 0) - campaign.view_progress).toLocaleString()}
                    </p>
                    <p className="text-[10px] font-mono text-white/20">{Math.min(100, (campaign.view_progress / (campaign.target_views || 1)) * 100).toFixed(1)}% full</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-2 text-white/30"><CheckCircle className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Min Views Requirement</span></div>
                    <p className="text-2xl font-mono font-bold text-white">{(campaign.min_views || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-mono text-white/20">{campaign.view_progress.toLocaleString()} views fulfilled</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-2 text-amber-500/60"><Clock className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Deadline</span></div>
                    <p className="text-2xl font-mono font-bold text-amber-400">{daysLeft}d</p>
                    <p className="text-[10px] font-mono text-white/20">remaining</p>
                </div>
            </div>

            {/* Campaign Progress (Views) */}
            <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Campaign Progress</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{viewsPercent}%</span>
                </div>
                <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min(viewsPercent, 100)}%` }} 
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="bg-emerald-500 h-full rounded-full"
                    />
                </div>
                <div className="mt-2 flex justify-between text-[9px] font-mono text-white/20 uppercase tracking-tighter">
                    <span>{campaign.view_progress.toLocaleString()} Qualified Views</span>
                    <span>Goal: {campaign.target_views.toLocaleString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Submissions & Leaderboard */}
                <div className="lg:col-span-2 space-y-8">

                    {/* My Submissions */}
                    <div className="rounded-3xl bg-[#0c0c0c] border border-white/[0.06] overflow-hidden">
                        <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                            <h3 className="text-lg font-bold tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    <Upload className="w-4 h-4" />
                                </div>
                                My Submissions
                            </h3>
                            <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-[0.2em] bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">Live Tracking</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[9px] font-bold text-white/20 uppercase tracking-widest border-b border-white/[0.03]">
                                        <th className="px-6 py-4">Clip</th>
                                        <th className="px-6 py-4">Views</th>
                                        <th className="px-6 py-4">Earned</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {!isJoined ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center space-y-4">
                                                <div className="flex flex-col items-center">
                                                    <Shield className="w-10 h-10 text-white/5 mb-4" />
                                                    <p className="text-sm font-bold text-white/40">You must join this campaign to see submissions.</p>
                                                    <Button variant="primary" onClick={() => setIsJoinModalOpen(true)} className="mt-4 text-[10px] uppercase tracking-widest py-3 px-8 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400">Join Now</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : submissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-[10px] uppercase tracking-widest text-white/30">
                                                No submissions yet. Add your first clip!
                                            </td>
                                        </tr>
                                    ) : submissions.map((sub, i) => (
                                        <tr key={sub.id || i} className="group hover:bg-white/[0.02] transition-all duration-300">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${sub.status === 'Verified' ? 'bg-emerald-500' : sub.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-white/80 max-w-[200px] truncate">{sub.url}</p>
                                                        <p className="text-[10px] text-white/20 mt-0.5 capitalize">{sub.platform} · {new Date(sub.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-mono font-bold text-white/70">{sub.views?.toLocaleString() || 0}</p>
                                                {campaign.min_views > 0 && sub.views < campaign.min_views && (
                                                    <p className="text-[9px] text-red-400/50 uppercase font-bold tracking-tighter mt-1">Views didn't meet req</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-mono font-bold text-emerald-400">${Number(sub.earnings || 0).toFixed(2)}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${sub.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : sub.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button 
                                                    onClick={() => handleDeleteSubmission(sub.id)}
                                                    className="p-2 rounded-lg bg-red-500/5 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                    title="Delete Submission"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Leaderboard (Moved to Left Col) */}
                    <div className="p-8 rounded-3xl bg-[#0c0c0c] border border-white/[0.06] space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold tracking-tight text-white/90">Leaderboard</h3>
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <Trophy className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {leaderboard.length === 0 ? (
                                <p className="text-center text-[10px] uppercase tracking-widest text-white/30 py-4">No data yet</p>
                            ) : (
                                <>
                                    {leaderboard.slice(0, 3).map((user, i) => (
                                        <div key={user.user_id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <span className="w-7 flex items-center justify-center">
                                                    {i === 0 ? <Trophy className="w-5 h-5 text-amber-400" /> :
                                                        i === 1 ? <Award className="w-5 h-5 text-slate-300" /> :
                                                            <Medal className="w-5 h-5 text-amber-700" />}
                                                </span>
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="w-9 h-9 rounded-xl border border-white/[0.06] object-cover" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/50">
                                                        {user.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-white/90">{user.name}</p>
                                                    <p className="text-[10px] text-white/25 font-mono">{user.views?.toLocaleString() || 0} views</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-mono font-bold text-emerald-400">${Number(user.earnings || 0).toFixed(2)}</p>
                                        </div>
                                    ))}

                                    {leaderboard.length > 3 && (
                                        <div className="pt-2 space-y-2">
                                            {leaderboard.slice(3).map((user, i) => (
                                                <div key={user.user_id} className="flex items-center justify-between px-4 py-2.5 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-mono font-bold w-4 text-white/15">{i + 4}</span>
                                                        <span className="text-xs text-white/40">{user.name}</span>
                                                    </div>
                                                    <span className="text-[11px] font-mono font-bold text-white/25">${Number(user.earnings || 0).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Info & Guidelines */}
                <div className="space-y-8">

                    {/* Discord Channel */}
                    <div className="p-7 rounded-3xl bg-[#5865F2]/[0.06] border border-[#5865F2]/20 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#5865F2]/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.07-11.41,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,7.09,11.4,105.25,105.25,0,0,0,32.78-16.17C126.89,56.51,122.34,32.57,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.18-12.69,11.43-12.69S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.18-12.69,11.44-12.69S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white/90">Get Content Here</p>
                                <p className="text-[10px] text-white/30">{isComingSoon ? 'Resources locked until start date' : 'Find clips in the Discord channel'}</p>
                            </div>
                        </div>
                        {isComingSoon ? (
                            <div className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/20 font-bold text-xs uppercase tracking-widest rounded-2xl py-3.5 cursor-not-allowed">
                                <Shield className="w-4 h-4" />
                                Resources Locked
                            </div>
                        ) : (
                            <a href={campaign.discord_channel} target="_blank" rel="noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs uppercase tracking-widest rounded-2xl py-3.5 transition-all">
                                <svg className="w-4 h-4" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.07-11.41,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,7.09,11.4,105.25,105.25,0,0,0,32.78-16.17C126.89,56.51,122.34,32.57,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.18-12.69,11.43-12.69S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.18-12.69,11.44-12.69S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                                Open Discord Channel
                            </a>
                        )}
                    </div>

                    {/* About Campaign */}
                    <div className="p-7 rounded-3xl bg-[#0c0c0c] border border-white/[0.06] space-y-4">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.15em]">About This Campaign</h3>
                        <p className="text-sm text-white/60 leading-relaxed">{campaign.description}</p>
                    </div>

                    {/* Requirements Badge Area */}
                    <div className="p-7 rounded-3xl bg-[#0c0c0c] border border-white/[0.06] space-y-4">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.15em]">Requirements</h3>
                        <div className="flex flex-wrap gap-2">
                            {campaign.allowed_platforms?.map(p => (
                                <span key={p} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-tight text-white/50">{p}</span>
                            ))}
                            {campaign.requires_dedicated_social && <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-tight text-emerald-400">Dedicated Social Required</span>}
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="p-8 rounded-3xl bg-[#0c0c0c] border border-white/[0.06]">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.15em] mb-5">Campaign Rules</h3>
                        <div className="space-y-4">
                            {campaign.rules?.length > 0 ? campaign.rules.map((rule, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="mt-0.5 w-5 h-5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-mono font-bold text-white/30">{i + 1}</span>
                                    </div>
                                    <p className="text-xs text-white/40 leading-relaxed">{rule}</p>
                                </div>
                            )) : (
                                <p className="text-xs text-white/10 italic">No specific rules listed.</p>
                            )}
                        </div>
                    </div>


                </div>
            </div>

            {/* Joining Modal */}
            <AnimatePresence>
                {isJoinModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
                        onClick={(e) => { if (e.target === e.currentTarget && joinStep !== 3) setIsJoinModalOpen(false); }}>
                        <motion.div initial={{ y: 24, scale: 0.95, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 24, scale: 0.95, opacity: 0 }}
                            className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl relative text-center">

                            {/* Close Button */}
                            <button
                                onClick={() => setIsJoinModalOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {joinStep === 1 && !isDiscordTransitioning && (
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] text-emerald-400">
                                        <Shield className="w-8 h-8 sm:w-10 sm:h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] sm:text-[10px] font-bold text-white/40 uppercase">Step 1 of 3</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Review & Agree</h2>
                                        <p className="text-white/30 text-xs sm:text-sm">Please study the campaign terms carefully.</p>
                                    </div>


                                    <div className="space-y-4">
                                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-left space-y-4 h-[200px] sm:h-[240px] overflow-y-auto custom-scrollbar">
                                            {campaign.rules?.length ? (
                                                campaign.rules.map((rule, idx) => (
                                                    <div key={idx} className="flex gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
                                                        <p className="text-xs text-white/60 leading-relaxed">{rule}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-white/30 italic text-center py-8">No specific rules provided for this campaign.</p>
                                            )}
                                        </div>
                                        
                                        <div className="text-center px-4">
                                            <p className="text-[10px] text-white/20 leading-relaxed uppercase tracking-wider">
                                                By participating in the campaign you are agreeing to our 
                                                <a 
                                                    href="#" 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        GlobalSwal.fire({
                                                            title: 'Terms & Conditions',
                                                            html: `
                                                                <div class="text-left text-sm space-y-4 text-zinc-400">
                                                                    <p><strong>Content Integrity:</strong> All clips must be organic. Use of bots, view farms, or misleading titles will result in permanent exclusion.</p>
                                                                    <p><strong>Verification Standards:</strong> Claims are only processed for clips that remain active on your linked social profile.</p>
                                                                    <p><strong>Payout Eligibility:</strong> Users must meet the minimum view requirement stated in the mission details.</p>
                                                                </div>
                                                            `,
                                                            confirmButtonText: 'Understood'
                                                        });
                                                    }}
                                                    className="mx-1 text-white/40 hover:text-white underline underline-offset-4 transition-colors"
                                                >
                                                    Terms of Service
                                                </a> 
                                                and Privacy Policy
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleNextFromRules}
                                        className="w-full py-5 rounded-2xl bg-white text-zinc-950 font-bold uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                                    >
                                        Accept & Continue
                                    </Button>
                                </div>
                            )}

                            {isDiscordTransitioning && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8 py-16"
                                >
                                    <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                opacity: [0.3, 0.6, 0.3]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="absolute inset-0 bg-[#5865F2]/20 rounded-full blur-xl"
                                        />
                                        <motion.div
                                            animate={{
                                                y: [0, -8, 0]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="relative text-[#5865F2]"
                                        >
                                            <svg className="w-16 h-16 drop-shadow-[0_0_15px_rgba(88,101,242,0.5)]" viewBox="0 0 127.14 96.36" fill="currentColor">
                                                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.07-11.41,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,7.09,11.4,105.25,105.25,0,0,0,32.78-16.17C126.89,56.51,122.34,32.57,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.18-12.69,11.43-12.69S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.18-12.69,11.44-12.69S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                                            </svg>
                                        </motion.div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-bold tracking-tight text-white/90">Connecting to Discord</h3>
                                        <div className="flex items-center justify-center gap-1.5">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                    className="w-1.5 h-1.5 rounded-full bg-[#5865F2]"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {joinStep === 2 && !isDiscordTransitioning && (
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#5865F2]/10 flex items-center justify-center border border-[#5865F2]/20 shadow-[0_0_30px_rgba(88,101,242,0.1)] text-[#5865F2]">
                                        <Shield className="w-8 h-8 sm:w-10 sm:h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] sm:text-[10px] font-bold text-white/40 uppercase">Step 2 of 3</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Discord Link</h2>
                                        <p className="text-white/30 text-xs sm:text-sm">Ensure you are part of our creator community.</p>
                                    </div>


                                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-left space-y-4">
                                        {user?.discordVerified ? (
                                            <div className="flex flex-col items-center py-4 space-y-4">
                                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-white">Discord Already Connected</p>
                                                    <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">ID: {user.discordId}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-xs text-white/50 leading-relaxed text-center">This campaign requires you to be in our Discord server. Link your account to continue.</p>
                                                <Button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/discord?redirectTo=${encodeURIComponent(window.location.href)}`, {
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                            });
                                                            const json = await res.json();
                                                            if (json.success && json.url) window.location.href = json.url;
                                                        } catch (e) {
                                                            Toast.fire({ title: 'Error', text: 'Failed to initiate Discord link.', icon: 'error' });
                                                        }
                                                    }}
                                                    className="w-full py-4 rounded-xl bg-[#5865F2] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#4752C4] shadow-lg shadow-[#5865F2]/20"
                                                >
                                                    Connect Discord
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setJoinStep(1)} className="flex-1 py-5 rounded-2xl border-white/10 text-white/40">Back</Button>
                                        <Button
                                            disabled={!user?.discordVerified}
                                            onClick={handleNextFromDiscord}
                                            className="flex-[2] py-5 rounded-2xl bg-white text-zinc-950 font-bold uppercase tracking-widest text-sm hover:scale-[1.02] disabled:opacity-30 transition-all shadow-xl"
                                        >
                                            Next Step
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {joinStep === 3 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-white/40 uppercase">Step 3/3</span>
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Social Linking</h2>
                                    </div>


                                    <div className="space-y-3 sm:space-y-4 text-left">
                                        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3 sm:space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Select Platform</p>
                                                <div className="flex gap-2">
                                                    {campaign.allowed_platforms?.includes('youtube') && (
                                                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center" title="YouTube Allowed">
                                                            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                                        </div>
                                                    )}
                                                    {campaign.allowed_platforms?.includes('instagram') && (
                                                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center" title="Instagram Allowed">
                                                            <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                                        </div>
                                                    )}
                                                    {campaign.allowed_platforms?.includes('tiktok') && (
                                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center" title="TikTok Allowed">
                                                            <svg className="w-4 h-4 text-cyan-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.63-.11.45-.12.92-.01 1.37.11.83.63 1.57 1.35 1.97.66.36 1.45.41 2.18.23.69-.15 1.3-.57 1.69-1.16.27-.42.41-.9.44-1.39-.03-3.9-.01-7.8-.02-11.7z"/></svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Disclaimer for Dedicated Account */}
                                            {campaign.requires_dedicated_social && (
                                                <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center gap-2">
                                                    <Shield className="w-3 h-3 text-amber-500" />
                                                    <p className="text-[9px] text-amber-200/60 uppercase tracking-widest font-bold">Dedicated Account Required</p>
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                {/* Selection UI if accounts exist */}
                                                {((campaign.allowed_platforms?.includes('instagram') && user?.instagramVerified) ||
                                                    (campaign.allowed_platforms?.includes('tiktok') && user?.tiktokVerified) ||
                                                    (campaign.allowed_platforms?.includes('youtube') && user?.youtubeVerified)) ? (
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Choose Linked Account</label>
                                                        <Dropdown
                                                            value={linkedHandle}
                                                            onChange={(val) => {
                                                                setLinkedHandle(val);
                                                                if (user?.instagramHandle === val || user?.instagramHandles?.includes(val)) setPlatform('instagram');
                                                                else if (user?.tiktokHandle === val) setPlatform('tiktok');
                                                                else setPlatform('youtube');
                                                            }}
                                                            placeholder="Select account"
                                                            options={[
                                                                ...(campaign.allowed_platforms?.includes('instagram') ? (user?.instagramHandles || (user?.instagramHandle ? [user.instagramHandle] : [])).map((h: string) => ({
                                                                    label: h,
                                                                    value: h,
                                                                    icon: <svg className="w-3.5 h-3.5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                                                })) : []),
                                                                ...(campaign.allowed_platforms?.includes('tiktok') && user?.tiktokVerified ? [{
                                                                    label: user.tiktokHandle!,
                                                                    value: user.tiktokHandle!,
                                                                    icon: <svg className="w-3.5 h-3.5 text-cyan-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.63-.11.45-.12.92-.01 1.37.11.83.63 1.57 1.35 1.97.66.36 1.45.41 2.18.23.69-.15 1.3-.57 1.69-1.16.27-.42.41-.9.44-1.39-.03-3.9-.01-7.8-.02-11.7z"/></svg>
                                                                }] : []),
                                                                ...(campaign.allowed_platforms?.includes('youtube') && user?.youtubeVerified ? (user?.youtubeChannels || []).map((c: any) => ({
                                                                    label: c.title || c.handle || c.channelId || 'YouTube Account',
                                                                    value: c.handle || c.channelId,
                                                                    icon: <svg className="w-3.5 h-3.5 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                                                })) : [])
                                                            ]}
                                                        />
                                                        <div className="pt-2 text-center">
                                                            <p className="text-[9px] text-white/20 uppercase tracking-[0.1em]">Or link a new one below</p>
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {(!showIgCode && !showYtCode && !showTtCode) ? (
                                                    <>
                                                        {/* Only show manual handle input if Instagram/TikTok is allowed OR if YouTube is in manual mode */}
                                                        {(campaign.allowed_platforms?.includes('instagram') || 
                                                          campaign.allowed_platforms?.includes('tiktok') ||
                                                          (campaign.allowed_platforms?.includes('youtube') && settings?.youtube_auth_mode === 'manual')) && (
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Social Handle</label>
                                                                <input
                                                                    value={linkedHandle}
                                                                    onChange={e => setLinkedHandle(e.target.value)}
                                                                    placeholder="@your_handle"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all font-mono"
                                                                />
                                                            </div>
                                                        )}

                                                        {campaign.allowed_platforms?.includes('instagram') && (
                                                            <Button
                                                                variant="outline"
                                                                onClick={handleInstagramVerify}
                                                                disabled={isVerifyingSocial || !linkedHandle}
                                                                className="w-full py-3 rounded-xl border-pink-500/20 text-pink-400 hover:bg-pink-500/5 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                                            >
                                                                {isVerifyingSocial && <div className="w-3 h-3 rounded-full border-2 border-pink-400/20 border-t-pink-400 animate-spin" />}
                                                                Link Instagram Bio
                                                            </Button>
                                                        )}
                                                        {campaign.allowed_platforms?.includes('tiktok') && (
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => { setShowTtCode(true); setPlatform('tiktok'); }}
                                                                disabled={isVerifyingSocial || !linkedHandle}
                                                                className="w-full py-3 rounded-xl border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/5 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                                            >
                                                                {isVerifyingSocial && <div className="w-3 h-3 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />}
                                                                Link TikTok Bio
                                                            </Button>
                                                        )}
                                                        {campaign.allowed_platforms?.includes('youtube') && (
                                                            settings?.youtube_auth_mode === 'manual' ? (
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => setShowYtCode(true)}
                                                                    className="w-full py-3 rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/5 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                                                    Link YouTube via Bio
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    onClick={handleYouTubeOAuth}
                                                                    disabled={isVerifyingSocial}
                                                                    className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/5 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                                                >
                                                                    {isVerifyingSocial && <div className="w-3 h-3 rounded-full border-2 border-red-400/20 border-t-red-400 animate-spin" />}
                                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                                                    Securely Link YouTube (OAuth)
                                                                </Button>
                                                            )
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl text-center space-y-3">
                                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                                                                Add this code to your {showYtCode ? 'YouTube channel' : showTtCode ? 'TikTok profile' : 'Instagram profile'} bio
                                                            </p>
                                                            <div className="bg-black/60 border border-white/10 p-4 rounded-xl font-mono text-emerald-400 text-xl tracking-widest shadow-inner">
                                                                {verifyCode}
                                                            </div>
                                                            <button 
                                                                onClick={() => { setShowIgCode(false); setShowYtCode(false); setShowTtCode(false); }} 
                                                                className="text-[9px] text-white/30 uppercase tracking-widest hover:text-white underline"
                                                            >
                                                                Back to handle input
                                                            </button>
                                                        </div>
                                                        <Button
                                                            onClick={showYtCode ? handleYouTubeVerify : showTtCode ? handleTiktokVerify : handleInstagramVerify}
                                                            disabled={isVerifyingSocial}
                                                            className="w-full py-4 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-all"
                                                        >
                                                            {isVerifyingSocial && <div className="w-3 h-3 rounded-full border-2 border-black/20 border-t-black animate-spin" />}
                                                            Check {showYtCode ? 'YouTube' : showTtCode ? 'TikTok' : 'Instagram'} Bio Now
                                                        </Button>
                                                        <p className="text-[9px] text-white/30 text-center italic">
                                                            Once linked, you can remove this code from your bio.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {socialVerifyError && (
                                                <p className="text-[10px] text-red-500 font-medium text-center bg-red-500/5 p-2 rounded-lg border border-red-500/10 italic">
                                                    {socialVerifyError}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setJoinStep(2)} className="flex-1 py-5 rounded-2xl border-white/10 text-white/40">Back</Button>
                                        <Button
                                            disabled={isSubmitting || isVerifyingSocial || !linkedHandle || !campaign?.allowed_platforms?.some(p => {
                                                if (p === 'instagram') {
                                                    const verifiedHandles = user?.instagramHandles || (user?.instagramHandle ? [user.instagramHandle] : []);
                                                    return user?.instagramVerified && verifiedHandles.includes(linkedHandle);
                                                }
                                                if (p === 'tiktok') return user?.tiktokVerified && user?.tiktokHandle === linkedHandle;
                                                if (p === 'youtube') return user?.youtubeVerified && (user?.youtubeHandle === linkedHandle || user?.youtubeChannels?.some((c: any) => c.handle === linkedHandle));
                                                return false;
                                            })}
                                            onClick={() => handleJoinSubmit()}
                                            className="flex-[2] py-5 rounded-2xl bg-emerald-500 text-black font-bold uppercase tracking-widest text-sm hover:scale-[1.02] disabled:opacity-30 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                                        >
                                            {isSubmitting ? 'Finalizing...' : 'Finalize & Join'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {joinStep === 4 && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
                                    <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                        <CheckCircle className="w-12 h-12 text-black" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-bold tracking-tight text-white">You're In!</h2>
                                        <p className="text-white/40 text-sm">Mission activated. Your progress is being tracked.</p>
                                    </div>
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active Participation</p>
                                    </div>
                                    <Button onClick={() => setIsJoinModalOpen(false)} className="w-full py-5 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-sm">
                                        Start Clipping
                                    </Button>
                                </motion.div>
                            )}

                            {/* End of Join Modal Steps */}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Modal */}
            <AnimatePresence>
                {isSubmitModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setIsSubmitModalOpen(false); }}>
                        <motion.div initial={{ y: 24, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 24, scale: 0.97, opacity: 0 }}
                            className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-5 sm:p-8 max-w-sm w-full shadow-2xl relative">

                            <button onClick={() => setIsSubmitModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full text-white/20 hover:text-white hover:bg-white/5 transition-all">
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-2xl font-bold tracking-tight mb-2">Submit Clip</h2>
                            <p className="text-white/30 text-xs mb-8">Paste your video link below. We will automatically detect the platform.</p>

                            <form onSubmit={handleSubmitClip} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Video URL <span className="text-red-400">*</span></label>
                                    <input
                                        required
                                        type="url"
                                        value={submissionUrl}
                                        onChange={(e) => setSubmissionUrl(e.target.value)}
                                        placeholder="https://..."
                                        className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-mono placeholder:text-white/10 ${
                                            !isUrlValid ? 'border-red-500/50' : 'border-white/[0.08] focus:border-white/20'
                                        }`}
                                    />
                                    {isCheckingUrl && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {urlError && (
                                    <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest animate-in slide-in-from-top-1 duration-300">
                                        <AlertCircle className="w-3 h-3" />
                                        {urlError}
                                    </div>
                                )}

                                 {submissionUrl && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Detected Platform</label>
                                            {campaign?.allowed_platforms && (
                                                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded">
                                                    Allowed: {campaign.allowed_platforms.join(', ')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white/50 flex items-center gap-3">
                                            {!platform && <span className="text-white/20 italic">Detecting...</span>}
                                            {platform === 'youtube' && <span className="text-red-500 font-bold">YouTube Shorts</span>}
                                            {platform === 'instagram' && <span className="text-pink-500 font-bold">Instagram Reels</span>}
                                            {platform === 'tiktok' && <span className="text-cyan-400 font-bold">TikTok</span>}
                                            
                                            {platform && campaign?.allowed_platforms && !campaign.allowed_platforms.includes(platform) && (
                                                <span className="ml-auto text-[10px] text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-md">Wrong Platform</span>
                                            )}
                                            {platform && campaign?.allowed_platforms && campaign.allowed_platforms.includes(platform) && (
                                                <div className="ml-auto w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting || isCheckingUrl || !isUrlValid || !platform || (platform && campaign?.allowed_platforms && !campaign.allowed_platforms.includes(platform))} 
                                    variant="primary" 
                                    className="w-full text-xs py-4 rounded-xl font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <div className="w-3 h-3 rounded-full border-2 border-black/20 border-t-black animate-spin" />}
                                    {isSubmitting ? (platform === 'youtube' ? 'Verifying Ownership...' : 'Submitting...') : 
                                     isCheckingUrl ? 'Checking Video...' : 
                                     !isUrlValid ? 'Duplicate Video' : 
                                     'Submit Clip'}
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
