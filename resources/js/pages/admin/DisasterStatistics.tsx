import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Update the path below if your useToast hook is located elsewhere
import axios from 'axios';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useToast } from '../../hooks/useToast';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StatisticsData {
    totalBencana: number;
    totalLaporan: number;
    totalLaporanVerified: number;
    totalPosko: number;
    bencanaBerdasarkanJenis: Record<string, number>;
    laporanBulanan: Record<string, number>;
}

export default function DisasterStatistics() {
    const [stats, setStats] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await axios.get('/api/statistik-bencana');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data statistik bencana',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data for disaster types
    const disasterTypeChartData = {
        labels: stats ? Object.keys(stats.bencanaBerdasarkanJenis) : [],
        datasets: [
            {
                label: 'Jumlah Kejadian',
                data: stats ? Object.values(stats.bencanaBerdasarkanJenis) : [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Prepare chart data for monthly reports
    const monthlyReportChartData = {
        labels: stats ? Object.keys(stats.laporanBulanan) : [],
        datasets: [
            {
                label: 'Laporan Bulanan',
                data: stats ? Object.values(stats.laporanBulanan) : [],
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
        },
    };

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
        </div>
    );
}
