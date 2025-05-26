import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Map, Shield, Users } from 'lucide-react';

interface User {
    role?: string;
}

interface Auth {
    user?: User;
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const auth = page.props.auth as Auth | undefined;
    const user = auth?.user;

    // Add role-specific navigation items
    const allItems = [...items];

    // Add map link for all users
    allItems.push({
        title: 'Peta Bencana',
        href: '/map',
        icon: Map,
    });

    // Add volunteer dashboard link for volunteers
    if (user?.role === 'relawan') {
        allItems.push({
            title: 'Panel Relawan',
            href: '/relawan/dashboard',
            icon: Shield,
        });
    }

    // Add user management link for admins
    if (user?.role === 'admin') {
        allItems.push({
            title: 'Kelola Pengguna',
            href: '/users',
            icon: Users,
        });
    }

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {allItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
