import Swal from 'sweetalert2';

type ConfirmOptions = {
    title?: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
};

type ToastOptions = {
    title: string;
    icon?: 'success' | 'error' | 'warning' | 'info';
};

const brandButtons = {
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#111111',
};

export function confirmAction(options: ConfirmOptions = {}) {
    return Swal.fire({
        title: options.title ?? 'Konfirmasi tindakan',
        text: options.text ?? 'Data akan diproses.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: options.confirmButtonText ?? 'Ya, lanjutkan',
        cancelButtonText: options.cancelButtonText ?? 'Batal',
        reverseButtons: true,
        ...brandButtons,
    });
}

export function showToast({ title, icon = 'success' }: ToastOptions) {
    return Swal.fire({
        title,
        icon,
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
    });
}
