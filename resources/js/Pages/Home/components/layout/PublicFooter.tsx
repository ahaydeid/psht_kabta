import { organizationProfile } from '../../data/homeContent';

export function PublicFooter() {
    return (
        <footer className="border-t border-zinc-200 bg-zinc-950 pb-20 text-white lg:pb-0">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                <div className="flex items-center gap-3">
                    <img alt="Logo PSHT" className="size-10 object-contain" src={organizationProfile.logo} />
                    <div>
                        <p className="text-sm font-bold">{organizationProfile.name}</p>
                        <p className="text-xs text-zinc-400">{organizationProfile.address}</p>
                    </div>
                </div>
                <p className="text-xs text-zinc-400">Copyright 2026. Semua hak cipta dilindungi.</p>
            </div>
        </footer>
    );
}
