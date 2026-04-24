import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#0D0D0D',
    color: '#fff',
    customClass: {
        popup: 'rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md bg-[#0D0D0D]/95',
        title: 'text-sm font-bold',
    },
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

export const GlobalSwal = Swal.mixin({
    background: '#0D0D0D',
    color: '#fff',
    customClass: {
        popup: 'rounded-[32px] border border-white/10 shadow-2xl bg-[#0D0D0D]',
        title: 'text-2xl font-bold tracking-tight pt-4',
        htmlContainer: 'text-sm text-white/40 leading-relaxed px-6',
        confirmButton: 'bg-white text-black px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-all mx-2',
        cancelButton: 'bg-transparent border border-white/10 text-white/50 px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all mx-2',
        actions: 'pb-6'
    },
    buttonsStyling: false
});
