import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, PlaySquare, CheckCircle, Wallet, Eye, ShieldCheck, MessageSquare, Rocket, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuthStore } from '../store/useAuthStore';

interface EarningsData {
    totalEarnings: number;
    availableBalance: number;
    pendingPayout: number;
    claimed: number;
    breakdown: any[];
}

export const ClipperDashboard = () => {
    const { user, token } = useAuthStore();
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            Promise.all([fetchEarnings(), fetchSubmissions()]).finally(() => setLoading(false));
        }
    }, [token]);

    const fetchEarnings = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/earnings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setEarnings(json.data);
        } catch (err) { console.error(err); }
    };

    const fetchSubmissions = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setSubmissions(json.data);
        } catch (err) { console.error(err); }
    };

    // Build chart data: group views by date (last 14 days)
    const chartData = useMemo(() => {
        const days: Record<string, { views: number; earnings: number }> = {};
        const now = new Date();

        // Initialize last 14 days
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            days[key] = { views: 0, earnings: 0 };
        }

        // Aggregate submissions by date
        for (const sub of submissions) {
            const d = new Date(sub.created_at);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (days[key]) {
                days[key].views += sub.views || 0;
                days[key].earnings += Number(sub.earnings || 0);
            }
        }

        return Object.entries(days).map(([name, data]) => ({
            name,
            views: data.views,
            earnings: data.earnings,
        }));
    }, [submissions]);

    // Compute stats
    const totalClips = submissions.length;
    const totalViews = submissions.reduce((sum, s) => sum + (s.views || 0), 0);
    const approvedClips = submissions.filter(s => s.status === 'Verified' || s.status === 'Paid').length;
    const uniqueCampaigns = new Set(submissions.map(s => s.campaign_id)).size;

    const stats = [
        { label: 'Campaigns', value: uniqueCampaigns.toString(), icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15' },
        { label: 'Total Clips', value: totalClips.toString(), icon: PlaySquare, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/15' },
        { label: 'Approved', value: approvedClips.toString(), icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
        { label: 'Earnings', value: `$${(earnings?.totalEarnings ?? 0).toFixed(2)}`, icon: Wallet, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15', highlight: true },
    ];

    const recentActivity = submissions.slice(0, 5);

    // Onboarding State
    const [currentStep, setCurrentStep] = useState(0);
    const [showOnboardingModal, setShowOnboardingModal] = useState(!user?.discordVerified || !user?.youtubeVerified);

    const onboardingSteps = [
        {
            id: 'verify',
            title: 'Step 1: Link Socials',
            description: 'Link your YouTube and Discord accounts to start earning and tracking your progress.',
            icon: ShieldCheck,
            buttonText: 'Go to Profile',
            link: '/profile',
            isExternal: false,
            checkpoint: !!(user?.discordVerified && user?.youtubeVerified)
        },
        {
            id: 'discord',
            title: 'Step 2: Join Discord',
            description: 'Our community shares the best hooks, high-CPM niches, and daily clipping tips.',
            icon: MessageSquare,
            buttonText: 'Join Server',
            link: 'https://discord.gg/rzhvv9Rf42',
            isExternal: true,
            checkpoint: !!user?.discordVerified
        },
        {
            id: 'campaign',
            title: 'Step 3: Pick a Mission',
            description: 'Browse active campaigns and find the perfect video to clip and monetize.',
            icon: Rocket,
            buttonText: 'Browse Missions',
            link: '/campaigns',
            isExternal: false,
            checkpoint: submissions.length > 0
        }
    ];

    const handleNext = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setShowOnboardingModal(false);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="pb-6 border-b border-white/[0.06]">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 shadow-lg">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name || 'User'}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white/40">
                                        {user?.name?.[0] || user?.email?.[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black border-2 border-emerald-500/30 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-white/90">
                                Welcome Back{user?.name ? `, ${user.name}` : ''}
                            </h1>
                            {user?.role === 'admin' && (
                                <Link 
                                    to="/admin" 
                                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 group"
                                >
                                    Admin Portal
                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            )}
                        </div>
                        <p className="text-white/30 text-sm font-light mt-0.5">Your activity and earnings overview.</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white animate-spin" />
                </div>
            ) : (
                <>
                    {/* Onboarding Modal Overlay */}
                    <AnimatePresence>
                        {showOnboardingModal && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative w-full max-w-xl bg-gradient-to-br from-[#121212] to-black border border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-12 text-center"
                                >
                                    {/* Exit button */}
                                    <button 
                                        onClick={() => setShowOnboardingModal(false)}
                                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white/60 transition-all"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                    </button>

                                    {/* Progress Dots */}
                                    <div className="flex justify-center gap-1.5 mb-10">
                                        {onboardingSteps.map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'w-2 bg-white/10'}`}
                                            />
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6">
                                                {(() => {
                                                    const Icon = onboardingSteps[currentStep].icon;
                                                    return <Icon className="w-8 h-8 text-emerald-400" />
                                                })()}
                                            </div>

                                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                                                {onboardingSteps[currentStep].title}
                                            </h2>
                                            <p className="text-white/40 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                                                {onboardingSteps[currentStep].description}
                                            </p>

                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                                                {onboardingSteps[currentStep].isExternal ? (
                                                    <a 
                                                        href={onboardingSteps[currentStep].link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-white text-black font-bold text-sm tracking-tight hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        {onboardingSteps[currentStep].buttonText}
                                                    </a>
                                                ) : (
                                                    <Link 
                                                        to={onboardingSteps[currentStep].link}
                                                        className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-white text-black font-bold text-sm tracking-tight hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        {onboardingSteps[currentStep].buttonText}
                                                    </Link>
                                                )}
                                                
                                                <button 
                                                    onClick={handleNext}
                                                    className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm tracking-tight hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                                                >
                                                    {currentStep === onboardingSteps.length - 1 ? "Finish" : "Next Step"}
                                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${stat.highlight ? 'bg-amber-500/5 border-amber-500/15' : 'bg-[#0c0c0c] border-white/[0.06]'}`}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`p-1.5 rounded-lg ${stat.bg} border ${stat.border}`}>
                                            <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                                        </div>
                                        <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                    <p className={`text-3xl font-mono tracking-tight font-bold ${stat.highlight ? 'text-amber-400' : 'text-white/90'}`}>{stat.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Chart + Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chart */}
                        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] h-80 flex flex-col">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-bold tracking-tight text-white/70">View Velocity</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/30">
                                        <Eye className="w-3 h-3" />
                                        {totalViews.toLocaleString()} total
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400/60 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        14d
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-0 -ml-4">
                                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorViewsDashboard" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="rgba(255,255,255,0.1)"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.1)"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toString()}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(10,10,10,0.95)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                backdropFilter: 'blur(12px)',
                                                fontSize: '11px',
                                                padding: '8px 12px'
                                            }}
                                            itemStyle={{ color: '#10b981', padding: 0 }}
                                            formatter={(value: any) => [Number(value || 0).toLocaleString(), 'Views']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="views"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorViewsDashboard)"
                                            animationDuration={800}
                                            animationEasing="ease-out"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="p-6 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] h-80 flex flex-col">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-bold tracking-tight text-white/70">Recent Clips</h3>
                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{totalClips} total</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                {recentActivity.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <PlaySquare className="w-8 h-8 text-white/10 mb-3" />
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest">No submissions yet</p>
                                        <p className="text-[10px] text-white/15 mt-1">Submit a clip to see activity here.</p>
                                    </div>
                                ) : recentActivity.map((sub, i) => (
                                    <motion.div
                                        key={sub.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sub.platform === 'youtube' ? 'bg-red-500/10 text-red-500' :
                                                    sub.platform === 'instagram' ? 'bg-pink-500/10 text-pink-500' :
                                                        'bg-cyan-500/10 text-cyan-400'
                                                }`}>
                                                {sub.platform === 'youtube' && (
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                                )}
                                                {sub.platform === 'instagram' && (
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                                )}
                                                {sub.platform === 'tiktok' && (
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-white/80 truncate">{sub.campaigns?.title || 'Campaign'}</p>
                                                <p className="text-[9px] text-white/30 font-mono">{(sub.views || 0).toLocaleString()} views</p>
                                            </div>
                                        </div>
                                        <div className="text-right ml-2 shrink-0">
                                            <p className="text-xs font-mono font-bold text-white/80">${Number(sub.earnings || 0).toFixed(2)}</p>
                                            <span className={`text-[8px] font-bold uppercase tracking-widest ${sub.status === 'Verified' || sub.status === 'Paid' ? 'text-emerald-500' :
                                                    sub.status === 'Pending' ? 'text-amber-500' : 'text-red-500'
                                                }`}>{sub.status}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Earnings Mini Summary */}
                    {earnings && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Available Balance', value: earnings.availableBalance, color: 'text-emerald-400', hint: 'Syncing' },
                                { label: 'Claimable Balance', value: earnings.pendingPayout, color: 'text-amber-400', hint: 'Ready' },
                                { label: 'Claimed', value: earnings.claimed, color: 'text-purple-400', hint: 'Paid' },
                            ].map((item: { label: string, value: number, color: string, hint: string }, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.05 }}
                                    className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] flex items-center justify-between"
                                >
                                    <div>
                                        <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className={`text-2xl font-mono font-bold ${item.color}`}>${item.value.toFixed(2)}</p>
                                    </div>
                                    <p className="text-[8px] text-white/15 uppercase tracking-widest max-w-[60px] text-right leading-tight">{item.hint}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};
