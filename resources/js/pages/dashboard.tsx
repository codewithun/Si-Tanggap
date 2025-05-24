import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

// Import role-specific dashboards
import AdminDashboard from '@/pages/admin/AdminDashboard';
import RelawanDashboard from '@/pages/relawan/RelawanDashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Render dashboard based on user role
    const renderDashboardByRole = () => {
        switch (user.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'masyarakat':
                return <div>Masyarakat Dashboard</div>; // Replace with actual masyarakat dashboard component
            case 'relawan':
                return <RelawanDashboard />; // Replace with actual relawan dashboard component
            default:
                return <div>Unauthorized</div>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">{renderDashboardByRole()}</div>
        </AppLayout>
    );
}
