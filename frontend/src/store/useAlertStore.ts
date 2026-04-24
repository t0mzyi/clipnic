import { create } from 'zustand';

interface AlertOptions {
    title: string;
    text?: string;
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
    showCancelButton?: boolean;
    confirmButtonText?: string;
    cancelButtonText?: string;
    input?: 'text' | 'textarea' | 'password' | 'email';
    inputPlaceholder?: string;
    inputAttributes?: Record<string, any>;
    inputValue?: string;
}


interface AlertState {
    isOpen: boolean;
    options: AlertOptions;
    resolve: ((value: { isConfirmed: boolean, isDismissed: boolean, value?: any }) => void) | null;
    showAlert: (options: AlertOptions) => Promise<{ isConfirmed: boolean, isDismissed: boolean, value?: any }>;
    closeAlert: (confirmed: boolean, value?: any) => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
    isOpen: false,
    options: { title: '' },
    resolve: null,
    showAlert: (options) => {
        return new Promise((resolve) => {
            set({
                isOpen: true,
                options,
                resolve
            });
        });
    },
    closeAlert: (confirmed, value) => {
        const { resolve } = get();
        if (resolve) {
            resolve({ isConfirmed: confirmed, isDismissed: !confirmed, value });
        }
        set({ isOpen: false, resolve: null });
    }
}));
