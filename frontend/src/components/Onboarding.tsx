import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

interface OnboardingProps {
    onComplete: () => void;
    openMenu?: () => void;
    closeMenu?: () => void;
}

interface TourStep {
    target: string;
    path: string;
    title: string;
    content: string;
    position: 'right' | 'left' | 'top' | 'bottom' | 'center';
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '#profile-discord-step',
        path: '/clippers/profile',
        title: 'Verification: Discord',
        content: 'Join our Discord server to confirm your identity. This is required to unlock platform features.',
        position: 'bottom'
    },
    {
        target: '#profile-socials-step',
        path: '/clippers/profile',
        title: 'Verification: Socials',
        content: 'Link your TikTok, Instagram, or YouTube channel to track your video views automatically.',
        position: 'bottom'
    },
    {
        target: '#sidebar-active-campaigns',
        path: '/clippers/campaigns',
        title: 'Active Campaigns',
        content: 'Browse available missions from top brands. Check CPM rates and joining rules to start earning.',
        position: 'right'
    },
    {
        target: '#sidebar-submissions',
        path: '/clippers/submissions',
        title: 'My Submissions',
        content: 'Track all your submitted clips here. Watch your views grow and see your verification status in real-time.',
        position: 'right'
    },
    {
        target: '#sidebar-earnings',
        path: '/clippers/earnings',
        title: 'Earnings & Payouts',
        content: 'Manage your capital. Track your total revenue and claim your payouts once clips are verified.',
        position: 'right'
    }
];

const CustomTick = ({ checked }: { checked: boolean }) => (
    <div className={`w-6 h-6 rounded-lg border transition-all duration-300 flex items-center justify-center ${checked
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

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, openMenu, closeMenu }) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [step] = useState(1);
    const [agreed, setAgreed] = useState(false);
    
    // Tour State
    const activeSteps = TOUR_STEPS.filter((_, idx) => {
        if (idx === 0 && user?.discordVerified) return false;
        return true;
    });

    const [tourActive, setTourActive] = useState(false);
    const [tourStepIdx, setTourStepIdx] = useState(0);
    const tourStepIdxRef = useRef(0);
    const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
    const [modalActive, setModalActive] = useState(false);
    const [isTourBooting, setIsTourBooting] = useState(false);
    const prevModalActive = useRef(false);

    // Initial tour boot delay to prevent glitches
    useEffect(() => {
        if (tourActive && !spotlightRect && !isTourBooting) {
            setIsTourBooting(true);
            const timer = setTimeout(() => setIsTourBooting(false), 1200);
            return () => clearTimeout(timer);
        }
    }, [tourActive]);
    const pollingRef = useRef<number | null>(null);
    const stepAtModalStart = useRef<number | null>(null);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Sync ref with state
    useEffect(() => {
        tourStepIdxRef.current = tourStepIdx;
    }, [tourStepIdx]);

    // Auto-sync Google name to database if not set
    useEffect(() => {
        if (user && !user.name) {
            const googleName = user.user_metadata?.full_name;
            if (googleName) {
                // Auto-save to database immediately
                supabase.from('users').update({ name: googleName }).eq('id', user.id).then();
            }
        }
    }, [user]);

    const handleNextTour = useCallback(() => {
        setTourStepIdx(prev => {
            // If on Discord and user skips, skip Socials too
            if (prev === 0) return 2;

            const next = prev + 1;
            if (next < activeSteps.length) return next;
            onComplete();
            navigate('/clippers/campaigns');
            return prev;
        });
    }, [onComplete, navigate]);

    // Auto-advance logic
    useEffect(() => {
        if (!tourActive) return;
        
        // Dynamic skipping removed in favor of activeSteps filter

        if (modalActive) {
            if (stepAtModalStart.current === null) {
                stepAtModalStart.current = tourStepIdx;
            }
        } else if (prevModalActive.current === true) {
            if (stepAtModalStart.current === tourStepIdx && (tourStepIdx === 0 || tourStepIdx === 1)) {
                handleNextTour();
            }
            stepAtModalStart.current = null;
        }
        
        prevModalActive.current = modalActive;
    }, [user, tourActive, tourStepIdx, modalActive, handleNextTour]);

    // Tour Spotlight Polling Logic
    useEffect(() => {
        if (!tourActive) return;

        const currentStep = activeSteps[tourStepIdx];
        
        // 1. Navigation handling
        if (!location.pathname.startsWith(currentStep.path)) {
            navigate(currentStep.path);
        }

        const updateSpotlight = () => {
            // ALWAYS use the Ref to avoid closure issues during high-frequency polling
            const currentIdx = tourStepIdxRef.current;
            const currentStep = activeSteps[currentIdx];
            
            const modalEl = document.querySelector('#verification-modal') || document.querySelector('#withdraw-modal');
            let isReallyActive = false;
            if (modalEl) {
                const style = window.getComputedStyle(modalEl);
                if (parseFloat(style.opacity) > 0.1) isReallyActive = true;
            }
            
            setModalActive(isReallyActive);

            const el = document.querySelector(currentStep.target);
            if (el && !isReallyActive) {
                if (isMobile) {
                    if (currentStep.target.startsWith('#sidebar-') && openMenu) {
                        openMenu();
                    } else if (closeMenu) {
                        closeMenu();
                    }
                }

                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    setSpotlightRect(rect);
                    // Minimal smooth scrolling for targeted elements
                    const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
                    if (!isInView) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            } else {
                setSpotlightRect(null);
            }
            pollingRef.current = requestAnimationFrame(updateSpotlight);
        };

        pollingRef.current = requestAnimationFrame(updateSpotlight);
        return () => {
            if (pollingRef.current) cancelAnimationFrame(pollingRef.current);
        };
    }, [tourActive, isMobile, openMenu, closeMenu, navigate, tourStepIdx, location.pathname]);

    if (tourActive) {
        if (isTourBooting) {
            return (
                <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="relative w-16 h-16 mx-auto">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-2 border-emerald-500 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-display uppercase tracking-widest text-white">Calibrating</h3>
                            <p className="text-white/30 text-xs font-mono uppercase tracking-[0.2em]">Synchronizing Tour Protocol</p>
                        </div>
                    </motion.div>
                </div>
            );
        }

        const currentStep = activeSteps[tourStepIdx];
        const holePath = spotlightRect ? `M 0 0 h ${window.innerWidth} v ${window.innerHeight} h -${window.innerWidth} Z M ${spotlightRect.x - 8} ${spotlightRect.y - 8} h ${spotlightRect.width + 16} v ${spotlightRect.height + 16} h -${spotlightRect.width + 16} Z` : '';

        return (
            <div className="fixed inset-0 z-[2000] pointer-events-none">
                {/* SVG Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <AnimatePresence>
                        {spotlightRect && !modalActive && (
                            <motion.path
                                key={`spotlight-${tourStepIdx}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                d={holePath}
                                fill="rgba(0,0,0,0.75)"
                                fillRule="evenodd"
                                className="pointer-events-auto backdrop-blur-[1px]"
                            />
                        )}
                    </AnimatePresence>
                </svg>

                {/* Tooltip */}
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={modalActive ? 'paused' : `step-${tourStepIdx}`}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            y: 0,
                            x: modalActive || !spotlightRect
                                ? (isMobile ? (window.innerWidth / 2) - 160 : 24)
                                : (isMobile 
                                    ? (window.innerWidth / 2) - 160 
                                    : (currentStep.position === 'right' 
                                        ? (spotlightRect ? spotlightRect.right + 24 : 24)
                                        : (spotlightRect ? spotlightRect.left + (spotlightRect.width / 2) - 160 : (window.innerWidth / 2) - 160))),
                            top: modalActive || !spotlightRect
                                ? (isMobile ? window.innerHeight - 320 : window.innerHeight - 250)
                                : (isMobile
                                    ? (window.innerHeight - 320)
                                    : (currentStep.position === 'right'
                                        ? Math.max(20, (spotlightRect ? spotlightRect.top + (spotlightRect.height / 2) - 100 : window.innerHeight / 2 - 100))
                                        : Math.min(window.innerHeight - 250, (spotlightRect ? spotlightRect.bottom + 24 : window.innerHeight / 2 + 100))))
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-[2001] w-[320px] sm:w-80 bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 shadow-2xl pointer-events-auto"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center min-w-[80px]">
                                    {modalActive ? 'Tour Paused' : (!spotlightRect ? 'Please Wait' : `Step ${tourStepIdx + 1} of ${activeSteps.length}`)}
                                </div>
                                <button onClick={onComplete} className="text-white/20 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold text-white tracking-tight">
                                    {modalActive ? 'Complete Action' : (!spotlightRect ? 'Element Loading...' : currentStep.title)}
                                </h4>
                                <p className="text-white/50 text-sm leading-relaxed">
                                    {modalActive 
                                        ? 'Finish your action in the window to continue the tour.' 
                                        : (!spotlightRect 
                                            ? 'The target element isn\'t visible yet. Please wait or skip if you are finished.' 
                                            : currentStep.content)
                                    }
                                </p>
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
                                    {tourStepIdx < 2 ? 'Skip' : (tourStepIdx === activeSteps.length - 1 ? 'Get Started' : 'Next')}
                                </Button>
                            </div>
                        </div>

                        {!isMobile && !modalActive && spotlightRect && (
                            <div className={`absolute w-4 h-4 bg-[#0c0c0c] border-l border-t border-white/10 transform rotate-[-45deg] ${
                                currentStep.position === 'right' 
                                ? '-left-2 top-1/2 -translate-y-1/2' 
                                : 'left-1/2 -top-2 -translate-x-1/2 rotate-[45deg]'
                            }`} />
                        )}
                    </motion.div>
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
                            animate={{ width: `${(step / 2) * 100}%` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    </div>

                    <div className="p-6 sm:p-12 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div 
                                    key="step-welcome"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-10 text-center"
                                >
                                    <div className="relative inline-flex items-center justify-center scale-75 sm:scale-100">
                                        <motion.div 
                                            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl opacity-50"
                                            layoutId="demo-glow"
                                        />
                                        <motion.div 
                                            initial={{ scale: 0.5, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="relative z-10"
                                        >
                                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                                                <img src="/logo.webp" alt="Logo" className="w-12 h-12 object-contain group-hover:scale-105 transition-transform duration-300" />
                                            </div>
                                        </motion.div>
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-2xl sm:text-4xl font-bold tracking-tighter text-white glassy-text">
                                            Welcome to Clipnic
                                        </h2>
                                        <p className="text-white/40 text-sm sm:text-base font-light leading-relaxed max-w-sm mx-auto px-4">
                                            Clipnic is the primary infrastructure for turning engagement into capital. We pay clippers for high velocity shortform content.
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <label className="flex items-start gap-4 cursor-pointer group text-left px-4">
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

                                        <div className="flex flex-col gap-3 sm:gap-4">
                                            <Button 
                                                disabled={!agreed}
                                                onClick={() => setTourActive(true)}
                                                className="w-full rounded-2xl py-4 sm:py-5 text-[11px] sm:text-sm uppercase font-bold tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] disabled:opacity-50"
                                            >
                                                Start Interactive Tour
                                            </Button>
                                            <button 
                                                disabled={!agreed}
                                                onClick={onComplete}
                                                className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors py-1 disabled:opacity-30"
                                            >
                                                Skip Introduction
                                            </button>
                                        </div>
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
