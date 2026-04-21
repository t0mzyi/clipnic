import { motion } from 'framer-motion';
import { Activity, PlaySquare, CheckCircle, Wallet } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuthStore } from '../store/useAuthStore';

export const ClipperDashboard = () => {
    const { user } = useAuthStore();
    const stats = [
        { label: 'Campaigns', value: '2', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15' },
        { label: 'Total Clips', value: '14', icon: PlaySquare, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/15' },
        { label: 'Approved', value: '11', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
        { label: 'Earnings', value: '$382.50', icon: Wallet, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15', highlight: true },
    ];

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
            <div className="pb-6 border-b border-white/[0.06]">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                    {/* Avatar */}
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
                        <h1 className="text-3xl font-bold tracking-tight text-white/90">
                            Welcome Back{user?.name ? `, ${user.name}` : ''}
                        </h1>
                        <p className="text-white/30 text-sm font-light mt-0.5">Your activity and earnings overview.</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Chart */}
            <div className="p-6 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] h-80 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold tracking-tight text-white/70">View Velocity</h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400/60 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                    </div>
                </div>
                <div className="flex-1 w-full min-h-0 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockViewData}>
                            <defs>
                                <linearGradient id="colorViewsDashboard" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                stroke="rgba(255,255,255,0.1)" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                dy={10}
                            />
                            <YAxis 
                                stroke="rgba(255,255,255,0.1)" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(val) => `${val / 1000}k`}
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

        </motion.div>
    );
};
