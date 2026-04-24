import { useAlertStore } from '../store/useAlertStore';
import { useToastStore } from '../store/useToastStore';

export const Toast = {
    fire: (options: { title: string, icon?: 'success' | 'error' | 'info' }) => {
        const { addToast } = useToastStore.getState();
        addToast(options.title, options.icon);
        return Promise.resolve();
    }
};

export const GlobalSwal = {
    fire: (options: any) => {
        const { showAlert } = useAlertStore.getState();
        // Map swal options to our AlertOptions
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


// Also export a default object for standard Swal usage
const Swal = {
    fire: (options: any) => {
        if (typeof options === 'string') {
            return GlobalSwal.fire({ title: options });
        }
        if (options.toast) {
            return Toast.fire({ title: options.title, icon: options.icon });
        }
        return GlobalSwal.fire(options);
    },
    mixin: (baseOptions: any) => {
        return {
            fire: (options: any) => Swal.fire({ ...baseOptions, ...options }),
            stopTimer: () => {},
            resumeTimer: () => {}
        };
    },
    stopTimer: () => {},
    resumeTimer: () => {}
};

export default Swal;

