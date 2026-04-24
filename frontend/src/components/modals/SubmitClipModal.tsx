import { motion } from 'framer-motion';
import { X, Loader2, Play, Camera, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState, useEffect } from 'react';

interface SubmitClipModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: any;
    onSubmit: (url: string, platform: string) => Promise<void>;
    token: string | null;
}

const TikTokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
);

export const SubmitClipModal = ({ isOpen, onClose, onSubmit, token }: SubmitClipModalProps) => {
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [platform, setPlatform] = useState<'youtube' | 'instagram' | 'tiktok' | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingUrl, setIsCheckingUrl] = useState(false);
    const [urlError, setUrlError] = useState('');

    useEffect(() => {
        const url = submissionUrl.toLowerCase();
        if (url.includes('youtube.com') || url.includes('youtu.be')) setPlatform('youtube');
        else if (url.includes('instagram.com')) setPlatform('instagram');
        else if (url.includes('tiktok.com')) setPlatform('tiktok');
        else setPlatform('');
    }, [submissionUrl]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (submissionUrl && submissionUrl.length > 10) {
                setIsCheckingUrl(true);
                setUrlError('');
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/submissions/check-url?url=${encodeURIComponent(submissionUrl)}${platform ? `&platform=${platform}` : ''}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const json = await res.json();
                    if (json.success && !json.data.available) {
                        setUrlError('This video has already been submitted.');
                    }
                } catch (err) { }
                finally { setIsCheckingUrl(false); }
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [submissionUrl, platform, token]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!platform || urlError) return;
        setIsSubmitting(true);
        try {
            await onSubmit(submissionUrl, platform);
            setSubmissionUrl('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div 
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                className="bg-[#0D0D0D] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative shadow-2xl"
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                    <X size={20} />
                </button>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Submit Your Clip</h2>
                        <p className="text-sm text-white/40">Provide the link to your published video.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Video URL</label>
                            <input 
                                type="text" 
                                placeholder="Paste link here..."
                                value={submissionUrl}
                                onChange={(e) => setSubmissionUrl(e.target.value)}
                                className={`w-full bg-white/5 border rounded-xl px-4 py-4 text-sm focus:outline-none transition-all ${urlError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white/20'}`}
                                required
                            />
                            {isCheckingUrl && <p className="text-[10px] text-white/20 animate-pulse">Checking availability...</p>}
                            {urlError && <p className="text-[10px] text-red-400 font-bold flex items-center gap-1"><AlertCircle size={10} /> {urlError}</p>}
                        </div>

                        {platform && (
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                                        {platform === 'youtube' ? <Play size={16} /> : platform === 'instagram' ? <Camera size={16} /> : <TikTokIcon />}
                                    </div>
                                    <p className="text-xs font-bold text-white/70 capitalize">{platform} detected</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                        )}

                        <Button 
                            type="submit"
                            disabled={!platform || isSubmitting || isCheckingUrl || !!urlError}
                            className="w-full py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-xs disabled:opacity-30"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Confirm Submission'}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
