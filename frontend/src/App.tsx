import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
    LayoutGrid, 
    Compass, 
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

// Navigation Sidebar
const Sidebar = ({ isOpen, closeMenu }: { isOpen: boolean, closeMenu: () => void }) => {
    const location = useLocation();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';
    const isAdminPortal = location.pathname.startsWith('/admin');
    
    return (
        <aside className={`fixed left-0 top-0 h-[100dvh] w-64 border-r border-white/10 bg-black/95 backdrop-blur-xl z-[100] flex flex-col px-6 py-8 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-8">
                <Link to="/dashboard" className="flex items-center gap-2.5 group">
                    <img src="/logo.webp" alt="Logo" className="h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
                    <span className="text-xl font-bold tracking-tight text-white/90">
                        clipnic<sup className="text-[10px] text-emerald-500/80 ml-0.5 font-bold">TM</sup>
                    </span>
                </Link>
                <button onClick={closeMenu} className="md:hidden text-white/50 hover:text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>


            {!isAdminPortal ? (
                <>
                    <div className="mb-4 text-xs font-bold text-white/30 uppercase tracking-widest px-3">Clipper Portal</div>
                    <nav className="flex flex-col gap-2 text-sm font-medium mb-10 overflow-y-auto">
                        <Link onClick={closeMenu} to="/dashboard" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/dashboard' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <LayoutGrid size={18} />
                            Dashboard
                        </Link>
                        <Link onClick={closeMenu} to="/campaigns" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/campaigns' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Compass size={18} />
                            Browse Campaigns
                        </Link>
                        <Link onClick={closeMenu} to="/campaigns/joined" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/campaigns/joined' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Target size={18} />
                            My Missions
                        </Link>
                        <Link onClick={closeMenu} to="/submissions" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/submissions') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Upload size={18} />
                            My Submissions
                        </Link>
                        <Link onClick={closeMenu} to="/earnings" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/earnings' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <DollarSign size={18} />
                            Earnings
                        </Link>
                        <Link onClick={closeMenu} to="/profile" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/profile' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <UserIcon size={18} />
                            Profile
                        </Link>
                    </nav>
                </>
            ) : (
                <>
                    <div className="mb-4 text-xs font-bold text-white/30 uppercase tracking-widest px-3">Admin Portal</div>
                    <nav className="flex flex-col gap-2 text-sm font-medium pb-8 overflow-y-auto mb-10">
                        <Link onClick={closeMenu} to="/admin" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/admin' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <BarChart3 size={18} />
                            Dashboard
                        </Link>
                        <Link onClick={closeMenu} to="/admin/campaigns" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/admin/campaigns') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Box size={18} />
                            Campaigns Mgmt
                        </Link>
                        <Link onClick={closeMenu} to="/admin/submissions" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/admin/submissions') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Upload size={18} />
                            Submissions Mgmt
                        </Link>
                        <Link onClick={closeMenu} to="/admin/users" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/admin/users') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Users size={18} />
                            Users Mgmt
                        </Link>
                        <Link onClick={closeMenu} to="/admin/settings" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/admin/settings') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Settings size={18} />
                            Settings
                        </Link>
                    </nav>
                </>
            )}

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
                
                // Set initial state from session
                login(instantUser, session.access_token);

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
            
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <img src="/logo.webp" alt="Logo" className="h-7 w-auto object-contain" />
                    <span className="text-lg font-bold tracking-tight text-white/90">
                        clipnic<sup className="text-[8px] text-emerald-500/80 ml-0.5">TM</sup>
                    </span>
                </Link>
                <button onClick={() => setMobileMenuOpen(true)} className="text-white/70 hover:text-white">
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar isOpen={mobileMenuOpen} closeMenu={() => setMobileMenuOpen(false)} />
            
            {/* Mobile overlay backdrop */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <main className="flex-1 md:ml-64 min-h-screen overflow-x-hidden">
               <div className="px-4 sm:px-6 md:px-12 pt-6 md:pt-16 pb-24 max-w-7xl mx-auto">
                   <AnimatePresence mode="wait">
                     <Routes>
                       <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
