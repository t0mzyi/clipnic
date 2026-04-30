import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Box, Play, DollarSign, TrendingUp, BarChart3, Target, 
    Calendar, ArrowRight, ExternalLink, Search, Copy, 
    RefreshCw, Download, Filter, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Toast } from '../lib/swal';

export const BrandDashboard = () => {
    const { token, user } = useAuthStore();
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
            <div className="relative">
                <div className="w-16 h-16 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Box size={24} className="text-emerald-500/50" />
                </div>
            </div>
            <p className="text-white/20 uppercase tracking-[0.3em] text-[10px] font-bold animate-pulse">Synchronizing Enterprise Data</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
                {!campaignId ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <BrandOverview campaigns={campaigns} token={token} user={user} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {selectedCampaign ? (
                            <CampaignDetailsView campaign={selectedCampaign} token={token} />
                        ) : (
                            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                                <Target size={48} className="mx-auto text-white/10 mb-4" />
                                <h2 className="text-xl font-bold mb-2">Campaign Not Found</h2>
                                <p className="text-white/40 mb-6">The requested campaign is missing or access is restricted.</p>
                                <a href="/brands/dashboard" className="text-emerald-400 hover:underline flex items-center justify-center gap-2">
                                    <ArrowRight size={16} /> Return to Overview
                                </a>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BrandOverview = ({ campaigns, token, user }: { campaigns: any[], token: string | null, user: any }) => {
    const [stats, setStats] = useState({ reach: 0, spend: 0, creatives: 0 });
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchAllStats = async () => {
        setIsSyncing(true);
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
                    const subs = json.data.data || json.data || [];
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
        setIsSyncing(false);
    };

    useEffect(() => {
        if (campaigns.length > 0) fetchAllStats();
    }, [campaigns, token]);

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">
                        <Box size={14} />
                        <span>Command Center</span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter uppercase glassy-text">
                        Welcome, <span className="text-white">{user?.name || 'Partner'}</span>
                    </h1>
                    <p className="text-white/40 font-light tracking-wide max-w-xl">
                        Monitor your global short-form infrastructure and viral velocity across all active missions.
                    </p>
                </div>
                <button 
                    onClick={fetchAllStats}
                    disabled={isSyncing}
                    className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                >
                    <RefreshCw size={18} className={`text-emerald-500 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    <span className="text-xs font-bold uppercase tracking-widest">Sync Metrics</span>
                </button>
            </header>

            <div className="grid grid-cols-3 gap-2 md:gap-6">
                <SummaryCard 
                    label="Missions" 
                    value={campaigns.length} 
                    icon={<BarChart3 className="w-5 h-5 md:w-8 md:h-8" />} 
                    color="blue" 
                />
                <SummaryCard 
                    label="Reach" 
                    value={stats.reach.toLocaleString()} 
                    icon={<Target className="w-5 h-5 md:w-8 md:h-8" />} 
                    color="emerald" 
                    subtext="Views"
                />
                <SummaryCard 
                    label="Budget" 
                    value={`$${stats.spend.toLocaleString()}`} 
                    icon={<DollarSign className="w-5 h-5 md:w-8 md:h-8" />} 
                    color="white" 
                />
            </div>

            <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight">Active Campaigns</h3>
                        <p className="text-white/30 text-xs mt-1 uppercase tracking-widest">Mission Control Registry</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search missions..." 
                                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-emerald-500/50 transition-all w-64"
                            />
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {campaigns.length === 0 ? (
                        <div className="lg:col-span-2 text-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                            <p className="text-white/10 italic text-sm">No missions assigned to this terminal.</p>
                        </div>
                    ) : campaigns.map(camp => (
                        <motion.a 
                            key={camp.id} 
                            href={`/brands/dashboard?id=${camp.id}`}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center justify-between p-5 md:p-6 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-[2rem] hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-4 md:gap-5">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-white/20 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all shadow-inner shrink-0">
                                    {camp.title.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold group-hover:text-white transition-colors text-base md:text-lg truncate">{camp.title}</h4>
                                    <div className="flex items-center gap-2 md:gap-3 mt-1">
                                        <span className="text-[9px] md:text-[10px] text-white/20 uppercase tracking-widest truncate">${camp.total_budget} Budget</span>
                                        <span className="w-1 h-1 bg-white/10 rounded-full shrink-0" />
                                        <span className="text-[9px] md:text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest shrink-0">Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl text-white/20 group-hover:text-white group-hover:bg-emerald-500 transition-all shrink-0">
                                <ChevronRight size={18} className="md:w-5 md:h-5" />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </section>
        </div>
    );
};

const CampaignDetailsView = ({ campaign, token }: { campaign: any, token: string | null }) => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/brand/${campaign.id}?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                const data = Array.isArray(json.data) ? json.data : (json.data?.data || []);
                setSubmissions(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSubmissions();
    }, [campaign.id, token]);

    const filteredSubmissions = submissions.filter(sub => 
        sub.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalViews = submissions.reduce((acc, sub) => acc + (sub.status !== 'Rejected' ? sub.views : 0), 0);
    const totalSpent = submissions.reduce((acc, sub) => acc + (sub.status !== 'Rejected' ? Number(sub.earnings) : 0), 0);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        Toast.fire({ title: 'Copied', text: 'Campaign ID copied to clipboard', icon: 'success', timer: 1500 });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <a href="/brands/dashboard" className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors">
                            <Box size={16} />
                        </a>
                        <span className="text-white/10">/</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Mission Detail</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-5xl font-bold tracking-tighter uppercase">{campaign.title}</h1>
                        <button 
                            onClick={() => copyToClipboard(campaign.id)}
                            className="p-2 text-white/10 hover:text-white/40 transition-colors"
                            title="Copy Campaign ID"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    <p className="text-white/40 font-light max-w-xl">Deep analytics for {campaign.title}. Performance metrics are updated in near real-time.</p>
                </div>
                
                <div className="flex gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 px-6 flex items-center gap-4">
                        <Calendar size={18} className="text-white/30" />
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-white/30">Initiated</p>
                            <p className="text-xs font-bold font-mono">{new Date(campaign.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button 
                        onClick={fetchSubmissions}
                        className="bg-emerald-500 text-black px-6 py-4 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MetricBox label="Total Reach" value={totalViews.toLocaleString()} icon={<TrendingUp size={20} />} trend="+12.5%" />
                <MetricBox label="Budget Spent" value={`$${totalSpent.toFixed(2)}`} icon={<DollarSign size={20} />} trend="On Track" />
                <MetricBox label="Content Pieces" value={submissions.length.toString()} icon={<Play size={20} />} />
                <MetricBox label="Unit Cost (CPM)" value={`$${campaign.cpm_rate}`} icon={<Target size={20} />} sub="Contract Rate" />
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.01]">
                    <div>
                        <h3 className="font-bold text-xl uppercase tracking-tight">Creative Performance Logs</h3>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Live data stream from connected socials</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input 
                                type="text" 
                                placeholder="Filter results..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-white/30 transition-all w-full md:w-64"
                            />
                        </div>
                        <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/30 hover:text-white transition-all">
                            <Filter size={18} />
                        </button>
                        <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/30 hover:text-white transition-all">
                            <Download size={18} />
                        </button>
                    </div>
                </div>
                
                {loading && submissions.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                         <div className="w-10 h-10 border-2 border-white/5 border-t-emerald-500 rounded-full animate-spin" />
                         <p className="text-white/20 uppercase text-[10px] tracking-widest font-bold animate-pulse">Scanning Social Graph...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-[0.3em] text-white/30 border-b border-white/5">
                                    <th className="px-10 py-6 font-bold">Source link</th>
                                    <th className="px-10 py-6 font-bold">Network</th>
                                    <th className="px-10 py-6 font-bold text-right">Verified Reach</th>
                                    <th className="px-10 py-6 font-bold text-center">Protocol Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredSubmissions.map((sub: any) => (
                                    <tr key={sub.id} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-10 py-7 max-w-[350px]">
                                            <a href={sub.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/60 hover:text-emerald-400 transition-colors">
                                                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
                                                    <ExternalLink size={14} />
                                                </div>
                                                <span className="truncate text-sm font-medium">{sub.url}</span>
                                            </a>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${sub.platform === 'TikTok' ? 'bg-pink-500' : sub.platform === 'YouTube' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                <span className="text-xs uppercase tracking-widest font-mono text-white/40">{sub.platform}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-mono font-bold text-lg text-white">
                                                    {sub.views.toLocaleString()}
                                                </span>
                                                <span className="text-[9px] text-white/20 uppercase tracking-widest">Impressions</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                                                sub.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                sub.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                sub.status === 'Paid' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-white/5 text-white/40 border-white/10'
                                            }`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSubmissions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Search size={40} />
                                                <p className="italic text-sm">No results match your current filter.</p>
                                            </div>
                                        </td>
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

const SummaryCard = ({ label, value, icon, color, subtext }: any) => (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-[2.5rem] p-4 md:p-10 relative overflow-hidden group hover:border-white/20 transition-all shadow-2xl">
        <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 blur-[40px] md:blur-[80px] rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 opacity-20 transition-opacity group-hover:opacity-40 ${
            color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-white'
        }`} />
        
        <div className="relative z-10">
            <div className={`mb-3 md:mb-8 p-2 md:p-4 inline-block rounded-xl md:rounded-2xl border border-white/10 bg-white/5 transition-colors group-hover:bg-white/10 ${
                color === 'emerald' ? 'text-emerald-500' : color === 'blue' ? 'text-blue-500' : 'text-white/50'
            }`}>
                {icon}
            </div>
            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-black text-white/20 mb-1 md:mb-2">{label}</p>
            <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                <p className="text-xl md:text-5xl font-bold font-mono tracking-tighter">{value}</p>
                {subtext && <span className="text-[8px] md:text-[10px] text-white/20 uppercase tracking-widest hidden md:inline">{subtext}</span>}
            </div>
        </div>
    </div>
);

const MetricBox = ({ label, value, icon, trend, sub }: any) => (
    <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 relative group overflow-hidden hover:bg-white/[0.05] hover:border-white/20 transition-all shadow-xl">
        <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/30 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all shadow-inner">
                {icon}
            </div>
            {trend && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <TrendingUp size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500">{trend}</span>
                </div>
            )}
        </div>
        <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20 mb-2">{label}</p>
            <p className="text-4xl font-bold font-mono tracking-tighter mb-1">{value}</p>
            {sub && <p className="text-[10px] text-white/10 uppercase tracking-widest font-medium">{sub}</p>}
        </div>
    </div>
);
