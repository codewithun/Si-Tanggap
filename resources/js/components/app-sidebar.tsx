import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {  Bell, LayoutGrid, Map, MapPinned, ShieldCheck, TentTree, User, Users } from 'lucide-react';
import AppLogo from './app-logo';

interface User {
    role?: string;
}
interface Auth {
    user?: User;
}

export function AppSidebar() {
    const { auth } = usePage().props as { auth?: Auth };
    const user = auth?.user;

    // Fungsi helper untuk path dashboard berdasarkan role
    // role dari Spatie sudah didapatkan dengan getRoleNames().first() di backend
    const dashboardHref = () => {
        if (user?.role === 'relawan') return '/relawan/dashboard';
        if (user?.role === 'admin') return '/admin/dashboard';
        return '/dashboard'; // masyarakat dan default
    };

    // Menu utama default (Dashboard)
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardHref(),
            icon: LayoutGrid,
        },
    ];

    // Tambahkan menu berdasarkan role
    if (user?.role === 'masyarakat') {
        mainNavItems.length = 0; // Hapus dashboard default
        mainNavItems.push(
            {
                title: 'Dashboard',
                href: '/masyarakat/laporan-saya',
                icon: LayoutGrid,
            },
            {
                title: 'Peta Bencana & Evakuasi',
                href: '/masyarakat/peta-bencana',
                icon: Map,
            },
        );
    } else if (user?.role === 'relawan') {
        mainNavItems.push(
            {
                title: 'Peta Bencana',
                href: '/relawan/bencana-map',
                icon: Map,
            },
            {
                title: 'Jalur & Posko Evakuasi',
                href: '/relawan/evacuation-and-shelter-map',
                icon: MapPinned,
            },
            {
                title: 'Tambah Jalur/Posko',
                href: '/relawan/add-evacuation-and-shelter',
                icon: TentTree,
            },
            {
                title: 'Verifikasi Laporan',
                href: '/relawan/disaster-report-verification',
                icon: ShieldCheck,
            },
        );
    } else if (user?.role === 'admin') {
        mainNavItems.push(
            {
                title: 'Kelola Pengguna',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Peta Bencana',
                href: '/admin/disaster-map',
                icon: Map,
            },
            {
                title: 'Peta Jalur & Posko Evakuasi',
                href: '/admin/map',
                icon: Map,
            },
            {
                title: 'Jalur Evakuasi',
                href: '/admin/evacuation-routes',
                icon: MapPinned,
            },
            {
                title: 'Posko',
                href: '/admin/shelters',
                icon: TentTree,
            },
            {
                title: 'Laporan Bencana',
                href: '/admin/reports',
                icon: ShieldCheck,
            },
            {
                title: 'Kirim Notifikasi',
                href: '/admin/notifications',
                icon: Bell,
            },
        );
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardHref()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
