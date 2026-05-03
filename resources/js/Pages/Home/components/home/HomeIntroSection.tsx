import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { featuredNotice, homeIntro, organizationProfile } from '../../data/homeContent';

export function HomeIntroSection() {
    return (
        <section className="border-b border-zinc-200 bg-white">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_22rem] lg:px-8">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold text-brand-red">{organizationProfile.eyebrow}</p>
                    <h1 className="mt-3 text-3xl font-bold leading-tight text-zinc-950 sm:text-4xl">{homeIntro.title}</h1>
                    <p className="mt-4 text-base leading-8 text-zinc-700">{homeIntro.lead}</p>
                    <p className="mt-3 text-sm leading-7 text-zinc-500">{homeIntro.note}</p>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            className="inline-flex min-h-11 items-center justify-center rounded bg-brand-red px-5 text-sm font-semibold text-white transition hover:bg-brand-red-dark"
                            href="/profil"
                        >
                            Lihat Profil
                            <ArrowRight className="ml-2 size-4" />
                        </Link>
                        <Link
                            className="inline-flex min-h-11 items-center justify-center rounded border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-800 transition hover:border-brand-red hover:text-brand-red"
                            href="/berita"
                        >
                            Berita Terbaru
                        </Link>
                    </div>
                </div>

                <aside className="rounded border border-zinc-200 bg-zinc-50 p-5">
                    <div className="flex items-center gap-3">
                        <img alt="Logo PSHT" className="size-14 object-contain" src={organizationProfile.logo} />
                        <div>
                            <p className="text-sm font-bold text-zinc-950">{organizationProfile.name}</p>
                            <p className="text-xs text-zinc-500">{organizationProfile.address}</p>
                        </div>
                    </div>
                    <div className="mt-5 border-t border-zinc-200 pt-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-brand-red">{featuredNotice.category}</p>
                        <h2 className="mt-2 text-lg font-bold text-zinc-950">{featuredNotice.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">{featuredNotice.description}</p>
                        <p className="mt-4 text-xs font-semibold text-zinc-500">{featuredNotice.date}</p>
                    </div>
                </aside>
            </div>
        </section>
    );
}

