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
    Menu,
    Bug
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
import { AdminPayouts } from './pages/AdminPayouts';
import { AdminCampaignDetails } from './pages/AdminCampaignDetails';
import { JoinedCampaigns } from './pages/JoinedCampaigns';
import { Login } from './pages/Login';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';
import { Onboarding } from './components/Onboarding';
import { Footer } from './components/Footer';
import { BugReportModal } from './components/BugReportModal';
import { AlertModal } from './components/ui/AlertModal';
import { ToastContainer } from './components/ui/ToastContainer';


const BrandUnderConstruction = () => (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-2xl space-y-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10"
            >
                <Box size={48} className="text-white/20" />
            </motion.div>
            <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tighter uppercase glassy-text">Under Development</h1>
                <p className="text-white/40 text-lg font-light">The brands webpage is currently under development. For inquiries or to get started, please contact us via Discord.</p>
            </div>
            <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
                <a 
                    href="https://discord.gg/8KXdFCxZsR" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-8 py-3 rounded-full bg-[#5865F2] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#4752C4] transition-all flex items-center justify-center gap-2"
                >
                    Join Our Discord
                </a>
                <Link to="/" className="px-8 py-3 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">Return to Core</Link>
            </div>
        </div>
    </div>
);

const NotFound = () => (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="relative inline-block"
            >
                <div className="w-32 h-32 bg-white/5 rounded-[40px] flex items-center justify-center border border-white/10 shadow-2xl relative z-10">
                    <LayoutGrid size={48} className="text-white/10" />
                </div>
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-white/10 blur-3xl -z-10 rounded-full"
                />
                <div className="absolute -top-4 -right-4 bg-red-500 text-white font-mono font-bold text-lg w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-black rotate-12 shadow-xl">
                    404
                </div>
            </motion.div>

            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter uppercase glassy-text">Transmission Lost</h1>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">The resource you are looking for has been purged or moved to a restricted sector.</p>
            </div>

            <Link to="/clippers/campaigns">
                <Button className="rounded-2xl px-12 py-5 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-white/90 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                    Return to Feed
                </Button>
            </Link>
        </div>
    </div>
);

const Sidebar = ({ isOpen, closeMenu, onReportBug }: { isOpen: boolean, closeMenu: () => void, onReportBug: () => void }) => {
    const location = useLocation();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';
    const isAdminPortal = location.pathname.startsWith('/admin');

    return (
        <aside className={`w-72 border-r border-white/10 bg-black/95 backdrop-blur-xl z-[100] flex flex-col px-6 py-8 transition-transform duration-500 ease-[0.16,1,0.3,1] ${isOpen ? 'fixed inset-y-0 left-0 translate-x-0 h-full' : 'fixed inset-y-0 left-0 -translate-x-full md:sticky md:top-0 md:h-screen md:translate-x-0'} ${isAdminPortal ? 'hidden md:hidden' : 'flex'}`}>
            <div className="flex items-center justify-between mb-8">
                <Link to="/clippers/campaigns" className="flex items-center gap-2 group">
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
                        <Link id="sidebar-active-campaigns" onClick={closeMenu} to="/clippers/campaigns" className={`transition-all py-3 px-4 rounded-xl flex items-center gap-3 ${location.pathname === '/clippers/campaigns' ? 'bg-white/15 text-white font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'text-white/40 hover:text-white/90 hover:bg-white/5'}`}>
                            <Globe size={18} className={location.pathname === '/clippers/campaigns' ? 'text-emerald-400' : ''} />
                            <span className="glassy-text">Active Campaigns</span>
                        </Link>
                    </nav>

                    <div className="mb-4 text-xs font-bold text-white/20 uppercase tracking-[0.2em] px-4 py-2 rounded-xl glassy-glow-premium">Clipper Portal</div>
                    <nav className="flex flex-col gap-2 text-sm font-medium mb-10 overflow-y-auto">
                        <Link id="sidebar-dashboard" onClick={closeMenu} to="/clippers/dashboard" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/clippers/dashboard' ? 'bg-white/15 text-white border border-white/5' : 'text-white/40 hover:text-white/90 hover:bg-white/5'}`}>
                            <LayoutGrid size={18} />
                            <span className="glassy-text">Dashboard</span>
                        </Link>
                        <Link id="sidebar-joined" onClick={closeMenu} to="/clippers/campaigns/joined" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/clippers/campaigns/joined' ? 'bg-white/15 text-white border border-white/5' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Target size={18} />
                            <span className="glassy-text">Joined Campaigns</span>
                        </Link>
                        <Link id="sidebar-submissions" onClick={closeMenu} to="/clippers/submissions" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname.startsWith('/clippers/submissions') ? 'bg-white/15 text-white border border-white/5' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <Upload size={18} />
                            <span className="glassy-text">My Submissions</span>
                        </Link>
                        <Link id="sidebar-earnings" onClick={closeMenu} to="/clippers/earnings" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/clippers/earnings' ? 'bg-white/15 text-white border border-white/5' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <DollarSign size={18} />
                            <span className="glassy-text">Earnings</span>
                        </Link>
                        <Link id="sidebar-profile" onClick={closeMenu} to="/clippers/profile" className={`transition-colors py-2 px-3 rounded-lg flex items-center gap-3 ${location.pathname === '/clippers/profile' ? 'bg-white/15 text-white border border-white/5' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                            <UserIcon size={18} />
                            <span className="glassy-text">Profile</span>
                        </Link>
                    </nav>
                </>
            ) : null}

            <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                {isAdmin && (
                    <Link
                        to={isAdminPortal ? "/clippers/dashboard" : "/admin"}
                        onClick={closeMenu}
                        className="w-full transition-all py-3 px-4 rounded-xl flex items-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.1)] group"
                    >
                        <Shield size={18} className={`transition-transform duration-500 ${isAdminPortal ? 'group-hover:-rotate-12' : 'group-hover:rotate-12'}`} />
                        {isAdminPortal ? "Switch to Clipper View" : "Go to Admin Dash"}
                    </Link>
                )}

                <button
                    onClick={onReportBug}
                    className="w-full transition-colors py-2 px-3 rounded-lg flex items-center gap-3 text-white/30 hover:text-white/70 hover:bg-white/5 group"
                >
                    <Bug size={18} className="transition-colors group-hover:text-red-400" />
                    Report Bug
                </button>

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
        { to: '/admin/payouts', icon: DollarSign, label: 'Payouts' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/settings', icon: Settings, label: 'Setup' },
        { to: '/clippers/dashboard', icon: UserIcon, label: 'Exit Admin', color: 'text-emerald-400' }
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
        return <Navigate to="/clippers/dashboard" replace state={{ from: location }} />;
    }

    return <>{children}</>;
};

// Layout
const Layout = ({ onReportBug }: { onReportBug: () => void }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { login, logout, user, updateUser } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        const syncBackend = async (session: any, isInitial = false) => {
            if (session) {
                setIsSyncing(true);
                // 1. Update store with metadata ONLY if we don't have a user or if it's the same user
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

                const { user: currentUser, login: storeLogin, updateUser } = useAuthStore.getState();

                // CRITICAL: Only overwrite if we don't have a user or if the IDs match 
                // BUT don't downgrade an existing 'admin' role with 'user' metadata
                if (currentUser && currentUser.id === session.user.id) {
                    const safeUpdate = { ...instantUser };
                    if (currentUser.role === 'admin' && instantUser.role === 'user') {
                        delete (safeUpdate as any).role; // Preserve admin role from store
                    }
                    updateUser(safeUpdate);
                } else {
                    storeLogin(instantUser, session.access_token);
                }

                // 2. Sync with backend in the background
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    });
                    const result = await response.json();
                    if (result.success) {
                        const userData = {
                            ...result.data,
                            avatarUrl: result.data.avatar_url,
                            discordVerified: result.data.discord_verified,
                            discordId: result.data.discord_id,
                            youtubeVerified: result.data.youtube_verified,
                            youtubeHandle: result.data.youtube_handle,
                            youtubeChannels: result.data.youtube_channels,
                            instagramVerified: result.data.instagram_verified,
                            instagramHandle: result.data.instagram_handle,
                            onboardingCompleted: result.data.onboarding_completed
                        };
                        login(userData, session.access_token, result.settings);
                    }
                } catch (err) {
                    console.error('Failed to sync with backend:', err);
                } finally {
                    setIsSyncing(false);
                    if (isInitial) setLoading(false);
                }
            } else {
                logout();
                setIsSyncing(false);
                if (isInitial) setLoading(false);
            }
        };

        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            // We await the FIRST sync to ensure we don't flicker unverified content
            syncBackend(session, true);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                syncBackend(session);
            } else if (event === 'SIGNED_OUT') {
                logout();
                setIsSyncing(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [login, logout]);

    useEffect(() => {
        // Check for onboarding
        if (user && !loading && !isSyncing) {
            const isAdmin = user.role === 'admin';
            // Only show to non-admins who haven't completed onboarding in DB
            if (!isAdmin && !user.onboardingCompleted) {
                setShowOnboarding(true);
            }
        }
    }, [user, loading, isSyncing]);

    const handleOnboardingComplete = async () => {
        setShowOnboarding(false);
        if (user) {
            try {
                // 1. Update store immediately for UI responsiveness
                updateUser({ onboardingCompleted: true });
                
                // 2. Persist to database
                await supabase
                    .from('users')
                    .update({ onboarding_completed: true })
                    .eq('id', user.id);
            } catch (err) {
                console.error('Failed to save onboarding status:', err);
            }
        }
    };

    // Only show full-screen loader if we're genuinely waiting for the first session check
    // OR if we're syncing and don't even have basic user info in the store yet.
    const currentUser = useAuthStore(s => s.user);
    if (loading || (isSyncing && !currentUser)) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-8">
                    <motion.div
                        animate={{ 
                            scale: [0.98, 1.05, 0.98],
                            opacity: [0.4, 0.8, 0.4]
                        }}
                        transition={{ 
                            duration: 2.5, 
                            repeat: Infinity,
                            ease: "easeInOut" 
                        }}
                        className="relative"
                    >
                        <img src="/logo.webp" alt="Loading..." className="w-16 h-16 object-contain brightness-125" />
                        <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl -z-10 scale-150" />
                    </motion.div>
                    <div className="flex items-center gap-3 justify-center">
                        <div className="w-1 h-1 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '300ms' }} />
                        <div className="w-1 h-1 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '600ms' }} />
                    </div>
                </div>
            </div>
        );
    }

    // If logged in and on login page, redirect to dashboard
    if (session && location.pathname === '/login') {
        return <Navigate to="/clippers/dashboard" replace />;
    }

    // Public Brand Page
    if (location.pathname === '/brand' || location.pathname === '/brands') {
        return <BrandUnderConstruction />;
    }

    // If not logged in and not on login page, redirect to login
    if (!session && location.pathname !== '/login') {
        return <Navigate to="/login" replace />;
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
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans flex flex-col">
            {showOnboarding && (
                <Onboarding 
                    onComplete={handleOnboardingComplete} 
                    openMenu={() => setMobileMenuOpen(true)} 
                    closeMenu={() => setMobileMenuOpen(false)}
                />
            )}
            
            <div className="flex flex-1 relative">
                <Sidebar isOpen={mobileMenuOpen} closeMenu={() => setMobileMenuOpen(false)} onReportBug={onReportBug} />
                
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Mobile Header */}
                    {!location.pathname.startsWith('/admin') && (
                        <div className="md:hidden flex-shrink-0 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6 z-50 sticky top-0">
                            <Link to="/clippers/campaigns" className="flex items-center gap-2">
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

                    {location.pathname.startsWith('/admin') && <AdminDock />}

                    {/* Mobile overlay backdrop */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            />
                        )}
                    </AnimatePresence>

                    <main className="flex-1 transition-all duration-300">
                        <div className="px-4 sm:px-6 md:px-12 pt-6 md:pt-16 pb-24 max-w-7xl mx-auto">
                            <AnimatePresence mode="wait">
                                <Routes>
                                    <Route path="/" element={<Navigate to="/clippers/campaigns" replace />} />
                                    
                                    {/* Clipper Routes */}
                                    <Route path="/clippers/dashboard" element={<ClipperDashboard />} />
                                    <Route path="/clippers/campaigns" element={<CampaignsFeed />} />
                                    <Route path="/clippers/campaigns/joined" element={<JoinedCampaigns />} />
                                    <Route path="/clippers/campaigns/:id" element={<CampaignDetails />} />
                                    <Route path="/clippers/submissions" element={<MySubmissions />} />
                                    <Route path="/clippers/earnings" element={<Earnings />} />
                                    <Route path="/clippers/profile" element={<Profile />} />

                                    {/* Admin Routes */}
                                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                                    <Route path="/admin/campaigns" element={<AdminRoute><AdminCampaigns /></AdminRoute>} />
                                    <Route path="/admin/campaigns/:id" element={<AdminRoute><AdminCampaignDetails /></AdminRoute>} />
                                    <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
                                    <Route path="/admin/payouts" element={<AdminRoute><AdminPayouts /></AdminRoute>} />
                                    <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                                    <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetails /></AdminRoute>} />
                                    <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

                                    {/* Fallback */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </div>
            {!location.pathname.startsWith('/admin') && <Footer />}
        </div>
    );
};

function App() {
    const [isBugReportOpen, setIsBugReportOpen] = useState(false);

    return (
        <BrowserRouter>
            <AlertModal />
            <ToastContainer />
            <BugReportModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />
            <Layout onReportBug={() => setIsBugReportOpen(true)} />
        </BrowserRouter>
    )

}

export default App;
