import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowUpRight, DollarSign, Wallet, TrendingUp } from 'lucide-react';

interface Campaign {
    id: string;
    title: string;
    cpm_rate: number;
    total_budget: number;
    budget_used: number;
    banner_url?: string;
    status: string;
    is_featured: boolean;
}

const FALLBACK_BANNERS = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
];

const MotionLink = motion.create(Link);

export const CampaignsFeed = () => {
    const { token } = useAuthStore();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) setCampaigns(json.data || []);
            } catch (err) {
                console.error('Failed to fetch campaigns:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, [token]);

    const activeCampaigns = campaigns.filter(c => c.status === 'Active');

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10 pb-12"
        >
            {/* Featured Marquee — Only show campaigns marked as featured */}
            {!loading && campaigns.filter(c => c.is_featured).length > 0 && (
                <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" /> Featured Opportunities
                        </h2>
                    </div>
                    
                    <div className="relative overflow-hidden w-full group">
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020202] to-transparent z-10 pointer-events-none" />
                        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020202] to-transparent z-10 pointer-events-none" />
                        
                        <motion.div 
                            className="flex gap-6 w-max"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ 
                                duration: 25, 
                                ease: "linear", 
                                repeat: Infinity 
                            }}
                        >
                            {/* Duplicate campaigns for infinite loop */}
                            {[...campaigns.filter(c => c.is_featured), ...campaigns.filter(c => c.is_featured)].map((c, i) => (
                                <Link 
                                    to={`/campaigns/${c.id}`}
                                    key={`${c.id}-${i}`}
                                    className="relative w-[280px] sm:w-[320px] md:w-[480px] h-[200px] sm:h-[220px] md:h-[280px] rounded-[32px] overflow-hidden border border-white/10 group/item flex-shrink-0"
                                >
                                    <img
                                        src={c.banner_url || FALLBACK_BANNERS[i % FALLBACK_BANNERS.length]}
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/item:opacity-90 group-hover/item:scale-105 transition-all duration-700"
                                        alt={c.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">{c.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-amber-400 font-mono text-sm">${c.cpm_rate.toFixed(2)} CPM</span>
                                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-bold text-white/50 uppercase tracking-widest">Featured</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white/90">All Campaigns</h1>
                    <p className="text-white/30 text-sm font-light tracking-tight mt-1">Browse and join active marketing opportunities.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    <TrendingUp className="w-4 h-4" />
                    {activeCampaigns.length} Available
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="py-24 flex justify-center">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                </div>
            )}

            {/* Empty state */}
            {!loading && campaigns.length === 0 && (
                <div className="py-24 text-center space-y-3">
                    <p className="text-white/20 text-4xl">📭</p>
                    <p className="text-white/30 text-sm font-light">No campaigns available right now. Check back soon!</p>
                </div>
            )}

            {/* Campaign Cards */}
            {!loading && campaigns.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {campaigns.map((campaign, index) => {
                        const remaining = campaign.total_budget - campaign.budget_used;
                        const progress = campaign.total_budget > 0 ? (campaign.budget_used / campaign.total_budget) * 100 : 0;
                        const isFull = remaining <= 0;
                        const banner = campaign.banner_url || FALLBACK_BANNERS[index % FALLBACK_BANNERS.length];

                        return (
                            <MotionLink
                                to={`/campaigns/${campaign.id}`}
                                key={campaign.id}
                                layoutId={`card-${campaign.id}`}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="group relative rounded-3xl bg-[#0c0c0c] border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer block overflow-hidden shadow-lg hover:shadow-2xl"
                            >
                                {/* Card Banner */}
                                <div className="h-28 w-full relative overflow-hidden">
                                    <img
                                        src={banner}
                                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                                        alt={campaign.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/60 to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <Badge status={campaign.status} />
                                    </div>
                                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white/80 group-hover:bg-white/10 transition-all duration-300">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="p-5 pt-2 space-y-4">
                                    <div>

                                        <h3 className="text-lg font-bold leading-tight tracking-tight text-white/90 group-hover:text-white transition-colors">{campaign.title}</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                            <div className="flex items-center gap-1.5 text-white/30 mb-1">
                                                <DollarSign className="w-3 h-3" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest">CPM</span>
                                            </div>
                                            <span className="font-mono text-lg font-bold text-white">${campaign.cpm_rate.toFixed(2)}</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                            <div className="flex items-center gap-1.5 text-white/30 mb-1">
                                                <Wallet className="w-3 h-3" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest">Left</span>
                                            </div>
                                            <span className={`font-mono text-lg font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                                                ${remaining.toFixed(0)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                                className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500/70'}`}
                                            />
                                        </div>
                                        <p className="text-[10px] text-white/20 font-mono text-right">{Math.round(progress)}% filled</p>
                                    </div>
                                </div>
                            </MotionLink>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};
