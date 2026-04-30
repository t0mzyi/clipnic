import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Plus, Search, Trash2, Link as LinkIcon, Unlink, Check, X, ChevronDown, ChevronUp, Settings2, Key, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Toast } from '../lib/swal';
import { Button } from '../components/ui/Button';

export const AdminBrands = () => {
    const { token } = useAuthStore();
    const [brands, setBrands] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showCreate, setShowCreate] = useState(false);
    const [newBrand, setNewBrand] = useState({ name: '', email: '', password: '' });

    const fetchBrands = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setBrands(json.data.filter((u: any) => u.role === 'brand'));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/admin/all?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setCampaigns(json.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (token) {
            Promise.all([fetchBrands(), fetchCampaigns()]).finally(() => setLoading(false));
        }
    }, [token]);

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/brands`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBrand)
            });
            const json = await res.json();
            if (json.success) {
                Toast.fire({ title: 'Success', text: 'Brand account created.', icon: 'success' });
                setShowCreate(false);
                setNewBrand({ name: '', email: '', password: '' });
                fetchBrands();
            } else {
                Toast.fire({ title: 'Error', text: json.error || 'Failed to create brand', icon: 'error' });
            }
        } catch (err: any) {
            Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
        }
    };

    if (loading) return <div className="p-12 text-center text-white/50">Loading management interface...</div>;

    return (
        <div className="space-y-12 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-bold uppercase tracking-tight glassy-text">Enterprise Partners</h1>
                    <p className="text-white/40 mt-1">Manage brand access and security.</p>
                </div>
                <Button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-6 py-3 rounded-2xl">
                    <Plus size={20} /> {showCreate ? 'Close Portal' : 'New Brand Account'}
                </Button>
            </div>

            <AnimatePresence>
                {showCreate && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 mb-8 relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Plus size={20} className="text-emerald-400" /> Provision New Brand
                            </h3>
                            <form onSubmit={handleCreateBrand} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-2">Brand Identity</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Nike, RedBull"
                                        value={newBrand.name}
                                        onChange={(e) => setNewBrand({...newBrand, name: e.target.value})}
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-2">Admin Email</label>
                                    <input
                                        type="email"
                                        placeholder="brand@example.com"
                                        value={newBrand.email}
                                        onChange={(e) => setNewBrand({...newBrand, email: e.target.value})}
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-2">Secure Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newBrand.password}
                                        onChange={(e) => setNewBrand({...newBrand, password: e.target.value})}
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                </div>
                                <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="rounded-xl px-6">Discard</Button>
                                    <Button type="submit" className="rounded-xl px-8 bg-emerald-500 hover:bg-emerald-600 text-black">Create Enterprise Account</Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-8">
                {brands.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem] text-white/20">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No enterprise accounts found in the database.</p>
                    </div>
                ) : brands.map(brand => (
                    <BrandCard key={brand.id} brand={brand} token={token} allCampaigns={campaigns} />
                ))}
            </div>
        </div>
    );
};

const BrandCard = ({ brand, token, allCampaigns }: { brand: any, token: string | null, allCampaigns: any[] }) => {
    const [assigned, setAssigned] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [resetting, setResetting] = useState(false);

    const fetchAssigned = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/brands/${brand.id}/campaigns`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setAssigned(json.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAssigned();
    }, [brand.id, token]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            Toast.fire({ title: 'Error', text: 'Password must be at least 6 characters', icon: 'error' });
            return;
        }
        setResetting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${brand.id}/password`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: newPassword })
            });
            const json = await res.json();
            if (json.success) {
                Toast.fire({ title: 'Success', text: 'Password updated.', icon: 'success' });
                setShowPasswordReset(false);
                setNewPassword('');
            } else {
                Toast.fire({ title: 'Error', text: json.error, icon: 'error' });
            }
        } catch (err: any) {
            Toast.fire({ title: 'Error', text: err.message, icon: 'error' });
        } finally {
            setResetting(false);
        }
    };

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500"
            >
                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-3xl font-bold shadow-2xl">
                            {brand.name ? brand.name.charAt(0).toUpperCase() : <Box size={24} />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight">{brand.name || 'Unnamed Brand'}</h3>
                            <p className="text-white/30 font-mono text-sm">{brand.email}</p>
                            <div className="flex gap-2 mt-3">
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    {assigned.length} Campaigns Linked
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                        <Button 
                            onClick={() => setShowPasswordReset(!showPasswordReset)}
                            className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm"
                        >
                            <Key size={16} /> Security
                        </Button>
                        <Button 
                            onClick={() => setShowModal(true)}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-2"
                        >
                            <Settings2 size={18} /> Manage Access
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {showPasswordReset && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/40 border-t border-white/5 overflow-hidden"
                        >
                            <form onSubmit={handleResetPassword} className="p-8 flex flex-col md:flex-row items-end gap-4 max-w-2xl">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-2 flex items-center gap-2">
                                        <ShieldAlert size={12} className="text-amber-400" /> New Security Key
                                    </label>
                                    <input 
                                        type="password"
                                        placeholder="Enter new brand password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-black/80 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={resetting}
                                    className="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/20 rounded-2xl px-6 py-3 font-bold transition-all whitespace-nowrap h-[52px]"
                                >
                                    {resetting ? 'Updating...' : 'Update Password'}
                                </Button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <BrandAssignmentModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                brand={brand} 
                assigned={assigned} 
                allCampaigns={allCampaigns} 
                onUpdate={fetchAssigned}
                token={token}
            />
        </>
    );
};

const BrandAssignmentModal = ({ isOpen, onClose, brand, assigned, allCampaigns, onUpdate, token }: any) => {
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const filtered = allCampaigns.filter((c: any) => 
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleToggle = async (campaignId: string, isAssigned: boolean) => {
        setSaving(true);
        try {
            if (isAssigned) {
                // Remove
                await fetch(`${import.meta.env.VITE_API_URL}/admin/brands/${brand.id}/campaigns/${campaignId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                // Add
                await fetch(`${import.meta.env.VITE_API_URL}/admin/brands/${brand.id}/campaigns`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ campaignId })
                });
            }
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold uppercase tracking-tight">Access Control</h3>
                        <p className="text-white/40 text-sm">Managing campaigns for <span className="text-emerald-400">{brand.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/30 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 bg-white/[0.02]">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        <input 
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/40 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {filtered.map((camp: any) => {
                        const isAssigned = assigned.some((a: any) => a.id === camp.id);
                        return (
                            <div 
                                key={camp.id}
                                className={`flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 ${
                                    isAssigned ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div>
                                    <h4 className={`font-bold transition-colors ${isAssigned ? 'text-emerald-400' : 'text-white'}`}>{camp.title}</h4>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">${camp.total_budget} Budget</p>
                                </div>
                                
                                <button
                                    disabled={saving}
                                    onClick={() => handleToggle(camp.id, isAssigned)}
                                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                        isAssigned 
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                                        : 'bg-emerald-500 text-black hover:bg-emerald-600'
                                    }`}
                                >
                                    {isAssigned ? 'Remove Access' : 'Grant Access'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="p-8 border-t border-white/5 bg-black/40 flex justify-end">
                    <Button onClick={onClose} className="rounded-2xl px-10">Done</Button>
                </div>
            </motion.div>
        </div>
    );
};
