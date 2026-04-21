import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { Settings, Shield, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

export const AdminSettings = () => {
    const { token, settings, setSettings } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    
    // Auth mode local state
    const [ytAuthMode, setYtAuthMode] = useState<'oauth' | 'manual'>(
        settings?.youtube_auth_mode || 'oauth'
    );

    useEffect(() => {
        if (settings?.youtube_auth_mode) {
            setYtAuthMode(settings.youtube_auth_mode);
        }
    }, [settings]);

    const handleSave = async (newMode: 'oauth' | 'manual') => {
        setIsSaving(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    key: 'youtube_auth_mode',
                    value: newMode
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSettings({ youtube_auth_mode: newMode });
            setYtAuthMode(newMode);
            
            Swal.fire({
                title: 'Settings Saved',
                text: `Mode: ${newMode.toUpperCase()}`,
                icon: 'success',
                background: '#0c0c0c',
                color: '#fff',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (err: any) {
            Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Settings className="w-5 h-5 text-white/40" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
                    <p className="text-xs text-white/30">Manage global application preferences.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 flex flex-col gap-6 shadow-xl relative overflow-hidden"
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-[#FF0000]/10 flex items-center justify-center border border-[#FF0000]/20 text-[#FF0000]">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white tracking-tight">YouTube Verification</h3>
                            <p className="text-[10px] text-white/40 font-light">Choose the verification method for users.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                        <button 
                            disabled={isSaving}
                            onClick={() => handleSave('oauth')}
                            className={`px-6 py-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group/btn h-full ${
                                ytAuthMode === 'oauth' 
                                ? 'bg-[#FF0000]/5 border-[#FF0000]/40 text-white' 
                                : 'bg-white/[0.01] border-white/5 text-white/30 hover:border-white/10'
                            }`}
                        >
                            <div className="flex flex-col gap-0.5 text-left">
                                <span className="font-bold text-sm tracking-tight">1-Click (OAuth)</span>
                                <span className="text-[10px] opacity-40">Google login method.</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${ytAuthMode === 'oauth' ? 'border-[#FF0000] bg-[#FF0000]' : 'border-white/10'}`}>
                                {ytAuthMode === 'oauth' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                        </button>

                        <button 
                            disabled={isSaving}
                            onClick={() => handleSave('manual')}
                            className={`px-6 py-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group/btn h-full ${
                                ytAuthMode === 'manual' 
                                ? 'bg-white/5 border-white/40 text-white' 
                                : 'bg-white/[0.01] border-white/5 text-white/30 hover:border-white/10'
                            }`}
                        >
                            <div className="flex flex-col gap-0.5 text-left">
                                <span className="font-bold text-sm tracking-tight">Manual Scraping</span>
                                <span className="text-[10px] opacity-40">Bio code fallback.</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${ytAuthMode === 'manual' ? 'border-white/50 bg-white' : 'border-white/10'}`}>
                                {ytAuthMode === 'manual' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                            </div>
                        </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-white/20 text-[9px] leading-relaxed flex gap-3 italic items-center relative z-10 uppercase tracking-widest">
                        <RefreshCw className={`w-3 h-3 ${isSaving ? 'animate-spin' : ''}`} />
                        Settings propagate instantly to all users.
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
