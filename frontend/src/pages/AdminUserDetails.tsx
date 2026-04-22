import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { 
    ChevronLeft, Shield, ShieldCheck, 
    MessageSquare, Mail, 
    User as UserIcon,
    AlertTriangle,
    Wallet, TrendingUp, History, Landmark, DollarSign
} from 'lucide-react';
import Swal from 'sweetalert2';

const YoutubeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

const InstagramIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
);

interface User {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    discord_id: string;
    discord_verified: boolean;
    youtube_verified: boolean;
    youtube_handle: string;
    instagram_verified: boolean;
    instagram_handle: string;
    is_blocked: boolean;
    role: 'admin' | 'user';
    created_at: string;
}

export const AdminUserDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [blockLoading, setBlockLoading] = useState(false);
    const [roleLoading, setRoleLoading] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [newRole, setNewRole] = useState<'admin' | 'user' | null>(null);
    const [earnings, setEarnings] = useState<any>(null);
    const [markingPaid, setMarkingPaid] = useState<string | null>(null);

    useEffect(() => {
        fetchUser();
        fetchEarnings();
    }, [id]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setUser(json.data);
        } catch (err) {
            console.error('Failed to fetch user:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEarnings = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}/earnings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setEarnings(json.data);
        } catch (err) {
            console.error('Failed to fetch earnings:', err);
        }
    };

    const handleMarkPaid = async (submissionId: string) => {
        const result = await Swal.fire({
            title: 'Mark as Paid?',
            text: 'This will move the earnings to the Claimed column.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#a855f7',
            cancelButtonColor: '#3f3f46',
            confirmButtonText: 'Yes, mark paid',
            background: '#0c0c0c',
            color: '#fff',
            customClass: { popup: 'rounded-[24px] border border-white/10' }
        });
        if (!result.isConfirmed) return;
        setMarkingPaid(submissionId);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/submissions/${submissionId}/status`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Paid' })
            });
            const json = await res.json();
            if (json.success) {
                Swal.fire({ title: 'Done', text: 'Marked as paid.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                fetchEarnings();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMarkingPaid(null);
        }
    };

    const handleToggleBlock = async () => {
        if (!user) return;
        setBlockLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}/block`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ block: !user.is_blocked })
            });
            const json = await res.json();
            if (json.success) {
                setUser({ ...user, is_blocked: !user.is_blocked });
            }
        } catch (err) {
            console.error('Failed to toggle block:', err);
        } finally {
            setBlockLoading(false);
        }
    };

    const handleUpdateRole = async () => {
        if (!user || !newRole) return;
        setRoleLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}/role`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            const json = await res.json();
            if (json.success) {
                setUser({ ...user, role: newRole });
                setIsRoleModalOpen(false);
            }
        } catch (err) {
            console.error('Failed to update role:', err);
        } finally {
            setRoleLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="text-white/40 mb-6">User not found.</p>
                <Link to="/admin/users">
                    <Button variant="secondary">Back to Users</Button>
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-8"
        >
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/admin/users')}
                    className="p-3 rounded-full bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] text-white/50 hover:text-white transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white/90">User Details</h1>
                    <p className="text-sm text-white/40">Clipper profile and security management.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col items-center">
                        <div className="relative group">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} className="w-24 h-24 rounded-3xl border-2 border-white/10 shadow-2xl" alt={user.name} />
                            ) : (
                                <div className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-white/10 flex items-center justify-center text-white/20 text-3xl font-bold uppercase">
                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-black border border-white/10 text-white/80">
                                <UserIcon className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="mt-6 text-center space-y-1">
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">{user.name || 'Anonymous'}</h2>
                            <p className="text-sm text-white/40 font-mono">{user.email}</p>
                        </div>

                        <div className="w-full mt-8 pt-8 border-t border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Status</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${user.is_blocked ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                    {user.is_blocked ? 'Blocked' : 'Active'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Joined</span>
                                <span className="text-[11px] text-white/50 font-mono">{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 text-white/40">
                            <Shield className="w-5 h-5 opacity-80" />
                            <h3 className="text-sm font-bold uppercase tracking-widest">Administrative Role</h3>
                        </div>
                        <p className="text-xs text-white/30 leading-relaxed">
                            {user.role === 'admin' 
                                ? "This user has full administrative access. Revoking this will restrict them to standard clipper permissions."
                                : "Promoting this user to Admin will grant them access to this panel, user metrics, and campaign management."}
                        </p>
                        <Button 
                            onClick={() => {
                                setNewRole(user.role === 'admin' ? 'user' : 'admin');
                                setIsRoleModalOpen(true);
                            }}
                            disabled={roleLoading}
                            variant="secondary" 
                            className="w-full rounded-2xl py-3.5 text-xs uppercase font-bold tracking-[0.15em] bg-white/5 hover:bg-white/10 text-white border-white/10"
                        >
                            {roleLoading ? 'Updating...' : (user.role === 'admin' ? 'Revoke Admin' : 'Make Admin')}
                        </Button>
                    </div>

                    <div className="p-8 rounded-[40px] bg-red-500/[0.02] border border-red-500/10 space-y-4">
                        <div className="flex items-center gap-3 text-red-400">
                            <AlertTriangle className="w-5 h-5 opacity-80" />
                            <h3 className="text-sm font-bold uppercase tracking-widest">Security Action</h3>
                        </div>
                        <p className="text-xs text-white/30 leading-relaxed">
                            Blocking this user will immediately revoke their API access. They will be unable to log in or submit clips.
                        </p>
                        <Button 
                            onClick={handleToggleBlock}
                            disabled={blockLoading}
                            variant={user.is_blocked ? 'outline' : 'danger'} 
                            className={`w-full rounded-2xl py-3.5 text-xs uppercase font-bold tracking-[0.15em] ${user.is_blocked ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5' : 'bg-red-500 hover:bg-red-600 border-0'}`}
                        >
                            {blockLoading ? 'Processing...' : (user.is_blocked ? 'Unblock Account' : 'Block Account')}
                        </Button>
                    </div>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Social Verification Card */}
                    <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <h3 className="text-lg font-medium text-white/90 mb-8 flex items-center gap-3">
                            <Shield className="w-5 h-5 text-white/40" />
                            Verification Status
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Discord */}
                            <div className={`p-6 rounded-3xl border ${user.discord_verified ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <MessageSquare className={`w-6 h-6 ${user.discord_verified ? 'text-indigo-400' : 'text-white/20'}`} />
                                    {user.discord_verified && <ShieldCheck className="w-4 h-4 text-indigo-400" />}
                                </div>
                                <h4 className="text-xs font-bold text-white/90 uppercase tracking-widest mb-1 font-sans">Discord</h4>
                                <p className="text-[11px] text-white/30 font-mono truncate">{user.discord_id || 'Not linked'}</p>
                            </div>

                            {/* YouTube */}
                            <div className={`p-6 rounded-3xl border ${user.youtube_verified ? 'bg-red-500/10 border-red-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={user.youtube_verified ? '' : 'opacity-20 grayscale'}>
                                        <YoutubeIcon />
                                    </div>
                                    {user.youtube_verified && <ShieldCheck className="w-4 h-4 text-red-400" />}
                                </div>
                                <h4 className="text-xs font-bold text-white/90 uppercase tracking-widest mb-1 font-sans">YouTube</h4>
                                <p className="text-[11px] text-white/30 font-mono truncate">{user.youtube_handle || 'Not linked'}</p>
                            </div>

                            {/* Instagram */}
                            <div className={`p-6 rounded-3xl border ${user.instagram_verified ? 'bg-pink-500/10 border-pink-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={user.instagram_verified ? '' : 'opacity-20 grayscale'}>
                                        <InstagramIcon />
                                    </div>
                                    {user.instagram_verified && <ShieldCheck className="w-4 h-4 text-pink-400" />}
                                </div>
                                <h4 className="text-xs font-bold text-white/90 uppercase tracking-widest mb-1 font-sans">Instagram</h4>
                                <p className="text-[11px] text-white/30 font-mono truncate">{user.instagram_handle || 'Not linked'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Earnings Card */}
                    <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <h3 className="text-lg font-medium text-white/90 mb-8 flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-white/40" />
                            Earnings Overview
                        </h3>

                        {earnings ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    {[
                                        { label: 'Total', value: earnings.totalEarnings, icon: TrendingUp, color: 'text-blue-500' },
                                        { label: 'Available', value: earnings.availableBalance, icon: Wallet, color: 'text-emerald-500' },
                                        { label: 'Claimable', value: earnings.pendingPayout, icon: History, color: 'text-amber-500' },
                                        { label: 'Claimed', value: earnings.claimed, icon: Landmark, color: 'text-purple-500' },
                                    ].map((s, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                                                {s.label}
                                            </p>
                                            <p className="text-xl font-mono font-bold text-white/90">${s.value.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {earnings.breakdown.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white/80 truncate">{item.campaignTitle}</p>
                                                <p className="text-[10px] text-white/30 font-mono truncate">{item.url}</p>
                                            </div>
                                            <div className="flex items-center gap-4 ml-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-mono font-bold text-white/90">${item.earnings.toFixed(2)}</p>
                                                    <p className="text-[9px] text-white/30 font-mono">{item.views?.toLocaleString()} views</p>
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border whitespace-nowrap ${
                                                    item.status === 'Paid' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                                                    item.status === 'Verified' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                                    item.status === 'Pending' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                                                    'text-red-400 bg-red-500/10 border-red-500/20'
                                                }`}>{item.status}</span>
                                                {item.status !== 'Paid' && item.status !== 'Rejected' && (
                                                    <button
                                                        disabled={markingPaid === item.id}
                                                        onClick={() => handleMarkPaid(item.id)}
                                                        className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all whitespace-nowrap disabled:opacity-50"
                                                    >
                                                        {markingPaid === item.id ? '...' : 'Mark Paid'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {earnings.breakdown.length === 0 && (
                                        <p className="text-center py-8 text-[10px] text-white/30 uppercase tracking-widest">No submissions yet.</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-center py-8">
                                <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Metadata Card */}
                    <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] bg-white/[0.02] border border-white/[0.05]">
                        <h3 className="text-lg font-medium text-white/90 mb-8 flex items-center gap-3">
                            <Mail className="w-5 h-5 text-white/40" />
                            Account Metadata
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">External Reference</p>
                                    <p className="text-sm font-mono text-white/60 truncate">{user.id}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Contact Email</p>
                                    <p className="text-sm font-mono text-white/60">{user.email}</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/5">
                                <p className="text-[11px] text-white/40 italic">Note: User metadata is managed via Supabase Auth and synced on each login.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Confirmation Modal */}
            <AnimatePresence>
                {isRoleModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ y: 20, scale: 0.95, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 20, scale: 0.95, opacity: 0 }}
                            className="bg-[#0D0D0D] border border-white/10 rounded-[40px] p-10 max-w-sm w-full relative shadow-[0_32px_64px_-16px_rgba(0,0,0,1)] text-center"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Shield className="w-10 h-10 text-white/80" />
                            </div>
                            
                            <h2 className="text-2xl font-bold tracking-tight mb-2">Change User Role?</h2>
                            <p className="text-sm text-white/40 leading-relaxed mb-8">
                                Are you sure you want to change <span className="text-white font-medium">{user.name || user.email}</span>'s role to <span className="text-white font-bold uppercase tracking-widest">{newRole}</span>?
                            </p>

                            <div className="space-y-3">
                                <Button 
                                    className="w-full rounded-2xl py-4 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90"
                                    onClick={handleUpdateRole}
                                    disabled={roleLoading}
                                >
                                    {roleLoading ? 'Updating...' : 'Yes, Confirm Change'}
                                </Button>
                                <button 
                                    onClick={() => setIsRoleModalOpen(false)}
                                    className="w-full py-4 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
