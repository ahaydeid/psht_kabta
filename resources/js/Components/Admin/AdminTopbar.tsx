import { Bell, Menu, Search, UserRound } from 'lucide-react';

import { Button } from '@/Components/ui';

type AdminTopbarProps = {
    onMenuClick?: () => void;
    organizationName?: string;
};

export function AdminTopbar({ onMenuClick, organizationName = 'PSHT Kabta' }: AdminTopbarProps) {
    return (
        <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-zinc-200 bg-white px-4 lg:px-6">
            <div className="flex items-center gap-3 lg:gap-4">
                <Button className="-ml-2 rounded-lg p-2 lg:hidden" onClick={onMenuClick} variant="ghost">
                    <Menu className="size-5 text-zinc-600" />
                </Button>

                <div className="hidden flex-col leading-tight lg:flex">
                    <span className="text-sm font-semibold tracking-tight text-zinc-800">{organizationName}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
                <div className="hidden items-center gap-2 rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-400 md:flex">
                    <Search className="size-4" />
                    <span>Cari menu atau data...</span>
                </div>
                <Button className="relative rounded-lg p-2" variant="ghost">
                    <Bell className="size-5 text-zinc-700" />
                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand-red" />
                </Button>
                <Button className="flex h-auto items-center gap-2 rounded-lg px-2 py-1.5" variant="ghost">
                    <span className="flex size-8 items-center justify-center rounded-full bg-brand-yellow text-brand-black">
                        <UserRound className="size-4" />
                    </span>
                    <span className="hidden text-left lg:block">
                        <span className="block text-sm font-semibold text-zinc-800">Admin</span>
                        <span className="block text-[10px] text-zinc-500">Administrator</span>
                    </span>
                </Button>
            </div>
        </header>
    );
}
