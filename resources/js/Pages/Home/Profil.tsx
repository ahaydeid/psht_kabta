import { Head } from '@inertiajs/react';

import { PublicPagePlaceholder } from './components/common/PublicPagePlaceholder';
import { PublicLayout } from './components/layout/PublicLayout';

export default function Profil() {
    return (
        <PublicLayout>
            <Head title="Profil" />
            <PublicPagePlaceholder title="Profil" />
        </PublicLayout>
    );
}
