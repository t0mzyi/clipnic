import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Shield, Eye, Clock, Target, Upload, ChevronLeft, CheckCircle, Globe, Trophy, Award, Medal, Trash2, History as HistoryIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Toast, GlobalSwal } from '../lib/swal';
import { useCountdown } from '../hooks/useCountdown';
import { JoinCampaignModal } from '../components/modals/JoinCampaignModal';
import { SubmitClipModal } from '../components/modals/SubmitClipModal';

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
    allowed_platforms: string[];
    rules: string[];
    status: string;
    view_progress: number;
    target_views: number;
    is_featured: boolean;
    start_date?: string;
    auto_start?: boolean;
}

const FALLBACK_BANNERS = [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2000&auto=format&fit=crop',
];

export const CampaignDetails = () => {
    const { id } = useParams();
    const { token, user, updateUser } = useAuthStore();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    const countdown = useCountdown(campaign?.end_date);
    const isComingSoon = useMemo(() => 
        Boolean(campaign?.start_date && new Date(campaign.start_date) > new Date()),
    [campaign?.start_date]);

    const viewsPercent = useMemo(() => {
        if (!campaign || campaign.target_views <= 0) return 0;
        return Math.round((campaign.view_progress / campaign.target_views) * 100);
    }, [campaign?.view_progress, campaign?.target_views]);

    const fetchCampaignData = useCallback(async () => {
        if (!id) return;
        try {
            const [campaignRes, submissionsRes, leaderboardRes, participationRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/campaigns/${id}?t=${Date.now()}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_URL}/submissions/campaign/${id}/my?t=${Date.now()}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_URL}/submissions/campaign/${id}/leaderboard`),
                token ? fetch(`${import.meta.env.VITE_API_URL}/campaigns/participations`, { headers: { 'Authorization': `Bearer ${token}` } }) : Promise.resolve(null)
            ]);

            const [campaignJson, submissionsJson, leaderboardJson, participationJson] = await Promise.all([
                campaignRes.json(),
                submissionsRes.json(),
                leaderboardRes.json(),
                participationRes ? participationRes.json() : Promise.resolve({ success: false })
            ]);

            if (campaignJson.success) setCampaign(campaignJson.data);
            if (submissionsJson.success) setSubmissions(submissionsJson.data);
            if (leaderboardJson.success) setLeaderboard(leaderboardJson.data);
            if (participationJson.success && Array.isArray(participationJson.data)) {
                setIsJoined(participationJson.data.includes(id));
            }
        } catch (err) {
            console.error('Failed to fetch campaign data:', err);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        fetchCampaignData();
        const interval = setInterval(fetchCampaignData, 15000); // 15s refresh
        return () => clearInterval(interval);
    }, [fetchCampaignData]);

    const handleJoin = async (linkedHandle?: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${id}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkedHandle })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);

            setIsJoined(true);
            setIsJoinModalOpen(false);
            Toast.fire({ title: 'Joined!', icon: 'success' });
            fetchCampaignData();
        } catch (err: any) {
            Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
        }
    };

    const handleSubmitClip = async (url: string, platform: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaign_id: id, url, platform })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);

            Toast.fire({ title: 'Submitted!', icon: 'success' });
            setIsSubmitModalOpen(false);
            fetchCampaignData();
        } catch (err: any) {
            Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
            throw err;
        }
    };

    const handleDeleteSubmission = async (subId: string) => {
        const result = await GlobalSwal.fire({
            title: 'Delete Clip?',
            text: "This removal is permanent.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/${subId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    Toast.fire({ title: 'Deleted', icon: 'success' });
                    fetchCampaignData();
                }
            } catch (err) {
                Toast.fire({ title: 'Error', icon: 'error' });
            }
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
    );

    if (!campaign) return (
        <div className="text-center py-24">
            <p className="text-white/30 text-sm mb-6">Campaign not found.</p>
            <Link to="/clippers/campaigns" className="text-white/50 hover:text-white text-sm underline">Back to Campaigns</Link>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-8 pb-12"
        >
            <Link to="/clippers/campaigns" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Campaigns
            </Link>

            <div className="relative h-[320px] md:h-[420px] rounded-[40px] overflow-hidden border border-white/10 group shadow-2xl bg-[#080808]">
                <img src={campaign.banner_url || FALLBACK_BANNERS[0]} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" alt={campaign.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge status={campaign.status} />
                            {campaign.is_featured && (
                                <div className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                    <Trophy size={12} fill="currentColor" /> Featured
                                </div>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white glassy-text">{campaign.title}</h1>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl text-center min-w-[140px]">
                            <p className="text-[9px] text-white/40 mb-1 uppercase tracking-[0.2em] font-bold">CPM Rate</p>
                            <p className="text-3xl font-mono font-bold text-emerald-400">${campaign.cpm_rate.toFixed(2)}</p>
                        </div>

                        {isJoined ? (
                            <Button 
                                variant="primary" 
                                disabled={isComingSoon}
                                onClick={() => setIsSubmitModalOpen(true)} 
                                className={`px-8 py-6 rounded-3xl font-bold uppercase tracking-widest text-sm shadow-2xl ${isComingSoon ? 'bg-white/5 text-white/20' : 'bg-white text-black hover:bg-white/90'}`}
                            >
                                <Upload className="w-5 h-5 mr-2 inline" /> Submit Clip
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                disabled={campaign.status !== 'Active' || isComingSoon}
                                onClick={() => setIsJoinModalOpen(true)}
                                className="px-8 py-6 rounded-3xl font-bold uppercase tracking-widest text-sm bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                            >
                                <Globe className="w-5 h-5 mr-2 inline" /> Join Campaign
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Budget Views', value: (campaign.target_views || 0).toLocaleString(), icon: Target, color: 'text-white/40' },
                    { label: 'Views Left', value: Math.max(0, (campaign.target_views || 0) - campaign.view_progress).toLocaleString(), icon: Eye, color: 'text-emerald-400' },
                    { label: 'Min Views', value: (campaign.min_views || 0).toLocaleString(), icon: CheckCircle, color: 'text-white/40' },
                    { label: 'Ends In', value: isComingSoon ? 'Starting Soon' : `${countdown.days}d ${countdown.hours}h`, icon: Clock, color: 'text-amber-400' }
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] space-y-2 group hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-2 text-white/20">
                            <stat.icon className="w-4 h-4" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {!isComingSoon && (
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Global Progress</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{viewsPercent}%</span>
                    </div>
                    <div className="w-full bg-white/[0.04] h-2.5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(viewsPercent, 100)}%` }} className="bg-emerald-500 h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="rounded-3xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
                        <div className="p-8 border-b border-white/[0.05] flex items-center justify-between">
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">My Submissions</h3>
                            {isJoined && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 uppercase tracking-widest">Active Partner</span>}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] border-b border-white/[0.03]">
                                    <tr>
                                        <th className="px-8 py-5">Clip Details</th>
                                        <th className="px-8 py-5">Views</th>
                                        <th className="px-8 py-5">Earned</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {!isJoined ? (
                                        <tr><td colSpan={5} className="px-8 py-20 text-center text-white/20 text-sm italic">Join this mission to see your stats.</td></tr>
                                    ) : submissions.length === 0 ? (
                                        <tr><td colSpan={5} className="px-8 py-12 text-center text-white/20 text-xs uppercase tracking-widest">No clips submitted yet.</td></tr>
                                    ) : (
                                        submissions.map(sub => (
                                            <tr key={sub.id} className="group hover:bg-white/[0.02] transition-all">
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-medium text-white/90 truncate max-w-[180px]">{sub.url}</p>
                                                    <p className="text-[10px] text-white/20 mt-1 capitalize">{sub.platform} · {new Date(sub.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-8 py-6 font-mono text-sm font-bold text-white/60">{sub.views?.toLocaleString()}</td>
                                                <td className="px-8 py-6 font-mono text-sm font-bold text-emerald-400">${Number(sub.earnings || 0).toFixed(2)}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${sub.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/30 border-white/10'}`}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button onClick={() => handleDeleteSubmission(sub.id)} className="p-2.5 rounded-xl bg-red-500/5 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/[0.05] space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold tracking-tight">Leaderboard</h3>
                            <Trophy className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="space-y-4">
                            {leaderboard.length === 0 ? (
                                <p className="text-center text-[10px] text-white/20 uppercase tracking-widest py-8">No participants yet</p>
                            ) : (
                                leaderboard.slice(0, 5).map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 text-xs font-bold text-white/20">{i + 1}</span>
                                            {entry.avatar_url ? <img src={entry.avatar_url} className="w-9 h-9 rounded-xl object-cover" /> : <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-bold uppercase">{entry.name?.charAt(0)}</div>}
                                            <div>
                                                <p className="text-xs font-bold text-white/80">{entry.name}</p>
                                                <p className="text-[9px] text-white/20 uppercase tracking-widest">{entry.views?.toLocaleString()} Views</p>
                                            </div>
                                        </div>
                                        {i === 0 && <Star size={14} className="text-amber-400" fill="currentColor" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Shield className="w-5 h-5" />
                            <h4 className="text-sm font-bold uppercase tracking-widest">Platform Rules</h4>
                        </div>
                        <div className="space-y-3">
                            {campaign.rules?.map((rule, i) => (
                                <div key={i} className="flex gap-2 text-[11px] text-white/50 leading-relaxed">
                                    <span className="text-emerald-500/40 mt-1">•</span>
                                    <span>{rule}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <JoinCampaignModal 
                isOpen={isJoinModalOpen} 
                onClose={() => setIsJoinModalOpen(false)} 
                campaign={campaign} 
                onJoined={handleJoin}
                verifyCode="CLPNIC-VERIFY"
            />

            <SubmitClipModal 
                isOpen={isSubmitModalOpen} 
                onClose={() => setIsSubmitModalOpen(false)} 
                campaign={campaign} 
                onSubmit={handleSubmitClip}
                token={token}
            />
        </motion.div>
    );
};
