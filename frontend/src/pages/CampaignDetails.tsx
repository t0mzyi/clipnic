import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useState } from 'react';
import { Shield, Trophy, Eye, DollarSign, Clock, Target, Upload, ChevronLeft } from 'lucide-react';

export const CampaignDetails = () => {
  const { id } = useParams();
  
  const stats = {
    status: 'Active',
    cpmRate: id === 'c1' ? '$0.40' : '$0.55',
    totalBudget: id === 'c1' ? '$18,134' : '$5,000',
    budgetUsed: id === 'c1' ? '$11,468.46' : '$0.00',
    budgetPercent: id === 'c1' ? '63%' : '0%',
    viewProgress: id === 'c1' ? '28.8M / 45.3M' : '0 / 9M',
    viewPercent: id === 'c1' ? '64%' : '0%',
    minViewsForPayout: '10,000 views',
    timeLeft: '10 days',
    title: id === 'c1' ? 'Test Verified' : 'Test Not Verified',
    brand: id === 'c1' ? 'GlowRecipe' : 'Grovemade',
  };

  const progressPercentage = id === 'c1' ? 64 : 0;
  const requiresVerification = id === 'c2';
  const isUserVerified = false;

  const [submissionUrl, setSubmissionUrl] = useState('');
  const [platform, setPlatform] = useState('youtube');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Back Nav */}
      <Link to="/campaigns" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Campaigns
      </Link>

      {/* Banner */}
      <div className="relative h-[320px] md:h-[420px] rounded-[40px] overflow-hidden border border-white/10 group shadow-2xl">
        <img 
            src={id === 'c1' 
                ? "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2000&auto=format&fit=crop" 
                : "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2000&auto=format&fit=crop"} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Campaign Banner" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
                <Badge status={stats.status} />
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">{stats.title}</h1>
                <p className="text-lg text-white/50 font-light">{stats.brand}</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl text-center min-w-[140px]">
                <p className="text-[9px] text-white/40 mb-1 uppercase tracking-[0.3em] font-bold">CPM Rate</p>
                <p className="text-4xl font-mono font-bold text-emerald-400">{stats.cpmRate}</p>
            </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 text-white/30">
            <DollarSign className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Total Budget</span>
          </div>
          <p className="text-2xl font-mono font-bold text-white">{stats.totalBudget}</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 text-white/30">
            <Target className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Spent</span>
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-400">{stats.budgetUsed}</p>
          <p className="text-[10px] font-mono text-white/20">{stats.budgetPercent} used</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 text-white/30">
            <Eye className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Views</span>
          </div>
          <p className="text-2xl font-mono font-bold text-white">{stats.viewProgress.split('/')[0].trim()}</p>
          <p className="text-[10px] font-mono text-white/20">{stats.viewPercent} of goal</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 text-amber-500/60">
            <Clock className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Deadline</span>
          </div>
          <p className="text-2xl font-mono font-bold text-amber-400">{stats.timeLeft}</p>
          <p className="text-[10px] font-mono text-white/20">remaining</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-6 rounded-2xl bg-[#0c0c0c] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Budget Consumption</span>
          <span className="text-sm font-mono font-bold text-white/60">{stats.budgetPercent}</span>
        </div>
        <div className="w-full bg-white/[0.04] h-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Submissions */}
        <div className="lg:col-span-2 space-y-8">
            {/* My Submissions */}
            <div className="rounded-3xl bg-[#0c0c0c] border border-white/[0.06] overflow-hidden">
                <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                    <h3 className="text-lg font-bold tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <Upload className="w-4 h-4" />
                        </div>
                        My Submissions
                    </h3>
                    <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-[0.2em] bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">Live Tracking</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[9px] font-bold text-white/20 uppercase tracking-widest border-b border-white/[0.03]">
                                <th className="px-6 py-4">Clip</th>
                                <th className="px-6 py-4">Views</th>
                                <th className="px-6 py-4">Earned</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {[
                                { url: 'youtu.be/clips/01x', platform: 'YouTube', views: '24,500', earnings: '$9.80', status: 'Verified', date: '2h ago' },
                                { url: 'youtu.be/clips/99y', platform: 'YouTube', views: '1,200', earnings: '$0.48', status: 'Pending', date: '5h ago' }
                            ].map((sub, i) => (
                                <tr key={i} className="group hover:bg-white/[0.02] transition-all duration-300">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${sub.status === 'Verified' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                            <div>
                                                <p className="text-sm font-medium text-white/80">{sub.url}</p>
                                                <p className="text-[10px] text-white/20 mt-0.5">{sub.platform} · {sub.date}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-mono font-bold text-white/70">{sub.views}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-mono font-bold text-emerald-400">{sub.earnings}</p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${sub.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Guidelines */}
            <div className="p-8 rounded-3xl bg-[#0c0c0c] border border-white/[0.06]">
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.15em] mb-5">Campaign Rules</h3>
                <div className="space-y-4">
                    {[
                        "Original content only. Stolen clips result in permanent ban.",
                        "Our system flags suspicious view velocity and bot patterns.",
                        "Payouts finalize upon campaign expiry or budget exhaustion."
                    ].map((rule, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <div className="mt-0.5 w-5 h-5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                                <span className="text-[9px] font-mono font-bold text-white/30">{i + 1}</span>
                            </div>
                            <p className="text-xs text-white/40 leading-relaxed">{rule}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
            {/* Submit Card */}
            {requiresVerification && !isUserVerified ? (
                <div className="p-8 rounded-3xl bg-red-500/[0.03] border border-red-500/10 relative overflow-hidden">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                        <Shield className="w-6 h-6 text-red-500" />
                        Verification Required
                    </h3>
                    <p className="text-white/40 mb-6 leading-relaxed text-sm">
                        Complete identity verification before submitting clips.
                    </p>
                    <Link to="/profile" className="w-full inline-flex items-center justify-center font-bold rounded-2xl bg-white text-black hover:bg-white/90 px-6 py-4 text-xs uppercase tracking-widest transition-all">
                        Verify Now
                    </Link>
                </div>
            ) : (
                <div className="p-8 rounded-3xl bg-[#0c0c0c] border border-white/[0.08] space-y-5">
                    <h3 className="text-xl font-bold text-white/90">Submit Clip</h3>
                    
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-[9px] font-bold text-white/20 uppercase tracking-widest">Platform</label>
                            <select 
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="youtube">YouTube Shorts</option>
                                <option value="instagram">Instagram Reels</option>
                                <option value="tiktok">TikTok</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                             <label className="block text-[9px] font-bold text-white/20 uppercase tracking-widest">URL</label>
                            <input 
                                type="url" 
                                value={submissionUrl}
                                onChange={(e) => setSubmissionUrl(e.target.value)}
                                placeholder="https://..." 
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-mono placeholder:text-white/10" 
                            />
                        </div>
                        <Button variant="primary" className="w-full text-xs py-4 rounded-xl font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90">
                            Submit
                        </Button>
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            <div className="p-8 rounded-3xl bg-[#0c0c0c] border border-white/[0.06] space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tight text-white/90">Leaderboard</h3>
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Trophy className="w-5 h-5 text-amber-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        { rank: 1, name: 'AlexEdit', views: '4.2M', earnings: '$1,680', medal: '🥇' },
                        { rank: 2, name: 'ClipperPro', views: '2.8M', earnings: '$1,120', medal: '🥈' },
                        { rank: 3, name: 'ShortsKing', views: '1.9M', earnings: '$760', medal: '🥉' },
                    ].map((user) => (
                        <div key={user.rank} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-3">
                                <span className="text-lg w-7">{user.medal}</span>
                                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/50">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white/90">{user.name}</p>
                                    <p className="text-[10px] text-white/25 font-mono">{user.views} views</p>
                                </div>
                            </div>
                            <p className="text-sm font-mono font-bold text-emerald-400">{user.earnings}</p>
                        </div>
                    ))}
                    
                    <div className="pt-2 space-y-2">
                         {[
                            { rank: 4, name: 'ViralWave', earnings: '$340' },
                            { rank: 5, name: 'FlowState', earnings: '$248' }
                        ].map((user) => (
                            <div key={user.rank} className="flex items-center justify-between px-4 py-2.5 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono font-bold w-4 text-white/15">{user.rank}</span>
                                    <span className="text-xs text-white/40">{user.name}</span>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-white/25">{user.earnings}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};
