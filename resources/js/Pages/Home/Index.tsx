import { Head } from '@inertiajs/react';

import { HomeIntroSection } from './components/home/HomeIntroSection';
import { HomeNewsPreviewSection } from './components/home/HomeNewsPreviewSection';
import { HomeQuickAccessSection } from './components/home/HomeQuickAccessSection';
import { HomeSchedulePreviewSection } from './components/home/HomeSchedulePreviewSection';
import { PublicLayout } from './components/layout/PublicLayout';

export default function HomeIndex() {
    return (
        <PublicLayout>
            <Head title="Beranda" />
            <main>
                <HomeIntroSection />
                <HomeQuickAccessSection />
                <HomeNewsPreviewSection />
                <HomeSchedulePreviewSection />
            </main>
        </PublicLayout>
    );
}
