import { Link, usePage } from '@inertiajs/react';
import { LogIn } from 'lucide-react';

import { cn } from '@/lib/cn';

import { organizationProfile } from '../../data/homeContent';
import { publicNavigationItems } from '../../data/navigation';

export function PublicTopbar() {
    const { url } = usePage();

    return (
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link className="flex min-w-0 items-center gap-3" href="/">
                    <img alt="Logo PSHT" className="size-10 shrink-0 object-contain" src={organizationProfile.logo} />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-zinc-950">{organizationProfile.name}</p>
                        <p className="truncate text-xs text-zinc-500">{organizationProfile.eyebrow}</p>
                    </div>
                </Link>

                <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
                    {publicNavigationItems.map((item) => {
                        const isActive = url === item.href;

                        return (
                            <Link
                                className={cn(
                                    'border-b-2 px-3 py-2 text-sm font-medium transition hover:text-brand-red',
                                    isActive ? 'border-brand-red text-brand-red' : 'border-transparent text-zinc-700',
                                )}
                                href={item.href}
                                key={item.href}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <Link
                    className="inline-flex size-10 items-center justify-center rounded border border-zinc-300 text-zinc-700 transition hover:border-brand-red hover:text-brand-red"
                    href="/admin/login"
                    title="Masuk admin"
                >
                    <LogIn className="size-5" />
                </Link>
            </div>
        </header>
    );
}
