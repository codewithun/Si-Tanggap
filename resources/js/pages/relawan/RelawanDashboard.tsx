import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, BarChart, ClipboardCheck, TentTree } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Relawan',
        href: '/relawan/dashboard',
    },
];

interface DashboardStats {
    totalLaporan: number;
    laporanDiverifikasi: number;
    poskoAktif: number;
    laporanTerbaru: Array<{
        id: number;
        judul: string;
        jenis_bencana: string;
        lokasi: string;
        created_at: string;
    }>;
}

export default function RelawanDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalLaporan: 0,
        laporanDiverifikasi: 0,
        poskoAktif: 0,
        laporanTerbaru: [],
    });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/api/relawan/dashboard-stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                toast({
                    title: 'Error',
                    description: 'Gagal memuat data dashboard',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [toast]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Relawan" />

            <div className="p-6">
                <h1 className="mb-4 text-3xl font-semibold text-gray-800">Dashboard Relawan</h1>
                <p className="mb-6 text-gray-600">
                    Selamat datang di dashboard relawan. Gunakan fitur yang tersedia untuk memantau dan memverifikasi laporan kebencanaan.
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Statistik Ringkas */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-semibold text-gray-700">Total Laporan Masuk</CardTitle>
                            <AlertTriangle className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.totalLaporan}</p>
                            <p className="mt-1 text-xs text-gray-500">Jumlah keseluruhan laporan bencana</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-semibold text-gray-700">Laporan Diverifikasi</CardTitle>
                            <ClipboardCheck className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats.laporanDiverifikasi}</p>
                            <p className="mt-1 text-xs text-gray-500">Laporan yang sudah diverifikasi</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-semibold text-gray-700">Posko Aktif</CardTitle>
                            <TentTree className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-purple-600">{loading ? '...' : stats.poskoAktif}</p>
                            <p className="mt-1 text-xs text-gray-500">Posko bantuan yang beroperasi</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Laporan Terbaru yang Menunggu Verifikasi */}
                <Card className="mt-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                <BarChart className="h-5 w-5" /> Laporan Terbaru Menunggu Verifikasi
                            </CardTitle>
                            <Link href="/relawan/disaster-report-verification">
                                <Button variant="outline" size="sm">
                                    Lihat Semua
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100"></div>
                                ))}
                            </div>
                        ) : stats.laporanTerbaru.length > 0 ? (
                            <div className="space-y-1">
                                {stats.laporanTerbaru.map((laporan) => (
                                    <Link key={laporan.id} href={`/relawan/disaster-report-verification?highlight=${laporan.id}`}>
                                        <div className="rounded-md border-b p-3 hover:bg-gray-50">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium">{laporan.judul}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {laporan.jenis_bencana} · {laporan.lokasi}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400">{formatDate(laporan.created_at)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                <p>Tidak ada laporan yang menunggu verifikasi</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
