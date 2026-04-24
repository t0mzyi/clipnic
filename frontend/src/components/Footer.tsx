import React from 'react';
import { Instagram, Twitter, Zap } from 'lucide-react';
import { SOCIAL_LINKS, LEGAL_LINKS, ECOSYSTEM_LINKS } from '../config/links';
import { motion } from 'framer-motion';

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
                                <Twitter className="w-4 h-4" /> Twitter / X
                            </a>
                            <a href={SOCIAL_LINKS.discord} className="text-sm text-white/40 hover:text-white transition-colors">Discord Guild</a>
                            <a href={SOCIAL_LINKS.instagram} className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
                                <Instagram className="w-4 h-4" /> Instagram
                            </a>
                        </div>
                    </div>

                    {/* Legal Framework */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Legal Framework</h4>
                        <div className="flex flex-col gap-3">
                            <a href={LEGAL_LINKS.privacy} className="text-sm text-white/40 hover:text-white transition-colors">Privacy Policy</a>
                            <a href={LEGAL_LINKS.terms} className="text-sm text-white/40 hover:text-white transition-colors">Terms of Service</a>
                            <a href={LEGAL_LINKS.clipperTerms} className="text-sm text-white/40 hover:text-white transition-colors">Clipper Terms</a>
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
        </footer>
    );
};
