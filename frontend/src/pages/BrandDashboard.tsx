import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
        <div className="space-y-12">
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight uppercase glassy-text">Enterprise Overview</h1>
                <p className="text-white/40 font-light tracking-wide">Select a mission from the sidebar to view deep analytics.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full" />
                    <BarChart3 className="text-white/20 mb-6" size={32} />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-1">Active Campains</p>
                    <p className="text-4xl font-bold font-mono">{campaigns.length}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
                    <Target className="text-emerald-500/20 mb-6" size={32} />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-1">Total Reach</p>
                    <p className="text-4xl font-bold font-mono">{stats.reach.toLocaleString()}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full" />
                    <DollarSign className="text-white/20 mb-6" size={32} />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-1">Budget Utilized</p>
                    <p className="text-4xl font-bold font-mono">${stats.spend.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10">
                <h3 className="text-xl font-bold mb-8 opacity-60">Recent Campaign Activity</h3>
                <div className="space-y-4">
                    {campaigns.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
                            <p className="text-white/10 italic">No assigned campaigns found.</p>
                        </div>
                    ) : campaigns.map(camp => (
                        <div key={camp.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-bold text-white/40 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                                    {camp.title.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold group-hover:text-white transition-colors">{camp.title}</h4>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">${camp.total_budget} Budget</p>
                                </div>
                            </div>
                            <a href={`/brands/dashboard?id=${camp.id}`} className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                <ArrowRight size={20} />
                            </a>
                        </div>
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Active Mission</span>
                        <span className="text-white/20 text-xs">/ {campaign.id.slice(0, 8)}</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight uppercase">{campaign.title}</h1>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 px-6 flex items-center gap-4">
                    <Calendar size={18} className="text-white/30" />
                    <div>
                        <p className="text-[9px] uppercase tracking-widest text-white/30">Contract Date</p>
                        <p className="text-xs font-bold">{new Date(campaign.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricBox label="Reach" value={totalViews.toLocaleString()} icon={<TrendingUp size={20} />} />
                <MetricBox label="Investment" value={`$${totalSpent.toFixed(2)}`} icon={<DollarSign size={20} />} />
                <MetricBox label="Creatives" value={submissions.length.toString()} icon={<Play size={20} />} />
                <MetricBox label="CPM Rate" value={`$${campaign.cpm_rate}`} icon={<TrendingUp size={20} />} />
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <h3 className="font-bold text-lg uppercase tracking-wider">Creative Performance Logs</h3>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Latest {submissions.length} Entries</p>
                </div>

                {loading ? (
                    <div className="p-20 text-center text-white/20 animate-pulse uppercase text-xs tracking-widest">Hydrating table data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-[0.2em] text-white/30 border-b border-white/5">
                                    <th className="px-8 py-5 font-bold">Source Link</th>
                                    <th className="px-8 py-5 font-bold">Network</th>
                                    <th className="px-8 py-5 font-bold text-right">Views</th>
                                    <th className="px-8 py-5 font-bold text-center">Protocol Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {submissions.map((sub: any) => (
                                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6 max-w-[300px]">
                                            <a href={sub.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-emerald-400 transition-colors">
                                                <span className="truncate">{sub.url}</span>
                                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs uppercase tracking-widest font-mono text-white/40">{sub.platform}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono font-bold text-sm">
                                            {sub.views.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${sub.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    sub.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        sub.status === 'Paid' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                            'bg-white/5 text-white/40 border border-white/10'
                                                }`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-white/10 italic">No data streams found for this campaign.</td>
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
    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 relative group overflow-hidden hover:border-white/20 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-2xl text-white/30 group-hover:text-white transition-colors">
                {icon}
            </div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 mb-1">{label}</p>
        <p className="text-3xl font-bold font-mono tracking-tight">{value}</p>
    </div>
);
