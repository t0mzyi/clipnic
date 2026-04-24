import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, MessageSquare, ShieldCheck, 
    ChevronRight, ChevronLeft, X, 
    Globe, Upload, DollarSign, 
    TrendingUp, Star, CheckCircle2,
    Plus, Instagram, Youtube, Twitter
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/Button';
import { supabase } from '../config/supabase';

interface OnboardingProps {
    onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const { user, token, updateUser } = useAuthStore();
    const [step, setStep] = useState(1);
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [agreed, setAgreed] = useState(false);

    // Step 1: Profile Setup
    // Step 2: Social Connect
    // Step 3-7: Demo

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
            description: "Your journey to becoming a top-tier brand ambassador starts here. We help clippers connect with brands and earn for their creativity.",
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

    const currentDemoStep = step - 3;

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
                    className="w-full max-w-xl bg-[#0c0c0c] border border-white/10 rounded-[40px] shadow-[0_32px_80px_-16px_rgba(0,0,0,1)] relative overflow-hidden"
                >
                    {/* Top Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 flex">
                        <motion.div 
                            className="h-full bg-emerald-500 shadow-[0_0_10px_#10b881]"
                            animate={{ width: `${(step / 7) * 100}%` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    </div>

                    <div className="p-8 sm:p-12">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div 
                                    key="step1"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                                            <User className="text-emerald-400 w-6 h-6" />
                                        </div>
                                        <h2 className="text-3xl font-bold tracking-tight text-white">Let's setup your profile</h2>
                                        <p className="text-white/40 text-sm">Tell us a bit about yourself to get started.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-1">Display Name</label>
                                            <input 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/10"
                                                placeholder="Your name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-1">Bio</label>
                                            <textarea 
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/10 min-h-[120px] resize-none"
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
                                                <div className="w-5 h-5 border border-white/10 rounded-md bg-white/[0.03] peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-white/30 leading-relaxed">
                                                By continuing, you agree to our <span className="text-emerald-400 font-medium">Clipper Terms & Conditions</span>, <span className="text-white/60">Terms of Service</span>, and <span className="text-white/60">Privacy Policy</span>.
                                            </p>
                                        </label>

                                        <Button 
                                            disabled={!agreed || !name || isSaving}
                                            onClick={handleSaveProfile}
                                            className="w-full rounded-2xl py-5 text-sm uppercase font-bold tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)]"
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
                                                    <Youtube size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white/90">YouTube</h4>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Connect Channel</p>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="rounded-xl px-4 py-2 text-[10px]">Connect</Button>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20">
                                                    <Instagram size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white/90">Instagram</h4>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Link Handle</p>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="rounded-xl px-4 py-2 text-[10px]">Connect</Button>
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

                                    <div className="flex flex-col gap-4 pt-4">
                                        <Button 
                                            onClick={() => setStep(3)}
                                            className="w-full rounded-2xl py-5 text-sm uppercase font-bold tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(59,130,246,0.3)]"
                                        >
                                            Add Social Account
                                        </Button>
                                        <button 
                                            onClick={() => setStep(3)}
                                            className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors py-2"
                                        >
                                            Skip for now
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step >= 3 && currentDemoStep < demoSteps.length && (
                                <motion.div 
                                    key={`demo-${step}`}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-10 text-center"
                                >
                                    <div className="relative inline-flex items-center justify-center">
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
                                        <h2 className="text-4xl font-bold tracking-tighter text-white glassy-text">
                                            {demoSteps[currentDemoStep].title}
                                        </h2>
                                        <p className="text-white/40 text-base font-light leading-relaxed max-w-sm mx-auto">
                                            {demoSteps[currentDemoStep].description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-4 pt-8">
                                        <Button 
                                            onClick={() => {
                                                if (step === 7) {
                                                    onComplete();
                                                } else {
                                                    setStep(step + 1);
                                                }
                                            }}
                                            className="w-full rounded-2xl py-5 text-sm uppercase font-bold tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(255,255,255,0.1)]"
                                        >
                                            {step === 7 ? 'Start Earning' : 'Next Step'}
                                        </Button>
                                        <button 
                                            onClick={onComplete}
                                            className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors py-2"
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
