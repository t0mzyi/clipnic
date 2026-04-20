import { motion } from 'framer-motion';
import { Activity, PlaySquare, CheckCircle, Wallet } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export const ClipperDashboard = () => {
    const stats = {
        campaignsParticipated: '2',
        totalSubmissions: '14',
        approved: '11',
        totalEarnings: '$382.50'
    };

    // Mock data for sparkline
    const mockViewData = [
      { name: 'Mon', views: 4000 },
      { name: 'Tue', views: 3000 },
      { name: 'Wed', views: 2000 },
      { name: 'Thu', views: 2780 },
      { name: 'Fri', views: 1890 },
      { name: 'Sat', views: 2390 },
      { name: 'Sun', views: 3490 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8" 
        >
            {/* Header */}
            <div className="pb-6 border-b border-white/[0.08] relative">
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-32 bg-white/[0.02] blur-[80px] pointer-events-none rounded-full" />
                <h1 className="text-4xl font-bold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 mb-2 relative z-10">Welcome Back</h1>
                <p className="text-white/40 text-lg tracking-tight relative z-10 font-light">Your activity and earnings overview.</p>
            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Active Campaigns Card */}
                <div className="relative overflow-hidden p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest flex items-center gap-2.5">
                            <Activity className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                            Campaigns
                        </p>
                    </div>
                    <p className="text-4xl font-mono tracking-tight font-medium text-white/90">{stats.campaignsParticipated}</p>
                </div>

                {/* Total Clips Card */}
                <div className="relative overflow-hidden p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest flex items-center gap-2.5">
                            <PlaySquare className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                            Clips
                        </p>
                    </div>
                    <p className="text-4xl font-mono tracking-tight font-medium text-white/90">{stats.totalSubmissions}</p>
                </div>

                {/* Approved Card */}
                <div className="relative overflow-hidden p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 text-green-500/50 group-hover:text-green-400 transition-colors" />
                            Approved
                        </p>
                    </div>
                    <p className="text-4xl font-mono tracking-tight font-medium text-white/90">{stats.approved}</p>
                </div>

                {/* Earnings Card - Highlighted */}
                <div className="relative overflow-hidden p-6 rounded-3xl bg-white/[0.05] border border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_30px_rgba(0,0,0,0.5)] group hover:bg-white/[0.08] transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest flex items-center gap-2.5">
                            <Wallet className="w-4 h-4 text-white/90" />
                            Earnings
                        </p>
                    </div>
                    <p className="text-4xl font-mono tracking-tight font-bold text-white relative z-10">{stats.totalEarnings}</p>
                </div>

            </div>

            {/* Performance Chart Bento Box */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] h-96 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium tracking-tight text-white/90">View Velocity</h3>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-white/50 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Live Tracking
                    </div>
                </div>
                <div className="flex-1 w-full h-full min-h-0 relative -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockViewData}>
                            <defs>
                                <linearGradient id="colorViewsDashboard" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
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
                                tickFormatter={(val) => `${val / 1000}k`}
                                dx={-10}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(10,10,10,0.9)', 
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(12px)',
                                    fontSize: '11px',
                                    padding: '8px 12px'
                                }}
                                itemStyle={{ color: '#fff', padding: 0 }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="views" 
                                stroke="#ffffff" 
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

        </motion.div>
    );
};
