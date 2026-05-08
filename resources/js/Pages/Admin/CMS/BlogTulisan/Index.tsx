import { Head } from '@inertiajs/react';

import { UnderDevelopment } from '@/Components/Admin/UnderDevelopment';
import { AdminLayout } from '@/Layouts/AdminLayout';

export default function BlogTulisanIndex() {
    return (
        <AdminLayout>
            <Head title="Blog & Tulisan" />

            <UnderDevelopment />
        </AdminLayout>
    );
}
