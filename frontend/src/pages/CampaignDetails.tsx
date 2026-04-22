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
    requires_verification: boolean; // Legacy
    allowed_platforms: string[];
    requires_dedicated_social: boolean;
    requires_discord: boolean;
    rules: string[];
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
    
    // Joint State
    const [isJoined, setIsJoined] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [joinStep, setJoinStep] = useState(1);
    const [linkedHandle, setLinkedHandle] = useState('');
    
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [platform, setPlatform] = useState('youtube');
    
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        const fetchSubmissions = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/campaign/${id}/my`, { headers: { 'Authorization': `Bearer ${token}` } });
                const json = await res.json();
                if (json.success) setSubmissions(json.data);
            } catch (err) { console.error('Failed to fetch my submissions:', err); }
        };

        const fetchLeaderboard = async () => {
             try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/campaign/${id}/leaderboard`);
                const json = await res.json();
                if (json.success) setLeaderboard(json.data);
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

        if (id) {
            fetchCampaign();
            if (token) {
                fetchSubmissions();
                checkParticipation();
            }
            fetchLeaderboard();
        }
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

    const budgetPercent = campaign.total_budget > 0
        ? Math.round((campaign.budget_used / campaign.total_budget) * 100)
        : 0;
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000));
    const banner = campaign.banner_url || FALLBACK_BANNERS[0];

    const handleJoinSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${id}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkedHandle })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            
            setIsJoined(true);
            setJoinStep(3); // Success
            Toast.fire({ title: 'Welcome Aboard!', text: 'You are now part of this campaign.', icon: 'success' });
        } catch (err: any) {
            Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitClip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
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
            setIsSubmitModalOpen(false);
            setSubmissionUrl('');
        } catch (err: any) {
            Toast.fire({ title: 'Error', text: err.message, icon: 'error', background: '#200' });
        } finally {
            setIsSubmitting(false);
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
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">{campaign.title}</h1>
                    </div>
                    
                    <div className="flex gap-3 sm:gap-4 items-center">
                        <div className="bg-black/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl text-center min-w-[100px] sm:min-w-[140px]">
                            <p className="text-[8px] sm:text-[9px] text-white/40 mb-1 uppercase tracking-[0.3em] font-bold">CPM Rate</p>
                            <p className="text-2xl sm:text-4xl font-mono font-bold text-emerald-400">${campaign.cpm_rate.toFixed(2)}</p>
                        </div>
                        
                        {/* Dynamic Top Button */}
                        {isJoined ? (
                            <Button variant="primary" onClick={() => setIsSubmitModalOpen(true)} className="flex items-center gap-2 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest px-6 py-4 sm:px-8 sm:py-6 rounded-2xl sm:rounded-3xl transition-all h-full shadow-2xl text-xs sm:text-base">
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                                Submit Clip
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={() => { setJoinStep(1); setIsJoinModalOpen(true); }} className="flex items-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 font-bold uppercase tracking-widest px-6 py-4 sm:px-8 sm:py-6 rounded-2xl sm:rounded-3xl transition-all h-full shadow-2xl text-xs sm:text-base">
                                <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                                Join Campaign
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
                    <div className="flex items-center gap-2 text-white/30"><Eye className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Total Views</span></div>
                    <p className="text-2xl font-mono font-bold text-white">{campaign.view_progress.toLocaleString()}</p>
                    <p className="text-[10px] font-mono text-white/20">{campaign.min_views > 0 ? `${campaign.min_views.toLocaleString()} min views` : 'No min views'}</p>
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
                                    {!isJoined ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center space-y-4">
                                                <div className="flex flex-col items-center">
                                                    <Shield className="w-10 h-10 text-white/5 mb-4" />
                                                    <p className="text-sm font-bold text-white/40">You must join this campaign to see submissions.</p>
                                                    <Button variant="outline" onClick={() => setIsJoinModalOpen(true)} className="mt-4 text-[10px] uppercase tracking-widest py-2 rounded-xl">Join Now</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : submissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-[10px] uppercase tracking-widest text-white/30">
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
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-mono font-bold text-emerald-400">${Number(sub.earnings || 0).toFixed(2)}</p>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${sub.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : sub.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
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
                            {leaderboard.length === 0 ? (
                                <p className="text-center text-[10px] uppercase tracking-widest text-white/30 py-4">No data yet</p>
                            ) : (
                                <>
                                    {leaderboard.slice(0, 3).map((user, i) => (
                                        <div key={user.user_id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg w-7">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
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
                            className="bg-[#0c0c0c] border border-white/10 rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative text-center">
                            
                            {joinStep < 3 && (
                                <button onClick={() => setIsJoinModalOpen(false)} className="absolute top-8 right-8 p-2 rounded-full text-white/20 hover:text-white hover:bg-white/5 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            {joinStep === 1 && (
                                <div className="space-y-8">
                                    <div className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                        <Shield className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold tracking-tight text-white">Join & Commit</h2>
                                        <p className="text-white/30 text-sm">Review the rules before joining this mission.</p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 text-left space-y-4 max-h-[240px] overflow-y-auto">
                                        {campaign.rules?.map((rule, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
                                                <p className="text-xs text-white/60 leading-relaxed">{rule}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Button onClick={() => setJoinStep(2)} className="w-full py-5 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                                        I Agree to the Rules
                                    </Button>
                                </div>
                            )}

                            {joinStep === 2 && (
                                <div className="space-y-8">
                                    <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                        <Target className="w-10 h-10 text-blue-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold tracking-tight text-white">Verification</h2>
                                        <p className="text-white/30 text-sm">Link your social handle to participate.</p>
                                    </div>

                                    <div className="space-y-4">
                                        {campaign.requires_discord && !user?.discordVerified && (
                                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs flex items-center gap-3">
                                                <X className="w-4 h-4 shrink-0" />
                                                Discord verification required first. Link it in your Profile.
                                            </div>
                                        )}

                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Social Handle</label>
                                            <input 
                                                value={linkedHandle}
                                                onChange={e => setLinkedHandle(e.target.value)}
                                                placeholder={campaign.requires_dedicated_social ? "@new_channel_handle" : "@your_handle"}
                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-mono"
                                            />
                                            {campaign.requires_dedicated_social && (
                                                <p className="text-[10px] text-amber-500/60 mt-2 flex items-center gap-2">
                                                    <Shield className="w-3 h-3" />
                                                    This mission requires a fresh, dedicated account.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setJoinStep(1)} className="flex-1 py-5 rounded-2xl border-white/10 text-white/40">Back</Button>
                                        <Button 
                                            disabled={isSubmitting || (campaign.requires_discord && !user?.discordVerified) || !linkedHandle} 
                                            onClick={handleJoinSubmit}
                                            className="flex-[2] py-5 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-sm hover:scale-[1.02] disabled:opacity-30 transition-all"
                                        >
                                            {isSubmitting ? 'Joining...' : 'Finalize & Join'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {joinStep === 3 && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
                                    <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                        <Upload className="w-12 h-12 text-black" />
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

                                <Button type="submit" disabled={isSubmitting} variant="primary" className="w-full text-xs py-4 rounded-xl font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {isSubmitting && <div className="w-3 h-3 rounded-full border-2 border-black/20 border-t-black animate-spin" />}
                                    {isSubmitting ? (platform === 'youtube' ? 'Verifying Ownership...' : 'Submitting...') : 'Submit Clip'}
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
