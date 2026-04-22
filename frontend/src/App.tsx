import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
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
import { Login } from './pages/Login';
import { supabase } from './lib/supabase';
import { useEffect } from 'react';
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
                <img src="/logo.webp" alt="Clipnic Logo" className="h-10 w-auto object-contain" />
                <button onClick={closeMenu} className="md:hidden text-white/50 hover:text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>


            {!isAdminPortal ? (
                <>
                    <div className="mb-4 text-xs font-bold text-white/30 uppercase tracking-widest px-3">Clipper Portal</div>
                    <nav className="flex flex-col gap-2 text-sm font-medium mb-10 overflow-y-auto">
                        <Link onClick={closeMenu} to="/dashboard" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/dashboard' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                            Dashboard
                        </Link>
                        <Link onClick={closeMenu} to="/campaigns" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/campaigns') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M3 18h6"/><path d="M3 21h6"/></svg>
                            Browse Campaigns
                        </Link>
                        <Link onClick={closeMenu} to="/submissions" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/submissions') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            My Submissions
                        </Link>
                        <Link onClick={closeMenu} to="/earnings" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/earnings' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Earnings
                        </Link>
                        <Link onClick={closeMenu} to="/profile" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/profile' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Profile
                        </Link>
                    </nav>
                </>
            ) : (
                <>
                    <div className="mb-4 text-xs font-bold text-white/30 uppercase tracking-widest px-3">Admin Portal</div>
                    <nav className="flex flex-col gap-2 text-sm font-medium pb-8 overflow-y-auto mb-10">
                        <Link onClick={closeMenu} to="/admin" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/admin' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                            Dashboard
                        </Link>
                        <Link onClick={closeMenu} to="/admin/campaigns" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/admin/campaigns') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                            Campaigns Mgmt
                        </Link>
                        <Link onClick={closeMenu} to="/admin/submissions" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/admin/submissions') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            Submissions Mgmt
                        </Link>
                        <Link onClick={closeMenu} to="/admin/users" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/admin/users') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Users Mgmt
                        </Link>
                        <Link onClick={closeMenu} to="/admin/settings" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/admin/settings') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
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
                        <svg className={`transition-transform duration-500 ${isAdminPortal ? 'group-hover:-rotate-12' : 'group-hover:rotate-12'}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {isAdminPortal ? (
                                <>
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </>
                            ) : (
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            )}
                        </svg>
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
                    <svg className="transition-colors group-hover:text-red-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
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
    const { login, logout } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        const syncBackend = async (session: any) => {
            if (session) {
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
                }
            } else {
                logout();
            }
        };

        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            syncBackend(session);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            syncBackend(session);
        });

        return () => subscription.unsubscribe();
    }, [login, logout]);

    // Loading state for initial session check
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
                <img src="/logo.webp" alt="Clipnic Logo" className="h-8 w-auto object-contain" />
                <button onClick={() => setMobileMenuOpen(true)} className="text-white/70 hover:text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
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
