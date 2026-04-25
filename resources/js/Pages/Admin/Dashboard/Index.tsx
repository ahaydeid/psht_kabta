import {
    CalendarCheck,
    ClipboardList,
    ShieldCheck,
    UserRoundCheck,
    UsersRound,
} from 'lucide-react';

import { AdminLayout } from '@/Layouts/AdminLayout';

type DashboardScope = 'pusat' | 'cabang' | 'ranting' | 'rayon' | 'sub-rayon' | 'komisariat';

const latihanTrend = [
    { label: 'Jan', value: 42 },
    { label: 'Feb', value: 58 },
    { label: 'Mar', value: 64 },
    { label: 'Apr', value: 73 },
    { label: 'Mei', value: 88 },
    { label: 'Jun', value: 96 },
];

const komposisiAnggota = [
    { name: 'Siswa Aktif', value: 0, colorClass: 'text-amber-300', dotClass: 'bg-amber-300' },
    { name: 'Warga', value: 0, colorClass: 'text-zinc-500', dotClass: 'bg-zinc-500' },
    { name: 'Pelatih', value: 0, colorClass: 'text-red-300', dotClass: 'bg-red-300' },
];

const modulHealth = [
    { name: 'Master Data', value: 35, barClass: 'bg-amber-300' },
    { name: 'Absensi', value: 20, barClass: 'bg-red-300' },
    { name: 'Pengaturan', value: 55, barClass: 'bg-zinc-500' },
    { name: 'Laporan', value: 10, barClass: 'bg-zinc-400' },
];

const scopeConfig: Record<
    DashboardScope,
    {
        agenda: string[];
        hierarchy: Array<{ label: string; value: string }>;
        subtitle?: string;
        title?: string;
        trendLabel: string;
    }
> = {
    pusat: {
        trendLabel: 'Semua Wilayah',
        hierarchy: [
            { label: 'Cabang', value: 'Belum diatur' },
            { label: 'Ranting', value: 'Belum diatur' },
            { label: 'Rayon', value: 'Belum diatur' },
            { label: 'Sub Rayon', value: 'Belum diatur' },
            { label: 'Komisariat', value: 'Belum diatur' },
            { label: 'Status Sistem', value: 'Persiapan awal' },
        ],
        agenda: ['Sinkronisasi struktur organisasi', 'Validasi data cabang', 'Pemantauan kelengkapan master data'],
    },
    cabang: {
        title: 'Dashboard Admin Cabang',
        subtitle: 'Ringkasan pengelolaan ranting, rayon, sub rayon, komisariat, dan latihan di tingkat cabang.',
        trendLabel: 'Cabang',
        hierarchy: [
            { label: 'Cabang', value: 'Belum diatur' },
            { label: 'Total Ranting', value: '0' },
            { label: 'Total Rayon', value: '0' },
            { label: 'Jadwal Cabang', value: 'Belum dibuat' },
            { label: 'Koordinator', value: 'Belum ditentukan' },
            { label: 'Status Cabang', value: 'Persiapan awal' },
        ],
        agenda: ['Tetapkan jadwal latihan cabang', 'Lengkapi data ranting', 'Cek rekap absensi cabang'],
    },
    ranting: {
        title: 'Dashboard Admin Ranting',
        subtitle: 'Pantauan rayon, sub rayon, siswa, warga, dan operasional latihan tingkat ranting.',
        trendLabel: 'Ranting',
        hierarchy: [
            { label: 'Ranting', value: 'Belum diatur' },
            { label: 'Induk Cabang', value: 'Belum diatur' },
            { label: 'Total Rayon', value: '0' },
            { label: 'Jadwal Ranting', value: 'Belum dibuat' },
            { label: 'Pelatih Aktif', value: '0' },
            { label: 'Status Ranting', value: 'Persiapan awal' },
        ],
        agenda: ['Tetapkan jadwal latihan ranting', 'Validasi data rayon', 'Review presensi siswa ranting'],
    },
    rayon: {
        title: 'Dashboard Admin Rayon',
        subtitle: 'Fokus pada data siswa, warga, pelatih, dan absensi latihan di tingkat rayon.',
        trendLabel: 'Rayon',
        hierarchy: [
            { label: 'Rayon', value: 'Belum diatur' },
            { label: 'Induk Ranting', value: 'Belum diatur' },
            { label: 'Total Sub Rayon', value: '0' },
            { label: 'Jadwal Rayon', value: 'Belum dibuat' },
            { label: 'Siswa Aktif', value: '0' },
            { label: 'Status Rayon', value: 'Persiapan awal' },
        ],
        agenda: ['Input jadwal latihan rayon', 'Lengkapi master siswa', 'Buka sesi absensi latihan'],
    },
    'sub-rayon': {
        title: 'Dashboard Admin Sub Rayon',
        subtitle: 'Ringkasan operasional latihan, anggota, dan absensi pada unit sub rayon.',
        trendLabel: 'Sub Rayon',
        hierarchy: [
            { label: 'Sub Rayon', value: 'Belum diatur' },
            { label: 'Induk Rayon', value: 'Belum diatur' },
            { label: 'Jadwal Sub Rayon', value: 'Belum dibuat' },
            { label: 'Siswa Aktif', value: '0' },
            { label: 'Warga Aktif', value: '0' },
            { label: 'Status Sub Rayon', value: 'Persiapan awal' },
        ],
        agenda: ['Input jadwal sub rayon', 'Periksa absensi latihan', 'Lengkapi daftar warga pendamping'],
    },
    komisariat: {
        title: 'Dashboard Admin Komisariat',
        subtitle: 'Pantauan siswa, warga, pelatih, dan jadwal latihan pada area komisariat.',
        trendLabel: 'Komisariat',
        hierarchy: [
            { label: 'Komisariat', value: 'Belum diatur' },
            { label: 'Induk Cabang', value: 'Belum diatur' },
            { label: 'Jadwal Komisariat', value: 'Belum dibuat' },
            { label: 'Siswa Aktif', value: '0' },
            { label: 'Pelatih Aktif', value: '0' },
            { label: 'Status Komisariat', value: 'Persiapan awal' },
        ],
        agenda: ['Input jadwal komisariat', 'Validasi data anggota komisariat', 'Cek kehadiran latihan terakhir'],
    },
};

function DonutChart({
    data,
    innerRadius = 50,
    outerRadius = 72,
    size = 160,
}: {
    data: Array<{ colorClass: string; name: string; value: number }>;
    innerRadius?: number;
    outerRadius?: number;
    size?: number;
}) {
    const fallbackData = data.every((item) => item.value === 0)
        ? data.map((item) => ({ ...item, value: 1 }))
        : data;
    const total = fallbackData.reduce((sum, item) => sum + item.value, 0);
    const radius = (innerRadius + outerRadius) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulated = 0;

    return (
        <svg className="-rotate-90" height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
            {fallbackData.map((item) => {
                const percentage = (item.value / total) * 100;
                const dashArray = (percentage / 100) * circumference;
                const offset = (accumulated / 100) * circumference;
                accumulated += percentage;

                return (
                    <circle
                        className={item.colorClass}
                        cx={size / 2}
                        cy={size / 2}
                        fill="transparent"
                        key={item.name}
                        r={radius}
                        stroke="currentColor"
                        strokeDasharray={`${dashArray} ${circumference}`}
                        strokeDashoffset={-offset}
                        strokeWidth={outerRadius - innerRadius}
                    />
                );
            })}
        </svg>
    );
}

function LineTrendChart({ data, height = 220 }: { data: Array<{ label: string; value: number }>; height?: number }) {
    const max = Math.max(...data.map((item) => item.value), 1);
    const padding = 18;
    const width = 640;
    const coordinates = data.map((item, index) => {
        const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((item.value / max) * (height - padding * 2) + padding);

        return { x, y };
    });
    const curvedPath = coordinates.reduce((path, point, index) => {
        if (index === 0) {
            return `M ${point.x} ${point.y}`;
        }

        const previous = coordinates[index - 1];
        const controlOffset = (point.x - previous.x) * 0.28;

        return `${path} C ${previous.x + controlOffset} ${previous.y}, ${point.x - controlOffset} ${point.y}, ${point.x} ${point.y}`;
    }, '');
    const areaPath = `${curvedPath} L ${coordinates[coordinates.length - 1]?.x ?? width - padding} ${height - padding} L ${coordinates[0]?.x ?? padding} ${height - padding} Z`;

    return (
        <div className="h-full w-full">
            <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <linearGradient id="latihan-trend-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#facc15" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {[0, 25, 50, 75, 100].map((value) => (
                    <line
                        key={value}
                        stroke="#e4e4e7"
                        strokeDasharray="4 4"
                        x1={padding}
                        x2={width - padding}
                        y1={height - ((value / 100) * (height - padding * 2) + padding)}
                        y2={height - ((value / 100) * (height - padding * 2) + padding)}
                    />
                ))}

                <path d={areaPath} fill="url(#latihan-trend-fill)" />
                <path d={curvedPath} fill="none" stroke="#f87171" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />

                {coordinates.map(({ x, y }, index) => (
                    <circle cx={x} cy={y} fill="#f87171" key={data[index].label} r="2" />
                ))}
            </svg>
            <div className="mt-2 flex justify-between px-2">
                {data.map((item) => (
                    <span className="text-[10px] font-medium text-zinc-400" key={item.label}>
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function FeatureBarChart({ data }: { data: Array<{ barClass: string; name: string; value: number }> }) {
    return (
        <div className="flex h-56 items-end justify-between gap-3 px-2 pb-6 pt-8">
            {data.map((item) => (
                <div className="flex h-full flex-1 flex-col items-center justify-end" key={item.name}>
                    <div className={`min-h-1.5 w-full rounded-t-sm ${item.barClass}`} style={{ height: `${item.value}%` }} />
                    <div className="mt-2 text-center text-[10px] leading-tight text-zinc-500">{item.name}</div>
                </div>
            ))}
        </div>
    );
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="border border-zinc-200 bg-zinc-50/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
            <p className="mt-2 text-sm font-semibold text-zinc-900">{value}</p>
        </div>
    );
}

export default function AdminDashboardIndex({ dashboardScope = 'pusat' }: { dashboardScope?: DashboardScope }) {
    const config = scopeConfig[dashboardScope] ?? scopeConfig.pusat;
    const cards = [
        {
            helper: 'Siswa aktif terdaftar',
            icon: UserRoundCheck,
            label: 'Siswa Aktif',
            surfaceClass: 'bg-amber-200',
            iconClass: 'text-amber-400/70',
            value: '0',
        },
        {
            helper: 'Warga organisasi',
            icon: UsersRound,
            label: 'Warga',
            surfaceClass: 'bg-slate-200',
            iconClass: 'text-slate-400/70',
            value: '0',
        },
        {
            helper: 'Pelatih aktif',
            icon: ShieldCheck,
            label: 'Pelatih',
            surfaceClass: 'bg-rose-200',
            iconClass: 'text-rose-400/60',
            value: '0',
        },
        {
            helper: 'Rekap presensi latihan hari ini',
            icon: CalendarCheck,
            label: 'Absensi Hari Ini',
            surfaceClass: 'bg-orange-200',
            iconClass: 'text-orange-400/65',
            value: '0',
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-4">
                {config.title || config.subtitle ? (
                    <div>
                        {config.title ? <h1 className="text-2xl font-bold text-brand-black">{config.title}</h1> : null}
                        {config.subtitle ? <p className="mt-1 text-sm text-zinc-500">{config.subtitle}</p> : null}
                    </div>
                ) : null}

                <div className="mb-10 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <div className={`relative min-h-35 overflow-hidden rounded-lg px-5 pb-5 pt-5 shadow-xs ${card.surfaceClass}`} key={card.label}>
                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/40" />
                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div className="flex-1 pr-12">
                                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-600">{card.label}</p>
                                    <p className="mt-1 text-3xl font-bold text-zinc-800">{card.value}</p>
                                </div>
                                <card.icon className={`mt-1 h-9 w-9 shrink-0 opacity-80 ${card.iconClass}`} strokeWidth={2.2} />
                            </div>
                            <p className="absolute bottom-5 left-5 right-5 text-xs font-medium text-zinc-500">{card.helper}</p>
                        </div>
                    ))}
                </div>

                <section className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">Statistik</h2>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
                        <div className="rounded-lg border border-zinc-200/70 bg-white p-6 lg:col-span-2">
                            <h3 className="mb-6 flex items-center justify-between text-sm font-bold text-zinc-700">
                                <span>Perkembangan Kehadiran Latihan</span>
                                <span className="text-brand-red">{config.trendLabel}</span>
                            </h3>
                            <div className="h-64">
                                <LineTrendChart data={latihanTrend} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:col-span-2">
                            <div className="rounded-lg border border-zinc-200/70 bg-white p-6">
                                <h3 className="mb-6 text-sm font-bold text-zinc-700">Komposisi Anggota</h3>
                                <div className="relative flex h-48 items-center justify-center">
                                    <DonutChart data={komposisiAnggota} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-zinc-800">0</span>
                                        <span className="text-[10px] font-medium uppercase tracking-tight text-zinc-500">Total</span>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-2">
                                    {komposisiAnggota.map((item) => (
                                        <div className="flex items-center justify-between text-xs" key={item.name}>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${item.dotClass}`} />
                                                <span className="font-medium text-zinc-600">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-zinc-800">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border border-zinc-200/70 bg-white p-6">
                                <h3 className="mb-6 text-sm font-bold text-zinc-700">Kesiapan Modul</h3>
                                <div className="mb-8 h-72">
                                    <FeatureBarChart data={modulHealth} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">Insight</h2>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
                        <div className="rounded-lg border border-zinc-200/70 bg-white p-6 lg:col-span-2">
                            <h3 className="mb-6 text-sm font-bold text-zinc-700">Quick Snapshot</h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                {config.hierarchy.map((item) => (
                                    <SnapshotItem key={item.label} label={item.label} value={item.value} />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-zinc-200/70 bg-white p-6 lg:col-span-2">
                            <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-zinc-700">
                                <ClipboardList className="h-4 w-4 text-brand-red" />
                                Agenda Terdekat
                            </h3>
                            <div className="space-y-3">
                                {config.agenda.map((item) => (
                                    <div className="rounded border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600" key={item}>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
