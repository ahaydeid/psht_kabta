import { Head } from '@inertiajs/react';

import { UnderDevelopment } from '@/Components/Admin/UnderDevelopment';
import { AdminLayout } from '@/Layouts/AdminLayout';

export default function GaleriIndex() {
    return (
        <AdminLayout>
            <Head title="Galeri" />

            <UnderDevelopment />
        </AdminLayout>
    );
}
