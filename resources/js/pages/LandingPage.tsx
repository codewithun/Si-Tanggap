import FeatureSection from '@/components/FeatureSection';
import Navbar from '@/components/Navbar';
import NewsSection from '@/components/NewsSection';
import RoleSelector from '@/components/RoleSelector';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import AboutSection from '../components/AboutSection';
import HeroSection from '../components/HeroSection';
import Statistics from '../components/Statistics';

export default function LandingPage() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth.user;
    const userRole = auth.user?.role || null;

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

                    <div id="news">
                        <NewsSection />
                    </div>

                    <div id="about">
                        <AboutSection />
                    </div>
                </main>
            </div>
        </>
    );
}
