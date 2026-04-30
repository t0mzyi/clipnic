import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { Toast } from '../lib/swal';

export const BrandLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/brand`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const json = await res.json();
            
            if (json.success) {
                login(json.user, json.token, null);
                navigate('/brands/dashboard');
            } else {
                Toast.fire({ title: 'Login Failed', text: json.error || 'Invalid credentials', icon: 'error' });
            }
        } catch (error: any) {
            Toast.fire({ title: 'Error', text: error.message, icon: 'error' });
        } finally {
            setLoading(false);
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
                            <Box size={32} className="text-white/50" />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
                        Clipnic Enterprise
                    </h1>
                    <p className="text-white/40 text-lg font-light tracking-tight">
                        Secure access to your campaign performance metrics.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] focus:bg-white/[0.08] focus:border-white/20 transition-all text-white placeholder:text-white/30 pl-12 pr-4 outline-none font-medium"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] focus:bg-white/[0.08] focus:border-white/20 transition-all text-white placeholder:text-white/30 pl-12 pr-4 outline-none font-medium"
                        />
                    </div>
                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            variant="primary"
                            className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base font-semibold group"
                        >
                            {loading ? 'Authenticating...' : 'Access Dashboard'}
                        </Button>
                    </div>
                </form>
            </motion.div>

            {/* Sub-pixel grain effect */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
            />
        </div>
    );
};
