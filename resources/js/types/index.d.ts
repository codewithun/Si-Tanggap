import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

// ENUM Role agar tidak typo
export type Role = 'admin' | 'masyarakat' | 'relawan';

export interface User {
    id: number;
    name: string;
    email: string;
    role?: Role; // Optional untuk menghindari error saat masih null
    roles?: Role[]; // Jika kamu gunakan Spatie multi-role
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    status?: string;
    [key: string]: unknown; // Tambahan properti lainnya
}

export interface Auth {
    user: User | null; // Bisa null saat belum login
}

export interface SharedData {
    name: string;
    quote: {
        message: string;
        author: string;
    };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}
