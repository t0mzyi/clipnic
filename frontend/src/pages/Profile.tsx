import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ShieldCheck, User, Mail, CreditCard, ExternalLink, Scissors, Eye, Wallet } from 'lucide-react';

export const Profile = () => {
    // Mock user stats
    const stats = {
        totalClips: '14',
        totalViews: '2,405,110',
        currentBalance: '$382.50',
    };

    // Modal state
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    const [verifyStep, setVerifyStep] = useState<1 | 2>(1);
    const [verificationStatus, setVerificationStatus] = useState<'Unverified' | 'Pending'>('Unverified');
    
    // Discord state
    const [discordUser, setDiscordUser] = useState('');
    
    // Social state
    const [selectedSocial, setSelectedSocial] = useState('');
    const [socialUser, setSocialUser] = useState('');
    const [showCode, setShowCode] = useState(false);
    const verifyCode = "CLPNIC-8XJ9K2";

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto space-y-8 pb-12"
            >
                <div className="pb-6 border-b border-white/[0.08] relative">
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-32 bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-white/90">Account Profile</h1>
                            <p className="text-white/40 text-lg font-light tracking-tight mt-2">Manage identity and payouts.</p>
                        </div>
                        <Button variant="outline" className="rounded-2xl border-white/10 hover:bg-white/5 text-white/70 h-12 px-6 text-sm font-bold uppercase tracking-wider">
                            Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Core Metrics - Bento Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Scissors className="w-10 h-10" />
                        </div>
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-2">
                            Total Clips
                        </p>
                        <p className="text-4xl font-mono tracking-tight font-medium text-white/90">{stats.totalClips}</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Eye className="w-10 h-10" />
                        </div>
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-2">
                            Total Views
                        </p>
                        <p className="text-4xl font-mono tracking-tight font-medium text-white/90">{stats.totalViews}</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white text-black relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-5 opacity-10">
                            <Wallet className="w-10 h-10" />
                        </div>
                        <p className="text-black/50 text-xs font-semibold uppercase tracking-widest mb-2.5">
                            Balance
                        </p>
                        <p className="text-4xl font-mono tracking-tight font-bold">{stats.currentBalance}</p>
                        <button className="mt-6 w-full py-3 bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-black/90 transition-colors">
                            Withdraw
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left Col: Account Form */}
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2.5">
                            <User className="w-5 h-5 text-white/40" />
                            Settings
                        </h3>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/30 ml-1">Display Name</label>
                                <input type="text" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-white/20 transition-all" defaultValue="John Clipper" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/30 ml-1">Email</label>
                                <div className="relative">
                                    <input type="email" readOnly className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-base text-white/40 cursor-not-allowed focus:outline-none" value="john@clipnic.com" />
                                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/30 ml-1">Bio</label>
                                <textarea className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-white/20 transition-all resize-none h-32" defaultValue="I make minimal tech content and edits." />
                            </div>
                            <Button variant="primary" className="w-full bg-white/10 hover:bg-white/15 border-white/5 text-white/80 rounded-2xl py-4 text-xs font-bold uppercase tracking-wide">
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    {/* Right Col: Verification & Payouts */}
                    <div className="space-y-8">
                        {/* Verification Box */}
                        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2.5">
                                    <ShieldCheck className="w-5 h-5 text-white/40" />
                                    Verification
                                </h3>
                                {verificationStatus === 'Unverified' ? (
                                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">Unverified</span>
                                ) : (
                                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-wider">Pending</span>
                                )}
                            </div>

                            {verificationStatus === 'Unverified' ? (
                                <div className="space-y-5 pt-2">
                                    <p className="text-sm text-white/30 leading-relaxed">
                                        Verify platforms to join premium campaigns.
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => { setVerifyStep(1); setShowCode(false); setIsVerifyOpen(true); }}
                                        className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-2xl py-3.5 h-auto text-xs font-bold uppercase tracking-widest"
                                    >
                                        Verify Now
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-4 items-start pt-2">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-base font-medium text-white/90">Pending Scan</p>
                                        <p className="text-sm text-white/30 leading-tight">Verification logic in progress.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payouts Box */}
                        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2.5">
                                <CreditCard className="w-5 h-5 text-white/40" />
                                Payouts
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-xs font-bold">P</div>
                                        <div>
                                            <p className="text-sm font-medium text-white/90">PayPal</p>
                                            <p className="text-xs text-white/30">john@clipnic.com</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors">Del</button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-dashed border-dashed opacity-30 hover:opacity-100 transition-opacity cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs font-bold">S</div>
                                        <p className="text-sm font-medium text-white/50">Stripe</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-white/20" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Verification Modal */}
            <AnimatePresence>
                {isVerifyOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ y: 20, scale: 0.97, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 20, scale: 0.97, opacity: 0 }}
                            className="bg-[#0D0D0D] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative shadow-[0_32px_64px_-16px_rgba(0,0,0,1)]"
                        >
                            <button 
                                onClick={() => setIsVerifyOpen(false)}
                                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                            
                            {verifyStep === 1 ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold tracking-tight">Join Official Discord</h2>
                                        <p className="text-xs text-white/40 leading-relaxed">Join the community to stay updated on high-ticket campaigns and role-based permissions.</p>
                                    </div>
                                    
                                    <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 rounded-2xl py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(88,101,242,0.4)]">
                                        <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.07-11.41,6.88,6.88,0,0,0-4.69-3.22,74.81,74.81,0,0,1-10.33-4.9,6.61,6.61,0,0,1-.12-11c.76-.58,1.56-1.11,2.44-1.63a70.84,70.84,0,0,1,34-11,70.06,70.06,0,0,1,34,11c.8.52,1.6,1.05,2.44,1.63a6.61,6.61,0,0,1-.12,11,74.44,74.44,0,0,1-10.33,4.9,6.88,6.88,0,0,0-4.69,3.22,77.7,77.7,0,0,0,7.07,11.41,105.73,105.73,0,0,0,32.77-16.15C129,56.6,124.47,32.65,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.08-12.69,11.41-12.69S54,46,54,53,48.82,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.08-12.69,11.44-12.69S96.14,46,96.14,53,91,65.69,84.69,65.69Z"/></svg>
                                        Authorize Discord
                                    </Button>

                                    <div className="space-y-4 pt-4 border-t border-white/5 mt-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Discord Tag</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. user#1234"
                                                value={discordUser}
                                                onChange={(e) => setDiscordUser(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all font-mono" 
                                            />
                                        </div>
                                        <Button 
                                            variant="primary" 
                                            className="w-full rounded-2xl py-3 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-xl"
                                            onClick={() => setVerifyStep(2)}
                                        >
                                            Next: Socials
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold tracking-tight">Platform Linkage</h2>
                                        <p className="text-xs text-white/40 leading-relaxed">Choose your primary content channel for views monitoring.</p>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Platform</label>
                                        <select 
                                            value={selectedSocial}
                                            onChange={(e) => {
                                                setSelectedSocial(e.target.value);
                                                setShowCode(false);
                                            }}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select network</option>
                                            <option value="youtube">YouTube</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="tiktok">TikTok</option>
                                        </select>
                                    </div>

                                    {selectedSocial && !showCode && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4 pt-4"
                                        >
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] ml-1">Account Handle</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="@username"
                                                    value={socialUser}
                                                    onChange={(e) => setSocialUser(e.target.value)}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all font-mono" 
                                                />
                                            </div>
                                            <Button 
                                                variant="secondary" 
                                                className="w-full rounded-2xl py-3 text-xs font-bold uppercase tracking-widest bg-white/10 text-white hover:bg-white/15"
                                                onClick={() => setShowCode(true)}
                                            >
                                                Generate Link Code
                                            </Button>
                                        </motion.div>
                                    )}

                                    {showCode && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-4 pt-4"
                                        >
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-3">
                                                <p className="text-[10px] text-white/40 font-medium leading-relaxed">Place this unique ID in your channel description or bio to prove ownership:</p>
                                                <div className="relative group">
                                                    <p className="font-mono text-lg tracking-[0.2em] font-bold text-white bg-black border border-white/20 p-4 rounded-xl selection:bg-white selection:text-black">
                                                        {verifyCode}
                                                    </p>
                                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl blur-md" />
                                                </div>
                                            </div>
                                            <Button 
                                                variant="primary" 
                                                className="w-full rounded-2xl py-3 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-[0_12px_24px_-8px_rgba(255,255,255,0.3)]"
                                                onClick={() => {
                                                    setVerificationStatus('Pending');
                                                    setIsVerifyOpen(false);
                                                }}
                                            >
                                                Verify Connection
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
