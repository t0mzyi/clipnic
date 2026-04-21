import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Search, ShieldCheck, ShieldAlert, MessageSquare, ExternalLink, Users } from 'lucide-react';

const YoutubeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

const InstagramIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
);
import { Link } from 'react-router-dom';

interface User {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    discord_id: string;
    discord_verified: boolean;
    youtube_verified: boolean;
    instagram_verified: boolean;
    is_blocked: boolean;
    role: 'admin' | 'user';
}

export const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const fetchUsers = async () => {
        try {
            const url = new URL(`${import.meta.env.VITE_API_URL}/admin/users`);
            if (search) url.searchParams.append('q', search);
            
            const res = await fetch(url.toString(), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setUsers(json.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: 'admin' | 'user') => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
        
        setActionLoading(userId);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            const json = await res.json();
            if (json.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
        } catch (err) {
            console.error('Failed to update role:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const adminCount = users.filter(u => u.role === 'admin').length;
    const verifiedCount = users.filter(u => u.discord_verified || u.youtube_verified).length;
    const blockedCount = users.filter(u => u.is_blocked).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="pb-6 border-b border-white/[0.06]">
                <h1 className="text-3xl font-bold tracking-tight text-white/90 mb-1">User Management</h1>
                <p className="text-white/30 text-sm font-light">Review clippers, verification status, and account access.</p>
            </div>

            {/* Quick Stat Chips */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-sm">
                    <Users className="w-4 h-4 text-white/30" />
                    <span className="text-white/40">{users.length}</span>
                    <span className="text-white/20 text-xs">Total</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 text-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-400 font-bold">{adminCount}</span>
                    <span className="text-red-400/40 text-xs">Admins</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-400 font-bold">{verifiedCount}</span>
                    <span className="text-emerald-400/40 text-xs">Verified</span>
                </div>
                {blockedCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/5 border border-orange-500/10 text-sm">
                        <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-orange-400 font-bold">{blockedCount}</span>
                        <span className="text-orange-400/40 text-xs">Blocked</span>
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/40 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#0c0c0c] border border-white/[0.06] rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none focus:border-white/15 transition-all placeholder:text-white/15"
                />
            </div>

            {/* Users Table */}
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
                                    <th className="px-6 py-4">Clipper</th>
                                    <th className="px-4 py-4">Role</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4">Socials</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {users.map((user) => {
                                    const isAdmin = user.role === 'admin';
                                    return (
                                        <tr key={user.id} className={`group hover:bg-white/[0.02] transition-all duration-200 ${isAdmin ? 'bg-red-500/[0.02]' : ''}`}>
                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`relative shrink-0 ${isAdmin ? 'ring-2 ring-red-500/40 rounded-full' : ''}`}>
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} className="w-9 h-9 rounded-full border border-white/10" alt={user.name} />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.06] text-white/30 text-xs font-bold uppercase">
                                                                {user.name?.charAt(0) || user.email?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-white/90 truncate">{user.name || 'Anonymous'}</p>
                                                        <p className="text-[11px] text-white/25 font-mono truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Badge */}
                                            <td className="px-4 py-4">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border inline-flex items-center gap-1 ${isAdmin ? 'bg-red-500 text-white border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'bg-white/[0.03] text-white/30 border-white/[0.05]'}`}>
                                                    {isAdmin && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                                    {user.role || 'user'}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 ${user.is_blocked ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                    {user.is_blocked ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                                    {user.is_blocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>

                                            {/* Verification Icons */}
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2 items-center">
                                                    <div className={`p-1.5 rounded-lg border ${user.youtube_verified ? 'bg-red-500/10 border-red-500/20' : 'bg-white/[0.02] border-white/[0.04] opacity-25'}`}>
                                                        <YoutubeIcon />
                                                    </div>
                                                    <div className={`p-1.5 rounded-lg border ${user.instagram_verified ? 'bg-pink-500/10 border-pink-500/20' : 'bg-white/[0.02] border-white/[0.04] opacity-25'}`}>
                                                        <InstagramIcon />
                                                    </div>
                                                    <div className={`p-1.5 rounded-lg border ${user.discord_verified ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/[0.02] border-white/[0.04] opacity-25'}`}>
                                                        <MessageSquare className={`w-3.5 h-3.5 ${user.discord_verified ? 'text-indigo-400' : 'text-white/20'}`} />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleUpdateRole(user.id, isAdmin ? 'user' : 'admin')}
                                                        disabled={actionLoading === user.id}
                                                        className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${isAdmin ? 'bg-white/[0.04] text-white/40 border-white/[0.06] hover:bg-white/[0.08]' : 'bg-red-500 text-white border-red-500 hover:bg-red-600 shadow-[0_2px_8px_rgba(239,68,68,0.2)]'}`}
                                                    >
                                                        {actionLoading === user.id ? '...' : (isAdmin ? 'Revoke' : 'Make Admin')}
                                                    </button>
                                                    <Link 
                                                        to={`/admin/users/${user.id}`}
                                                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-white/50 transition-colors"
                                                    >
                                                        View
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-white/20 text-sm font-light italic">
                                            No users found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
