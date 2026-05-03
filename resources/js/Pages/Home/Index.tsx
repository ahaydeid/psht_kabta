import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { homeInformationPopup } from './data/homeContent';
import { HomeInformationModal } from './components/home/HomeInformationModal';
import { HomeIntroSection } from './components/home/HomeIntroSection';
import { HomeNewsPreviewSection } from './components/home/HomeNewsPreviewSection';
import { HomeQuickAccessSection } from './components/home/HomeQuickAccessSection';
import { HomeSchedulePreviewSection } from './components/home/HomeSchedulePreviewSection';
import { PublicLayout } from './components/layout/PublicLayout';

function shouldShowInitialInformation() {
    return homeInformationPopup.isActive && window.initialAppPathname === '/' && !window.hasClosedHomeInformationModal;
}

export default function HomeIndex() {
    const [showInformation, setShowInformation] = useState(() => shouldShowInitialInformation());
    const closeInformation = () => {
        window.hasClosedHomeInformationModal = true;
        setShowInformation(false);
    };

    return (
        <PublicLayout>
            <Head title="Beranda" />
            {showInformation ? (
                <HomeInformationModal information={homeInformationPopup} onClose={closeInformation} />
            ) : null}
            <main>
                <HomeIntroSection />
                <HomeQuickAccessSection />
                <HomeNewsPreviewSection />
                <HomeSchedulePreviewSection />
            </main>
        </PublicLayout>
    );
}
