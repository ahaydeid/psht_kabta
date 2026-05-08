import { Head } from '@inertiajs/react';

import { UnderDevelopment } from '@/Components/Admin/UnderDevelopment';
import { AdminLayout } from '@/Layouts/AdminLayout';

export default function KontributorIndex() {
    return (
        <AdminLayout>
            <Head title="Kontributor" />

            <UnderDevelopment />
        </AdminLayout>
    );
}
