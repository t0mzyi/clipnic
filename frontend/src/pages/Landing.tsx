import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Play, Zap, BarChart3, Globe, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

export const Landing = () => {
    const [mode, setMode] = useState<'clippers' | 'brands'>('clippers');

    return (
        <div className="landing-container">
            <div className="glow-top" />
            <div className="glow-bottom" />

            <nav className="landing-nav">
                <Link to="/" className="landing-logo">
                    <img src="/logo.webp" alt="Logo" />
                    <span>CLIPNIC</span>
                </Link>
                <div className="nav-links">
                    <a href="#how-it-works" className="nav-link">How it works</a>
                    <a href="#pricing" className="nav-link">Pricing</a>
                    <a href="#about" className="nav-link">Network</a>
                </div>
                <Link to="/login" className="nav-cta">Launch App</Link>
            </nav>

            <main className="hero">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="badge"
                >
                    {mode === 'clippers' ? 'For Creators & Editors' : 'For Agencies & Brands'}
                </motion.div>

                <h1 className="hero-h1">
                    {mode === 'clippers' ? (
                        <>Don't just post. <br /><span className="text-emerald">Dominate</span> the reach.</>
                    ) : (
                        <>Scale your brand's <br /><span className="text-emerald">viral footprint</span>.</>
                    )}
                </h1>

                <p className="hero-p">
                    {mode === 'clippers' 
                        ? 'Monetize your storytelling. Access exclusive high-CPM campaigns from global brands and turn your reach into consistent revenue.'
                        : 'Connect with elite clippers who specialize in viral storytelling. Scale your presence across TikTok, Reels, and Shorts with performance-driven reach.'
                    }
                </p>

                <div className="toggle-wrapper">
                    <button 
                        className={`toggle-btn ${mode === 'clippers' ? 'active' : ''}`}
                        onClick={() => setMode('clippers')}
                    >
                        Clippers
                    </button>
                    <button 
                        className={`toggle-btn ${mode === 'brands' ? 'active' : ''}`}
                        onClick={() => setMode('brands')}
                    >
                        Brands
                    </button>
                </div>

                <div className="card-3d-wrapper">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={mode}
                            initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.95, rotateX: -10 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="card-3d"
                        >
                            <div className="card-content">
                                <div className="feature-tag">
                                    {mode === 'clippers' ? 'Editor Benefits' : 'Brand Growth'}
                                </div>
                                <h2 className="card-h2">
                                    {mode === 'clippers' 
                                        ? 'Post shorts, earn high-yield CPMs.' 
                                        : 'Performance-driven creator scaling.'
                                    }
                                </h2>
                                <ul className="card-list">
                                    {mode === 'clippers' ? (
                                        <>
                                            <li><Zap size={18} /> High CPM rates across all niches</li>
                                            <li><Play size={18} /> Verified reach attribution system</li>
                                            <li><Globe size={18} /> Exclusive global brand network</li>
                                            <li><Check size={18} /> Automated weekly payouts</li>
                                        </>
                                    ) : (
                                        <>
                                            <li><BarChart3 size={18} /> Guaranteed viral reach metrics</li>
                                            <li><Users size={18} /> Vetted elite clippers only</li>
                                            <li><ShieldCheck size={18} /> Fraud-proof content verification</li>
                                            <li><Zap size={18} /> Direct-to-consumer viral impact</li>
                                        </>
                                    )}
                                </ul>
                                <Link to="/login" className="card-cta">
                                    {mode === 'clippers' ? 'Start Clipping' : 'Start Campaign'}
                                    <ArrowRight size={16} style={{ marginLeft: '8px', display: 'inline' }} />
                                </Link>
                            </div>

                            <div className="card-visual">
                                {mode === 'clippers' ? (
                                    <div className="floating-element bg-emerald/10 p-8 border border-white/10">
                                        <div className="space-y-6">
                                            <div className="h-2 w-24 bg-white/10 rounded" />
                                            <div className="h-4 w-48 bg-emerald/20 rounded" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                                                <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                                            </div>
                                            <div className="h-32 bg-emerald/10 rounded-2xl border border-emerald/20 flex items-center justify-center">
                                                <BarChart3 className="text-emerald w-12 h-12" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="floating-element bg-white/5 p-8 border border-white/10">
                                        <div className="space-y-6 text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/10" />
                                                <div className="h-2 w-20 bg-white/20 rounded" />
                                            </div>
                                            <div className="h-4 w-full bg-white/5 rounded" />
                                            <div className="h-4 w-2/3 bg-white/5 rounded" />
                                            <div className="pt-4 mt-4 border-t border-white/5 flex justify-between">
                                                <div className="h-8 w-16 bg-white/10 rounded-lg" />
                                                <div className="h-8 w-16 bg-white/10 rounded-lg" />
                                                <div className="h-8 w-16 bg-white/10 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <footer className="landing-footer">
                <p className="footer-text">© 2026 Clipnic Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

const Users = ({ size }: { size: number }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
