import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    LayoutGrid,
    Globe,
    Target,
    Upload,
    DollarSign,
    User as UserIcon,
    BarChart3,
    Box,
    Users,
    Settings,
    LogOut,
    Shield,
    Menu
} from 'lucide-react';
import { CampaignsFeed } from './pages/CampaignsFeed';
import { CampaignDetails } from './pages/CampaignDetails';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCampaigns } from './pages/AdminCampaigns';
import { ClipperDashboard } from './pages/ClipperDashboard';
import { MySubmissions } from './pages/MySubmissions';
import { Earnings } from './pages/Earnings';
import { AdminUsers } from './pages/AdminUsers';
import { AdminUserDetails } from './pages/AdminUserDetails';
import { AdminSettings } from './pages/AdminSettings';
import { AdminSubmissions } from './pages/AdminSubmissions';
import { JoinedCampaigns } from './pages/JoinedCampaigns';
import { Login } from './pages/Login';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';

const Sidebar = ({ isOpen, closeMenu }: { isOpen: boolean, closeMenu: () => void }) => {
    const location = useLocation();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';
    const isAdminPortal = location.pathname.startsWith('/admin');

    return (
        <aside className={`fixed left-0 top-0 h-[100dvh] w-72 border-r border-white/10 bg-black/95 backdrop-blur-xl z-[100] flex flex-col px-6 py-8 transition-transform duration-500 ease-[0.16,1,0.3,1] md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isAdminPortal ? 'hidden md:hidden' : 'flex'}`}>
            <div className="flex items-center justify-between mb-8">
                <Link to="/campaigns" className="flex items-center gap-2 group">
                    <img src="/logo.webp" alt="Logo" className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
                    <span className="text-xl font-bold tracking-tight text-premium-white">
                        CLIPNIC.COM
                    </span>
                </Link>
                <button onClick={closeMenu} className="md:hidden text-white/50 hover:text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
            </div>


            {!isAdminPortal ? (
                <>
                    <nav className="flex flex-col gap-2 text-sm font-medium mb-8 mt-14">
                        <Link onClick={closeMenu} to="/campaigns" className={`transition-all py-3 px-4 rounded-xl flex items-center gap-3 ${location.pathname === '/campaigns' ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'text-white/40 hover:text-white/90 hover:bg-white/5'}`}>
                            <Globe size={18} className={location.pathname === '/campaigns' ? 'text-emerald-400' : ''} />
                            <span className="glassy-text">Active Campaigns</span>
                        </Link>
                    </nav>

                    <div className="mb-4 text-xs font-bold text-white/20 uppercase tracking-[0.2em] px-4 py-2 rounded-xl glassy-glow-premium">Clipper Portal</div>
                    <nav className="flex flex-col gap-2 text-sm font-medium mb-10 overflow-y-auto">
                        <Link onClick={closeMenu} to="/dashboard" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/dashboard' ? 'bg-white/15 text-white border border-white/5' : 'text-white/40 hover:text-white/90 hover:bg-white/5'}`}>
                            <LayoutGrid size={18} />
                            <span className="glassy-text">Dashboard</span>
                        </Link>
                        <Link onClick={closeMenu} to="/campaigns/joined" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/campaigns/joined' ? 'bg-white/15 text-white border border-white/5' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Target size={18} />
                            <span className="glassy-text">My Missions</span>
                        </Link>
                        <Link onClick={closeMenu} to="/submissions" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/submissions') ? 'bg-white/15 text-white border border-white/5' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Upload size={18} />
                            <span className="glassy-text">My Submissions</span>
                        </Link>
                        <Link onClick={closeMenu} to="/earnings" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/earnings' ? 'bg-white/15 text-white border border-white/5' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <DollarSign size={18} />
                            <span className="glassy-text">Earnings</span>
                        </Link>
                        <Link onClick={closeMenu} to="/profile" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/profile' ? 'bg-white/15 text-white border border-white/5' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <UserIcon size={18} />
                            <span className="glassy-text">Profile</span>
                        </Link>
                    </nav>
                </>
            ) : null}

            <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                {isAdmin && (
                    <Link
                        to={isAdminPortal ? "/dashboard" : "/admin"}
                        onClick={closeMenu}
                        className="w-full transition-all py-3 px-4 rounded-xl flex items-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.1)] group"
                    >
                        <Shield size={18} className={`transition-transform duration-500 ${isAdminPortal ? 'group-hover:-rotate-12' : 'group-hover:rotate-12'}`} />
                        {isAdminPortal ? "Switch to Clipper View" : "Go to Admin Dash"}
                    </Link>
                )}

                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        closeMenu();
                    }}
                    className="w-full transition-colors py-2 px-3 rounded-lg flex items-center gap-3 text-white/50 hover:text-white/90 hover:bg-red-500/10 hover:text-red-400 group"
                >
                    <LogOut size={18} className="transition-colors group-hover:text-red-400" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

const AdminDock = () => {
    const location = useLocation();
    const isAdmin = useAuthStore(s => s.user?.role === 'admin');
    
    if (!isAdmin) return null;

    const items = [
        { to: '/admin', icon: BarChart3, label: 'Stats' },
        { to: '/admin/campaigns', icon: Box, label: 'Campaigns' },
        { to: '/admin/submissions', icon: Upload, label: 'Review' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/settings', icon: Settings, label: 'Setup' },
        { to: '/dashboard', icon: UserIcon, label: 'Exit Admin', color: 'text-emerald-400' }
    ];

    return (
        <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-max max-w-[95vw]">
            <div className="ios-glass flex items-center p-1 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
                {/* Surface Shine Gradient */}
                <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none rounded-t-full" />
                
                {items.map((item) => {
                    const isActive = location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to));
                    // Mobile-responsive icon size
                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                    const iconSize = isMobile ? 18 : 22;

                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`relative w-11 sm:w-16 h-11 sm:h-14 flex items-center justify-center transition-all duration-500 rounded-full group ${isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.05]'}`}
                        >
                            <item.icon size={iconSize} className={`${item.color || ''} ${isActive ? 'scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'scale-100'} transition-transform duration-500`} />
                            
                            {isActive && (
                                <motion.div 
                                    layoutId="dock-indicator" 
                                    className="absolute bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" 
                                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

// Admin Route Protector
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuthStore();
    const location = useLocation();

    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace state={{ from: location }} />;
    }

    return <>{children}</>;
};

// Layout
const Layout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const { login, logout } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        const syncBackend = async (session: any) => {
            if (session) {
                setIsSyncing(true);
                // 1. Instantly update store with metadata from the login session
                const metadata = session.user.user_metadata;
                const instantUser = {
                    id: session.user.id,
                    email: session.user.email,
                    name: metadata?.given_name
                        ? `${metadata.given_name} ${metadata.family_name || ''}`.trim()
                        : (metadata?.full_name || metadata?.name),
                    avatarUrl: metadata?.avatar_url || metadata?.picture,
                    role: (metadata?.role as 'admin' | 'user') || 'user'
                };

                // Set initial state from session metadata
                // We use updateUser if we already have a user in the store (e.g. from persistence)
                // to avoid overwriting detailed verification flags with basic session info.
                const { user: currentUser, login: storeLogin, updateUser } = useAuthStore.getState();
                if (currentUser && currentUser.id === session.user.id) {
                    updateUser(instantUser);
                } else {
                    storeLogin(instantUser, session.access_token);
                }

                // 2. Sync with backend in the background to ensure DB is up to date
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    });
                    const result = await response.json();
                    if (result.success) {
                        // Map snake_case from DB to camelCase for the frontend
                        const userData = {
                            ...result.data,
                            avatarUrl: result.data.avatar_url,
                            discordVerified: result.data.discord_verified,
                            discordId: result.data.discord_id,
                            youtubeVerified: result.data.youtube_verified,
                            youtubeHandle: result.data.youtube_handle,
                            youtubeChannels: result.data.youtube_channels,
                            instagramVerified: result.data.instagram_verified,
                            instagramHandle: result.data.instagram_handle
                        };
                        login(userData, session.access_token, result.settings);
                    }
                } catch (err) {
                    console.error('Failed to sync with backend:', err);
                } finally {
                    setIsSyncing(false);
                }
            } else {
                logout();
                setIsSyncing(false);
            }
        };

        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            syncBackend(session);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            // Only trigger a full sync on specific events to avoid flickering on visible change
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                syncBackend(session);
            } else if (event === 'SIGNED_OUT') {
                logout();
                setIsSyncing(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [login, logout]);

    // Only show full-screen loader if we're genuinely waiting for the first session check
    // OR if we're syncing and don't even have basic user info in the store yet.
    const currentUser = useAuthStore(s => s.user);
    if (loading || (isSyncing && !currentUser)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 text-center px-6">
                    <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
                    <div className="space-y-2">
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Syncing Session</p>
                        <p className="text-[9px] text-white/10 lowercase italic">Securing your connection...</p>
                    </div>
                </div>
            </div>
        );
    }

    // If not logged in and not on login page, redirect to login
    if (!session && location.pathname !== '/login') {
        return <Navigate to="/login" replace />;
    }

    // If logged in and on login page, redirect to dashboard
    if (session && location.pathname === '/login') {
        return <Navigate to="/dashboard" replace />;
    }

    // Show login page without sidebar layout
    if (location.pathname === '/login') {
        return (
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/login" element={<Login />} />
                </Routes>
            </AnimatePresence>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans flex flex-col md:flex-row">

            {/* Mobile Header - Hidden for Admins as they use the Dock */}
            {!location.pathname.startsWith('/admin') && (
                <div className="md:hidden sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6">
                    <Link to="/campaigns" className="flex items-center gap-2">
                        <img src="/logo.webp" alt="Logo" className="h-7 w-auto object-contain" />
                        <span className="text-lg font-bold tracking-tight text-premium-white">
                            clipnic.com
                        </span>
                    </Link>
                    <button onClick={() => setMobileMenuOpen(true)} className="text-white/70 hover:text-white">
                        <Menu size={24} />
                    </button>
                </div>
            )}

            <Sidebar isOpen={mobileMenuOpen} closeMenu={() => setMobileMenuOpen(false)} />
            {location.pathname.startsWith('/admin') && <AdminDock />}

            {/* Mobile overlay backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <main className={`flex-1 ${location.pathname.startsWith('/admin') ? 'md:ml-0' : 'md:ml-64'} min-h-screen overflow-x-hidden transition-all duration-300`}>
                <div className="px-4 sm:px-6 md:px-12 pt-6 md:pt-16 pb-24 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <Routes>
                            <Route path="/" element={<Navigate to="/campaigns" replace />} />
                            <Route path="/dashboard" element={<ClipperDashboard />} />
                            <Route path="/campaigns" element={<CampaignsFeed />} />
                            <Route path="/campaigns/joined" element={<JoinedCampaigns />} />
                            <Route path="/campaigns/:id" element={<CampaignDetails />} />
                            <Route path="/submissions" element={<MySubmissions />} />
                            <Route path="/earnings" element={<Earnings />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                            <Route path="/admin/campaigns" element={<AdminRoute><AdminCampaigns /></AdminRoute>} />
                            <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
                            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                            <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetails /></AdminRoute>} />
                            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                        </Routes>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    )
}

export default App;
