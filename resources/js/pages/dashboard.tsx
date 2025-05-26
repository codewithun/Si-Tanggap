import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

// Import role-specific dashboards
import AdminDashboard from '@/pages/admin/AdminDashboard';
import MasyarakatDashboard from '@/pages/masyarakat/MasyarakatDashboard';
import RelawanDashboard from '@/pages/relawan/RelawanDashboard';
import { JSX } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const roleDashboardMap: Record<string, JSX.Element> = {
    admin: <AdminDashboard />,
    masyarakat: <MasyarakatDashboard />,
    relawan: <RelawanDashboard />,
};

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const dashboardComponent = roleDashboardMap[user?.role ?? ''] || (
        <div className="text-red-500">Unauthorized: Role tidak dikenali</div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {dashboardComponent}
            </div>
        </AppLayout>
    );
}
