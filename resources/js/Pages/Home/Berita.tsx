import { Head } from '@inertiajs/react';

import { PublicPagePlaceholder } from './components/common/PublicPagePlaceholder';
import { PublicLayout } from './components/layout/PublicLayout';

export default function Berita() {
    return (
        <PublicLayout>
            <Head title="Berita" />
            <PublicPagePlaceholder title="Berita" />
        </PublicLayout>
    );
}
