import { Modal } from './Modal';
import { useAlertStore } from '../../store/useAlertStore';
import { Button } from './Button';
import { CheckCircle2, AlertTriangle, XCircle, Info, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export const AlertModal = () => {
    const { isOpen, options, closeAlert } = useAlertStore();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            setInputValue(options.inputValue || '');
        }
    }, [isOpen, options.inputValue]);

    const getIcon = () => {
        switch (options.icon) {
            case 'success': return <CheckCircle2 className="text-emerald-500 w-12 h-12" />;
            case 'error': return <XCircle className="text-red-500 w-12 h-12" />;
            case 'warning': return <AlertTriangle className="text-amber-500 w-12 h-12" />;
            case 'info': return <Info className="text-blue-500 w-12 h-12" />;
            case 'question': return <HelpCircle className="text-purple-500 w-12 h-12" />;
            default: return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => closeAlert(false)}>
            <div className="flex flex-col items-center text-center space-y-6 py-4">
                {options.icon && (
                    <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/10 shadow-2xl">
                        {getIcon()}
                    </div>
                )}
                
                <div className="space-y-2 w-full">
                    <h2 className="text-2xl font-bold tracking-tight text-white">{options.title}</h2>
                    {options.text && (
                        <p className="text-white/40 leading-relaxed text-sm whitespace-pre-wrap">
                            {options.text}
                        </p>
                    )}
                </div>

                {options.input && (
                    <div className="w-full">
                        {options.input === 'textarea' ? (
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={options.inputPlaceholder}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all min-h-[100px] resize-none"
                                {...options.inputAttributes}
                            />
                        ) : (
                            <input
                                type={options.input}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={options.inputPlaceholder}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                                {...options.inputAttributes}
                            />
                        )}
                    </div>
                )}

                <div className="flex items-center gap-3 w-full pt-4">
                    {options.showCancelButton && (
                        <Button
                            onClick={() => closeAlert(false)}
                            className="flex-1 py-4 bg-transparent border border-white/10 text-white/50 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                        >
                            {options.cancelButtonText || 'Cancel'}
                        </Button>
                    )}
                    <Button
                        onClick={() => closeAlert(true, options.input ? inputValue : true)}
                        className={`flex-1 py-4 font-bold uppercase tracking-widest text-[10px] rounded-2xl transition-all ${
                            options.icon === 'error' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-black hover:bg-white/90'
                        }`}
                    >
                        {options.confirmButtonText || 'Confirm'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

