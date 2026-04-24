import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Globe, Upload, DollarSign, 
    TrendingUp, Star, CheckCircle2,
    Plus, MessageSquare, ShieldCheck,
    X
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

interface OnboardingProps {
    onComplete: () => void;
    openMenu?: () => void;
}

interface TourStep {
    target: string;
    title: string;
    content: string;
    position: 'right' | 'left' | 'top' | 'bottom' | 'center';
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '#sidebar-active-campaigns',
        title: 'Active Campaigns',
        content: 'This is where you find new missions. Browse available brands, check CPM rates, and join to start earning.',
        position: 'right'
    },
    {
        target: '#sidebar-dashboard',
        title: 'Your Dashboard',
        content: 'Track your overall performance, active clips, and total views across all joined campaigns in real-time.',
        position: 'right'
    },
    {
        target: '#sidebar-earnings',
        title: 'Earnings & Payouts',
        content: 'Manage your rewards here. Once your clips are verified, you can claim your earnings directly to your wallet.',
        position: 'right'
    },
    {
        target: '#tour-search',
        title: 'Smart Search',
        content: 'Looking for a specific brand or platform? Use the search and filters to find the perfect campaign for your niche.',
        position: 'bottom'
    }
];

const CustomTick = ({ checked }: { checked: boolean }) => (
    <div className={`w-6 h-6 rounded-lg border transition-all duration-300 flex items-center justify-center ${
        checked 
            ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
            : 'bg-white/5 border-white/10 hover:border-white/20'
    }`}>
        <AnimatePresence>
            {checked && (
                <motion.svg
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-4 h-4 text-black"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <motion.polyline points="20 6 9 17 4 12" />
                </motion.svg>
            )}
        </AnimatePresence>
    </div>
);

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, openMenu }) => {
    const { user, updateUser } = useAuthStore();
    const [step, setStep] = useState(1);
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [agreed, setAgreed] = useState(false);
    
    // Tour State
    const [tourActive, setTourActive] = useState(false);
    const [tourStepIdx, setTourStepIdx] = useState(0);
    const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const handleSaveProfile = async () => {
        if (!agreed) return;
        setIsSaving(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ name, bio })
                .eq('id', user?.id)
                .select()
                .single();
            
            if (!error && data) {
                updateUser({ ...user, name: data.name, bio: data.bio } as any);
                setStep(2);
            }
        } catch (err) {
            console.error('Failed to save profile:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const demoSteps = [
        {
            title: "Welcome to Clipnic",
            description: "Clipnic is the primary infrastructure for turning engagement into capital. We pay clippers for high velocity shortform content.",
            icon: <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                    <img src="/logo.webp" alt="Logo" className="w-12 h-12 object-contain" />
                  </div>,
            color: "from-purple-500/20 to-blue-500/20"
        },
        {
            title: "Browse Campaigns",
            description: "Find active missions from top brands. Check requirements, CPM rates, and rules before joining.",
            icon: <Globe className="w-12 h-12 text-emerald-400" />,
            color: "from-emerald-500/20 to-teal-500/20"
        },
        {
            title: "Submit Your Clips",
            description: "Upload your short-form content links from TikTok, Instagram, or YouTube. We track the views automatically.",
            icon: <Upload className="w-12 h-12 text-blue-400" />,
            color: "from-blue-500/20 to-indigo-500/20"
        },
        {
            title: "Earn CPM Rewards",
            description: "Get paid based on the views your clips generate. The more views, the more you earn. Transparent and fast.",
            icon: <TrendingUp className="w-12 h-12 text-amber-400" />,
            color: "from-amber-500/20 to-orange-500/20"
        },
        {
            title: "Instant Payouts",
            description: "Once verified, claim your earnings directly to your preferred payout method. No complex wait times.",
            icon: <DollarSign className="w-12 h-12 text-purple-400" />,
            color: "from-purple-500/20 to-pink-500/20"
        }
    ];

    const currentDemoStep = step - 4;

    // Tour Logic
    useEffect(() => {
        if (!tourActive) return;

        const updateSpotlight = () => {
            const currentStep = TOUR_STEPS[tourStepIdx];
            
            // If it's a sidebar step and we're on mobile, try to open the menu
            if (isMobile && currentStep.target.startsWith('#sidebar-') && openMenu) {
                openMenu();
                // We need to wait for the menu animation to finish to get the correct rect
                setTimeout(() => {
                    const el = document.querySelector(currentStep.target);
                    if (el) setSpotlightRect(el.getBoundingClientRect());
                }, 500);
            } else {
                const el = document.querySelector(currentStep.target);
                if (el) setSpotlightRect(el.getBoundingClientRect());
            }
        };

        updateSpotlight();
        const interval = setInterval(updateSpotlight, 1000); // Polling for any layout changes
        window.addEventListener('resize', updateSpotlight);
        return () => {
            window.removeEventListener('resize', updateSpotlight);
            clearInterval(interval);
        };
    }, [tourActive, tourStepIdx, isMobile, openMenu]);

    const handleNextTour = () => {
        if (tourStepIdx < TOUR_STEPS.length - 1) {
            setTourStepIdx(tourStepIdx + 1);
        } else {
            onComplete();
        }
    };

    if (tourActive) {
        return (
            <div className="fixed inset-0 z-[2000] pointer-events-none">
                {/* SVG Overlay with Spotlight Hole */}
                <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                    <defs>
                        <mask id="spotlight-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {spotlightRect && (
                                <motion.rect
                                    initial={false}
                                    animate={{
                                        x: spotlightRect.x - 8,
                                        y: spotlightRect.y - 8,
                                        width: spotlightRect.width + 16,
                                        height: spotlightRect.height + 16,
                                        rx: 12
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect 
                        width="100%" 
                        height="100%" 
                        fill="rgba(0,0,0,0.85)" 
                        mask="url(#spotlight-mask)" 
                        className="backdrop-blur-[2px]"
                    />
                </svg>

                {/* Tooltip */}
                <AnimatePresence mode="wait">
                    {spotlightRect && (
                        <motion.div
                            key={tourStepIdx}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: 0,
                                x: isMobile 
                                    ? (window.innerWidth / 2) - 160 
                                    : (TOUR_STEPS[tourStepIdx].position === 'right' 
                                        ? spotlightRect.right + 24 
                                        : spotlightRect.left + (spotlightRect.width / 2) - 160),
                                top: isMobile
                                    ? (window.innerHeight - 300)
                                    : (TOUR_STEPS[tourStepIdx].position === 'right'
                                        ? Math.max(20, spotlightRect.top + (spotlightRect.height / 2) - 100)
                                        : spotlightRect.bottom + 24)
                            }}
                            className="absolute z-[2001] w-[320px] sm:w-80 bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 shadow-2xl pointer-events-auto"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                        Step {tourStepIdx + 1} of {TOUR_STEPS.length}
                                    </div>
                                    <button onClick={onComplete} className="text-white/20 hover:text-white transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-white tracking-tight">{TOUR_STEPS[tourStepIdx].title}</h4>
                                    <p className="text-white/50 text-sm leading-relaxed">{TOUR_STEPS[tourStepIdx].content}</p>
                                </div>
                                <div className="pt-4 flex items-center justify-between">
                                    <button 
                                        onClick={onComplete}
                                        className="text-xs font-bold text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Skip Tour
                                    </button>
                                    <Button 
                                        onClick={handleNextTour}
                                        className="rounded-xl px-6 py-2.5 text-xs uppercase font-bold tracking-widest h-auto"
                                    >
                                        {tourStepIdx === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
                                    </Button>
                                </div>
                            </div>

                            {/* Arrow Indicator - Hidden on Mobile for simplicity */}
                            {!isMobile && (
                                <div className={`absolute w-4 h-4 bg-[#0c0c0c] border-l border-t border-white/10 transform rotate-[-45deg] ${
                                    TOUR_STEPS[tourStepIdx].position === 'right' 
                                    ? '-left-2 top-1/2 -translate-y-1/2' 
                                    : 'left-1/2 -top-2 -translate-x-1/2 rotate-[45deg]'
                                }`} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            >
                {/* Background Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <motion.div 
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    className="w-full max-w-xl bg-[#0c0c0c] border border-white/10 rounded-[32px] sm:rounded-[40px] shadow-[0_32px_80px_-16px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col max-h-[95vh] sm:max-h-none"
                >
                    {/* Top Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 flex">
                        <motion.div 
                            className="h-full bg-emerald-500 shadow-[0_0_10px_#10b881]"
                            animate={{ width: `${(step / 8) * 100}%` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    </div>

                    <div className="p-6 sm:p-12 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div 
                                    key="step1"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-6 sm:space-y-8"
                                >
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                                            <User className="text-emerald-400 w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Let's setup your profile</h2>
                                        <p className="text-white/40 text-xs sm:text-sm">Tell us a bit about yourself to get started.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-1">Display Name</label>
                                            <input 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/10 text-sm"
                                                placeholder="Your name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-1">Bio</label>
                                            <textarea 
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/10 min-h-[80px] sm:min-h-[120px] resize-none text-sm"
                                                placeholder="Tell us about yourself, your niche, or your clipping journey..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <div className="relative mt-1">
                                                <input 
                                                    type="checkbox" 
                                                    checked={agreed}
                                                    onChange={(e) => setAgreed(e.target.checked)}
                                                    className="peer sr-only" 
                                                />
                                                <CustomTick checked={agreed} />
                                            </div>
                                            <p className="text-xs text-white/30 leading-relaxed group-hover:text-white/50 transition-colors">
                                                By continuing, you agree to our <span className="text-emerald-400 font-medium hover:underline cursor-pointer">Clipper Terms & Conditions</span>, <span className="text-white/60">Terms of Service</span>, and <span className="text-white/60">Privacy Policy</span>.
                                            </p>
                                        </label>

                                        <Button 
                                            disabled={!agreed || !name || isSaving}
                                            onClick={handleSaveProfile}
                                            className="w-full rounded-2xl py-4 sm:py-5 text-[11px] sm:text-sm uppercase font-bold tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)]"
                                        >
                                            {isSaving ? 'Saving...' : 'Continue'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                             {step === 2 && (
                                <motion.div 
                                    key="step2"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center mb-6">
                                            <MessageSquare className="text-[#5865F2] w-6 h-6" />
                                        </div>
                                        <h2 className="text-3xl font-bold tracking-tight text-white">Join our Discord</h2>
                                        <p className="text-white/40 text-sm">Get access to exclusive support, community tips, and real-time mission updates.</p>
                                    </div>

                                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[#5865F2]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                            <div className="w-20 h-20 rounded-full bg-[#5865F2] flex items-center justify-center shadow-[0_0_40px_-10px_#5865F2]">
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/></svg>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-white">Official Clipper Server</h3>
                                                <p className="text-white/30 text-xs">Join 2,000+ other brand ambassadors</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Verified Community</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:gap-4 pt-2 sm:pt-4">
                                        <Button 
                                            onClick={() => {
                                                window.open('https://discord.gg/clipnic', '_blank');
                                                setStep(3);
                                            }}
                                            className="w-full rounded-2xl py-4 sm:py-5 text-[11px] sm:text-sm uppercase font-bold tracking-[0.2em] bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[0_20px_40px_-12px_rgba(88,101,242,0.3)]"
                                        >
                                            Connect Discord
                                        </Button>
                                        <button 
                                            onClick={() => setStep(3)}
                                            className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors py-1"
                                        >
                                            Skip for now
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div 
                                    key="step3"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                                            <Plus className="text-blue-400 w-6 h-6" />
                                        </div>
                                        <h2 className="text-3xl font-bold tracking-tight text-white">Connect your social accounts</h2>
                                        <p className="text-white/40 text-sm">Link your social media accounts to start tracking your content and earning.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white/90">YouTube</h4>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Connect Channel</p>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="rounded-xl px-4 py-1.5 sm:py-2 text-[10px]">Connect</Button>
                                        </div>
                                        <div className="p-4 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20">
                                                    <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white/90">Instagram</h4>
                                                    <p className="text-[9px] sm:text-[10px] text-white/30 uppercase tracking-widest">Link Handle</p>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="rounded-xl px-4 py-1.5 sm:py-2 text-[10px]">Connect</Button>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <Star size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Why connect?</span>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-3 text-[11px] text-white/50">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400/40" />
                                                Search and join campaigns instantly
                                            </li>
                                            <li className="flex items-center gap-3 text-[11px] text-white/50">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400/40" />
                                                Get paid for your amazing clips
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:gap-4 pt-2 sm:pt-4">
                                        <Button 
                                            onClick={() => setStep(4)}
                                            className="w-full rounded-2xl py-4 sm:py-5 text-[11px] sm:text-sm uppercase font-bold tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(59,130,246,0.3)]"
                                        >
                                            Add Social Account
                                        </Button>
                                        <button 
                                            onClick={() => setStep(4)}
                                            className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors py-1"
                                        >
                                            Skip for now
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step >= 4 && currentDemoStep < demoSteps.length && (
                                <motion.div 
                                    key={`demo-${step}`}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-10 text-center"
                                >
                                    <div className="relative inline-flex items-center justify-center scale-75 sm:scale-100">
                                        <motion.div 
                                            className={`absolute inset-0 bg-gradient-to-br ${demoSteps[currentDemoStep].color} blur-3xl opacity-50`}
                                            layoutId="demo-glow"
                                        />
                                        <motion.div 
                                            initial={{ scale: 0.5, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="relative z-10"
                                        >
                                            {demoSteps[currentDemoStep].icon}
                                        </motion.div>
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-2xl sm:text-4xl font-bold tracking-tighter text-white glassy-text">
                                            {demoSteps[currentDemoStep].title}
                                        </h2>
                                        <p className="text-white/40 text-sm sm:text-base font-light leading-relaxed max-w-sm mx-auto px-4">
                                            {demoSteps[currentDemoStep].description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-8">
                                        <Button 
                                            onClick={() => {
                                                if (step === 8) {
                                                    setTourActive(true);
                                                } else {
                                                    setStep(step + 1);
                                                }
                                            }}
                                            className="w-full rounded-2xl py-4 sm:py-5 text-[11px] sm:text-sm uppercase font-bold tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(255,255,255,0.1)]"
                                        >
                                            {step === 8 ? 'Start Interactive Tour' : 'Next'}
                                        </Button>
                                        <button 
                                            onClick={onComplete}
                                            className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors py-1"
                                        >
                                            Skip Introduction
                                        </button>
                                    </div>

                                    {/* Step Dots */}
                                    <div className="flex items-center justify-center gap-2 pt-4">
                                        {demoSteps.map((_, i) => (
                                            <div 
                                                key={i}
                                                className={`h-1 rounded-full transition-all duration-500 ${i === currentDemoStep ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/10'}`}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
