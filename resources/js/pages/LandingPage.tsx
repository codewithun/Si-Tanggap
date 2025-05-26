import Navbar from '@/components/Navbar';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import AboutSection from '../components/AboutSection';
import HeroSection from '../components/HeroSection';
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
                    <AboutSection />
                </main>
            </div>
        </>
    );
}
