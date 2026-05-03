import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { quickAccessItems } from '../../data/homeContent';

export function HomeQuickAccessSection() {
    return (
        <section className="bg-zinc-50 py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-brand-red">Akses Cepat</p>
                        <h2 className="mt-2 text-2xl font-bold text-zinc-950">Temukan informasi utama</h2>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickAccessItems.map((item) => (
                        <Link className="rounded border border-zinc-200 bg-white p-5 transition hover:border-brand-red" href={item.href} key={item.href}>
                            <h3 className="text-base font-bold text-zinc-950">{item.label}</h3>
                            <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-600">{item.description}</p>
                            <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-red">
                                Buka
                                <ArrowRight className="ml-2 size-4" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

