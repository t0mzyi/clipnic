import { motion } from 'framer-motion';
import { Target, Users, Landmark, TrendingUp } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

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

        if (token) fetchStats();
    }, [token]);

    const iconMap: Record<string, any> = {
        Target,
        Landmark,
        Users,
        TrendingUp
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
    );

    const kpis = stats?.kpis || [
        { label: 'Active Campaigns', value: '0', change: '0', icon: 'Target' },
        { label: 'Total Budget', value: '$0', change: '0', icon: 'Landmark' },
        { label: 'Pending Payouts', value: '$0', change: '0', icon: 'Users' },
        { label: 'Platform Margin', value: '0%', change: '0', icon: 'TrendingUp' },
    ];

    const burnRate = stats?.burnChart || [];
    const topClippers = stats?.topClippers || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
        >
            <div className="pb-6 border-b border-white/[0.08] relative">
                <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-80 h-32 bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />
                <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 mb-2 relative z-10">Platform Overview</h1>
                <p className="text-white/40 text-base sm:text-lg tracking-tight relative z-10 font-light">Global metrics and financial health.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi: any, idx: number) => {
                    const Icon = typeof kpi.icon === 'string' ? iconMap[kpi.icon] : kpi.icon;
                    return (
                        <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest flex items-center gap-2.5">
                                    <Icon className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                                    {kpi.label}
                                </p>
                            </div>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-mono tracking-tight font-medium text-white/90">{kpi.value}</p>
                                <span className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${kpi.change.startsWith('+') ? 'bg-white/10 text-white border-white/20' : 'bg-white/[0.02] text-white/40 border-white/[0.05]'}`}>
                                    {kpi.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Advanced Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-medium tracking-tight text-white/90">Daily Budget Burn</h3>
                    </div>
                    <div className="flex-1 w-full h-full min-h-0 relative -ml-4 focus-within:z-10">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <BarChart data={burnRate}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="rgba(255,255,255,0.2)" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="rgba(255,255,255,0.2)" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(val) => `$${val}`}
                                    dx={-10}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(10,10,10,0.9)', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(12px)',
                                        fontSize: '11px',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar 
                                    dataKey="burn" 
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={1000}
                                    animationEasing="ease-out"
                                >
                                    {burnRate.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill="rgba(255,255,255,0.8)" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] h-80 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-medium tracking-tight text-white/90">Top Clippers</h3>
                    </div>
                    <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                        {topClippers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-white/10 italic text-[10px] uppercase tracking-widest">
                                No data yet
                            </div>
                        ) : topClippers.map((clipper: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.05] cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 text-xs font-medium border border-white/10 overflow-hidden">
                                        {clipper.avatar_url ? (
                                            <img src={clipper.avatar_url} className="w-full h-full object-cover" alt="" />
                                        ) : clipper.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white/90 text-sm">{clipper.name}</p>
                                        <p className="text-[11px] text-white/40">{clipper.views.toLocaleString()} views</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm tracking-tight text-white/90">${clipper.earnings.toFixed(2)}</p>
                                    <p className="text-[9px] uppercase tracking-widest text-emerald-500/60 font-bold">Performance</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
            </div>
        </motion.div>
    );
};
