import { Loader2 } from 'lucide-react';

type LoadingOverlayProps = {
    show?: boolean;
    text?: string;
};

export function LoadingOverlay({ show = true, text = 'Memuat data...' }: LoadingOverlayProps) {
    if (!show) {
        return null;
    }

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75">
            <div className="flex items-center gap-2 rounded bg-brand-black px-4 py-2 text-sm font-medium text-white shadow">
                <Loader2 className="h-4 w-4 animate-spin text-brand-yellow" />
                {text}
            </div>
        </div>
    );
}
