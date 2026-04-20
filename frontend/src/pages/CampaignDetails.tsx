import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useState } from 'react';

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
      className="max-w-4xl mx-auto space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{stats.title}</h1>
            <Badge status={stats.status} />
          </div>
          <p className="text-lg text-white/50">{stats.brand}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm text-white/40 mb-1 uppercase tracking-widest">CPM Rate</p>
          <p className="text-3xl font-mono tabular-metrics font-semibold">{stats.cpmRate}</p>
        </div>
      </div>

      {/* Metrics Layout grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-8">
            <div className="p-8 rounded-[24px] bg-[#0A0A0A] border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <h3 className="text-xl font-semibold mb-6">Financial Overview</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-white/50">Total Budget</span>
                        <span className="font-mono tabular-metrics text-lg">{stats.totalBudget}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/50">Budget Used</span>
                        <span className="font-mono tabular-metrics text-lg">{stats.budgetUsed}</span>
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-[24px] bg-[#0A0A0A] border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-xl font-semibold">View Progress</h3>
                    <span className="text-sm font-mono text-white/60">{stats.timeLeft} left</span>
                </div>
                
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        className="bg-white h-full"
                    />
                </div>
                
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-mono tabular-metrics text-white/80">{stats.viewProgress}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-white/50">Min. Views for Payout</span>
                    <span className="font-mono tabular-metrics">{stats.minViewsForPayout}</span>
                </div>
            </div>
        </div>

        {/* Action & Rules Zone */}
        <div className="space-y-8">
            {requiresVerification && !isUserVerified ? (
                <div className="p-8 rounded-[24px] border border-white/10 bg-[#0A0A0A] relative overflow-hidden group">
                    <h3 className="text-2xl font-bold mb-4 relative z-10 flex items-center gap-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        Verification Required
                    </h3>
                    <p className="text-white/60 mb-6 relative z-10 leading-relaxed font-light">
                        This campaign requires a verified clipper account. Navigate to your profile to complete the verification checklist.
                    </p>
                    
                    <div className="relative z-10">
                        <Link to="/profile" className="w-full inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none bg-white text-black hover:bg-white/90 px-8 py-3.5 text-lg">
                            Go to Verification
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="p-8 rounded-[24px] border border-white/10 bg-black relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-2xl font-bold mb-2 relative z-10">Submit Your Clip</h3>
                    <p className="text-white/60 mb-6 relative z-10 leading-relaxed font-light">
                        Paste your short URL below. Metrics will be tracked algorithmically.
                    </p>
                    
                    <div className="space-y-4 relative z-10">
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Platform</label>
                            <select 
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                            >
                                <option value="youtube">YouTube Shorts</option>
                                <option value="instagram">Instagram Reels</option>
                                <option value="tiktok">TikTok</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Video URL</label>
                            <input 
                                type="url" 
                                value={submissionUrl}
                                onChange={(e) => setSubmissionUrl(e.target.value)}
                                placeholder="https://youtube.com/shorts/..." 
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/30" 
                            />
                        </div>
                        <Button variant="primary" size="lg" className="w-full relative z-10 text-lg py-4 mt-2">
                            Submit Content
                        </Button>
                    </div>
                </div>
            )}

            <div className="p-8 rounded-[24px] bg-[#0A0A0A] border border-white/5">
                <h3 className="text-lg font-semibold mb-6">Rules & Guidelines</h3>
                <ul className="space-y-4 text-white/60 font-light leading-relaxed">
                    <li className="flex gap-3">
                        <span className="p-1 rounded-md bg-white/10 text-white h-fit w-fit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </span>
                        Original content only. Stolen clips will result in permanent ban.
                    </li>
                    <li className="flex gap-3">
                        <span className="p-1 rounded-md bg-white/10 text-white h-fit w-fit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </span>
                        Do not use bot views. Our system flags suspicious view velocity.
                    </li>
                    <li className="flex gap-3">
                        <span className="p-1 rounded-md bg-white/10 text-white h-fit w-fit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </span>
                        Payouts are locked in upon campaign expiry or budget exhaustion.
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </motion.div>
  );
};
