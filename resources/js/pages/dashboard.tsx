import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

// Import hanya dashboard masyarakat - admin dan relawan redirect
import MasyarakatDashboard from '@/pages/masyarakat/MasyarakatDashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Untuk dashboard masyarakat cukup menggunakan komponen langsung
// Admin dan Relawan akan diredirect ke halaman dashboard spesifik mereka

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    // Handle saat user belum dimuat
    if (!user) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="py-10 text-center text-gray-500">Loading...</div>
            </AppLayout>
        );
    }

    // Debug log - berguna untuk pengembangan
    console.log('Role user:', user.role);

    // Redirect jika role spesifik
    // role sekarang dari Spatie sudah didapatkan dengan getRoleNames().first()
    if (user?.role === 'relawan') {
        window.location.href = '/relawan/dashboard';
        return null;
    }
    if (user?.role === 'admin') {
        window.location.href = '/admin/dashboard';
        return null;
    }

    // Ambil dashboard berdasarkan role untuk masyarakat
    const dashboardComponent =
        user.role === 'masyarakat' ? (
            <MasyarakatDashboard />
        ) : (
            <div className="py-10 text-center font-semibold text-red-600">
                Unauthorized: Role <strong>{user.role}</strong> tidak dikenali
            </div>
        );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">{dashboardComponent}</div>
        </AppLayout>
    );
}
