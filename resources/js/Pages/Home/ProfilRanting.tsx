import { Head } from '@inertiajs/react';

import { PublicPagePlaceholder } from './components/common/PublicPagePlaceholder';
import { PublicLayout } from './components/layout/PublicLayout';

export default function ProfilRanting() {
    return (
        <PublicLayout>
            <Head title="Ranting" />
            <PublicPagePlaceholder title="Ranting" />
        </PublicLayout>
    );
}
