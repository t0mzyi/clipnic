import { motion } from 'framer-motion';
import { Target, Users, Landmark, TrendingUp, LayoutGrid, CheckCircle2, DollarSign } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const AdminDashboard = () => {
    const { token } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) setStats(json.data);
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStats();
            const interval = setInterval(fetchStats, 10000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const iconMap: Record<string, any> = {
        Target,
        Landmark,
        Users,
        TrendingUp
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    const kpis = stats?.kpis || [
        { label: 'Active Campaigns', value: '0', change: '0', icon: 'Target' },
        { label: 'Total Budget', value: '$0', change: '0', icon: 'Landmark' },
        { label: 'Pending Withdrawals', value: '$0', change: '0', icon: 'Users' },
        { label: 'Platform Margin', value: '0%', change: '0', icon: 'TrendingUp' },
    ];

    const burnRate = stats?.burnChart || [];
    const topClippers = stats?.topClippers || [];

    const activeCampaigns = kpis.find((k: any) => k.label === 'Active Campaigns')?.value || '0';
    const totalBudget = kpis.find((k: any) => k.label === 'Total Budget')?.value || '$0';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10 relative pb-20"
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Standardized Admin Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-white/[0.08]">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-white/50" /> Platform Overview
                    </h1>
                    <p className="text-white/40 mt-1">Global metrics, financial health, and clippers performance.</p>
                </div>

                <div className="flex items-center gap-4">
                     <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                        <div className="bg-emerald-500/20 text-emerald-500 p-1.5 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">Active Projects</span>
                            <span className="text-lg font-bold text-white leading-none tabular-metrics">
                                {activeCampaigns}
                            </span>
                        </div>
                     </div>
                     <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                        <div className="bg-blue-500/20 text-blue-400 p-1.5 rounded-lg">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">Total Deployed</span>
                            <span className="text-lg font-bold text-white leading-none tabular-metrics">
                                {totalBudget}
                            </span>
                        </div>
                     </div>
                </div>
            </header>


            {/* KPI Grid - Forced 4 Columns on Mobile */}
            <div className="grid grid-cols-4 gap-2 sm:gap-6">
                {kpis.map((kpi: any, idx: number) => {
                    const Icon = typeof kpi.icon === 'string' ? iconMap[kpi.icon] : kpi.icon;
                    return (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-panel glass-glow p-3 sm:p-8 rounded-2xl sm:rounded-[2rem] group cursor-default flex flex-col justify-between h-full"
                        >
                            <div className="flex items-center justify-between mb-4 sm:mb-8">
                                <div className="p-1.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:border-white/20 transition-colors duration-500">
                                    <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white/40 group-hover:text-emerald-400 transition-all duration-500 group-hover:scale-110" />
                                </div>
                                <span className={`text-[8px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full border ${kpi.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                                    {kpi.change}
                                </span>
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                                <p className="text-white/30 text-[7px] sm:text-[10px] font-bold uppercase tracking-tighter sm:tracking-[0.2em] truncate">{kpi.label}</p>
                                <p className="text-sm sm:text-4xl font-mono tracking-tighter font-bold text-white group-hover:text-emerald-50 transition-colors truncate">{kpi.value}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Advanced Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                <div className="lg:col-span-3 glass-panel p-8 rounded-[2.5rem] h-[450px] flex flex-col relative overflow-hidden group">
                    <div className="absolute inset-0 campaign-control-bg opacity-40 pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold tracking-tight text-white">Budget Velocity</h3>
                            <p className="text-xs text-white/30 font-light">Daily platform-wide expenditure</p>
                        </div>
                        <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500" />
                             <div className="w-2 h-2 rounded-full bg-white/10" />
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full h-full min-h-0 relative -ml-6 focus-within:z-10 z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={burnRate}>
                                <defs>
                                    <linearGradient id="areaGradientPremium" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="rgba(255,255,255,0.15)" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={15}
                                    fontFamily="ui-monospace"
                                />
                                <YAxis 
                                    stroke="rgba(255,255,255,0.15)" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(val) => `$${val}`}
                                    dx={-15}
                                    fontFamily="ui-monospace"
                                />
                                <Tooltip 
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(5,5,5,0.95)', 
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '16px',
                                        backdropFilter: 'blur(20px)',
                                        fontSize: '11px',
                                        padding: '12px 16px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone"
                                    dataKey="burn" 
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fill="url(#areaGradientPremium)"
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                    filter="url(#glow)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem] h-[450px] flex flex-col group">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold tracking-tight text-white">Elite Performers</h3>
                            <p className="text-xs text-white/30 font-light">Leading contributors by reach</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-emerald-500/50" />
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        {topClippers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-white/10 italic text-[11px] uppercase tracking-[0.2em] font-bold">
                                Waiting for activity...
                            </div>
                        ) : topClippers.map((clipper: any, idx: number) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + idx * 0.1 }}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 group/item cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm font-bold border border-emerald-500/20 overflow-hidden shadow-lg">
                                            {clipper.avatar_url ? (
                                                <img src={clipper.avatar_url} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" alt="" />
                                            ) : clipper.name.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050505] shadow-lg" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm tracking-tight">{clipper.name}</p>
                                        <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">{clipper.views.toLocaleString()} impressions</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-base font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">${clipper.earnings.toFixed(2)}</p>
                                    <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold group-hover/item:text-white/40 transition-colors">Yield</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
