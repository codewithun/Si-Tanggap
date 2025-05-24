import Navbar from '@/components/Navbar';
import { Head, usePage } from '@inertiajs/react';
// Make sure the path is correct; if the file is named 'HeroSection.tsx' and located in 'resources/js/components', use:
import HeroSection from '../components/HeroSection';
// Or, if using an alias, ensure your tsconfig.json or webpack config maps '@' to 'resources/js'
import { type SharedData } from '@/types';
import AboutSection from '../components/AboutSection';
import DisasterMap from '../components/DisasterMap';
import RecentReports from '../components/RecentReports';
import Statistics from '../components/Statistics';

export default function LandingPage() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth.user;
    const userRole = auth.user?.role || null;

    return (
        <>
            <Head title="Si-Tanggap - Sistem Informasi Tanggap Bencana" />

            <div className="flex min-h-screen flex-col">
                <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />

                <main className="flex-1">
                    <HeroSection />
                    <Statistics />
                    <RecentReports />
                    <DisasterMap />
                    <AboutSection />
                </main>
            </div>
        </>
    );
}
