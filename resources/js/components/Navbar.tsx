import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface NavbarProps {
    isAuthenticated?: boolean;
    userRole?: 'masyarakat' | 'relawan' | 'admin' | null;
    isLandingPage?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated = false, userRole = null, isLandingPage = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);

            // Update active section based on scroll position
            if (isLandingPage) {
                const sections = ['hero', 'features', 'users', 'statistics', 'news', 'about'];
                const scrollPosition = window.scrollY + 100;

                for (let i = sections.length - 1; i >= 0; i--) {
                    const section = document.getElementById(sections[i]);
                    if (section && section.offsetTop <= scrollPosition) {
                        setActiveSection(sections[i]);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isLandingPage]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const scrollToSection = (sectionId: string, event: React.MouseEvent) => {
        if (isLandingPage) {
            event.preventDefault();
            const section = document.getElementById(sectionId);
            if (section) {
                window.scrollTo({
                    top: section.offsetTop - 80, // Account for navbar height
                    behavior: 'smooth',
                });
                setActiveSection(sectionId);
                setIsMenuOpen(false);
            }
        }
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

    const navItems = [
        { name: 'Beranda', href: '/', sectionId: 'hero' },
        { name: 'Fitur', href: '/features', sectionId: 'features' },
        { name: 'Pengguna', href: '/users', sectionId: 'users' },
        { name: 'Statistik', href: '/statistics', sectionId: 'statistics' },
        { name: 'Berita', href: '/news', sectionId: 'news' },
        { name: 'Tentang', href: '/about', sectionId: 'about' },
    ];

    return (
        <nav className={`sticky top-0 z-50 w-full border-b border-gray-200 bg-white transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/img/logo.png" alt="GeoSiaga Logo" className="h-8 w-auto" />
                            <span className="text-xl font-bold">
                                <span className="text-black">Geo</span>
                                <span className="text-blue-400">Siaga</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={isLandingPage ? `#${item.sectionId}` : item.href}
                                    onClick={(e) => isLandingPage && scrollToSection(item.sectionId, e)}
                                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                        isLandingPage && activeSection === item.sectionId
                                            ? 'bg-blue-50 font-semibold text-blue-600'
                                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                                >
                                    {item.name}
                                </a>
                            ))}

                            {isAuthenticated ? (
                                <Link
                                    href={getDashboardLink()}
                                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    Masuk
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Buka menu utama</span>
                            {/* Icon when menu is closed */}
                            <svg
                                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {/* Icon when menu is open */}
                            <svg
                                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state */}
            {isMenuOpen && (
                <div
                    className={`${
                        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden transition-all duration-300 ease-in-out md:hidden`}
                >
                    <div className="space-y-1 px-2 pt-2 pb-3">
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={isLandingPage ? `#${item.sectionId}` : item.href}
                                onClick={(e) => isLandingPage && scrollToSection(item.sectionId, e)}
                                className={`block rounded-md px-3 py-2 text-base font-medium ${
                                    isLandingPage && activeSection === item.sectionId
                                        ? 'bg-blue-50 font-semibold text-blue-600'
                                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                            >
                                {item.name}
                            </a>
                        ))}

                        {isAuthenticated ? (
                            <Link
                                href={getDashboardLink()}
                                className="block rounded-md bg-blue-600 px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/login" className="block rounded-md bg-blue-600 px-3 py-2 text-base font-medium text-white hover:bg-blue-700">
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
