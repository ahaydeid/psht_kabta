import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    containerClassName?: string;
    error?: string;
    label?: string;
    variant?: 'underlined' | 'box';
};

const variants = {
    underlined: 'rounded-none border-b border-zinc-300 bg-transparent px-1 focus:border-brand-yellow-dark',
    box: 'rounded border border-zinc-200 bg-white px-4 focus:ring-1 focus:ring-brand-yellow/30',
};

export function Input({
    className = '',
    containerClassName = '',
    error,
    id,
    label,
    variant = 'box',
    ...props
}: InputProps) {
    const inputId = id ?? props.name;

    return (
        <div className={cn('w-full space-y-1.5', containerClassName)}>
            {label ? (
                <label
                    className={cn('ml-0.5 block text-xs font-medium text-zinc-700', error ? 'text-brand-red' : '')}
                    htmlFor={inputId}
                >
                    {label}
                </label>
            ) : null}
            <input
                className={cn(
                    'w-full py-2 text-sm text-brand-black outline-none transition-all placeholder:text-zinc-400',
                    variants[variant],
                    error ? 'border-brand-red bg-red-50 focus:border-brand-red' : '',
                    className,
                )}
                id={inputId}
                {...props}
            />
            {error ? <p className="ml-1 mt-1 text-[10px] font-medium text-brand-red md:text-xs">{error}</p> : null}
        </div>
    );
}
