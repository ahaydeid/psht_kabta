import { Head } from '@inertiajs/react';

import { PublicPagePlaceholder } from './components/common/PublicPagePlaceholder';
import { PublicLayout } from './components/layout/PublicLayout';

export default function Jadwal() {
    return (
        <PublicLayout>
            <Head title="Jadwal" />
            <PublicPagePlaceholder title="Jadwal" />
        </PublicLayout>
    );
}
