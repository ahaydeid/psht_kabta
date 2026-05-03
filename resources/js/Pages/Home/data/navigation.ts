import { CalendarDays, Home, Images, Newspaper, Phone, UsersRound } from 'lucide-react';

import type { PublicNavigationItem } from '../types';

export const publicNavigationItems: PublicNavigationItem[] = [
    {
        href: '/',
        icon: Home,
        label: 'Beranda',
    },
    {
        href: '/profil',
        icon: UsersRound,
        label: 'Profil',
    },
    {
        href: '/berita',
        icon: Newspaper,
        label: 'Berita',
    },
    {
        href: '/jadwal',
        icon: CalendarDays,
        label: 'Jadwal',
    },
    {
        href: '/galeri',
        icon: Images,
        label: 'Galeri',
    },
    {
        href: '/kontak',
        icon: Phone,
        label: 'Kontak',
    },
];
