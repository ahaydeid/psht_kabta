import { Head } from '@inertiajs/react';

import { PublicPagePlaceholder } from './components/common/PublicPagePlaceholder';
import { PublicLayout } from './components/layout/PublicLayout';

export default function Kontak() {
    return (
        <PublicLayout>
            <Head title="Kontak" />
            <PublicPagePlaceholder title="Kontak" />
        </PublicLayout>
    );
}
