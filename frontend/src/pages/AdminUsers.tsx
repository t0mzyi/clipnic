import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Search, User as UserIcon, Shield, ShieldCheck, ShieldAlert, MessageSquare, ExternalLink, Filter } from 'lucide-react';

const YoutubeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

const InstagramIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
        >
            <div className="pb-6 border-b border-white/[0.08] relative">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-32 bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 mb-2 font-sans">User Management</h1>
                        <p className="text-white/40 text-lg font-light tracking-tight">Review clippers, verification status, and account access.</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/50 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search users by name or email..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-12 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                    />
                </div>
                <button className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all text-white/40">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Users Table */}
            <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-4 -mt-4">
                            <thead>
                                <tr className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-4">
                                    <th className="pb-4 pl-6">Clipper</th>
                                    <th className="pb-4">Role</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Verification</th>
                                    <th className="pb-4 Pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="group bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                                        <td className="py-5 pl-6 rounded-l-2xl border-y border-l border-white/[0.05]">
                                            <div className="flex items-center gap-4">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} className="w-10 h-10 rounded-full border border-white/10" alt={user.name} />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/40 text-xs uppercase font-bold">
                                                        {user.name?.charAt(0) || user.email?.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-white/90">{user.name || 'Anonymous'}</p>
                                                    <p className="text-[11px] text-white/30 font-mono">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 border-y border-white/[0.05]">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${user.role === 'admin' ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 text-white/40 border-white/5'}`}>
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="py-5 border-y border-white/[0.05]">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border flex items-center w-fit gap-1.5 ${user.is_blocked ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                {user.is_blocked ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                                {user.is_blocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-5 border-y border-white/[0.05]">
                                            <div className="flex gap-2.5">
                                                <div className={user.youtube_verified ? 'opacity-100' : 'opacity-20 grayscale'}>
                                                    <YoutubeIcon />
                                                </div>
                                                <div className={user.instagram_verified ? 'opacity-100' : 'opacity-20 grayscale'}>
                                                    <InstagramIcon />
                                                </div>
                                                <MessageSquare className={`w-4 h-4 ${user.discord_verified ? 'text-indigo-500' : 'text-white/10'}`} />
                                            </div>
                                        </td>
                                        <td className="py-5 pr-6 rounded-r-2xl border-y border-r border-white/[0.05] text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <button
                                                    onClick={() => handleUpdateRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                                    disabled={actionLoading === user.id}
                                                    className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border transition-all ${user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-red-500 text-white border-red-500 hover:bg-red-600'}`}
                                                >
                                                    {actionLoading === user.id ? '...' : (user.role === 'admin' ? 'Revoke' : 'Make Admin')}
                                                </button>
                                                <Link 
                                                    to={`/admin/users/${user.id}`}
                                                    className="inline-flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-white transition-colors"
                                                >
                                                    Details
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
