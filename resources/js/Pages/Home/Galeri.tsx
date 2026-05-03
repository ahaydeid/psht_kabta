import { Head } from '@inertiajs/react';

import { PublicPagePlaceholder } from './components/common/PublicPagePlaceholder';
import { PublicLayout } from './components/layout/PublicLayout';

export default function Galeri() {
    return (
        <PublicLayout>
            <Head title="Galeri" />
            <PublicPagePlaceholder title="Galeri" />
        </PublicLayout>
    );
}
