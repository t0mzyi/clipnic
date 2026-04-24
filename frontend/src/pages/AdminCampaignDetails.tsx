import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { 
    ChevronLeft, Eye, Users, 
    TrendingUp, Calendar, DollarSign, 
    ExternalLink, CheckCircle2, XCircle,
    Pencil, ToggleRight, ToggleLeft,
    BarChart, LayoutGrid, Upload
} from 'lucide-react';
import Swal from '../lib/swal';

interface Campaign {
    id: string;
    title: string;
    description: string;
    status: string;
    total_budget: number;
    budget_used: number;
    view_progress: number;
    target_views: number;
    min_views: number;
    cpm_rate: number;
    end_date: string;
    participant_count?: number;
    total_submissions_count?: number;
    pending_submissions_count?: number;
}

export const AdminCampaignDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCampaign();
            fetchSubmissions();
        }
    }, [id]);

    const fetchCampaign = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                const found = json.data.find((c: any) => c.id === id);
                if (found) setCampaign(found);
            }
        } catch (err) {
            console.error('Failed to fetch campaign:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/submissions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setSubmissions(json.data.filter((s: any) => s.campaign_id === id));
            }
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        }
    };

    const handleUpdateStatus = async (subId: string, status: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/submissions/${subId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const json = await res.json();
            if (json.success) {
                setSubmissions(submissions.map(s => s.id === subId ? { ...s, status } : s));
                Swal.fire({
                    title: `Marked as ${status}`,
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    background: '#0c0c0c',
                    color: '#fff'
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleCampaignStatus = async () => {
        if (!campaign) return;
        setUpdatingStatus(true);
        try {
            const newStatus = campaign.status === 'Active' ? 'Paused' : 'Active';
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/campaigns/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setCampaign({ ...campaign, status: newStatus });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
        );
    }

    if (!campaign) return <div className="text-center py-20 text-white/40">Campaign not found.</div>;

    const viewsPercent = Math.min(100, ((Number(campaign.view_progress) || 0) / (Number(campaign.target_views) || 1)) * 100);
    const budgetPercent = Math.min(100, (campaign.budget_used / (campaign.total_budget || 1)) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/campaigns')}
                        className="p-3 rounded-full bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] text-white/50 hover:text-white transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-white/90">{campaign.title}</h1>
                            <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border ${campaign.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                {campaign.status}
                            </span>
                        </div>
                        <p className="text-sm text-white/40">Campaign Analytics & Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => navigate(`/admin/campaigns?edit=${id}`)} className="rounded-xl flex items-center gap-2 bg-white/5 hover:bg-white/10 border-white/10 text-[11px] font-bold uppercase tracking-widest px-5">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button onClick={handleToggleCampaignStatus} disabled={updatingStatus} className={`rounded-xl flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-5 ${campaign.status === 'Active' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {campaign.status === 'Active' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        {campaign.status === 'Active' ? 'Pause' : 'Resume'}
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] space-y-4">
                    <div className="flex items-center gap-2 text-white/30"><DollarSign className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Budget Used</span></div>
                    <div>
                        <p className="text-2xl font-mono font-bold text-white">${Number(campaign.budget_used || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-white/20 mt-1">of ${(campaign.total_budget || 0).toLocaleString()} total</p>
                    </div>
                    <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${budgetPercent}%` }} />
                    </div>
                </div>

                <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] space-y-4">
                    <div className="flex items-center gap-2 text-white/30"><Eye className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">View Progress</span></div>
                    <div>
                        <p className="text-2xl font-mono font-bold text-white">{(Number(campaign.view_progress) || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-white/20 mt-1">of {(Number(campaign.target_views) || 0).toLocaleString()} goal</p>
                    </div>
                    <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${viewsPercent}%` }} />
                    </div>
                </div>

                <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] space-y-4">
                    <div className="flex items-center gap-2 text-white/30"><Users className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Clipper Base</span></div>
                    <div>
                        <p className="text-2xl font-mono font-bold text-white">{campaign.participant_count || 0}</p>
                        <p className="text-[10px] text-white/20 mt-1">Joined participants</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/60">
                        <TrendingUp className="w-3 h-3" />
                        <span>{campaign.total_submissions_count || 0} clips submitted</span>
                    </div>
                </div>

                <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] space-y-4">
                    <div className="flex items-center gap-2 text-amber-400/50"><Calendar className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Days Remaining</span></div>
                    <div>
                        <p className="text-2xl font-mono font-bold text-amber-400">
                            {Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000))}d
                        </p>
                        <p className="text-[10px] text-white/20 mt-1">until {new Date(campaign.end_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                        {(Number(campaign.min_views) || 0).toLocaleString()} min views req
                    </div>
                </div>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold tracking-tight text-white/90 flex items-center gap-3">
                            <Upload className="w-5 h-5 text-white/30" />
                            Recent Campaign Submissions
                        </h3>
                        <Link to={`/admin/submissions?search=${encodeURIComponent(campaign.title)}`} className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors flex items-center gap-1.5">
                            Manage All <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[9px] font-bold text-white/15 uppercase tracking-[0.2em] border-b border-white/[0.03]">
                                    <th className="pb-4">Clipper</th>
                                    <th className="pb-4">Stats</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 text-right">Review</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {submissions.slice(0, 5).map((sub) => (
                                    <tr key={sub.id} className="group hover:bg-white/[0.01]">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/30 uppercase">
                                                    {sub.users?.name?.charAt(0) || sub.users?.email?.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white/80 truncate">{sub.users?.name || 'Anon'}</p>
                                                    <p className="text-[10px] text-white/20 font-mono truncate">{sub.platform}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="text-right inline-block">
                                                <p className="text-sm font-mono font-bold text-white/70">{sub.views?.toLocaleString()}</p>
                                                <p className="text-[10px] text-emerald-400/60 font-mono">${Number(sub.earnings || 0).toFixed(2)}</p>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                                sub.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                sub.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {sub.status === 'Pending' && (
                                                    <>
                                                        <button onClick={() => handleUpdateStatus(sub.id, 'Verified')} className="p-2 text-white/20 hover:text-emerald-400 transition-colors" title="Verify"><CheckCircle2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleUpdateStatus(sub.id, 'Rejected')} className="p-2 text-white/20 hover:text-red-400 transition-colors" title="Reject"><XCircle className="w-4 h-4" /></button>
                                                    </>
                                                )}
                                                <a href={sub.url} target="_blank" rel="noreferrer" className="p-2 text-white/20 hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-white/20 text-xs italic">No submissions yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] h-full">
                        <h3 className="text-lg font-bold tracking-tight text-white/90 mb-6 flex items-center gap-3">
                            <BarChart className="w-5 h-5 text-white/30" />
                            Campaign Config
                        </h3>
                        <div className="space-y-6">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Goal Distribution</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[11px] text-white/50">
                                        <span>CPM Rate</span>
                                        <span className="font-mono text-emerald-400">${(Number(campaign.cpm_rate) || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-white/50">
                                        <span>Min Views</span>
                                        <span className="font-mono">{(Number(campaign.min_views) || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-white/50">
                                        <span>Per Clipper Cap</span>
                                        <span className="font-mono text-amber-500/60">$Unlimited</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Efficiency</p>
                                <div className="space-y-1">
                                        {campaign.total_submissions_count ? ((Number(campaign.view_progress) || 0) / campaign.total_submissions_count).toFixed(0) : 0}
                                    <p className="text-[10px] text-white/30">Avg Views Per Clip</p>
                                </div>
                            </div>

                            <Link to={`/campaigns/${campaign.id}`} target="_blank" className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/70 transition-all">
                                <LayoutGrid className="w-4 h-4" />
                                Preview Public Page
                            </Link>
                        </div>
                    </div>
                 </div>
            </div>
        </motion.div>
    );
};
