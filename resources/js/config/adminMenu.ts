import {
    Building2,
    CalendarCheck,
    LayoutDashboard,
    Medal,
    Settings,
    ShieldCheck,
    UserRoundCheck,
    UserCog,
    UsersRound,
} from 'lucide-react';

import type { MenuItem } from '@/types/Menu';

export const adminMenu: MenuItem[] = [
    {
        name: 'Dashboard',
        icon: LayoutDashboard,
        children: [
            {
                name: 'Admin Pusat',
                path: '/',
            },
            {
                name: 'Admin Cabang',
                path: '/admin/dashboard/cabang',
            },
            {
                name: 'Admin Ranting',
                path: '/admin/dashboard/ranting',
            },
            {
                name: 'Admin Rayon',
                path: '/admin/dashboard/rayon',
            },
            {
                name: 'Admin Sub Rayon',
                path: '/admin/dashboard/sub-rayon',
            },
            {
                name: 'Admin Komisariat',
                path: '/admin/dashboard/komisariat',
            },
        ],
    },
    {
        name: 'Master Data',
        section: 'Master Data',
        children: [
            {
                name: 'Master Siswa',
                path: '/admin/master-data/siswa',
                icon: UserRoundCheck,
            },
            {
                name: 'Master Warga',
                path: '/admin/master-data/warga',
                icon: UsersRound,
            },
            {
                name: 'Master Pelatih',
                path: '/admin/master-data/pelatih',
                icon: ShieldCheck,
            },
            {
                name: 'Tingkatan',
                path: '/admin/master-data/tingkatan',
                icon: Medal,
            },
        ],
    },
    {
        name: 'Operasional',
        section: 'Operasional',
        children: [
            {
                name: 'Absensi Siswa',
                path: '/admin/operasional/absensi-siswa',
                icon: CalendarCheck,
            },
        ],
    },
    {
        name: 'Pengaturan',
        section: 'Pengaturan',
        children: [
            {
                name: 'Role & Permission',
                path: '/admin/pengaturan/role-permission',
                icon: UserCog,
            },
            {
                name: 'User Management',
                path: '/admin/pengaturan/user-management',
                icon: Settings,
            },
            {
                name: 'Pengaturan Cabang',
                path: '/admin/pengaturan/cabang',
                icon: Building2,
                children: [
                    {
                        name: 'Jadwal Latihan',
                        path: '/admin/pengaturan/cabang/jadwal-latihan',
                    },
                ],
            },
            {
                name: 'Pengaturan Ranting',
                path: '/admin/pengaturan/ranting',
                icon: Building2,
                children: [
                    {
                        name: 'Jadwal Latihan',
                        path: '/admin/pengaturan/ranting/jadwal-latihan',
                    },
                ],
            },
            {
                name: 'Pengaturan Rayon',
                path: '/admin/pengaturan/rayon',
                icon: Building2,
                children: [
                    {
                        name: 'Jadwal Latihan',
                        path: '/admin/pengaturan/rayon/jadwal-latihan',
                    },
                ],
            },
            {
                name: 'Pengaturan Sub Rayon',
                path: '/admin/pengaturan/sub-rayon',
                icon: Building2,
                children: [
                    {
                        name: 'Jadwal Latihan',
                        path: '/admin/pengaturan/sub-rayon/jadwal-latihan',
                    },
                ],
            },
            {
                name: 'Pengaturan Komisariat',
                path: '/admin/pengaturan/komisariat',
                icon: Building2,
                children: [
                    {
                        name: 'Jadwal Latihan',
                        path: '/admin/pengaturan/komisariat/jadwal-latihan',
                    },
                ],
            },
        ],
    },
];
