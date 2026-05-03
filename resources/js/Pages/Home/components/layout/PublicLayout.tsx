import type { ReactNode } from 'react';

import { PublicBottomBar } from './PublicBottomBar';
import { PublicFooter } from './PublicFooter';
import { PublicTopbar } from './PublicTopbar';

type PublicLayoutProps = {
    children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-white text-zinc-950">
            <PublicTopbar />
            {children}
            <PublicFooter />
            <PublicBottomBar />
        </div>
    );
}

