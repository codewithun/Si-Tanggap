import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import AdminMap from './AdminMap';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Peta Bencana',
        href: '/admin/disaster-map',
    },
];

export default function DisasterMap() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peta Bencana" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold text-gray-800">Peta Bencana</h1>
                <p className="mb-6 text-gray-600">Visualisasi data bencana, jalur evakuasi, dan posko pengungsian dalam bentuk peta interaktif.</p>

                <AdminMap />
            </div>
        </AppLayout>
    );
}
