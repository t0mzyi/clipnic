import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ArrowUpRight, DollarSign, Wallet } from 'lucide-react';

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
  },
  {
    id: 'c2',
    title: 'Test Not Verified',
    brand: 'Grovemade',
    cpmRate: 0.55,
    totalBudget: 5000,
    budgetUsed: 5000,
    status: 'Paused',
  },
  {
    id: 'c3',
    title: 'Tech Gadget Review',
    brand: 'MarquesBrownlee',
    cpmRate: 1.20,
    totalBudget: 25000,
    budgetUsed: 12000,
    status: 'Active',
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

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
      <div className="relative h-[300px] md:h-[450px] rounded-[48px] overflow-hidden border border-white/10 group shadow-2xl">
        <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Featured Campaign" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-12 md:p-16 space-y-6">
            <div className="space-y-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Featured Opportunity</span>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white max-w-xl">Brand New: Summer Tech Showcase</h2>
            </div>
            <p className="text-lg text-white/60 font-light max-w-lg leading-relaxed">Join the world's leading brands in the ultimate clipper challenge. High CPM, fast payouts, and premium assets provided.</p>
            <div className="flex items-center gap-4">
                <Button variant="primary" className="rounded-2xl px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-white/90">
                    Explore Now
                </Button>
                <div className="flex items-center gap-2 text-white/40 font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    124 Clippers Active
                </div>
            </div>
        </div>
      </div>

      <div className="pb-6 border-b border-white/[0.08] relative">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-24 bg-white/[0.02] blur-[80px] pointer-events-none rounded-full" />
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 relative z-10">All Campaigns</h1>
        <p className="text-white/40 text-lg font-light tracking-tight mt-1.5 relative z-10">Discover marketing opportunities.</p>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockCampaigns.map((campaign) => (
          <MotionLink
            to={`/campaigns/${campaign.id}`}
            key={campaign.id}
            layoutId={`card-${campaign.id}`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer block overflow-hidden"
          >
            {/* Card Banner */}
            <div className="h-24 w-full relative overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" 
                    alt={campaign.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
            </div>

            <div className="p-6 relative z-10 -mt-6">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
            
            <div className="flex items-start justify-between mb-5 relative z-10">
              <Badge status={campaign.status} />
              <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 group-hover:text-white/60 transition-all duration-300">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mb-6 relative z-10">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-1.5">{campaign.brand}</p>
              <h3 className="text-xl font-semibold leading-tight tracking-tight text-white/90 group-hover:text-white transition-colors">{campaign.title}</h3>
            </div>

            <div className="space-y-3 mb-6 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-white/40">
                  <DollarSign className="w-4 h-4" />
                  <span>CPM</span>
                </div>
                <span className="font-mono tabular-metrics font-medium text-white/80">{formatCurrency(campaign.cpmRate)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-white/40">
                  <Wallet className="w-4 h-4" />
                  <span>Budget</span>
                </div>
                <span className="font-mono tabular-metrics font-medium text-white/80">{formatCurrency(campaign.totalBudget - campaign.budgetUsed)}</span>
              </div>
            </div>

            <div className="relative z-10 mb-6">
              <div className="w-full bg-white/[0.03] h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(campaign.budgetUsed / campaign.totalBudget) * 100}%` }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white/30 h-full rounded-full"
                />
              </div>
            </div>
            
            <Button variant="secondary" className="w-full relative z-10 bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white/70 py-2 h-auto text-xs font-bold uppercase rounded-xl tracking-wider">
              Details
            </Button>
          </div>
          </MotionLink>
        ))}
      </div>
    </motion.div>
  );
};
