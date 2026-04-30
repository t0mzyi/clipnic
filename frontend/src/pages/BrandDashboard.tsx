import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        <div className="space-y-12 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Brand Dashboard</h1>
                <p className="text-white/40 text-sm">Performance summary for all active campaigns.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricBox label="Active Missions" value={campaigns.length} />
                <MetricBox label="Aggregate Reach" value={stats.reach.toLocaleString()} />
                <MetricBox label="Investment" value={`$${stats.spend.toLocaleString()}`} />
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-white/20 uppercase tracking-widest px-6">Assigned Campaigns</h3>
                <div className="grid grid-cols-1 gap-3">
                    {campaigns.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/5 rounded-[2.5rem]">
                            <p className="text-white/10 italic">No assigned campaigns found.</p>
                        </div>
                    ) : campaigns.map(camp => (
                        <Link 
                            key={camp.id} 
                            to={`/brands/dashboard?id=${camp.id}`} 
                            className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-full px-10 hover:bg-white/[0.04] transition-all group"
                        >
                            <div className="flex items-center gap-8">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center overflow-hidden">
                                    {camp.banner_url ? (
                                        <img src={camp.banner_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-white/10">{camp.title.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white/80 group-hover:text-white transition-colors">{camp.title}</h4>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">${camp.total_budget} Budget</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-white/10 group-hover:text-white/40 transition-colors" />
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
                    const submissionData = Array.isArray(json.data) ? json.data : (json.data?.data || []);
                    setSubmissions(submissionData);
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
        <div className="space-y-12 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white uppercase">{campaign.title}</h1>
                    <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-mono">Campaign ID: {campaign.id.slice(0, 8)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-full px-6 py-2.5 flex items-center gap-3">
                    <Calendar size={14} className="text-white/30" />
                    <span className="text-xs font-bold text-white/80">{new Date(campaign.created_at).toLocaleDateString()}</span>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricBox label="Reach" value={totalViews.toLocaleString()} />
                <MetricBox label="Spent" value={`$${totalSpent.toFixed(2)}`} />
                <MetricBox label="Creatives" value={submissions.length.toString()} />
                <MetricBox label="CPM" value={`$${campaign.cpm_rate}`} />
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="font-semibold text-white/80 text-sm">Activity Log</h3>
                    <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">{submissions.length} Submissions</p>
                </div>

                {loading ? (
                    <div className="p-16 text-center text-white/20 text-xs tracking-widest">Loading data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-white/40 border-b border-white/10 bg-white/[0.01]">
                                    <th className="px-8 py-5 font-semibold w-20 text-center">Preview</th>
                                    <th className="px-8 py-5 font-semibold">Source</th>
                                    <th className="px-8 py-5 font-semibold text-right">Reach</th>
                                    <th className="px-8 py-5 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {submissions.map((sub: any) => {
                                    const thumbnail = getThumbnailUrl(sub.url, sub.platform);
                                    return (
                                        <tr key={sub.id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="w-12 h-16 rounded-xl mx-auto bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative group/thumb">
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
                                            <td className="px-8 py-6 max-w-[300px]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="truncate text-xs font-medium text-white/80">{sub.url}</span>
                                                    <span className="text-[9px] uppercase tracking-widest text-white/20">{sub.platform}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-white/90 text-sm">
                                                {sub.views.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
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
                                        <td colSpan={4} className="px-8 py-20 text-center text-white/20 text-sm italic">No entries yet.</td>
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

const MetricBox = ({ label, value }: any) => (
    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 mb-1">{label}</p>
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
