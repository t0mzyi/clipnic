import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowUpRight, DollarSign, Wallet, TrendingUp, Star, ChevronLeft, ChevronRight, Search, Play, Camera, History } from 'lucide-react';

const TikTokIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tiktok">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

interface Campaign {
    id: string;
    title: string;
    cpm_rate: number;
    total_budget: number;
    budget_used: number;
    banner_url?: string;
    status: string;
    is_featured: boolean;
    start_date?: string;
    end_date: string;
    auto_start?: boolean;
}

const FALLBACK_BANNERS = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
];

const MotionLink = motion.create(Link);

export const CampaignsFeed = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Discovery State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    // Carousel State
    const [activeIdx, setActiveIdx] = useState(0);
    const [direction, setDirection] = useState(0);
    const autoplayTimerRef = useRef<any>(null);

    const featured = campaigns.filter(c => {
        const now = new Date();
        const isStarted = !c.start_date || new Date(c.start_date) <= now;
        return c.is_featured && (c.status === 'Active' || (!isStarted && c.auto_start));
    });

    useEffect(() => {
        const fetchCampaigns = async () => {
            // 1. Try to load from cache first for instant UI
            const cachedData = localStorage.getItem('clipnic_campaigns_cache');
            if (cachedData) {
                try {
                    const { data, timestamp } = JSON.parse(cachedData);
                    // If cache is less than 5 minutes old, we can still show it but will revalidate
                    setCampaigns(data);
                    if (Date.now() - timestamp < 300000) { // 5 mins
                         setLoading(false);
                    }
                } catch (e) {
                    localStorage.removeItem('clipnic_campaigns_cache');
                }
            }

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    const fetchedData = json.data || [];
                    setCampaigns(fetchedData);
                    // 2. Update cache
                    localStorage.setItem('clipnic_campaigns_cache', JSON.stringify({
                        data: fetchedData,
                        timestamp: Date.now()
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch campaigns:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, [token]);

    // Autoplay logic
    useEffect(() => {
        if (featured.length <= 1) return;
        
        const startAutoplay = () => {
            autoplayTimerRef.current = setInterval(() => {
                setDirection(1);
                setActiveIdx((prev) => (prev + 1) % featured.length);
            }, 6000);
        };

        startAutoplay();
        return () => {
            if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
        };
    }, [featured.length, activeIdx]);

    const handleNext = () => {
        if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
        setDirection(1);
        setActiveIdx((prev) => (prev + 1) % featured.length);
    };

    const handlePrev = () => {
        if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
        setDirection(-1);
        setActiveIdx((prev) => (prev - 1 + featured.length) % featured.length);
    };

    const now = new Date();
    const activeCampaigns = campaigns.filter(c => {
        const isStarted = !c.start_date || new Date(c.start_date) <= now;
        // Show if Active, OR if it's Scheduled (Paused but auto_start is true and has future start_date)
        return c.status === 'Active' || (!isStarted && c.auto_start);
    });
    
    // Discovery Logic
    const filteredCampaigns = activeCampaigns.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = !selectedPlatform || (c as any).allowed_platforms?.includes(selectedPlatform.toLowerCase());
        return matchesSearch && matchesPlatform;
    });

    const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
    });

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.98
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.98
        })
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10 pb-12"
        >
            {/* Hero Carousel */}
            {!loading && featured.length > 0 && (
                <>
                    <div className="relative w-full group flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
                            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] glassy-text">Featured Opportunities</h2>
                        </div>
                        {featured.length > 1 && (
                            <div className="flex gap-2">
                                <button onClick={handlePrev} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={handleNext} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative h-[300px] md:h-[420px] w-full rounded-[40px] overflow-hidden border border-white/10 bg-[#080808]">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={activeIdx}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.3 }
                                }}
                                className="absolute inset-0"
                            >
                                <div 
                                    onClick={() => {
                                        if (featured[activeIdx]?.id) {
                                            navigate(`/clippers/campaigns/${featured[activeIdx].id}`);
                                        }
                                    }}
                                    className="block h-full w-full relative group/slide cursor-pointer"
                                >
                                    <img
                                        src={featured[activeIdx].banner_url || FALLBACK_BANNERS[activeIdx % FALLBACK_BANNERS.length]}
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover/slide:scale-105"
                                        alt={featured[activeIdx].title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                    
                                    <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end max-w-3xl">
                                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/40 flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                                                    <Star size={12} className="text-amber-400" fill="currentColor" /> Featured
                                                </div>
                                            </div>
                                            <h3 className="text-3xl md:text-6xl font-bold text-premium-white mb-6 leading-[1.1] tracking-tight">{featured[activeIdx].title}</h3>
                                            <div className="flex items-center gap-8">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Earning Potential</span>
                                                    <span className="text-2xl font-mono font-bold text-amber-400">${featured[activeIdx].cpm_rate.toFixed(2)} <span className="text-sm opacity-50 font-sans tracking-tight">/ 1000 views</span></span>
                                                </div>
                                                <div className="h-10 w-[1px] bg-white/10" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Campaign Budget</span>
                                                    <span className="text-2xl font-mono font-bold text-white">${featured[activeIdx].total_budget.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Glass Shine Animation Overlay */}
                                    <div className="absolute inset-0 glowing-glass-item opacity-40 pointer-events-none" />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Slide Indicators */}
                        {featured.length > 1 && (
                            <div className="absolute bottom-10 right-12 flex gap-2 z-20">
                                {featured.map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => {
                                            setDirection(i > activeIdx ? 1 : -1);
                                            setActiveIdx(i);
                                        }}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'}`} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Discovery & Search Section */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div id="tour-search" className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find campaigns by brand or keyword..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-12 pr-6 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.05] transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scroll-hide">
                        <button 
                            onClick={() => setSelectedPlatform(null)}
                            className={`px-5 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${!selectedPlatform ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                        >
                            All Platforms
                        </button>
                        {[
                            { id: 'youtube', icon: <Play size={12} />, label: 'YouTube' },
                            { id: 'tiktok', icon: <TikTokIcon />, label: 'TikTok' },
                            { id: 'instagram', icon: <Camera size={12} />, label: 'Instagram' }
                        ].map(p => (
                            <button 
                                key={p.id}
                                onClick={() => setSelectedPlatform(p.id)}
                                className={`px-5 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${selectedPlatform === p.id ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                            >
                                {p.icon}
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.05] pb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white/90 glassy-text">Available Campaigns</h2>
                    <p className="text-white/30 text-sm font-light tracking-tight mt-1">Explore all active clipping opportunities matching your search.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    {sortedCampaigns.length} Results
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
                <div className="py-24 text-center space-y-4">
                    <History size={40} className="mx-auto text-white/10 mb-4" />
                    <p className="text-white/30 text-sm font-light">No campaigns available right now. Check back soon!</p>
                </div>
            )}

            {/* Campaign Cards */}
            {!loading && sortedCampaigns.length > 0 && (
                <div id="tour-campaign-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedCampaigns.map((campaign, index) => {
                        const remaining = campaign.total_budget - campaign.budget_used;
                        const progress = campaign.total_budget > 0 ? (campaign.budget_used / campaign.total_budget) * 100 : 0;
                        const isFull = remaining <= 0;
                        const banner = campaign.banner_url || FALLBACK_BANNERS[index % FALLBACK_BANNERS.length];

                        return (
                            <MotionLink
                                to={`/clippers/campaigns/${campaign.id}`}
                                key={campaign.id}
                                layoutId={`card-${campaign.id}`}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className={`group relative rounded-3xl bg-[#0c0c0c] border transition-all cursor-pointer block overflow-hidden shadow-lg hover:shadow-2xl ${
                                    campaign.is_featured 
                                        ? 'glowing-glass-item border-purple-500/30 ring-1 ring-purple-500/10' 
                                        : 'border-white/[0.06] hover:border-white/15'
                                }`}
                            >
                                {/* Card Banner */}
                                <div className="h-28 w-full relative overflow-hidden">
                                    <img
                                        src={banner}
                                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                                        alt={campaign.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/60 to-transparent" />
                                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                        {(!campaign.start_date || new Date(campaign.start_date) <= new Date()) ? (
                                            <Badge status={campaign.status} />
                                        ) : (
                                            <div className="px-2 py-1 rounded-lg bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-[9px] font-bold text-amber-400 flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                                COMING SOON
                                            </div>
                                        )}
                                        {campaign.is_featured && (
                                            <div className="px-2 py-1 rounded-lg bg-purple-500/20 backdrop-blur-md border border-purple-500/30 text-[9px] font-bold text-purple-400 flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                                <Star size={10} fill="currentColor" /> FEATURED
                                            </div>
                                        )}
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
                                        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest px-1">
                                            {(!campaign.start_date || new Date(campaign.start_date) <= new Date()) ? (
                                                <span className="text-amber-500/60">
                                                    Ends: {new Date(campaign.end_date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            ) : (
                                                <span className="text-blue-400/60">
                                                    Starts: {new Date(campaign.start_date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                            <span className="text-white/20 font-mono">{Math.round(progress)}% filled</span>
                                        </div>
                                        <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                                className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500/70'}`}
                                            />
                                        </div>
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
