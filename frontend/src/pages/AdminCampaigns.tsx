import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ToggleLeft, ToggleRight, Pencil, Search, Eye, Globe, Filter, CheckCircle2, Star, BarChart, Layers } from 'lucide-react';
import { Dropdown } from '../components/Dropdown';

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
    requires_verification: false, // Legacy field, keeping for compat if needed but using newer ones
    is_featured: false,
    allowed_platforms: ['youtube', 'instagram', 'tiktok'],
    requires_dedicated_social: false,
    requires_discord: true,
    rules: ['Follow brand guidelines', 'No artificial engagement'],
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
    const [step, setStep] = useState(1);
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

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setForm(p => ({ ...p, [key]: val }));
    }

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setCampaigns(json.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const validateForm = () => {
        if (!form.title.trim()) return "Campaigns need a catchy title.";
        if (!form.description.trim()) return "Please provide a description so clippers know what to do.";
        if (!form.discord_channel.trim() || !form.discord_channel.startsWith('http')) return "A valid Discord invitation link is required.";
        
        const cpm = parseFloat(form.cpm_rate);
        const budget = parseFloat(form.total_budget);
        
        if (isNaN(cpm) || cpm <= 0) return "CPM rate must be a positive number.";
        if (isNaN(budget) || budget <= 0) return "Total budget must be a positive number.";
        if (budget < cpm) return "Total budget is too small for this CPM.";
        
        if (!form.end_date) return "Select a deadline for this campaign.";
        if (new Date(form.end_date) <= new Date()) return "Deadline must be in the future.";
        
        if (form.allowed_platforms.length === 0) return "Select at least one platform (YouTube/IG/TikTok).";
        
        return null;
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            setFormError(error);
            Toast.fire({ title: 'Validation Error', text: error, icon: 'error', background: '#200' });
            return;
        }

        setSubmitting(true);
        setFormError('');
        try {
            const payload: any = {
                ...form,
                cpm_rate: parseFloat(form.cpm_rate),
                total_budget: parseFloat(form.total_budget),
                min_views: form.min_views ? parseInt(form.min_views, 10) : null,
                per_clipper_cap: form.per_clipper_cap ? parseFloat(form.per_clipper_cap) : null,
                per_video_cap: form.per_video_cap ? parseFloat(form.per_video_cap) : null,
            };

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
                Toast.fire({ title: 'Campaign Updated!', icon: 'success' });
            } else {
                setCampaigns(prev => [json.data, ...prev]);
                Toast.fire({ title: 'Campaign Created!', icon: 'success' });
            }
            
            setIsModalOpen(false);
            setEditingCampaign(null);
            setForm(defaultForm);
            setStep(1);
        } catch (err: any) {
            setFormError(err.message);
        } finally { setSubmitting(false); }
    };

    const handleEditClick = (campaign: any) => {
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
            allowed_platforms: campaign.allowed_platforms || ['youtube', 'instagram', 'tiktok'],
            requires_dedicated_social: campaign.requires_dedicated_social || false,
            requires_discord: campaign.requires_discord || false,
            rules: campaign.rules || ['Follow brand guidelines'],
        });
        setStep(1);
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

    const togglePlatform = (p: string) => {
        setForm(prev => ({
            ...prev,
            allowed_platforms: prev.allowed_platforms.includes(p)
                ? prev.allowed_platforms.filter(x => x !== p)
                : [...prev.allowed_platforms, p]
        }));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">

            {/* Header */}
            <div className="flex items-end justify-between pb-6 border-b border-white/[0.06]">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white/90 mb-1 glassy-text">Campaigns</h1>
                    <p className="text-white/30 text-sm font-light">Create and manage clipping campaigns.</p>
                </div>
                <Button variant="primary" onClick={() => { setEditingCampaign(null); setForm(defaultForm); setStep(1); setIsModalOpen(true); }}
                    className="flex items-center gap-2 rounded-xl px-5 py-3 bg-white text-zinc-950 text-xs font-bold uppercase tracking-widest hover:bg-white/90">
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
                <div className="w-full sm:w-[200px]">
                    <Dropdown 
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { label: 'All Statuses', value: 'All', icon: <Filter size={14} /> },
                            { label: 'Active', value: 'Active', icon: <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> },
                            { label: 'Paused', value: 'Paused', icon: <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> },
                            { label: 'Featured', value: 'Featured', icon: <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> },
                        ]}
                    />
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
                                    <th className="px-4 py-4">Budget Progress</th>
                                    <th className="px-4 py-4">View Goal</th>
                                    <th className="px-4 py-4">Activity</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filteredCampaigns.map((camp) => {
                                    const progress = camp.total_budget > 0 ? (camp.budget_used / camp.total_budget) * 100 : 0;
                                    return (
                                        <tr key={camp.id} 
                                            className="group hover:bg-white/[0.02] transition-all duration-200 relative overflow-hidden"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-white/20 transition-all">
                                                        {camp.banner_url ? (
                                                            <img src={camp.banner_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" alt="" />
                                                        ) : (
                                                            <Layers className="w-5 h-5 text-white/10" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <Link to={`/campaigns/${camp.id}`} target="_blank" className="font-bold text-white/90 hover:text-white transition-colors truncate">
                                                            {camp.title}
                                                        </Link>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {camp.is_featured && <Star size={10} className="text-purple-400 fill-purple-400" />}
                                                            <span className="text-[10px] text-white/30 font-mono">Ends {new Date(camp.end_date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-emerald-400 font-mono font-bold">${(camp.cpm_rate || 0).toFixed(2)}</td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1.5 min-w-[140px]">
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="text-white/50 font-mono">${Number(camp.budget_used || 0).toFixed(0)} <span className="text-white/20">/ ${(camp.total_budget || 0).toLocaleString()}</span></span>
                                                        <span className="text-white/30">{(progress || 0).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1.5 min-w-[140px]">
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="text-white/50 font-mono">{(Number((camp as any).view_progress) || 0).toLocaleString()} <span className="text-white/20">/ {(Number((camp as any).target_views) || 0).toLocaleString()}</span></span>
                                                        <span className="text-white/30">{((Number((camp as any).view_progress) || 0) / (Number((camp as any).target_views) || 1) * 100).toFixed(0)}%</span>
                                                    </div>
                                                    {/* Small Sparkline-like Progress */}
                                                    <div className="flex gap-0.5 h-3 items-end">
                                                        {Array.from({ length: 20 }).map((_, i) => {
                                                            const p = ((camp as any).view_progress / ((camp as any).target_views || 1)) * 20;
                                                            return (
                                                                <div key={i} className={`flex-1 rounded-t-sm transition-all duration-500 ${i < p ? 'bg-emerald-500/40' : 'bg-white/5'}`} style={{ height: `${20 + Math.sin(i * 0.5) * 40}%` }} />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[9px] text-white/20 font-bold uppercase">Clips</span>
                                                        <span className="text-sm font-mono text-white/70">{(camp as any).total_submissions_count || 0}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[9px] text-white/20 font-bold uppercase">Pending</span>
                                                        <Link 
                                                            to={`/admin/submissions?search=${encodeURIComponent(camp.title)}&status=Pending`}
                                                            className={`text-sm font-mono transition-colors hover:underline ${(camp as any).pending_submissions_count > 0 ? 'text-amber-400 hover:text-amber-300' : 'text-white/30'}`}
                                                        >
                                                            {(camp as any).pending_submissions_count || 0}
                                                        </Link>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[9px] text-white/20 font-bold uppercase">Join</span>
                                                        <span className="text-sm font-mono text-white/70">{(camp as any).participant_count || 0}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <Badge status={camp.status} />
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Eye className="w-3 h-3 text-white/20" />
                                                        <span className="text-[9px] font-mono text-white/30">{camp.min_views ? `${camp.min_views.toLocaleString()} min` : 'No min'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                                                <Link to={`/admin/campaigns/${camp.id}`} className="p-2 text-white/20 hover:text-white transition-colors" title="Campaign Analytics"><BarChart className="w-4 h-4" /></Link>
                                                <button onClick={() => handleEditClick(camp)} className="p-2 text-white/20 hover:text-amber-400 transition-colors" title="Edit Campaign"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleToggleStatus(camp)} className="p-2 text-white/20 hover:text-white transition-colors" title={camp.status === 'Active' ? 'Pause' : 'Activate'}>
                                                    {camp.status === 'Active' ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                                                </button>
                                                <button onClick={() => handleDelete(camp)} className="p-2 text-white/20 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Campaign Modal (Wizard) */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                        <motion.div initial={{ y: 24, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 24, scale: 0.97, opacity: 0 }}
                            className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
                            
                            {/* Stepper Header */}
                            <div className="flex items-center gap-4 mb-8">
                                {[1, 2, 3, 4].map((s) => (
                                    <div key={s} className="flex-1 h-1.5 rounded-full bg-white/[0.03] overflow-hidden relative">
                                        {step >= s && <motion.div layoutId="step" className="absolute inset-0 bg-white" />}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Step {step} of 4</h2>
                                    <p className="text-white/30 text-xs mt-1">
                                        {step === 1 && "Basic Info & Editorial Rules"}
                                        {step === 2 && "Platform & Social Requirements"}
                                        {step === 3 && "Financials & Caps"}
                                        {step === 4 && "Final Review"}
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                                    <Plus className="w-5 h-5 rotate-45 text-white/20" />
                                </button>
                            </div>

                            {formError && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{formError}</div>}

                            <div className="min-h-[400px]">
                                {/* Step 1: Basics */}
                                {step === 1 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                        <InputField label="Campaign Name" required value={form.title} onChange={set('title')} placeholder="e.g. Summer Skincare Launch" />
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">About This Campaign</label>
                                            <textarea className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white" rows={3} value={form.description} onChange={set('description')} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Rules & Guidelines</label>
                                            <div className="space-y-2">
                                                {form.rules.map((rule, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-white" value={rule} onChange={e => {
                                                            const newRules = [...form.rules];
                                                            newRules[idx] = e.target.value;
                                                            setForm(p => ({ ...p, rules: newRules }));
                                                        }} />
                                                        <button onClick={() => setForm(p => ({ ...p, rules: p.rules.filter((_, i) => i !== idx) }))} className="p-2 text-red-400/40 hover:text-red-400 bg-red-400/5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => setForm(p => ({ ...p, rules: [...p.rules, ''] }))} className="text-[10px] text-white/40 hover:text-white flex items-center gap-1.5 mt-2">+ Add Rule</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Platform */}
                                {step === 2 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Allowed Platforms</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['youtube', 'instagram', 'tiktok'].map(p => (
                                                    <button 
                                                        key={p} 
                                                        onClick={() => togglePlatform(p)} 
                                                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                                                            form.allowed_platforms.includes(p) 
                                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                                                                : 'bg-white/[0.02] border-white/[0.05] grayscale opacity-40 hover:opacity-60'
                                                        }`}
                                                    >
                                                        <span className="text-xs uppercase font-bold tracking-[0.1em]">{p}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/[0.05]">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                                                <div>
                                                    <p className="text-sm font-bold text-white/90">Feature this Campaign</p>
                                                    <p className="text-[10px] text-white/30 mt-0.5">Make this campaign more prominent and highlight it in the clipper portal.</p>
                                                </div>
                                                <button onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}>
                                                    {form.is_featured ? <ToggleRight className="text-purple-500 w-8 h-8" /> : <ToggleLeft className="text-white/10 w-8 h-8" />}
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                                                <div>
                                                    <p className="text-sm font-bold text-white/90">Require Dedicated Social</p>
                                                    <p className="text-[10px] text-white/30 mt-0.5">Clippers must link a fresh account specifically for this campaign.</p>
                                                </div>
                                                <button onClick={() => setForm(p => ({ ...p, requires_dedicated_social: !p.requires_dedicated_social }))}>
                                                    {form.requires_dedicated_social ? <ToggleRight className="text-emerald-400 w-8 h-8" /> : <ToggleLeft className="text-white/10 w-8 h-8" />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <InputField label="Source Asset / Discord Channel" required value={form.discord_channel} onChange={set('discord_channel')} placeholder="Discord link where assets are kept" />
                                    </motion.div>
                                )}

                                {/* Step 3: Financials */}
                                {step === 3 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="CPM Rate ($)" required type="number" step="0.01" value={form.cpm_rate} onChange={set('cpm_rate')} />
                                            <InputField label="Total Budget ($)" required type="number" value={form.total_budget} onChange={set('total_budget')} />
                                        </div>
                                        <InputField label="End Date" required type="date" value={form.end_date} onChange={set('end_date')} />
                                        
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest border-b border-white/5 pb-2">Earnings Caps</p>
                                            <div className="grid grid-cols-3 gap-4">
                                                <InputField label="Min Views" type="number" value={form.min_views} onChange={set('min_views')} />
                                                <InputField label="Max / Person ($)" type="number" value={form.per_clipper_cap} onChange={set('per_clipper_cap')} />
                                                <InputField label="Max / Video ($)" type="number" value={form.per_video_cap} onChange={set('per_video_cap')} />
                                            </div>
                                        </div>
                                        <InputField label="Banner URL" type="url" value={form.banner_url} onChange={set('banner_url')} />
                                    </motion.div>
                                )}

                                {/* Step 4: Final Review */}
                                {step === 4 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 overflow-y-auto max-h-[480px] pr-2 custom-scrollbar">
                                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-[0.2em]">Ready to Launch</p>
                                                <p className="text-sm text-white/60">Everything looks good. Review the details below.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold">{form.title}</h3>
                                            <p className="text-white/40 text-xs line-clamp-2">{form.description}</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                <p className="text-[9px] text-white/30 uppercase font-bold">Financials</p>
                                                <div className="mt-1 flex items-end gap-1">
                                                    <span className="text-lg font-bold text-emerald-400">${form.cpm_rate}</span>
                                                    <span className="text-[10px] text-white/20 pb-1">CPM</span>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                <p className="text-[9px] text-white/30 uppercase font-bold">Total Budget</p>
                                                <div className="mt-1 text-lg font-bold">${parseFloat(form.total_budget).toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[9px] text-white/30 uppercase font-bold">Requirements</p>
                                            <div className="flex flex-wrap gap-2">
                                                {form.allowed_platforms.map(p => <span key={p} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold uppercase">{p}</span>)}
                                                {form.requires_dedicated_social && <span className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-tight">Dedicated Account Required</span>}
                                                {form.requires_discord && <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-tight">Discord Link Required</span>}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/[0.05] flex gap-3">
                                {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)} className="px-8 py-3 rounded-xl text-xs">Back</Button>}
                                {step < 4 ? (
                                    <Button variant="primary" onClick={() => setStep(s => s + 1)} className="flex-1 bg-white text-zinc-950 py-4 rounded-xl font-bold uppercase tracking-widest text-xs">Continue</Button>
                                ) : (
                                    <Button variant="primary" onClick={handleSubmit} disabled={submitting} className="flex-1 bg-emerald-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                        {submitting ? "Launching..." : editingCampaign ? "Save Changes" : (
                                            <div className="flex items-center justify-center gap-2">
                                                <Globe size={14} />
                                                Launch Campaign
                                            </div>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
