import { Link } from '@inertiajs/react';
import React, { useState } from 'react';

interface NavbarProps {
    isAuthenticated?: boolean;
    userRole?: 'masyarakat' | 'relawan' | 'admin' | null;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated = false, userRole = null }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Dashboard link based on user role
    const getDashboardLink = () => {
        switch (userRole) {
            case 'masyarakat':
                return '/dashboard/masyarakat';
            case 'relawan':
                return '/dashboard/relawan';
            case 'admin':
                return '/dashboard/admin';
            default:
                return '/dashboard';
        }
    };

    return (
        <header className="fixed top-0 right-0 left-0 z-50 bg-white px-4 py-2 shadow-sm">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center">
                        <img src="/logo.svg" alt="Si Tanggap Logo" className="mr-2 h-10 w-10" />
                        <span className="text-2xl font-bold text-blue-600">Si Tanggap</span>
                    </Link>
                </div>

                {/* Navigation Menu */}
                <nav className="hidden md:flex">
                    <ul className="flex space-x-6">
                        <li>
                            <Link href="/" className="px-2 py-1 font-medium text-gray-700 hover:text-blue-600">
                                Beranda
                            </Link>
                        </li>
                        <li>
                            <Link href="/webgis/map" className="px-2 py-1 font-medium text-gray-700 hover:text-blue-600">
                                Peta
                            </Link>
                        </li>
                        <li>
                            <Link href="/webgis/reports" className="px-2 py-1 font-medium text-gray-700 hover:text-blue-600">
                                Laporan
                            </Link>
                        </li>
                        <li>
                            <Link href="/webgis/about" className="px-2 py-1 font-medium text-gray-700 hover:text-blue-600">
                                Tentang Kami
                            </Link>
                        </li>

                        {/* Authentication Links */}
                        {isAuthenticated ? (
                            <>
                                <li>
                                    <Link href={getDashboardLink()} className="px-2 py-1 font-medium text-blue-600 hover:text-blue-800">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/logout" method="post" as="button" className="px-2 py-1 font-medium text-red-600 hover:text-red-800">
                                        Logout
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link href="/login" className="px-2 py-1 font-medium text-gray-700 hover:text-blue-600">
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/register" className="rounded-md bg-blue-600 px-4 py-1 font-medium text-white hover:bg-blue-700">
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button className="flex items-center p-2 text-gray-500" aria-label="Toggle Menu" onClick={toggleMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="container mx-auto bg-white px-4 py-2">
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="block py-2 font-medium text-gray-700 hover:text-blue-600">
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link href="/webgis/map" className="block py-2 font-medium text-gray-700 hover:text-blue-600">
                                    Peta
                                </Link>
                            </li>
                            <li>
                                <Link href="/webgis/reports" className="block py-2 font-medium text-gray-700 hover:text-blue-600">
                                    Laporan
                                </Link>
                            </li>
                            <li>
                                <Link href="/webgis/about" className="block py-2 font-medium text-gray-700 hover:text-blue-600">
                                    Tentang Kami
                                </Link>
                            </li>

                            {/* Authentication Links */}
                            {isAuthenticated ? (
                                <>
                                    <li>
                                        <Link href={getDashboardLink()} className="block py-2 font-medium text-blue-600 hover:text-blue-800">
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="block py-2 font-medium text-red-600 hover:text-red-800"
                                        >
                                            Logout
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link href="/login" className="block py-2 font-medium text-gray-700 hover:text-blue-600">
                                            Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/register" className="block py-2 font-medium text-blue-600 hover:text-blue-800">
                                            Register
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
