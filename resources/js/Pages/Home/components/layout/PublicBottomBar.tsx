import { Link, usePage } from '@inertiajs/react';

import { cn } from '@/lib/cn';

import { publicNavigationItems } from '../../data/navigation';

export function PublicBottomBar() {
    const { url } = usePage();

    return (
        <nav
            aria-label="Navigasi mobile"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] lg:hidden"
        >
            <div className="grid grid-cols-6 gap-1">
                {publicNavigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = url === item.href;

                    return (
                        <Link
                            className={cn(
                                'flex min-h-12 flex-col items-center justify-center gap-1 rounded text-[10px] font-semibold transition hover:bg-zinc-100 hover:text-brand-red',
                                isActive ? 'bg-zinc-100 text-brand-red' : 'text-zinc-600',
                            )}
                            href={item.href}
                            key={item.href}
                        >
                            <Icon className="size-4" />
                            <span className="max-w-full truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
