import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useState } from 'react';
import { Shield } from 'lucide-react';

export const CampaignDetails = () => {
  const { id } = useParams();
  
  // Mock data representing exact metrics
  const stats = {
    status: 'Active',
    cpmRate: id === 'c1' ? '$0.40' : '$0.55',
    totalBudget: id === 'c1' ? '$18,134' : '$5,000',
    budgetUsed: id === 'c1' ? '$11,468.46 (63%)' : '$0.00 (0%)',
    viewProgress: id === 'c1' ? '28,805,919 / 45,335,000 (64%)' : '0 / 9,000,000 (0%)',
    minViewsForPayout: '10,000 views',
    timeLeft: '10 days',
    title: id === 'c1' ? 'Test Verified' : 'Test Not Verified',
    brand: id === 'c1' ? 'GlowRecipe' : 'Grovemade',
  };

  const progressPercentage = id === 'c1' ? 64 : 0;
  
  // Scenario: c1 is for "Verified", c2 is "Verification Required"
  const requiresVerification = id === 'c2';
  const isUserVerified = false; // Mock user state

  const [submissionUrl, setSubmissionUrl] = useState('');
  const [platform, setPlatform] = useState('youtube');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-6xl mx-auto space-y-10"
    >
      {/* Banner & Header Section */}
      <div className="relative h-[400px] md:h-[500px] rounded-[48px] overflow-hidden border border-white/10 group shadow-2xl">
        {/* Background Image */}
        <img 
            src={id === 'c1' 
                ? "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2000&auto=format&fit=crop" 
                : "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2000&auto=format&fit=crop"} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt="Campaign Banner" 
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[2px]" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-10 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
            <div className="space-y-4">
                <Badge status={stats.status} />
                <div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-2 text-white drop-shadow-2xl">{stats.title}</h1>
                    <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide">{stats.brand}</p>
                </div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 shadow-2xl">
                <p className="text-[10px] text-white/40 mb-2 uppercase tracking-[0.3em] font-bold">Standard CPM</p>
                <p className="text-4xl md:text-5xl font-mono tabular-metrics font-bold text-white">{stats.cpmRate}</p>
            </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Stats & Progress */}
        <div className="lg:col-span-2 space-y-10">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-[32px] bg-[#0c0c0c] border border-white/5 shadow-2xl space-y-6">
                    <div className="flex items-center gap-3 text-white/40 uppercase tracking-widest text-[10px] font-bold">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                        Financials
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-white/30">Total Budget</span>
                            <span className="text-2xl font-mono font-bold text-white/90">{stats.totalBudget}</span>
                        </div>
                        <div className="w-full h-px bg-white/5" />
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-white/30">Budget Used</span>
                            <span className="text-xl font-mono font-medium text-emerald-500/80">{stats.budgetUsed}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-[32px] bg-[#0c0c0c] border border-white/5 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white/40 uppercase tracking-widest text-[10px] font-bold">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                            View Goals
                        </div>
                        <span className="text-[10px] font-mono text-amber-500/80 font-bold px-2 py-1 bg-amber-500/5 rounded-lg border border-amber-500/10 uppercase tracking-tighter">
                            {stats.timeLeft} left
                        </span>
                    </div>
                    <div className="space-y-4">
                        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="bg-gradient-to-r from-white/40 to-white h-full"
                            />
                        </div>
                        <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
                            <span className="text-[11px] text-white/40 font-mono italic">Progression</span>
                            <span className="text-[13px] font-mono font-bold text-white/90">{stats.viewProgress}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Submissions - Major Section */}
            <div className="rounded-[40px] bg-[#0c0c0c] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight">Campaign Submissions</h3>
                    </div>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Verified Tracking</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/[0.01]">
                                <th className="px-8 py-5">Submissions</th>
                                <th className="px-8 py-5">Views Meta</th>
                                <th className="px-8 py-5">Value</th>
                                <th className="px-8 py-5 text-right">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {[
                                { url: 'youtu.be/clips/01x', platform: 'YouTube', views: '24,500', earnings: '$9.80', status: 'Verified', date: '2h ago' },
                                { url: 'youtu.be/clips/99y', platform: 'YouTube', views: '1,200', earnings: '$0.48', status: 'Pending', date: '5h ago' }
                            ].map((sub, i) => (
                                <tr key={i} className="group hover:bg-white/[0.02] transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <div>
                                                <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{sub.url}</p>
                                                <p className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">{sub.platform}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-sm font-mono font-bold text-white/70">{sub.views}</p>
                                            <p className="text-[10px] text-white/20 uppercase tracking-tighter">{sub.date}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-mono font-bold text-emerald-400 group-hover:scale-105 transition-transform origin-left">{sub.earnings}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${sub.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/30 border-white/5'}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-8 bg-white/[0.01] text-center border-t border-white/5">
                    <p className="text-[11px] text-white/20 italic tracking-wide">Syncing data with social platforms in real-time...</p>
                </div>
            </div>
        </div>

        {/* Right Column: Submission & Leaderboard */}
        <div className="space-y-10">
            {/* Submit Card */}
            {requiresVerification && !isUserVerified ? (
                <div className="p-10 rounded-[40px] bg-red-500/[0.02] border border-red-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/[0.03] blur-3xl -mr-16 -mt-16 rounded-full" />
                    <h3 className="text-2xl font-bold mb-4 relative z-10 flex items-center gap-3">
                        <Shield className="w-7 h-7 text-red-500" />
                        Verification Required
                    </h3>
                    <p className="text-white/40 mb-8 relative z-10 leading-relaxed font-light text-sm">
                        Access is restricted until your account satisfies the platform verification metrics.
                    </p>
                    <Link to="/profile" className="w-full group/btn relative z-10 inline-flex items-center justify-center font-bold rounded-2xl transition-all focus:outline-none bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] px-8 py-4 text-sm uppercase tracking-widest">
                        Activate Identity
                    </Link>
                </div>
            ) : (
                <div className="p-10 rounded-[40px] bg-[#0c0c0c] border border-white/10 relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-2xl font-bold mb-6 relative z-10 text-white/90">Submit Your Clip</h3>
                    
                    <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Platform Origin</label>
                            <select 
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="youtube">YouTube Shorts</option>
                                <option value="instagram">Instagram Reels</option>
                                <option value="tiktok">TikTok</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                             <label className="block text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Content URL</label>
                            <input 
                                type="url" 
                                value={submissionUrl}
                                onChange={(e) => setSubmissionUrl(e.target.value)}
                                placeholder="https://..." 
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/30 transition-all font-mono placeholder:text-white/10" 
                            />
                        </div>
                        <Button variant="primary" size="lg" className="w-full relative z-10 text-sm py-5 rounded-2xl font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90">
                            Push Submission
                        </Button>
                    </div>
                </div>
            )}

            {/* Leaderboard Card */}
            <div className="p-10 rounded-[40px] bg-[#0c0c0c] border border-white/5 shadow-2xl space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold tracking-tight text-white/90">Hall of Fame</h3>
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-500"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { rank: 1, name: 'AlexEdit', views: '4.2M', earnings: '$1,680', color: 'text-amber-400', bg: 'bg-amber-500/5' },
                        { rank: 2, name: 'ClipperPro', views: '2.8M', earnings: '$1,120', color: 'text-zinc-300', bg: 'bg-white/[0.04]' },
                        { rank: 3, name: 'ShortsKing', views: '1.9M', earnings: '$760', color: 'text-amber-700', bg: 'bg-amber-700/5' },
                    ].map((user) => (
                        <div key={user.rank} className={`flex items-center justify-between p-5 rounded-3xl ${user.bg} border border-white/[0.03] hover:border-white/10 transition-all group relative overflow-hidden`}>
                            <div className="flex items-center gap-4 relative z-10">
                                <span className={`text-lg font-mono font-bold w-6 ${user.color}`}>
                                    {user.rank}
                                </span>
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white/90">{user.name}</p>
                                    <p className="text-[10px] text-white/30 font-mono tracking-tighter uppercase">{user.views} views</p>
                                </div>
                            </div>
                            <div className="text-right relative z-10">
                                <p className="text-sm font-mono font-bold text-emerald-400 group-hover:scale-110 transition-transform">{user.earnings}</p>
                            </div>
                        </div>
                    ))}
                    
                    <div className="pt-4 space-y-3">
                         {[
                            { rank: 4, name: 'ViralWave', views: '850K', earnings: '$340' },
                            { rank: 5, name: 'FlowState', views: '620K', earnings: '$248' }
                        ].map((user) => (
                            <div key={user.rank} className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono font-bold w-4 text-white/20">{user.rank}</span>
                                    <span className="text-xs font-medium text-white/50">{user.name}</span>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-white/30">{user.earnings}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rules Card */}
            <div className="p-10 rounded-[40px] bg-[#0c0c0c] border border-white/5 shadow-2xl">
                <h3 className="text-lg font-bold mb-6 text-white/40 uppercase tracking-[0.2em]">Guidelines</h3>
                <ul className="space-y-6">
                    {[
                        "Original content only. Stolen clips result in permanent ban.",
                        "Our system flags suspicious view velocity and bot patterns.",
                        "Payouts finalize upon campaign expiry or budget exhaustion."
                    ].map((rule, i) => (
                        <li key={i} className="flex gap-4 group">
                             <div className="mt-1 p-1 rounded-lg bg-white/5 text-white/30 h-fit w-fit group-hover:bg-white/10 group-hover:text-white transition-all">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                            </div>
                            <p className="text-xs text-white/40 leading-relaxed font-light group-hover:text-white/60 transition-colors">{rule}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
    </motion.div>
  );
};


