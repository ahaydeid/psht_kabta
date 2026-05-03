import { Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';

import { trainingSchedules } from '../../data/homeContent';

export function HomeSchedulePreviewSection() {
    return (
        <section className="border-t border-zinc-200 bg-white py-12">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[20rem_1fr] lg:px-8">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-red">Jadwal</p>
                    <h2 className="mt-2 text-2xl font-bold text-zinc-950">Agenda terdekat</h2>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">Ringkasan jadwal latihan dan kegiatan. Detail lengkap nanti tersedia di halaman jadwal.</p>
                    <Link className="mt-5 inline-flex items-center text-sm font-semibold text-brand-red hover:text-brand-red-dark" href="/jadwal">
                        Lihat jadwal
                    </Link>
                </div>

                <div className="divide-y divide-zinc-200 rounded border border-zinc-200">
                    {trainingSchedules.map((schedule) => (
                        <div className="grid gap-3 p-4 sm:grid-cols-[8rem_1fr_8rem] sm:items-center" key={`${schedule.day}-${schedule.place}`}>
                            <div className="flex items-center gap-2 font-bold text-zinc-950">
                                <CalendarDays className="size-4 text-brand-red" />
                                {schedule.day}
                            </div>
                            <p className="text-sm font-semibold text-zinc-700">{schedule.place}</p>
                            <p className="text-sm font-bold text-brand-red sm:text-right">{schedule.time}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

