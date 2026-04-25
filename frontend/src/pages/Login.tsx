import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { supabase } from '../lib/supabase';

import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { Toast } from '../lib/swal';

export const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, token: existingToken } = useAuthStore();

    useEffect(() => {
        // Handle token from custom backend Google Auth
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (token) {
            // We have a token from our backend! 
            // We'll call /sync to get user data and populate the store.
            const fetchUser = async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const json = await res.json();
                    if (json.success) {
                        login(json.data, token, json.settings);
                        navigate('/clippers/dashboard');
                    } else {
                        Toast.fire({ title: 'Login Failed', text: json.error, icon: 'error' });
                    }
                } catch (err) {
                    console.error('Sync failed:', err);
                }
            };
            fetchUser();
        } else if (error) {
            Toast.fire({ title: 'Authentication Error', text: error, icon: 'error' });
        } else if (existingToken) {
            navigate('/clippers/dashboard');
        }
    }, [location, login, navigate, existingToken]);

    const handleLogin = async (provider: 'google' | 'discord') => {
        try {
            // Use our CUSTOM backend-led Auth to avoid Supabase URL
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/${provider}`);
            const json = await res.json();
            if (json.success && json.url) {
                window.location.href = json.url;
            } else {
                throw new Error(json.error || `Failed to start ${provider} Auth`);
            }
        } catch (error: any) {
            console.error('Error logging in:', error.message);
            Toast.fire({ title: 'Login Error', text: error.message, icon: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
            {/* Cinematic Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md px-8 relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-block mb-8"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group hover:border-white/20 transition-colors overflow-hidden p-3">
                            <img src="/logo.webp" alt="Clipnic Logo" className="w-full h-full object-contain" />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
                        Welcome to Clipnic
                    </h1>
                    <p className="text-white/40 text-lg font-light tracking-tight">
                        Sign in to start clipping and earning.
                    </p>
                </div>

                <div className="space-y-4">
                    <Button
                        variant="primary"
                        className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base font-semibold group"
                        onClick={() => handleLogin('google')}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </Button>

                    <Button
                        variant="secondary"
                        className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base font-semibold group border border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"
                        onClick={() => handleLogin('discord')}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.419c0 1.334-.955 2.419-2.156 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z" />
                        </svg>
                        Continue with Discord
                    </Button>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >

                </motion.div>
            </motion.div>

            {/* Sub-pixel grain effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};
