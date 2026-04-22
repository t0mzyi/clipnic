import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ToggleLeft, ToggleRight, Users, Film, Pencil, Search, Filter, Eye } from 'lucide-react';

interface Campaign {
    id: string;
    title: string;
    description: string;
    discord_channel: string;
    source_link?: string;
    cpm_rate: number;
    total_budget: number;
    budget_used: number;
    end_date: string;
    banner_url?: string;
    min_views?: number | null;
    per_clipper_cap?: number | null;
    per_video_cap?: number | null;
    requires_verification: boolean;
    is_featured: boolean;
    status: string;
    view_progress: number;
    target_views: number;
    created_at: string;
}

const defaultForm = {
    title: '',
    description: '',
    discord_channel: '',
    cpm_rate: '',
    total_budget: '',
    end_date: '',
    banner_url: '',
    min_views: '',
    per_clipper_cap: '',
    per_video_cap: '',
    requires_verification: false,
    is_featured: false,
};

const InputField = ({ label, required = false, ...props }: any) => (
    <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <input
            {...props}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-all"
        />
    </div>
);

const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#0c0c0c',
    color: '#fff',
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

export const AdminCampaigns = () => {
    const { token } = useAuthStore();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredCampaigns = campaigns.filter(camp => {
        const matchesSearch = camp.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All'
            ? true
            : statusFilter === 'Featured'
                ? camp.is_featured
                : camp.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    useEffect(() => { fetchCampaigns(); }, []);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setCampaigns(json.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');
        try {
            const { brand: _brand, ...rest } = form as any;
            const payload: any = {
                ...rest,
                cpm_rate: parseFloat(form.cpm_rate),
                total_budget: parseFloat(form.total_budget),
                min_views: form.min_views ? parseInt(form.min_views, 10) : null,
                per_clipper_cap: form.per_clipper_cap ? parseFloat(form.per_clipper_cap) : null,
                per_video_cap: form.per_video_cap ? parseFloat(form.per_video_cap) : null,
            };

            if (payload.per_clipper_cap !== null && payload.per_video_cap !== null) {
                if (payload.per_video_cap > payload.per_clipper_cap) {
                    throw new Error("Per Video Cap cannot be greater than Per Clipper Cap.");
                }
            }

            const url = editingCampaign 
                ? `${import.meta.env.VITE_API_URL}/campaigns/${editingCampaign.id}`
                : `${import.meta.env.VITE_API_URL}/campaigns`;
            
            const method = editingCampaign ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error || `Failed to ${editingCampaign ? 'update' : 'create'} campaign`);
            
            if (editingCampaign) {
                setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? json.data : c));
                Toast.fire({ title: 'Campaign Updated!', text: `"${json.data.title}" saved successfully.`, icon: 'success' });
            } else {
                setCampaigns(prev => [json.data, ...prev]);
                Toast.fire({ title: 'Campaign Created!', text: `"${json.data.title}" is now live.`, icon: 'success' });
            }
            
            setIsModalOpen(false);
            setEditingCampaign(null);
            setForm(defaultForm);
        } catch (err: any) {
            setFormError(err.message);
        } finally { setSubmitting(false); }
    };

    const handleEditClick = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setForm({
            title: campaign.title,
            description: campaign.description,
            discord_channel: campaign.discord_channel,
            cpm_rate: campaign.cpm_rate.toString(),
            total_budget: campaign.total_budget.toString(),
            end_date: new Date(campaign.end_date).toISOString().split('T')[0],
            banner_url: campaign.banner_url || '',
            min_views: campaign.min_views ? campaign.min_views.toString() : '',
            per_clipper_cap: campaign.per_clipper_cap ? campaign.per_clipper_cap.toString() : '',
            per_video_cap: campaign.per_video_cap ? campaign.per_video_cap.toString() : '',
            requires_verification: campaign.requires_verification,
            is_featured: campaign.is_featured,
        });
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (campaign: Campaign) => {
        const newStatus = campaign.status === 'Active' ? 'Paused' : 'Active';
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${campaign.id}/status`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const json = await res.json();
            if (json.success) setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c));
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (campaign: Campaign) => {
        const result = await Swal.fire({
            title: 'Delete Campaign?', text: `This will permanently delete "${campaign.title}".`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444',
            cancelButtonColor: '#27272a', confirmButtonText: 'Delete', background: '#0c0c0c', color: '#fff',
            customClass: { popup: 'rounded-3xl border border-white/10' }
        });
        if (!result.isConfirmed) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${campaign.id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
            setCampaigns(prev => prev.filter(c => c.id !== campaign.id));
            Toast.fire({ title: 'Deleted!', icon: 'success' });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">

            {/* Header */}
            <div className="flex items-end justify-between pb-6 border-b border-white/[0.06]">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white/90 mb-1">Campaigns</h1>
                    <p className="text-white/30 text-sm font-light">Create and manage clipping campaigns.</p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl px-5 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90">
                    <Plus className="w-4 h-4" /> New Campaign
                </Button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                        type="text" 
                        placeholder="Search campaigns by name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0c0c0c] border border-white/[0.05] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all font-mono"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#0c0c0c] border border-white/[0.05] rounded-xl pl-11 pr-10 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer w-full sm:w-[180px] font-mono"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Featured">Featured</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-[#0c0c0c] border border-white/[0.06] overflow-hidden">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[9px] font-bold text-white/20 uppercase tracking-widest border-b border-white/[0.04]">
                                    <th className="px-6 py-4">Campaign</th>
                                    <th className="px-4 py-4">CPM</th>
                                    <th className="px-4 py-4">Budget</th>
                                    <th className="px-4 py-4">Caps</th>
                                    <th className="px-4 py-4">Total Views</th>
                                    <th className="px-4 py-4">Deadline</th>
                                    <th className="px-4 py-4 text-center">Featured</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filteredCampaigns.map((camp) => {
                                    const progress = camp.total_budget > 0 ? (camp.budget_used / camp.total_budget) * 100 : 0;
                                    const daysLeft = Math.ceil((new Date(camp.end_date).getTime() - Date.now()) / 86400000);
                                    return (
                                        <tr key={camp.id} 
                                            className="group hover:bg-white/[0.02] transition-all duration-200 relative"
                                            style={camp.banner_url ? { 
                                                backgroundImage: `linear-gradient(rgba(12,12,12,0.94), rgba(12,12,12,0.94)), url(${camp.banner_url})`, 
                                                backgroundSize: 'cover', 
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat'
                                            } : undefined}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm font-medium text-white/90">{camp.title}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-mono text-sm font-bold text-emerald-400">${camp.cpm_rate.toFixed(2)}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1.5 min-w-[120px]">
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="text-white/50 font-mono">${camp.budget_used.toFixed(0)} <span className="text-white/20">/ ${camp.total_budget.toLocaleString()}</span></span>
                                                    </div>
                                                    <div className="w-full bg-white/[0.04] h-1 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${progress >= 100 ? 'bg-red-500' : 'bg-emerald-500/70'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                                                        <Eye className="w-3 h-3 text-emerald-400/60" />
                                                        <span className="font-mono">{camp.min_views ? `${camp.min_views.toLocaleString()} views` : <span className="text-white/20">No min views</span>}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                                                        <Users className="w-3 h-3 text-blue-400/60" />
                                                        <span className="font-mono">{camp.per_clipper_cap ? `$${camp.per_clipper_cap}/person` : <span className="text-white/20">No cap</span>}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                                                        <Film className="w-3 h-3 text-purple-400/60" />
                                                        <span className="font-mono">{camp.per_video_cap ? `$${camp.per_video_cap}/video` : <span className="text-white/20">No cap</span>}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-mono text-sm text-white/70">{camp.view_progress.toLocaleString()}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="text-xs text-white/60 font-mono">{new Date(camp.end_date).toLocaleDateString()}</p>
                                                    <p className={`text-[10px] mt-0.5 ${daysLeft < 3 ? 'text-red-400' : 'text-white/20'}`}>{daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {camp.is_featured ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-500/20 text-amber-500 border-amber-500/20">YES</span>
                                                ) : (
                                                    <span className="text-white/10 text-[10px]">No</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4"><Badge status={camp.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 relative z-10">
                                                    <Link to={`/campaigns/${camp.id}`} target="_blank"
                                                        className="p-2 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.04] transition-all">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => handleToggleStatus(camp)}
                                                        className="p-2 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.04] transition-all">
                                                        {camp.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => handleEditClick(camp)}
                                                        className="p-2 rounded-lg text-white/20 hover:text-amber-400 hover:bg-white/[0.04] transition-all">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(camp)}
                                                        className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredCampaigns.length === 0 && (
                                    <tr><td colSpan={8} className="py-20 text-center text-white/20 text-sm font-light italic">No matching campaigns found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Campaign Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                        <motion.div initial={{ y: 24, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 24, scale: 0.97, opacity: 0 }}
                            className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">

                            <div className="flex items-center justify-between mb-7">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">{editingCampaign ? 'Edit Campaign' : 'New Campaign'}</h2>
                                    <p className="text-white/30 text-xs mt-1">{editingCampaign ? 'Modify campaign parameters and caps.' : 'Fill in the details to launch a clipping campaign.'}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full text-white/20 hover:text-white hover:bg-white/5 transition-all">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Section: Identity */}
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] pt-1">Campaign Identity</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <InputField label="Campaign Name" required placeholder="e.g. Summer Skincare Launch" value={form.title} onChange={set('title')} />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">About This Campaign <span className="text-red-400">*</span></label>
                                        <textarea required value={(form as any).description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                            placeholder="Tell clippers what this campaign is about, what kind of content to make, tips, etc."
                                            rows={3}
                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-all resize-none" />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Discord Channel Link <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5865F2]/60" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.07-11.41,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,7.09,11.4,105.25,105.25,0,0,0,32.78-16.17C126.89,56.51,122.34,32.57,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.18-12.69,11.43-12.69S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.18-12.69,11.44-12.69S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
                                            <input required type="url" placeholder="https://discord.com/channels/..." value={(form as any).discord_channel} onChange={set('discord_channel')}
                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 font-mono focus:outline-none focus:border-[#5865F2]/40 transition-all" />
                                        </div>
                                        <p className="text-[9px] text-white/20">Clippers will see this link to find content to clip</p>
                                    </div>
                                    <InputField label="Banner Image URL" type="url" placeholder="https://... (wide image)" value={form.banner_url} onChange={set('banner_url')} />
                                </div>

                                {/* Section: Financials */}
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] pt-2 border-t border-white/[0.05] mt-2">Budget & Payouts</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">CPM Rate ($) <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm font-mono">$</span>
                                            <input required type="number" step="0.01" min="0.01" placeholder="0.40"
                                                value={form.cpm_rate} onChange={set('cpm_rate')}
                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-white/20 font-mono focus:outline-none focus:border-white/25 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Total Budget ($) <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm font-mono">$</span>
                                            <input required type="number" step="1" min="1" placeholder="10000"
                                                value={form.total_budget} onChange={set('total_budget')}
                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-white/20 font-mono focus:outline-none focus:border-white/25 transition-all" />
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Caps */}
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] pt-2 border-t border-white/[0.05] mt-2">Earnings Caps <span className="text-white/15 normal-case font-normal">(optional)</span></p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                                            <Eye className="w-3 h-3 text-emerald-400/60" /> Min Views
                                        </label>
                                        <input type="number" step="1" min="0" placeholder="e.g. 1000"
                                            value={form.min_views ?? ''} onChange={set('min_views')}
                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 font-mono focus:outline-none focus:border-white/25 transition-all" />
                                        <p className="text-[9px] text-white/20">Views needed before earnings count</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                                            <Users className="w-3 h-3 text-blue-400/60" /> Per Clipper Cap ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm font-mono">$</span>
                                            <input type="number" step="0.01" min="0" placeholder="No cap"
                                                value={form.per_clipper_cap ?? ''} onChange={set('per_clipper_cap')}
                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-white/20 font-mono focus:outline-none focus:border-white/25 transition-all" />
                                        </div>
                                        <p className="text-[9px] text-white/20">Max total per clipper</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                                            <Film className="w-3 h-3 text-purple-400/60" /> Per Video Cap ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm font-mono">$</span>
                                            <input type="number" step="0.01" min="0" placeholder="No cap"
                                                value={form.per_video_cap ?? ''} onChange={set('per_video_cap')}
                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-white/20 font-mono focus:outline-none focus:border-white/25 transition-all" />
                                        </div>
                                        <p className="text-[9px] text-white/20">Max per single video</p>
                                    </div>
                                </div>

                                {/* Section: Rules */}
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] pt-2 border-t border-white/[0.05] mt-2">Rules & Deadline</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <InputField label="End Date" required type="date"
                                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                            value={form.end_date} onChange={set('end_date')} />
                                    </div>
                                    <div className="col-span-2 space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}>
                                            <input type="checkbox" id="is_featured" checked={form.is_featured} readOnly className="w-4 h-4 accent-amber-500" />
                                            <label htmlFor="is_featured" className="text-sm text-white/60 cursor-pointer flex items-center gap-2">
                                                Featured Campaign <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest font-bold">Recommended</span>
                                            </label>
                                        </div>
                                        <div className="h-px bg-white/[0.05]" />
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setForm(p => ({ ...p, requires_verification: !p.requires_verification }))}>
                                            <input type="checkbox" id="req_verify" checked={form.requires_verification} readOnly className="w-4 h-4 accent-white" />
                                            <label htmlFor="req_verify" className="text-sm text-white/60 cursor-pointer">
                                                Require Discord + Social verification to join
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {formError && (
                                    <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 px-4 py-3 rounded-xl">{formError}</p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setEditingCampaign(null); }}
                                        className="flex-1 rounded-xl py-3 text-xs border-white/10 text-white/50 hover:bg-white/5">Cancel</Button>
                                    <Button type="submit" variant="primary" disabled={submitting}
                                        className="flex-1 rounded-xl py-3 text-xs bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90 disabled:opacity-50">
                                        {submitting ? 'Saving...' : editingCampaign ? '💾 Save Changes' : '🚀 Launch Campaign'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
