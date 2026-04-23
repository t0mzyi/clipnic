import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Layers, CheckCircle2, Eye, Wallet, RotateCw, ExternalLink, X, Upload, ShieldCheck, Globe, Info, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';
import { Dropdown } from '../components/Dropdown';
import { AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';

export const MySubmissions = () => {
    const { token } = useAuthStore();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        totalEarnings: 0,
        availableBalance: 0,
        pendingPayout: 0,
        claimableBalance: 0,
        claimed: 0
    });
    const [refreshingId, setRefreshingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('Newest');

    const filteredSubmissions = useMemo(() => {
        let result = [...submissions];

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.campaignTitle?.toLowerCase().includes(q) ||
                s.url?.toLowerCase().includes(q)
            );
        }

        // Platform filter
        if (platformFilter !== 'All') {
            result = result.filter(s => s.platform === platformFilter);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortOrder === 'Newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortOrder === 'Oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sortOrder === 'Views') return (b.views || 0) - (a.views || 0);
            if (sortOrder === 'Earnings') return (b.earnings || 0) - (a.earnings || 0);
            return 0;
        });

        return result;
    }, [submissions, searchQuery, platformFilter, sortOrder]);

    const fetchAll = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/my/summary?t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setSubmissions(json.data.breakdown);
                setSummary({
                    totalEarnings: json.data.totalEarnings,
                    availableBalance: json.data.availableBalance,
                    pendingPayout: json.data.pendingPayout,
                    claimableBalance: json.data.claimableBalance,
                    claimed: json.data.claimed
                });

                let approved = 0;
                json.data.breakdown.forEach((s: any) => {
                    if (s.status === 'Verified') approved += 1;
                });
                // stats removed as it was unused
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

const handleDeleteSubmission = async (subId: string) => {
    const result = await Swal.fire({
        title: 'Delete Submission?',
        text: "This will remove the clip and deduct your earnings from the campaign stats.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        background: '#0D0D0D',
        color: '#fff',
        confirmButtonColor: '#ef4444',
        customClass: {
            popup: 'rounded-[24px] border border-white/10'
        }
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/${subId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);

            Swal.fire({
                title: 'Deleted',
                text: 'Submission removed successfully.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            fetchAll(); // Refresh all stats
        } catch (err: any) {
            Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#0D0D0D', color: '#fff' });
        }
    }
};

const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
const [joinedCampaigns, setJoinedCampaigns] = useState<any[]>([]);
const [selectedCampaignId, setSelectedCampaignId] = useState('');
const [submissionUrl, setSubmissionUrl] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);

const selectedCampaign = joinedCampaigns.find(c => c.id === selectedCampaignId);

const platform = useMemo(() => {
    if (submissionUrl.includes('youtube.com') || submissionUrl.includes('youtu.be')) return 'youtube';
    if (submissionUrl.includes('instagram.com')) return 'instagram';
    if (submissionUrl.includes('tiktok.com')) return 'tiktok';
    return null;
}, [submissionUrl]);

    const fetchJoinedCampaigns = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/joined?t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setJoinedCampaigns(json.data);
        } catch (err) { console.error('Failed to fetch joined campaigns:', err); }
    };

const handleSubmitClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !submissionUrl) return;
    if (!platform) {
        Swal.fire({ title: 'Invalid Link', text: 'Please provide a valid social link.', icon: 'error', background: '#0D0D0D', color: '#fff' });
        return;
    }

    setIsSubmitting(true);
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: selectedCampaignId, url: submissionUrl, platform })
        });
        const json = await res.json();

        if (!json.success) throw new Error(json.error);

        Swal.fire({ title: 'Success!', text: 'Your clip is now in review.', icon: 'success', background: '#0D0D0D', color: '#fff' });
        setIsSubmitModalOpen(false);
        setSubmissionUrl('');
        fetchAll();
    } catch (err: any) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#0D0D0D', color: '#fff' });
    } finally {
        setIsSubmitting(false);
    }
};

useEffect(() => {
    if (token) {
        fetchAll();
        fetchJoinedCampaigns();
    }
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
                <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex items-center gap-2 bg-white text-zinc-950 hover:bg-white/90 font-bold uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-2xl text-xs"
                >
                    <Upload className="w-4 h-4" />
                    Submit New Clip
                </button>
            </div>
        </div>

        {/* KPIs - Premium Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Available / Potential */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group hover:bg-white/[0.04] transition-colors duration-500">
                <p className="text-[10px] text-white/30 mb-3 uppercase tracking-[0.2em] font-bold flex items-center gap-2.5">
                    <RotateCw className="w-4 h-4 text-white/20" />
                    Potential
                </p>
                <p className="text-3xl font-mono tabular-metrics text-white/90">${summary.availableBalance.toFixed(2)}</p>
                <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest leading-relaxed font-medium">Accumulating while campaign is active</p>
            </div>

            {/* Goal Met / Pending */}
            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 group hover:bg-blue-500/10 transition-all duration-500">
                <p className="text-[10px] text-blue-400 mb-3 uppercase tracking-[0.2em] font-bold flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Goal Met
                </p>
                <p className="text-3xl font-mono tabular-metrics text-blue-400 font-bold">${summary.pendingPayout.toFixed(2)}</p>
                <p className="text-[10px] text-blue-400/40 mt-2 uppercase tracking-widest leading-relaxed font-medium italic">Validated & Waiting for final sync</p>
            </div>

            {/* Claimable Balance */}
            <div className="p-6 rounded-3xl bg-white text-zinc-950 shadow-[0_0_40px_rgba(255,255,255,0.1)] group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-black/[0.03] to-transparent pointer-events-none" />
                <p className="text-black/40 text-[10px] mb-3 uppercase tracking-[0.2em] font-extrabold flex items-center gap-2.5 relative z-10">
                    <Wallet className="w-4 h-4" />
                    Claimable
                </p>
                <p className="text-4xl font-mono tabular-metrics font-black relative z-10">${summary.claimableBalance.toFixed(2)}</p>
                <p className="text-[10px] text-black/30 mt-2 uppercase tracking-widest leading-relaxed relative z-10 font-bold">Finalized & ready for withdrawal</p>
            </div>

            {/* Total Paid */}
            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 group hover:bg-emerald-500/10 transition-all duration-500">
                <p className="text-[10px] text-emerald-500 mb-3 uppercase tracking-[0.2em] font-bold flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Paid Out
                </p>
                <p className="text-3xl font-mono tabular-metrics text-emerald-500 font-bold">${summary.claimed.toFixed(2)}</p>
                <p className="text-[10px] text-emerald-500/40 mt-2 uppercase tracking-widest leading-relaxed font-medium">Total earnings sent to your wallet</p>
            </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="relative w-full lg:w-auto lg:flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search submissions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-12 py-4 text-base text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                    />
                </div>
                <div className="flex flex-wrap w-full lg:w-auto items-center gap-3">
                    <div className="w-full sm:w-[180px]">
                        <Dropdown
                            value={platformFilter}
                            onChange={setPlatformFilter}
                            options={[
                                { label: 'All Platforms', value: 'All', icon: <Layers size={14} /> },
                                { label: 'YouTube', value: 'youtube', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> },
                                { label: 'Instagram', value: 'instagram', icon: <div className="w-2 h-2 rounded-full bg-pink-500" /> },
                                { label: 'TikTok', value: 'tiktok', icon: <div className="w-2 h-2 rounded-full bg-cyan-400" /> },
                            ]}
                        />
                    </div>
                    <div className="w-full sm:w-[180px]">
                        <Dropdown
                            value={sortOrder}
                            onChange={setSortOrder}
                            options={[
                                { label: 'Newest', value: 'Newest', icon: <Calendar size={14} /> },
                                { label: 'Oldest', value: 'Oldest', icon: <Calendar size={14} /> },
                                { label: 'Sort: Views', value: 'Views', icon: <Eye size={14} /> },
                                { label: 'Sort: Earnings', value: 'Earnings', icon: <Wallet size={14} /> },
                            ]}
                        />
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
                        {filteredSubmissions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-[10px] uppercase tracking-widest text-white/30 font-bold">
                                    No trackable submissions found matching your filters.
                                </td>
                            </tr>
                        ) : filteredSubmissions.map((sub: any) => (
                            <tr key={sub.id} className="group bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                                <td className="py-5 pl-6 rounded-l-2xl border-y border-l border-white/[0.05]">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${sub.platform === 'youtube' ? 'text-red-500' : sub.platform === 'instagram' ? 'text-pink-500' : 'text-cyan-400'}`}>
                                            {sub.platform === 'youtube' && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>}
                                            {sub.platform === 'instagram' && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>}
                                            {sub.platform === 'tiktok' && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white/90">{sub.campaigns?.title || 'Unknown Campaign'}</p>
                                            <p className="text-[10px] text-white/30 mt-0.5 truncate max-w-[200px]">{sub.url}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-5 border-y border-white/[0.05]">
                                    <div className="flex flex-col gap-1.5 items-start">
                                        {sub.earningCategory === 'failed' && (
                                            <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md bg-red-400/5 text-red-500/60 border border-red-500/10">Failed Goal</span>
                                        )}
                                        {sub.earningCategory === 'accumulating' && (
                                            <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md bg-white/5 text-white/30 border border-white/5">Accumulating</span>
                                        )}
                                        {sub.earningCategory === 'pending' && (
                                            <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">Goal Met 🎯</span>
                                        )}
                                        {sub.earningCategory === 'claimable' && (
                                            <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md bg-white text-zinc-950 font-black border border-white/20">Finalized 💰</span>
                                        )}
                                        {sub.earningCategory === 'claimed' && (
                                            <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid Out</span>
                                        )}
                                        <p className="text-[10px] text-white/10 uppercase tracking-widest font-medium ml-1">Campaign: {sub.campaignStatus}</p>
                                    </div>
                                </td>
                                <td className="py-5 border-y border-white/[0.05] font-mono text-sm text-white/60">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white/80">{sub.views?.toLocaleString() || 0}</span>
                                        {sub.minViews > 0 && sub.views < sub.minViews && (
                                            <div className="flex items-center gap-1.5 opacity-40">
                                                <div className="w-12 bg-white/5 h-0.5 rounded-full overflow-hidden">
                                                    <div className="bg-white h-full" style={{ width: `${(sub.views / sub.minViews) * 100}%` }} />
                                                </div>
                                                <span className="text-[8px] uppercase tracking-tighter">to {sub.minViews / 1000}k</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-5 border-y border-white/[0.05] font-mono text-sm font-bold text-white/90">
                                    <div className="flex flex-col items-start">
                                        <span className={sub.earningCategory === 'failed' ? 'text-white/10 line-through' : ''}>
                                            ${Number(sub.earnings || 0).toFixed(2)}
                                        </span>
                                        {sub.earningCategory === 'accumulating' && <span className="text-[8px] text-white/20 uppercase tracking-widest font-light">Potential</span>}
                                    </div>
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
                                        <button
                                            onClick={() => handleDeleteSubmission(sub.id)}
                                            className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                            title="Delete Submission"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Submit Modal */}
        <AnimatePresence>
            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-[#0D0D0D] border border-white/10 rounded-[32px] p-6 sm:p-10 max-w-xl w-full relative shadow-[0_32px_64px_-16px_rgba(0,0,0,1)]"
                    >
                        <button onClick={() => setIsSubmitModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">New Submission</span>
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Submit a Clip</h2>
                                <p className="text-sm text-white/40 leading-relaxed">Choose a mission and paste your clip link.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Campaign Selector */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">1. Select Mission</label>
                                    <Dropdown
                                        value={selectedCampaignId}
                                        onChange={setSelectedCampaignId}
                                        options={[
                                            { label: 'Select a mission...', value: '', icon: <Layers size={14} /> },
                                            ...joinedCampaigns.map(c => ({
                                                label: c.title,
                                                value: c.id,
                                                icon: <div className="w-2 h-2 rounded-full bg-white/20" />
                                            }))
                                        ]}
                                    />
                                </div>

                                {/* URL Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">2. Video Link</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={submissionUrl}
                                            onChange={(e) => setSubmissionUrl(e.target.value)}
                                            placeholder="Paste YouTube, Instagram or TikTok link..."
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10"
                                        />
                                        {submissionUrl && platform && (
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 animate-in fade-in zoom-in duration-300">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${platform === 'youtube' ? 'text-red-500' : platform === 'instagram' ? 'text-pink-500' : 'text-cyan-400'}`}>
                                                    {platform} Detected
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Requirements Info */}
                                {selectedCampaign && (
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Mission Requirements</p>
                                            <div className="flex gap-2">
                                                {selectedCampaign.allowed_platforms?.map((p: string) => (
                                                    <span key={p} className="text-[9px] font-black uppercase text-white/20">{p}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-white/20 uppercase font-bold">Min Views</p>
                                                <p className="text-sm font-mono text-white/60">{selectedCampaign.min_views?.toLocaleString() || 0}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-white/20 uppercase font-bold">CPM Rate</p>
                                                <p className="text-sm font-mono text-emerald-400/80">${selectedCampaign.cpm_rate?.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={handleSubmitClip}
                                    disabled={isSubmitting || !selectedCampaignId || !submissionUrl || !platform}
                                    className="w-full py-5 rounded-2xl bg-white text-zinc-950 text-xs font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-all disabled:opacity-30 disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full border-2 border-zinc-950/20 border-t-zinc-950 animate-spin" />
                                            Verifying & Submitting...
                                        </div>
                                    ) : 'Submit for Review'}
                                </Button>


                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </motion.div>
);
};
