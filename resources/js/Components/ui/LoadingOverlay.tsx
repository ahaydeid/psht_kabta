type LoadingOverlayProps = {
    backdropClassName?: string;
    className?: string;
    show?: boolean;
};

export function LoadingOverlay({
    backdropClassName = 'bg-slate-950/25',
    className = 'fixed inset-0',
    show = true,
}: LoadingOverlayProps) {
    if (!show) {
        return null;
    }

    return (
        <div className={`z-50 flex items-center justify-center px-6 ${backdropClassName} ${className}`}>
            <div className="relative flex h-24 w-24 items-center justify-center">
                <div
                    className="absolute inset-0 animate-spin rounded-full"
                    style={{
                        background:
                            'conic-gradient(from 220deg, rgba(245, 158, 11, 0.08) 0deg, rgba(245, 158, 11, 0.22) 135deg, rgba(245, 158, 11, 0.54) 220deg, rgba(245, 158, 11, 0.92) 315deg, rgba(245, 158, 11, 0.08) 360deg)',
                        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px))',
                        mask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px))',
                    }}
                />
                <div className="relative flex h-16 w-16 items-center justify-center">
                    <img
                        alt="PSHT"
                        className="h-11 w-auto object-contain"
                        decoding="sync"
                        loading="eager"
                        src="/img/logo-psht.webp"
                    />
                </div>
            </div>
        </div>
    );
}
