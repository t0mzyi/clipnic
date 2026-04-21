import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ArrowUpRight, DollarSign, Wallet, TrendingUp } from 'lucide-react';

// Mock data
const mockCampaigns = [
  {
    id: 'c1',
    title: 'Test Verified',
    brand: 'GlowRecipe',
    cpmRate: 0.40,
    totalBudget: 18134,
    budgetUsed: 11468.46,
    status: 'Active',
    accent: 'emerald',
  },
  {
    id: 'c2',
    title: 'Test Not Verified',
    brand: 'Grovemade',
    cpmRate: 0.55,
    totalBudget: 5000,
    budgetUsed: 5000,
    status: 'Paused',
    accent: 'amber',
  },
  {
    id: 'c3',
    title: 'Tech Gadget Review',
    brand: 'MarquesBrownlee',
    cpmRate: 1.20,
    totalBudget: 25000,
    budgetUsed: 12000,
    status: 'Active',
    accent: 'blue',
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const bannerImages = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop',
];

// Create a motion version of react-router Link
const MotionLink = motion.create(Link);

export const CampaignsFeed = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-10 pb-12"
    >
      {/* Featured Banner */}
      <div className="relative h-[280px] md:h-[400px] rounded-[40px] overflow-hidden border border-white/10 group shadow-2xl">
        <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Featured Campaign" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-14 space-y-5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit backdrop-blur-sm">Featured Opportunity</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white max-w-xl leading-[1.1]">Summer Tech Showcase</h2>
            <p className="text-sm text-white/50 font-light max-w-lg leading-relaxed">High CPM, fast payouts, and premium assets provided.</p>
            <div className="flex items-center gap-4 pt-2">
                <Button variant="primary" className="rounded-2xl px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-white/90">
                    Explore Now
                </Button>
                <div className="flex items-center gap-2 text-white/40 font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    124 Active
                </div>
            </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">All Campaigns</h1>
          <p className="text-white/30 text-sm font-light tracking-tight mt-1">Browse and join active marketing opportunities.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
          <TrendingUp className="w-4 h-4" />
          {mockCampaigns.length} Available
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockCampaigns.map((campaign, index) => {
          const remaining = campaign.totalBudget - campaign.budgetUsed;
          const progress = (campaign.budgetUsed / campaign.totalBudget) * 100;
          const isFull = remaining <= 0;

          return (
            <MotionLink
              to={`/campaigns/${campaign.id}`}
              key={campaign.id}
              layoutId={`card-${campaign.id}`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="group relative rounded-3xl bg-[#0c0c0c] border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer block overflow-hidden shadow-lg hover:shadow-2xl"
            >
              {/* Card Banner */}
              <div className="h-28 w-full relative overflow-hidden">
                  <img 
                      src={bannerImages[index % bannerImages.length]} 
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" 
                      alt={campaign.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge status={campaign.status} />
                  </div>
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white/80 group-hover:bg-white/10 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
              </div>

              <div className="p-5 pt-2 space-y-4">
                {/* Title */}
                <div>
                  <p className="text-[10px] text-white/30 font-semibold uppercase tracking-[0.15em] mb-1">{campaign.brand}</p>
                  <h3 className="text-lg font-bold leading-tight tracking-tight text-white/90 group-hover:text-white transition-colors">{campaign.title}</h3>
                </div>

                {/* Key Metrics - Highlighted */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 text-white/30 mb-1">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">CPM</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-white">{formatCurrency(campaign.cpmRate)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 text-white/30 mb-1">
                      <Wallet className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Left</span>
                    </div>
                    <span className={`font-mono text-lg font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(remaining)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500/70'}`}
                    />
                  </div>
                  <p className="text-[10px] text-white/20 font-mono text-right">{Math.round(progress)}% filled</p>
                </div>
              </div>
            </MotionLink>
          );
        })}
      </div>
    </motion.div>
  );
};
