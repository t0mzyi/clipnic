import { useAlertStore } from '../store/useAlertStore';
import { useToastStore } from '../store/useToastStore';

export interface ToastOptions {
    title?: string;
    text?: string;
    icon?: 'success' | 'error' | 'info' | 'warning' | 'question';
}

export const Toast = {
    fire: (options: ToastOptions): Promise<void> => {
        const { addToast } = useToastStore.getState();
        const title = options.title || '';
        const fullMessage = options.text ? `${title}: ${options.text}` : title;
        addToast(fullMessage, options.icon);
        return Promise.resolve();
    }
};

export interface SwalOptions {
    title?: string;
    text?: string;
    html?: string;
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
    showCancelButton?: boolean;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonColor?: string;
    cancelButtonColor?: string;
    background?: string;
    color?: string;
    position?: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end';
    timer?: number;
    timerProgressBar?: boolean;
    showConfirmButton?: boolean;
    buttonsStyling?: boolean;
    customClass?: Record<string, string | Record<string, string>>;
    didOpen?: (el: any) => void;
    input?: 'text' | 'textarea' | 'password' | 'email';
    inputPlaceholder?: string;
    inputAttributes?: Record<string, any>;
    inputValue?: string;
    toast?: boolean;
}

export interface SwalResult {
    isConfirmed: boolean;
    isDismissed: boolean;
    value?: any;
}

export const GlobalSwal = {
    fire: (options: SwalOptions): Promise<SwalResult> => {
        const { showAlert } = useAlertStore.getState();
        return showAlert({
            title: options.title || '',
            text: options.text || options.html || '',
            icon: options.icon,
            showCancelButton: options.showCancelButton,
            confirmButtonText: options.confirmButtonText,
            cancelButtonText: options.cancelButtonText,
            input: options.input,
            inputPlaceholder: options.inputPlaceholder,
            inputAttributes: options.inputAttributes,
            inputValue: options.inputValue
        });
    }
};

const Swal = {
    fire: (options: string | SwalOptions): Promise<any> => {
        if (typeof options === 'string') {
            return GlobalSwal.fire({ title: options });
        }
        if (options.toast) {
            return Toast.fire({ title: options.title, text: options.text, icon: options.icon });
        }
        return GlobalSwal.fire(options);
    },
    mixin: (baseOptions: SwalOptions) => {
        return {
            fire: (options: SwalOptions): Promise<any> => Swal.fire({ ...baseOptions, ...options }),
            stopTimer: () => {},
            resumeTimer: () => {}
        };
    },
    stopTimer: () => {},
    resumeTimer: () => {}
};

export default Swal;

