import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, ChevronRight, Activity, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Badge } from '../components/ui/Badge';

interface JoinedCampaign {
    id: string;
    title: string;
    description: string;
    banner_url: string;
    status: string;
    joined_at: string;
    cpm_rate: number;
    platform_requirements: string[];
}

export const JoinedCampaigns = () => {
    const { token } = useAuthStore();
    const [campaigns, setCampaigns] = useState<JoinedCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJoined = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/joined`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) setCampaigns(json.data);
            } catch (err) {
                console.error('Failed to fetch joined campaigns:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchJoined();
    }, [token]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="pb-6 border-b border-white/[0.06]">
                <h1 className="text-3xl font-bold tracking-tight text-white/90">Joined Campaigns</h1>
                <p className="text-white/30 text-sm font-light mt-1">Campaigns you are currently participating in.</p>
            </div>

            {campaigns.length === 0 ? (
                <div className="py-32 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                        <Globe className="w-10 h-10 text-white/10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white/60">No Active Campaigns</h3>
                        <p className="text-white/25 text-sm max-w-xs">You haven't joined any campaigns yet. Browse the feed to find a campaign.</p>
                    </div>
                    <Link to="/campaigns" className="px-8 py-3 rounded-2xl bg-white text-zinc-950 font-bold text-sm hover:scale-105 transition-all">
                        Browse Campaigns
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((camp, idx) => (
                        <motion.div
                            key={camp.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative bg-[#0c0c0c] border border-white/[0.06] rounded-[32px] overflow-hidden hover:border-white/20 transition-all duration-500"
                        >
                            <div className="aspect-[16/9] overflow-hidden relative">
                                <img 
                                    src={camp.banner_url || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop'} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    alt="" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute top-4 left-4">
                                    <Badge status={camp.status} />
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white/90 group-hover:text-white transition-colors">{camp.title}</h3>
                                    <p className="text-xs text-white/30 line-clamp-2 mt-1">{camp.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pb-2">
                                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                                        <div className="flex items-center gap-2 text-white/20 mb-1">
                                            <Activity className="w-3 h-3" />
                                            <span className="text-[8px] font-bold uppercase tracking-widest">CPM Rate</span>
                                        </div>
                                        <p className="text-sm font-mono font-bold text-emerald-400">${camp.cpm_rate.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                                        <div className="flex items-center gap-2 text-white/20 mb-1">
                                            <Target className="w-3 h-3" />
                                            <span className="text-[8px] font-bold uppercase tracking-widest">Joined</span>
                                        </div>
                                        <p className="text-sm font-mono font-bold text-white/60">{new Date(camp.joined_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <Link 
                                    to={`/campaigns/${camp.id}`}
                                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all group/btn"
                                >
                                    Campaign Control
                                    <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
