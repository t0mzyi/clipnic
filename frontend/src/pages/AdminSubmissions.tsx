import { useState, useEffect } from 'react';
import { Search, Filter, Layers, CheckCircle2, XCircle, ExternalLink, User, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';

export const AdminSubmissions = () => {
    const { token } = useAuthStore();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

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

    const filtered = submissions.filter(s => {
        const matchesSearch = 
            s.url.toLowerCase().includes(search.toLowerCase()) || 
            s.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.campaigns?.title?.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Layers className="w-8 h-8 text-white/50" /> Submissions Mgmt
                    </h1>
                    <p className="text-white/40 mt-1">Review and verify clips from all users across the platform.</p>
                </div>

                <div className="flex items-center gap-3">
                     <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3">
                        <div className="bg-emerald-500/20 text-emerald-500 p-1.5 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Total Verified</span>
                            <span className="text-lg font-bold text-white leading-none">
                                {submissions.filter(s => s.status === 'Verified').length}
                            </span>
                        </div>
                     </div>
                </div>
            </header>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                        type="text" 
                        placeholder="Search by user, campaign, or URL..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white appearance-none focus:outline-none focus:border-white/20 transition-all"
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Verified">Verified</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-4">
                            <th className="pb-4 pl-6">Submitter</th>
                            <th className="pb-4">Campaign</th>
                            <th className="pb-4">Stats</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4">Date</th>
                            <th className="pb-4 pr-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center text-white/20 font-light italic">
                                    No submissions found matching your filters.
                                </td>
                            </tr>
                        ) : filtered.map((sub) => (
                            <tr key={sub.id} className="group bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                                <td className="py-4 pl-6 rounded-l-2xl border-y border-l border-white/[0.05]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 overflow-hidden shrink-0">
                                            {sub.users?.avatar_url ? (
                                                <img src={sub.users.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-white/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium text-white/90 truncate">{sub.users?.name || 'Unknown'}</span>
                                            <span className="text-[10px] text-white/30 truncate">{sub.users?.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 border-y border-white/[0.05]">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white/70">{sub.campaigns?.title || 'Unknown Campaign'}</span>
                                        <a href={sub.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-500/60 hover:text-emerald-400 flex items-center gap-1 mt-0.5">
                                            View Video <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                    </div>
                                </td>
                                <td className="py-4 border-y border-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">Views</span>
                                            <span className="text-xs font-mono text-white/60">{sub.views?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">Earnings</span>
                                            <span className="text-xs font-mono text-emerald-500/80">${Number(sub.earnings || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 border-y border-white/[0.05]">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                        sub.status === 'Verified' ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20' :
                                        sub.status === 'Rejected' ? 'text-red-500 bg-red-500/5 border-red-500/20' :
                                        'text-amber-500 bg-amber-500/5 border-amber-500/20'
                                    }`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="py-4 border-y border-white/[0.05]">
                                     <div className="flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </div>
                                     </div>
                                </td>
                                <td className="py-4 pr-6 rounded-r-2xl border-y border-r border-white/[0.05] text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {sub.status !== 'Verified' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(sub.id, 'Verified')}
                                                className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                title="Approve Submission"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {sub.status !== 'Rejected' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(sub.id, 'Rejected')}
                                                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                                title="Reject Submission"
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
        </div>
    );
};
