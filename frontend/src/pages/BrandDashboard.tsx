import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Play, DollarSign, TrendingUp, BarChart3, Target, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Toast } from '../lib/swal';

export const BrandDashboard = () => {
    const { token } = useAuthStore();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const campaignId = searchParams.get('id');

    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/brand-assigned`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    setCampaigns(json.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchCampaigns();
    }, [token]);

    const selectedCampaign = campaigns.find(c => c.id === campaignId);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-white/5 border-t-white/40 rounded-full animate-spin" />
            <p className="text-white/20 uppercase tracking-[0.3em] text-[10px] font-bold">Synchronizing Data</p>
        </div>
    );

    if (!campaignId) {
        return <BrandOverview campaigns={campaigns} token={token} />;
    }

    if (!selectedCampaign) {
        return (
            <div className="text-center py-20">
                <p className="text-white/40">Campaign not found or access restricted.</p>
            </div>
        );
    }

    return <CampaignDetailsView campaign={selectedCampaign} token={token} />;
};

const BrandOverview = ({ campaigns, token }: { campaigns: any[], token: string | null }) => {
    const [stats, setStats] = useState({ reach: 0, spend: 0, creatives: 0 });

    useEffect(() => {
        const fetchAllStats = async () => {
            let totalReach = 0;
            let totalSpend = 0;
            let totalCreatives = 0;

            for (const camp of campaigns) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/brand/${camp.id}?limit=1000`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const json = await res.json();
                    if (json.success) {
                        const subs = json.data.data || [];
                        totalCreatives += subs.length;
                        subs.forEach((s: any) => {
                            if (s.status !== 'Rejected') {
                                totalReach += s.views || 0;
                                totalSpend += Number(s.earnings || 0);
                            }
                        });
                    }
                } catch (e) { console.error(e); }
            }
            setStats({ reach: totalReach, spend: totalSpend, creatives: totalCreatives });
        };

        if (campaigns.length > 0) fetchAllStats();
    }, [campaigns, token]);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Brand Overview</h1>
                <p className="text-white/40 text-sm">Real-time performance across all assigned missions.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative group">
                    <BarChart3 className="text-white/20 mb-4" size={24} />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-1">Active Campaigns</p>
                    <p className="text-3xl font-bold">{campaigns.length}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative group">
                    <Target className="text-white/20 mb-4" size={24} />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-1">Total Reach</p>
                    <p className="text-3xl font-bold">{stats.reach.toLocaleString()}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative group">
                    <DollarSign className="text-white/20 mb-4" size={24} />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-1">Budget Utilized</p>
                    <p className="text-3xl font-bold">${stats.spend.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6 text-white/60">Campaign Activity</h3>
                <div className="space-y-3">
                    {campaigns.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                            <p className="text-white/10 italic">No assigned campaigns found.</p>
                        </div>
                    ) : campaigns.map(camp => (
                        <Link 
                            key={camp.id} 
                            to={`/brands/dashboard?id=${camp.id}`} 
                            className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all group border-transparent hover:border-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center font-bold text-white/40">
                                    {camp.title.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{camp.title}</h4>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">${camp.total_budget} Budget</p>
                                </div>
                            </div>
                            <div className="p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-white group-hover:bg-white/10 transition-all">
                                <ArrowRight size={18} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CampaignDetailsView = ({ campaign, token }: { campaign: any, token: string | null }) => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/brand/${campaign.id}?limit=100`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    // Handle both flat array and nested data: { data: [...] }
                    const submissionData = Array.isArray(json.data) ? json.data : (json.data?.data || []);
                    setSubmissions(submissionData);
                } else {
                    Toast.fire({ title: 'Error', text: json.error || 'Failed to load submissions', icon: 'error' });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchSubmissions();
    }, [campaign.id, token]);

    const totalViews = submissions.reduce((acc, sub) => acc + (sub.status !== 'Rejected' ? sub.views : 0), 0);
    const totalSpent = submissions.reduce((acc, sub) => acc + (sub.status !== 'Rejected' ? Number(sub.earnings) : 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                        <span className="text-white/20 text-[10px] font-mono tracking-tighter"># {campaign.id.slice(0, 8)}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white uppercase">{campaign.title}</h1>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 px-5 flex items-center gap-3">
                    <Calendar size={16} className="text-white/30" />
                    <div>
                        <p className="text-[8px] uppercase tracking-widest text-white/30 leading-none mb-1">Launch Date</p>
                        <p className="text-xs font-bold text-white/80">{new Date(campaign.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <MetricBox label="Total Reach" value={totalViews.toLocaleString()} icon={<TrendingUp size={18} />} />
                <MetricBox label="Investment" value={`$${totalSpent.toFixed(2)}`} icon={<DollarSign size={18} />} />
                <MetricBox label="Creatives" value={submissions.length.toString()} icon={<Play size={18} />} />
                <MetricBox label="CPM Rate" value={`$${campaign.cpm_rate}`} icon={<TrendingUp size={18} />} />
                <MetricBox label="Avg. Velocity" value={(totalViews / (submissions.length || 1)).toLocaleString(undefined, {maximumFractionDigits: 0})} icon={<TrendingUp size={18} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-white/60 text-sm uppercase tracking-wider">Platform Performance</h3>
                        <div className="flex gap-4">
                            {['youtube', 'tiktok', 'instagram'].map(p => (
                                <div key={p} className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${p === 'youtube' ? 'bg-red-500' : p === 'tiktok' ? 'bg-emerald-400' : 'bg-purple-500'}`} />
                                    <span className="text-[10px] uppercase text-white/20 font-bold">{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        {['youtube', 'tiktok', 'instagram'].map(platform => {
                            const platformViews = submissions.filter(s => s.platform === platform && s.status !== 'Rejected').reduce((acc, s) => acc + s.views, 0);
                            const percentage = totalViews > 0 ? (platformViews / totalViews) * 100 : 0;
                            return (
                                <div key={platform} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs font-bold text-white/60 capitalize">{platform}</p>
                                        <p className="text-xs font-mono text-white/40">{platformViews.toLocaleString()} views ({percentage.toFixed(1)}%)</p>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${platform === 'youtube' ? 'bg-red-500' : platform === 'tiktok' ? 'bg-emerald-400' : 'bg-purple-500'}`} 
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-white/60 text-sm uppercase tracking-wider mb-2">Network Health</h3>
                        <p className="text-xs text-white/20 leading-relaxed">Your campaign is currently distributed across {new Set(submissions.map(s => s.user_id)).size} unique creator nodes.</p>
                    </div>
                    <div className="mt-8 space-y-4">
                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                            <p className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Approval Rating</p>
                            <p className="text-xl font-bold text-emerald-400">
                                {((submissions.filter(s => s.status === 'Verified' || s.status === 'Paid').length / (submissions.length || 1)) * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                            <p className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Efficiency Factor</p>
                            <p className="text-xl font-bold text-white">
                                {totalViews > 100000 ? 'High' : totalViews > 10000 ? 'Medium' : 'Standard'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="font-semibold text-white/80 text-sm">Submission Intelligence</h3>
                    <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">{submissions.length} total entries</p>
                </div>

                {loading ? (
                    <div className="p-16 text-center text-white/20 text-xs tracking-widest">Loading data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-white/40 border-b border-white/10 bg-white/[0.01]">
                                    <th className="px-6 py-4 font-semibold w-16">Preview</th>
                                    <th className="px-6 py-4 font-semibold">Video URL</th>
                                    <th className="px-6 py-4 font-semibold">Network</th>
                                    <th className="px-6 py-4 font-semibold text-right">Reach</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {submissions.map((sub: any) => {
                                    const thumbnail = getThumbnailUrl(sub.url, sub.platform);
                                    return (
                                        <tr key={sub.id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative group/thumb">
                                                    {thumbnail ? (
                                                        <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Play size={16} className="text-white/10" />
                                                    )}
                                                    <a href={sub.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ExternalLink size={14} className="text-white" />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-[300px]">
                                                <a href={sub.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                                                    <span className="truncate text-xs">{sub.url}</span>
                                                    <ExternalLink size={12} className="opacity-40" />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-white/50">{sub.platform}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-white/90 text-sm">
                                                {sub.views.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-medium ${
                                                    sub.status === 'Verified' ? 'text-emerald-400 bg-emerald-400/10' :
                                                    sub.status === 'Rejected' ? 'text-red-400 bg-red-400/10' :
                                                    sub.status === 'Paid' ? 'text-blue-400 bg-blue-400/10' :
                                                    'text-white/40 bg-white/10'
                                                }`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center text-white/20 text-sm italic">No submissions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricBox = ({ label, value, icon }: any) => (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative group overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover:text-white/40 transition-colors">
                {icon}
            </div>
            <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-white/30">{label}</p>
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

const getThumbnailUrl = (url: string, platform: string) => {
    if (platform === 'youtube') {
        const match = url.match(/(?:shorts\/|v=|\/v\/|youtu\.be\/|embed\/)([^"&?\/\s]{11})/);
        const id = match ? match[1] : null;
        return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
    }
    return null;
};
