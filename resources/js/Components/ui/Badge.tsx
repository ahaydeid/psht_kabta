import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
};

const variants = {
    default: 'border-brand-black bg-brand-black text-white',
    secondary: 'border-zinc-500 bg-zinc-500 text-white',
    destructive: 'border-brand-red bg-brand-red text-white',
    outline: 'border-zinc-200 bg-white text-brand-black',
    success: 'border-emerald-500 bg-emerald-500 text-white',
    warning: 'border-brand-yellow bg-brand-yellow text-brand-black',
    info: 'border-zinc-700 bg-zinc-700 text-white',
};

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-tight transition-colors',
                variants[variant],
                className,
            )}
            {...props}
        />
    );
}
