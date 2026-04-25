import Swal from 'sweetalert2';

type ConfirmOptions = {
    title?: string;
    text?: string;
    confirmButtonClassName?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    variant?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
};

type ToastOptions = {
    title: string;
    icon?: 'success' | 'error' | 'warning' | 'info';
};

const brandButtons = {
    cancelButtonColor: '#e4e4e7',
};

const confirmButtonColors = {
    danger: '#dc2626',
    info: '#0284c7',
    primary: '#facc15',
    success: '#059669',
    warning: '#facc15',
};

const confirmButtonClasses = {
    danger: '!text-white',
    info: '!text-white',
    primary: '!text-brand-black',
    success: '!text-white',
    warning: '!text-brand-black',
};

const alertTitleClassName = '!text-2xl';

export function confirmAction(options: ConfirmOptions = {}) {
    const variant = options.variant ?? 'primary';

    return Swal.fire({
        title: options.title ?? 'Konfirmasi tindakan',
        text: options.text ?? 'Data akan diproses.',
        icon: variant === 'danger' ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonText: options.confirmButtonText ?? 'Ya, lanjutkan',
        cancelButtonText: options.cancelButtonText ?? 'Batal',
        reverseButtons: true,
        cancelButtonColor: brandButtons.cancelButtonColor,
        ...(options.confirmButtonClassName ? {} : { confirmButtonColor: confirmButtonColors[variant] }),
        customClass: {
            title: alertTitleClassName,
            confirmButton: options.confirmButtonClassName ?? confirmButtonClasses[variant],
            cancelButton: '!text-zinc-700',
        },
    });
}

export function showToast({ title, icon = 'success' }: ToastOptions) {
    return Swal.fire({
        title,
        icon,
        timer: icon === 'success' ? 1800 : undefined,
        timerProgressBar: icon === 'success',
        confirmButtonColor: icon === 'success' ? confirmButtonColors.success : confirmButtonColors.primary,
        customClass: {
            title: alertTitleClassName,
            confirmButton: icon === 'success' ? '!text-white' : '!text-brand-black',
        },
    });
}
