import { motion } from 'framer-motion';
import { Target, Users, Landmark, TrendingUp } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

export const AdminDashboard = () => {
    const kpis = [
        { label: 'Active Campaigns', value: '12', change: '+2', icon: Target },
        { label: 'Total Budget Allocated', value: '$143,500', change: '+$12k', icon: Landmark },
        { label: 'Pending Payouts', value: '$8,450', change: '-$1.2k', icon: Users },
        { label: 'Platform Margin', value: '15%', change: '0%', icon: TrendingUp },
    ];

    const mockBurnRate = [
        { name: 'Mon', burn: 1200 },
        { name: 'Tue', burn: 1800 },
        { name: 'Wed', burn: 2400 },
        { name: 'Thu', burn: 1600 },
        { name: 'Fri', burn: 3100 },
        { name: 'Sat', burn: 4200 },
        { name: 'Sun', burn: 2900 },
    ];

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
                <h1 className="text-4xl font-bold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 mb-2 relative z-10">Platform Overview</h1>
                <p className="text-white/40 text-lg tracking-tight relative z-10 font-light">Global metrics and financial health.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={idx} className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
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
                
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-medium tracking-tight text-white/90">Daily Budget Burn</h3>
                    </div>
                    <div className="flex-1 w-full h-full min-h-0 relative -ml-4 focus-within:z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockBurnRate}>
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
                                    {mockBurnRate.map((_, index) => (
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
                        {[
                            { name: 'Alexander', views: '2.4M', earnings: '$1,200', change: '+12%' },
                            { name: 'TechEdits', views: '1.8M', earnings: '$900', change: '+5%' },
                            { name: 'Sarah_Shorts', views: '1.2M', earnings: '$600', change: '-2%' },
                            { name: 'MinimalFlow', views: '900K', earnings: '$450', change: '+22%' }
                        ].map((user, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.05] cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 text-xs font-medium border border-white/10 group-hover:border-white/20 transition-colors">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white/90 text-sm">{user.name}</p>
                                        <p className="text-[11px] text-white/40">{user.views} total views</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm tracking-tight">{user.earnings}</p>
                                    <p className={`text-[11px] ${user.change.startsWith('+') ? 'text-green-500/80' : 'text-red-500/80'}`}>{user.change}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
            </div>
        </motion.div>
    );
};
