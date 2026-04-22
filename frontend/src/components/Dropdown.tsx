import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface DropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
}

export const Dropdown = ({ options, value, onChange, placeholder = 'Select option', label, className = '' }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(o => o.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
            {label && <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">{label}</label>}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white/90 hover:border-white/20 hover:bg-white/[0.05] transition-all group"
            >
                <div className="flex items-center gap-3">
                    {selectedOption?.icon}
                    <span className={!selectedOption ? 'text-white/20' : ''}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-white/40`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute z-[110] left-0 right-0 mt-2 p-2 bg-[#0d0d0d] border border-white/[0.1] rounded-2xl shadow-2xl backdrop-blur-3xl overflow-hidden"
                    >
                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm transition-all ${
                                        value === option.value 
                                            ? 'bg-white/10 text-white' 
                                            : 'text-white/40 hover:bg-white/[0.04] hover:text-white/80'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {option.icon}
                                        <span>{option.label}</span>
                                    </div>
                                    {value === option.value && <Check className="w-4 h-4 text-emerald-400" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
