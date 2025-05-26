import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Map, MapPinned, ShieldCheck, TentTree, Users } from 'lucide-react';
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
    const dashboardHref = () => {
        if (user?.role === 'relawan') return '/relawan/dashboard';
        return '/dashboard'; // admin & masyarakat (jika ada)
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
    if (user?.role === 'relawan') {
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
        mainNavItems.push({
            title: 'Kelola Pengguna',
            href: '/users',
            icon: Users,
        });
    }

    // Footer nav items bisa tetap sama
    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
