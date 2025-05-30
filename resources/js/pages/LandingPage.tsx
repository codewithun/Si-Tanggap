import FeatureSection from '@/components/FeatureSection';
import Navbar from '@/components/Navbar';
import NewsSection from '@/components/NewsSection';
import RoleSelector from '@/components/RoleSelector';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import AboutSection from '../components/AboutSection';
import HeroSection from '../components/HeroSection';
import Statistics from '../components/Statistics';

export default function LandingPage() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth.user;
    const userRole = auth.user?.role || null;

    useEffect(() => {
        // Check for section parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const sectionParam = urlParams.get('section');

        if (sectionParam) {
            const section = document.getElementById(sectionParam);
            if (section) {
                // Increased timeout to ensure page fully loads
                setTimeout(() => {
                    window.scrollTo({
                        top: section.offsetTop - 80, // Adjust for navbar height
                        behavior: 'smooth',
                    });

                    // Update URL to remove query parameter after scrolling
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, newUrl);
                }, 300); // Longer timeout for better reliability
            }
        }
    }, []);

    return (
        <>
            <Head title="Si-Tanggap - Sistem Informasi Tanggap Bencana" />

            <div className="flex min-h-screen flex-col">
                <Navbar isAuthenticated={isAuthenticated} userRole={userRole} isLandingPage={true} />

                <main className="flex-1">
                    <div id="hero">
                        <HeroSection />
                    </div>

                    <div id="features">
                        <FeatureSection />
                    </div>

                    <div id="users">
                        <RoleSelector />
                    </div>

                    <div id="statistics">
                        <Statistics />
                    </div>

                    <div id="news" className="py-24">
                        <div className="container mx-auto px-4">
                            <NewsSection />
                        </div>
                    </div>

                    <div id="about">
                        <AboutSection />
                    </div>
                </main>
            </div>
        </>
    );
}
