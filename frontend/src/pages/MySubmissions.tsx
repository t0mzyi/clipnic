import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Layers, CheckCircle2, Eye, Wallet, RotateCw, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';

export const MySubmissions = () => {
    const { token } = useAuthStore();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalClips: 0, views: 0, earnings: 0, approved: 0 });
    const [refreshingId, setRefreshingId] = useState<string | null>(null);

    const fetchAll = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
               setSubmissions(json.data);
               let views = 0;
               let earnings = 0;
               let approved = 0;
               json.data.forEach((s: any) => {
                   views += s.views || 0;
                   earnings += Number(s.earnings || 0);
                   if (s.status === 'Verified') approved += 1;
               });
               setStats({ totalClips: json.data.length, views, earnings, approved });
            }
        } catch (err) { console.error('Failed to fetch my submissions:', err); }
    };

    const handleRefresh = async (id: string) => {
        setRefreshingId(id);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/${id}/refresh`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);

            Swal.fire({
                title: 'Views Updated!',
                text: 'Your clip views and earnings have been synced with the latest platform data.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            await fetchAll();
        } catch (err: any) {
            Swal.fire({
                title: 'Too Soon',
                text: err.message,
                icon: 'info',
                background: '#0D0D0D',
                color: '#fff',
                confirmButtonColor: '#fff',
                confirmButtonText: 'Got it',
                customClass: {
                    popup: 'rounded-[24px] border border-white/10'
                }
            });
        } finally {
            setRefreshingId(null);
        }
    };
    
    useEffect(() => {
        if (token) fetchAll();
    }, [token]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 pb-8"
        >
            <div className="pb-6 border-b border-white/[0.08] relative">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-32 bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />
                <div className="flex items-end justify-between relative z-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 mb-2">My Submissions</h1>
                        <p className="text-white/40 text-lg font-light tracking-tight">Track and manage your clips.</p>
                    </div>
                </div>
            </div>

            {/* KPIs - Premium Design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                    <p className="text-xs text-white/40 mb-3 uppercase tracking-widest font-semibold flex items-center gap-2.5">
                        <Layers className="w-5 h-5" />
                        Total Clips
                    </p>
                    <p className="text-4xl font-mono tabular-metrics text-white/90">{stats.totalClips}</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                    <p className="text-xs text-white/40 mb-3 uppercase tracking-widest font-semibold flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-green-500/50" />
                        Approved
                    </p>
                    <p className="text-4xl font-mono tabular-metrics text-white/90">{stats.approved}</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                    <p className="text-xs text-white/40 mb-3 uppercase tracking-widest font-semibold flex items-center gap-2.5">
                        <Eye className="w-5 h-5 text-white/30" />
                        Views
                    </p>
                    <p className="text-4xl font-mono tabular-metrics text-white/90">{stats.views.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-3xl bg-white text-black shadow-2xl group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/[0.05] to-transparent pointer-events-none" />
                    <p className="text-black/50 text-xs mb-3 uppercase tracking-widest font-bold flex items-center gap-2.5 relative z-10">
                        <Wallet className="w-5 h-5" />
                        Earnings
                    </p>
                    <p className="text-4xl font-mono tabular-metrics font-bold relative z-10">${stats.earnings.toFixed(2)}</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="relative w-full lg:w-auto lg:flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="Search submissions..." 
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-12 py-4 text-base text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                        />
                    </div>
                    <div className="flex flex-wrap w-full lg:w-auto items-center gap-3">
                        <div className="relative group">
                            <select className="bg-white/[0.03] border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-sm font-medium text-white/50 focus:outline-none focus:border-white/20 appearance-none cursor-pointer hover:bg-white/[0.05] transition-all">
                                <option>All Campaigns</option>
                            </select>
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        </div>
                        <div className="relative group">
                            <select className="bg-white/[0.03] border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-sm font-medium text-white/50 focus:outline-none focus:border-white/20 appearance-none cursor-pointer hover:bg-white/[0.05] transition-all">
                                <option>All Platforms</option>
                            </select>
                            <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        </div>
                        <div className="relative group">
                            <select className="bg-white/[0.03] border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-sm font-medium text-white/50 focus:outline-none focus:border-white/20 appearance-none cursor-pointer hover:bg-white/[0.05] transition-all">
                                <option>Sort: Newest</option>
                            </select>
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="mt-10 overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-4">
                                <th className="pb-4 pl-6">Campaign</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Views</th>
                                <th className="pb-4">Earnings</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-[10px] uppercase tracking-widest text-white/30">
                                        No trackable submissions found on your account.
                                    </td>
                                </tr>
                            ) : submissions.map((sub) => (
                                <tr key={sub.id} className="group bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                                    <td className="py-5 pl-6 rounded-l-2xl border-y border-l border-white/[0.05]">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${sub.platform === 'youtube' ? 'text-red-500' : sub.platform === 'instagram' ? 'text-pink-500' : 'text-cyan-400'}`}>
                                                {sub.platform === 'youtube' && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>}
                                                {sub.platform === 'instagram' && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>}
                                                {sub.platform === 'tiktok' && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white/90">{sub.campaigns?.title || 'Unknown Campaign'}</p>
                                                <p className="text-[10px] text-white/30 mt-0.5 truncate max-w-[200px]">{sub.url}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 border-y border-white/[0.05]">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 ${sub.status === 'Verified' ? 'text-emerald-500' : sub.status === 'Pending' ? 'text-amber-500' : 'text-red-500'}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="py-5 border-y border-white/[0.05] font-mono text-sm text-white/60">
                                        {sub.views?.toLocaleString() || 0}
                                    </td>
                                    <td className="py-5 border-y border-white/[0.05] font-mono text-sm font-bold text-white/90">
                                        ${Number(sub.earnings || 0).toFixed(2)}
                                    </td>
                                    <td className="py-5 border-y border-white/[0.05] text-[11px] text-white/30 font-medium">
                                        {new Date(sub.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-5 pr-6 rounded-r-2xl border-y border-r border-white/[0.05] text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button 
                                                disabled={refreshingId === sub.id}
                                                onClick={() => handleRefresh(sub.id)}
                                                className={`p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all ${refreshingId === sub.id ? 'animate-pulse' : ''}`}
                                                title="Refresh View Count"
                                            >
                                                <RotateCw className={`w-3.5 h-3.5 ${refreshingId === sub.id ? 'animate-spin' : ''}`} />
                                            </button>
                                            <a 
                                                href={sub.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                                title="Open Video"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};
