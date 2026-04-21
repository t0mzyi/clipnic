import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useState, useEffect } from 'react';
import { Shield, Trophy, Eye, DollarSign, Clock, Target, Upload, ChevronLeft, X } from 'lucide-react';
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
    requires_verification: boolean;
    status: string;
    view_progress: number;
    target_views: number;
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
    background: '#0c0c0c',
    color: '#fff',
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

export const CampaignDetails = () => {
    const { id } = useParams();
    const { token, user } = useAuthStore();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [platform, setPlatform] = useState('youtube');

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${id}`, {
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
        if (id) fetchCampaign();
    }, [id, token]);

    // Auto-detect platform from URL
    useEffect(() => {
        const url = submissionUrl.toLowerCase();
        if (url.includes('youtube') || url.includes('youtu.be')) setPlatform('youtube');
        else if (url.includes('instagram')) setPlatform('instagram');
        else if (url.includes('tiktok')) setPlatform('tiktok');
    }, [submissionUrl]);

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

    const progressPercentage = campaign.target_views > 0
        ? Math.round((campaign.view_progress / campaign.target_views) * 100)
        : 0;
    const budgetPercent = campaign.total_budget > 0
        ? Math.round((campaign.budget_used / campaign.total_budget) * 100)
        : 0;
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000));
    const requiresVerification = campaign.requires_verification;
    const isUserVerified = !!(user?.discordVerified && user?.youtubeVerified);
    const banner = campaign.banner_url || FALLBACK_BANNERS[0];

    const handleSubmitClip = (e: React.FormEvent) => {
        e.preventDefault();
        Toast.fire({ title: 'Clip Submitted!', text: 'Your clip is now in review.', icon: 'success' });
        setIsSubmitModalOpen(false);
        setSubmissionUrl('');
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
            <div className="relative h-[320px] md:h-[420px] rounded-[40px] overflow-hidden border border-white/10 group shadow-2xl">
                <img src={banner} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={campaign.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <Badge status={campaign.status} />
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">{campaign.title}</h1>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                        <div className="bg-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl text-center min-w-[140px]">
                            <p className="text-[9px] text-white/40 mb-1 uppercase tracking-[0.3em] font-bold">CPM Rate</p>
                            <p className="text-4xl font-mono font-bold text-emerald-400">${campaign.cpm_rate.toFixed(2)}</p>
                        </div>
                        
                        {/* Dynamic Top Button */}
                        {requiresVerification && !isUserVerified ? (
                            <Link to="/profile" className="flex items-center gap-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30 font-bold uppercase tracking-widest px-8 py-6 rounded-3xl transition-all h-full">
                                <Shield className="w-5 h-5" />
                                Go Verify
                            </Link>
                        ) : (
                            <Button variant="primary" onClick={() => setIsSubmitModalOpen(true)} className="flex items-center gap-2 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest px-8 py-6 rounded-3xl transition-all h-full shadow-2xl">
                                <Upload className="w-5 h-5" />
                                Submit Clip
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-2 text-white/30"><DollarSign className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Total Budget</span></div>
                    <p className="text-2xl font-mono font-bold text-white">${campaign.total_budget.toLocaleString()}</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-2 text-white/30"><Target className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Spent</span></div>
                    <p className="text-2xl font-mono font-bold text-emerald-400">${campaign.budget_used.toFixed(2)}</p>
                    <p className="text-[10px] font-mono text-white/20">{budgetPercent}% used</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-2 text-white/30"><Eye className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Views</span></div>
                    <p className="text-2xl font-mono font-bold text-white">{campaign.view_progress.toLocaleString()}</p>
                    <p className="text-[10px] font-mono text-white/20">{progressPercentage}% of goal</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-2 text-amber-500/60"><Clock className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Deadline</span></div>
                    <p className="text-2xl font-mono font-bold text-amber-400">{daysLeft}d</p>
                    <p className="text-[10px] font-mono text-white/20">remaining</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="p-6 rounded-2xl bg-[#0c0c0c] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Budget Consumption</span>
                    <span className="text-sm font-mono font-bold text-white/60">{budgetPercent}%</span>
                </div>
                <div className="w-full bg-white/[0.04] h-3 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(budgetPercent, 100)}%` }} transition={{ duration: 1.8, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
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
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {[
                                        { url: 'youtu.be/clips/01x', platform: 'YouTube', views: '24,500', earnings: '$9.80', status: 'Verified', date: '2h ago' },
                                        { url: 'youtu.be/clips/99y', platform: 'YouTube', views: '1,200', earnings: '$0.48', status: 'Pending', date: '5h ago' }
                                    ].map((sub, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.02] transition-all duration-300">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${sub.status === 'Verified' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-white/80">{sub.url}</p>
                                                        <p className="text-[10px] text-white/20 mt-0.5">{sub.platform} · {sub.date}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-mono font-bold text-white/70">{sub.views}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-mono font-bold text-emerald-400">{sub.earnings}</p>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${sub.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                    {sub.status}
                                                </span>
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
                            {[
                                { rank: 1, name: 'AlexEdit', views: '4.2M', earnings: '$1,680', medal: '🥇' },
                                { rank: 2, name: 'ClipperPro', views: '2.8M', earnings: '$1,120', medal: '🥈' },
                                { rank: 3, name: 'ShortsKing', views: '1.9M', earnings: '$760', medal: '🥉' },
                            ].map((user) => (
                                <div key={user.rank} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg w-7">{user.medal}</span>
                                        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/50">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white/90">{user.name}</p>
                                            <p className="text-[10px] text-white/25 font-mono">{user.views} views</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-mono font-bold text-emerald-400">{user.earnings}</p>
                                </div>
                            ))}
                            
                            <div className="pt-2 space-y-2">
                                 {[
                                    { rank: 4, name: 'ViralWave', earnings: '$340' },
                                    { rank: 5, name: 'FlowState', earnings: '$248' }
                                ].map((user) => (
                                    <div key={user.rank} className="flex items-center justify-between px-4 py-2.5 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono font-bold w-4 text-white/15">{user.rank}</span>
                                            <span className="text-xs text-white/40">{user.name}</span>
                                        </div>
                                        <span className="text-[11px] font-mono font-bold text-white/25">{user.earnings}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Info & Guidelines */}
                <div className="space-y-8">

                    {/* Discord Channel */}
                    <div className="p-7 rounded-3xl bg-[#5865F2]/[0.06] border border-[#5865F2]/20 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#5865F2]/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.07-11.41,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,7.09,11.4,105.25,105.25,0,0,0,32.78-16.17C126.89,56.51,122.34,32.57,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.18-12.69,11.43-12.69S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.18-12.69,11.44-12.69S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white/90">Get Content Here</p>
                                <p className="text-[10px] text-white/30">Find clips in the Discord channel</p>
                            </div>
                        </div>
                        <a href={campaign.discord_channel} target="_blank" rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs uppercase tracking-widest rounded-2xl py-3.5 transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.07-11.41,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,7.09,11.4,105.25,105.25,0,0,0,32.78-16.17C126.89,56.51,122.34,32.57,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.18-12.69,11.43-12.69S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.18-12.69,11.44-12.69S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
                            Open Discord Channel
                        </a>
                    </div>

                    {/* About Campaign */}
                    <div className="p-7 rounded-3xl bg-[#0c0c0c] border border-white/[0.06] space-y-4">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.15em]">About This Campaign</h3>
                        <p className="text-sm text-white/60 leading-relaxed">{campaign.description}</p>
                    </div>

                    {/* Guidelines (Moved to Right Col) */}
                    <div className="p-8 rounded-3xl bg-[#0c0c0c] border border-white/[0.06]">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.15em] mb-5">Campaign Rules</h3>
                        <div className="space-y-4">
                            {[
                                "Original content only. Stolen clips result in permanent ban.",
                                "Our system flags suspicious view velocity and bot patterns.",
                                "Payouts finalize upon campaign expiry or budget exhaustion."
                            ].map((rule, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="mt-0.5 w-5 h-5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-mono font-bold text-white/30">{i + 1}</span>
                                    </div>
                                    <p className="text-xs text-white/40 leading-relaxed">{rule}</p>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </div>

            {/* Submit Modal */}
            <AnimatePresence>
                {isSubmitModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setIsSubmitModalOpen(false); }}>
                        <motion.div initial={{ y: 24, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 24, scale: 0.97, opacity: 0 }}
                            className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
                            
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
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-mono placeholder:text-white/10" 
                                    />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Detected Platform</label>
                                    <div className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white/50 flex items-center gap-3">
                                        {platform === 'youtube' && <span className="text-red-500">YouTube Shorts</span>}
                                        {platform === 'instagram' && <span className="text-pink-500">Instagram Reels</span>}
                                        {platform === 'tiktok' && <span className="text-cyan-400">TikTok</span>}
                                    </div>
                                </div>

                                <Button type="submit" variant="primary" className="w-full text-xs py-4 rounded-xl font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-xl">
                                    Submit Clip
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
