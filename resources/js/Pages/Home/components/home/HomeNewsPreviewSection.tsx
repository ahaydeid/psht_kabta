import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { latestArticles } from '../../data/homeContent';

export function HomeNewsPreviewSection() {
    return (
        <section className="bg-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-brand-red">Berita</p>
                        <h2 className="mt-2 text-2xl font-bold text-zinc-950">Kabar terbaru</h2>
                    </div>
                    <Link className="inline-flex items-center text-sm font-semibold text-brand-red hover:text-brand-red-dark" href="/berita">
                        Semua berita
                        <ArrowRight className="ml-2 size-4" />
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {latestArticles.map((article) => (
                        <article className="rounded border border-zinc-200 bg-white p-5" key={article.slug}>
                            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                                <span className="text-brand-red">{article.category}</span>
                                <span>{article.date}</span>
                            </div>
                            <h3 className="mt-3 text-base font-bold leading-6 text-zinc-950">{article.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-zinc-600">{article.excerpt}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

