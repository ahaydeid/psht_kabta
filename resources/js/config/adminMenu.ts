import {
    Building2,
    CalendarCheck,
    LayoutDashboard,
    Settings,
    UserRoundCheck,
    UserCog,
    UsersRound,
} from 'lucide-react';

import type { MenuItem } from '@/types/Menu';

export const adminMenu: MenuItem[] = [
    {
        name: 'Dashboard',
        icon: LayoutDashboard,
        path: '/',
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
                        name: 'Data Cabang',
                        path: '/admin/pengaturan/cabang',
                    },
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
                        name: 'Data Ranting',
                        path: '/admin/pengaturan/ranting',
                    },
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
                        name: 'Data Rayon',
                        path: '/admin/pengaturan/rayon',
                    },
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
                        name: 'Data Sub Rayon',
                        path: '/admin/pengaturan/sub-rayon',
                    },
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
                        name: 'Data Komisariat',
                        path: '/admin/pengaturan/komisariat',
                    },
                    {
                        name: 'Jadwal Latihan',
                        path: '/admin/pengaturan/komisariat/jadwal-latihan',
                    },
                ],
            },
        ],
    },
];

type AdminMenuAccess = {
    allowedDashboardScopes?: string[];
    allowedSettingScopes?: string[];
    canViewRolePermission?: boolean;
    canViewUserManagement?: boolean;
    defaultDashboardScope?: string;
    permissions?: string[];
};

function dashboardPath(scope?: string): string {
    return scope && scope !== 'pusat' ? `/admin/dashboard/${scope}` : '/';
}

function filterMenuItems(items: MenuItem[], access: AdminMenuAccess): MenuItem[] {
    return items
        .map((item) => {
            if (item.name === 'Dashboard') {
                return (access.allowedDashboardScopes ?? []).length > 0
                    ? { ...item, path: dashboardPath(access.defaultDashboardScope) }
                    : null;
            }

            if (item.section === 'Pengaturan' && item.children) {
                const allowedSettingPaths = new Set(
                    (access.allowedSettingScopes ?? []).flatMap((scope) => [
                        `/admin/pengaturan/${scope}`,
                        `/admin/pengaturan/${scope}/jadwal-latihan`,
                    ]),
                );

                const children = item.children
                    .filter((child) => {
                        if (child.path === '/admin/pengaturan/role-permission') {
                            return access.canViewRolePermission;
                        }

                        if (child.path === '/admin/pengaturan/user-management') {
                            return access.canViewUserManagement;
                        }

                        return child.path ? allowedSettingPaths.has(child.path) : false;
                    })
                    .map((child) => {
                        if (!child.children?.length) {
                            return child;
                        }

                        const nestedChildren = child.children.filter((nestedChild) =>
                            nestedChild.path ? allowedSettingPaths.has(nestedChild.path) : false,
                        );

                        return nestedChildren.length > 0 ? { ...child, children: nestedChildren } : child;
                    });

                return children.length > 0 ? { ...item, children } : null;
            }

            return item;
        })
        .filter(Boolean) as MenuItem[];
}

export function buildAdminMenu(access: AdminMenuAccess = {}): MenuItem[] {
    return filterMenuItems(adminMenu, access);
}
