import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Search, Filter, Layers, CheckCircle2, XCircle, 
    ExternalLink, User, Calendar, ChevronDown, ChevronUp,
    Video, DollarSign, Eye, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';
import { Dropdown } from '../components/Dropdown';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminSubmissions = () => {
    const { token } = useAuthStore();
    const [searchParams] = useSearchParams();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [expandedCampaigns, setExpandedCampaigns] = useState<string[]>([]);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/submissions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setSubmissions(json.data);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSubmissions();
    }, [token]);

    const handleUpdateStatus = async (id: string, status: 'Verified' | 'Rejected' | 'Pending') => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/submissions/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const json = await res.json();
            if (json.success) {
                setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s));
                Swal.fire({
                    title: `Marked as ${status}`,
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    background: '#0D0D0D',
                    color: '#fff'
                });
            }
        } catch (err) {
            Swal.fire({ title: 'Error', text: 'Failed to update status', icon: 'error' });
        }
    };

    const groupedSubmissions = useMemo(() => {
        const filtered = submissions.filter(s => {
            const matchesSearch = 
                s.url.toLowerCase().includes(search.toLowerCase()) || 
                s.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
                s.campaigns?.title?.toLowerCase().includes(search.toLowerCase());
            
            const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
            
            return matchesSearch && matchesStatus;
        }).sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        // Group by campaign
        const groups: { [key: string]: { campaign: any, submissions: any[] } } = {};
        filtered.forEach(sub => {
            const campId = sub.campaign_id || 'unknown';
            if (!groups[campId]) {
                groups[campId] = {
                    campaign: sub.campaigns || { title: 'Unknown Campaign', id: campId },
                    submissions: []
                };
            }
            groups[campId].submissions.push(sub);
        });

        return Object.values(groups);
    }, [submissions, search, filterStatus, sortOrder]);

    const toggleCampaign = (id: string) => {
        setExpandedCampaigns(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                        <Layers className="w-10 h-10 text-white/50" /> Approvals
                    </h1>
                    <p className="text-white/40 mt-1 font-medium">Grouped by Campaign for easier management.</p>
                </div>

                <div className="flex items-center gap-3">
                     <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-4">
                        <div className="bg-emerald-500/20 text-emerald-500 p-2 rounded-xl">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Global Verified</span>
                            <span className="text-xl font-bold text-white tabular-nums">
                                {submissions.filter(s => s.status === 'Verified').length}
                            </span>
                        </div>
                     </div>
                </div>
            </header>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input 
                        type="text" 
                        placeholder="Search users, campaigns, or links..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all font-mono"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="w-[180px]">
                        <Dropdown 
                            value={filterStatus}
                            onChange={setFilterStatus}
                            options={[
                                { label: 'All Status', value: 'all', icon: <Filter size={14} /> },
                                { label: 'Pending', value: 'Pending', icon: <Clock size={14} className="text-amber-500" /> },
                                { label: 'Verified', value: 'Verified', icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
                                { label: 'Rejected', value: 'Rejected', icon: <XCircle size={14} className="text-red-500" /> },
                            ]}
                        />
                    </div>
                    <div className="w-[180px]">
                        <Dropdown 
                            value={sortOrder}
                            onChange={(val: any) => setSortOrder(val)}
                            options={[
                                { label: 'Newest First', value: 'newest', icon: <Calendar size={14} /> },
                                { label: 'Oldest First', value: 'oldest', icon: <Calendar size={14} /> },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Grouped View */}
            <div className="space-y-6">
                {groupedSubmissions.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-white/10 rounded-[32px] bg-white/[0.01]">
                        <AlertCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/20 font-medium tracking-wide">No submissions found matching your filters.</p>
                    </div>
                ) : groupedSubmissions.map((group) => (
                    <div key={group.campaign.id} className="group overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.02] transition-all hover:bg-white/[0.03]">
                        {/* Campaign Header */}
                        <div 
                            onClick={() => toggleCampaign(group.campaign.id)}
                            className="p-6 cursor-pointer flex items-center justify-between transition-colors hover:bg-white/5"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-white/20 transition-all">
                                    {group.campaign.banner_url ? (
                                        <img src={group.campaign.banner_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-all" alt="" />
                                    ) : (
                                        <Layers className="w-6 h-6 text-white/20" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white/90 group-hover:text-white transition-colors">{group.campaign.title}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-[10px] uppercase tracking-widest font-bold">
                                        <span className="flex items-center gap-1.5 text-white/30">
                                            <Video className="w-3.5 h-3.5" /> {group.submissions.length} Total
                                        </span>
                                        <span className="flex items-center gap-1.5 text-amber-500/60">
                                            <Clock className="w-3.5 h-3.5" /> {group.submissions.filter(s => s.status === 'Pending').length} Pending
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex items-center gap-8 px-6 border-r border-white/5 mr-4">
                                    <div className="text-right">
                                        <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold mb-1">Group Earnings</p>
                                        <p className="text-sm font-mono font-bold text-emerald-500/80">
                                            ${group.submissions.reduce((acc, s) => acc + Number(s.earnings || 0), 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold mb-1">Total Views</p>
                                        <p className="text-sm font-mono font-bold text-white/40">
                                            {group.submissions.reduce((acc, s) => acc + (s.views || 0), 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-xl transition-all ${expandedCampaigns.includes(group.campaign.id) ? 'bg-white text-black rotate-180' : 'bg-white/5 text-white/40'}`}>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Submissions List */}
                        <AnimatePresence>
                            {expandedCampaigns.includes(group.campaign.id) && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-white/5"
                                >
                                    <div className="p-4 overflow-x-auto">
                                        <table className="w-full text-left border-separate border-spacing-y-2">
                                            <thead>
                                                <tr className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] px-4">
                                                    <th className="pb-2 pl-6">Clipper</th>
                                                    <th className="pb-2">Performance</th>
                                                    <th className="pb-2">Status</th>
                                                    <th className="pb-2">Date</th>
                                                    <th className="pb-2 pr-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.submissions.map((sub) => (
                                                    <tr key={sub.id} className="group/row bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-200">
                                                        <td className="py-4 pl-6 rounded-l-2xl border-y border-l border-white/[0.03]">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                                    {sub.users?.avatar_url ? (
                                                                        <img src={sub.users.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <User className="w-4 h-4 text-white/20" />
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-sm font-bold text-white/90 truncate group-hover/row:text-white">{sub.users?.name || 'Unknown'}</span>
                                                                    <a href={sub.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-500/40 hover:text-emerald-400 flex items-center gap-1 mt-0.5 transition-colors">
                                                                        Open Clip <ExternalLink className="w-2.5 h-2.5" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 border-y border-white/[0.03]">
                                                            <div className="flex items-center gap-6">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Views</span>
                                                                    <span className="text-xs font-mono text-white/60 tabular-nums">{sub.views?.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Earned</span>
                                                                    <span className="text-xs font-mono text-emerald-500/70 tabular-nums">${Number(sub.earnings || 0).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 border-y border-white/[0.03]">
                                                            <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md border ${
                                                                sub.status === 'Verified' ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20' :
                                                                sub.status === 'Rejected' ? 'text-red-500 bg-red-500/5 border-red-500/20' :
                                                                'text-amber-500 bg-amber-500/5 border-amber-500/20'
                                                            }`}>
                                                                {sub.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 border-y border-white/[0.03]">
                                                            <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-mono">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(sub.created_at).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 pr-6 rounded-r-2xl border-y border-r border-white/[0.03] text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {sub.status !== 'Verified' && (
                                                                    <button 
                                                                        onClick={() => handleUpdateStatus(sub.id, 'Verified')}
                                                                        className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-90"
                                                                        title="Approve"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                {sub.status !== 'Rejected' && (
                                                                    <button 
                                                                        onClick={() => handleUpdateStatus(sub.id, 'Rejected')}
                                                                        className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"
                                                                        title="Reject"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};
