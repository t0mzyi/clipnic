import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { SOCIAL_LINKS, LEGAL_LINKS, ECOSYSTEM_LINKS } from '../config/links';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full mt-20 border-t border-white/[0.05] bg-[#0c0c0c]/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand & Mission */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                                <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                            </div>
                            <span className="font-display text-xl tracking-widest text-white uppercase">CLIPNIC</span>
                        </div>
                        <p className="text-sm text-white/30 leading-relaxed max-w-xs font-light">
                            The primary infrastructure for turning engagement into capital. We automate the creator economy.
                        </p>
                    </div>

                    {/* Ecosystem */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Ecosystem</h4>
                        <div className="flex flex-col gap-3">
                            <a href={ECOSYSTEM_LINKS.documentation} className="text-sm text-white/40 hover:text-white transition-colors">Documentation</a>
                            <a href={ECOSYSTEM_LINKS.revenueModel} className="text-sm text-white/40 hover:text-white transition-colors">Revenue Model</a>
                            <a href={ECOSYSTEM_LINKS.viralMetrics} className="text-sm text-white/40 hover:text-white transition-colors">Viral Metrics</a>
                        </div>
                    </div>

                    {/* Transmissions */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Transmissions</h4>
                        <div className="flex flex-col gap-3">
                            <a href={SOCIAL_LINKS.twitter} className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Twitter / X
                            </a>
                            <a href={SOCIAL_LINKS.discord} className="text-sm text-white/40 hover:text-white transition-colors">Discord Guild</a>
                            <a href={SOCIAL_LINKS.instagram} className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> Instagram
                            </a>
                        </div>
                    </div>

                </div>

                <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] uppercase tracking-widest text-white/20">
                        © 2026 CLIPNIC.COM • ALL RIGHTS RESERVED
                    </p>
                    <div className="flex gap-4">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono">Live Network Status: Operational</span>
                    </div>
                </div>
            </div>
            <div className="h-20 md:h-32" /> {/* Extra spacing at the very bottom */}
        </footer>
    );
};
