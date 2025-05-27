import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { useCallback, useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import AdminMap from './AdminMap';

// Register all necessary chart components including ArcElement for Pie charts
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement, // Penting! Tambahkan ArcElement untuk Pie chart
    Title,
    Tooltip,
    Legend,
);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
];

// Standardisasi nama jenis bencana untuk tampilan
const disasterTypeMap: Record<string, string> = {
    banjir: 'Banjir',
    gempa: 'Gempa Bumi',
    longsor: 'Tanah Longsor',
    tsunami: 'Tsunami',
    'angin-topan': 'Angin Topan',
    kebakaran: 'Kebakaran',
};

// Colors for each disaster type
const disasterTypeColors: Record<string, { backgroundColor: string; borderColor: string }> = {
    banjir: {
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
    },
    gempa: {
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
    },
    longsor: {
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
    },
    tsunami: {
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
    },
    'angin-topan': {
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
    },
    kebakaran: {
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
    },
};

interface StatisticsData {
    totalBencana: number;
    totalLaporan: number;
    totalLaporanVerified: number;
    totalPosko: number;
    bencanaBerdasarkanJenis: Record<string, number>;
    laporanBulanan: Record<string, number>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchStatistics = useCallback(async () => {
        try {
            const response = await axios.get('/statistik-bencana');

            // Ensure all disaster types are represented in statistics
            const standardizedData = { ...response.data };

            if (standardizedData.bencanaBerdasarkanJenis) {
                // Create a standardized object with all disaster types initialized to 0
                const standardizedCounts: Record<string, number> = {
                    banjir: 0,
                    gempa: 0,
                    longsor: 0,
                    tsunami: 0,
                    'angin-topan': 0,
                    kebakaran: 0,
                };

                // Map the incoming data to our standardized structure
                Object.entries(standardizedData.bencanaBerdasarkanJenis).forEach(([key, value]) => {
                    // Use original key if it exists in our map, otherwise keep as is
                    const normalizedKey = key.toLowerCase();
                    if (Object.prototype.hasOwnProperty.call(standardizedCounts, normalizedKey)) {
                        standardizedCounts[normalizedKey] = value as number;
                    } else {
                        // Handle any unexpected disaster types
                        standardizedCounts[key] = value as number;
                    }
                });

                standardizedData.bencanaBerdasarkanJenis = standardizedCounts;
            }

            setStats(standardizedData);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast({
                    title: 'Error',
                    description: error.response?.data?.message || 'Gagal memuat data statistik',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Error',
                    description: 'Terjadi kesalahan saat memuat data',
                    variant: 'destructive',
                });
            }
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    const disasterTypeChartData = {
        labels: stats?.bencanaBerdasarkanJenis ? Object.keys(stats.bencanaBerdasarkanJenis).map((key) => disasterTypeMap[key] || key) : [],
        datasets: [
            {
                label: 'Jumlah Kejadian',
                data: stats?.bencanaBerdasarkanJenis ? Object.values(stats.bencanaBerdasarkanJenis) : [],
                backgroundColor: stats?.bencanaBerdasarkanJenis
                    ? Object.keys(stats.bencanaBerdasarkanJenis).map((key) => disasterTypeColors[key]?.backgroundColor || 'rgba(128, 128, 128, 0.6)')
                    : [],
                borderColor: stats?.bencanaBerdasarkanJenis
                    ? Object.keys(stats.bencanaBerdasarkanJenis).map((key) => disasterTypeColors[key]?.borderColor || 'rgba(128, 128, 128, 1)')
                    : [],
                borderWidth: 1,
            },
        ],
    };

    const monthlyReportChartData = {
        labels: stats?.laporanBulanan ? Object.keys(stats.laporanBulanan) : [],
        datasets: [
            {
                label: 'Laporan Bulanan',
                data: stats?.laporanBulanan ? Object.values(stats.laporanBulanan) : [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Statistik Bencana',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            title: {
                display: true,
                text: 'Distribusi Jenis Bencana',
            },
        },
    };

    const renderStatisticsContent = () => {
        if (loading) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, index) => (
                            <Card key={index} className="animate-pulse">
                                <CardHeader className="pb-2">
                                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 w-1/3 rounded bg-gray-200"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[...Array(2)].map((_, index) => (
                            <Card key={index} className="animate-pulse">
                                <CardHeader className="pb-2">
                                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-40 rounded bg-gray-200"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Bencana</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalBencana || 0}</div>
                            <p className="text-muted-foreground text-xs">Jumlah bencana yang terjadi</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Laporan Masuk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalLaporan || 0}</div>
                            <p className="text-muted-foreground text-xs">Total laporan dari masyarakat</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Laporan Terverifikasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalLaporanVerified || 0}</div>
                            <p className="text-muted-foreground text-xs">Laporan yang sudah diverifikasi</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Posko Evakuasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalPosko || 0}</div>
                            <p className="text-muted-foreground text-xs">Jumlah posko yang tersedia</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistik Jenis Bencana</CardTitle>
                            <CardDescription>Jumlah kejadian berdasarkan jenis bencana</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <Bar data={disasterTypeChartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Laporan Bulanan</CardTitle>
                            <CardDescription>Jumlah laporan per bulan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <Bar data={monthlyReportChartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tambahkan Pie Chart untuk distribusi jenis bencana */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Jenis Bencana</CardTitle>
                        <CardDescription>Persentase kejadian berdasarkan jenis bencana</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div className="h-[300px] w-full max-w-[600px]">
                            <Pie data={disasterTypeChartData} options={pieChartOptions} />
                        </div>
                    </CardContent>
                </Card>

                {/* Tabel Rincian Jenis Bencana */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rincian Statistik Jenis Bencana</CardTitle>
                        <CardDescription>Data lengkap jumlah kejadian per jenis bencana</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Jenis Bencana</th>
                                        <th className="px-4 py-2 text-left font-medium">Jumlah Kejadian</th>
                                        <th className="px-4 py-2 text-left font-medium">Persentase</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.bencanaBerdasarkanJenis &&
                                        Object.entries(stats.bencanaBerdasarkanJenis).map(([key, value]) => {
                                            const total = Object.values(stats.bencanaBerdasarkanJenis).reduce((a, b) => a + b, 0);
                                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

                                            return (
                                                <tr key={key} className="border-b">
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-3 w-3 rounded-full"
                                                                style={{
                                                                    backgroundColor: disasterTypeColors[key]?.backgroundColor || 'grey',
                                                                }}
                                                            ></div>
                                                            {disasterTypeMap[key] || key}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2">{value}</td>
                                                    <td className="px-4 py-2">{percentage}%</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                                <tfoot className="bg-muted/30">
                                    <tr>
                                        <td className="px-4 py-2 font-medium">Total</td>
                                        <td className="px-4 py-2 font-medium">
                                            {stats?.bencanaBerdasarkanJenis
                                                ? Object.values(stats.bencanaBerdasarkanJenis).reduce((a, b) => a + b, 0)
                                                : 0}
                                        </td>
                                        <td className="px-4 py-2 font-medium">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-gray-800">Dashboard Admin</h1>
                    <p className="mt-1 text-gray-600">Kelola aplikasi WebGIS untuk tanggap bencana</p>
                </div>

                {/* Statistik */}
                <div className="mt-8">{renderStatisticsContent()}</div>

                {/* Peta */}
                <div className="mt-8">
                    <h2 className="mb-4 text-xl font-semibold text-gray-800">Peta Bencana</h2>
                    <AdminMap />
                </div>
            </div>
        </AppLayout>
    );
}
