import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios, { type AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

type StatusType = 'menunggu' | 'diverifikasi' | 'ditolak';
type TabType = 'semua' | StatusType;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/masyarakat/laporan-saya',
    },
];

interface Statistics {
    totalLaporan: number;
    menunggu: number;
    diverifikasi: number;
    ditolak: number;
    tingkatResiko: {
        rendah: number;
        sedang: number;
        tinggi: number;
    };
}

interface Laporan {
    id: number;
    judul: string;
    jenis_bencana: string;
    lokasi: string;
    status: StatusType;
    created_at: string;
    tingkat_bahaya?: 'rendah' | 'sedang' | 'tinggi';
    deskripsi?: string;
}

interface ApiResponse {
    data: Laporan[];
    message?: string;
    statistics?: Statistics;
}

interface ErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

export default function MasyarakatDashboard() {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const userId = auth?.user?.id;
    const [laporans, setLaporans] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('semua');
    const [statistics, setStatistics] = useState<Statistics>({
        totalLaporan: 0,
        menunggu: 0,
        diverifikasi: 0,
        ditolak: 0,
        tingkatResiko: {
            rendah: 0,
            sedang: 0,
            tinggi: 0
        }
    });
    const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);

    const getLaporanSaya = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number> = activeTab !== 'semua' ? { status: activeTab } : {};
            if (userId) params.user_id = userId;
            const response = await axios.get<ApiResponse>('/api/laporan-saya', { params });

            if (response.data) {
                if (Array.isArray(response.data.data)) {
                    setLaporans(response.data.data);
                } else {
                    setLaporans([]);
                    console.warn('Unexpected API response format:', response.data);
                }
                
                if (response.data.statistics) {
                    setStatistics(response.data.statistics);
                }
            }
        } catch (error) {
            console.error('Error fetching reports:', error);

            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Terjadi kesalahan tidak terduga';

            toast.error(`Gagal mengambil data laporan: ${errorMessage}`);
            setLaporans([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, userId]);

    useEffect(() => {
        getLaporanSaya();
    }, [getLaporanSaya]);

    const getStatusBadge = (status: StatusType) => {
        const statusConfig = {
            menunggu: {
                className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                label: 'Menunggu',
            },
            diverifikasi: {
                className: 'bg-green-100 text-green-800 border-green-300',
                label: 'Diverifikasi',
            },
            ditolak: {
                className: 'bg-red-100 text-red-800 border-red-300',
                label: 'Ditolak',
            },
        };

        const config = statusConfig[status];

        return (
            <Badge variant="outline" className={config.className}>
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const handleCreateReport = () => {
        router.visit('/masyarakat/buat-laporan');
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value as TabType);
    };

    const getEmptyStateMessage = () => {
        if (activeTab === 'semua') {
            return 'Belum ada laporan. Silakan buat laporan pertama Anda.';
        }
        return `Belum ada laporan dengan status "${activeTab}".`;
    };

    const getTabLabel = (tab: TabType) => {
        const labels = {
            semua: 'Semua',
            menunggu: 'Menunggu',
            diverifikasi: 'Diverifikasi',
            ditolak: 'Ditolak',
        };
        return labels[tab];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Masyarakat" />
            <div className="container mx-auto max-w-[95%] space-y-8 px-2 py-6 lg:max-w-none">
                <Card className="w-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-semibold">Dashboard</CardTitle>
                        <CardDescription>
                            Selamat datang di Si-Tanggap. Di sini Anda dapat melihat dan mengelola laporan bencana yang pernah Anda kirimkan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Action Button */}
                        <div className="flex items-center justify-between">
                            <Button onClick={handleCreateReport} size="lg" className="font-medium">
                                + Buat Laporan Baru
                            </Button>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statistics.totalLaporan}</div>
                                    <p className="text-muted-foreground mt-2 text-xs">Semua laporan yang Anda buat</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">{statistics.menunggu}</div>
                                    <p className="text-muted-foreground mt-2 text-xs">Laporan dalam proses verifikasi</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Terverifikasi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{statistics.diverifikasi}</div>
                                    <p className="text-muted-foreground mt-2 text-xs">Laporan yang sudah diverifikasi</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">{statistics.ditolak}</div>
                                    <p className="text-muted-foreground mt-2 text-xs">Laporan yang ditolak</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Risk Level Distribution */}
                        <div className="grid gap-6 lg:grid-cols-2"> 
                            <Card>
                                <CardHeader>
                                    <CardTitle>Keterangan Status</CardTitle>
                                    <CardDescription>Makna warna setiap status laporan</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 rounded-lg bg-yellow-50/50 p-3">
                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Menunggu</Badge>
                                        <p className="text-sm text-yellow-800">Laporan sedang dalam proses verifikasi oleh relawan</p>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-green-50/50 p-3">
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Diverifikasi</Badge>
                                        <p className="text-sm text-green-800">Laporan telah diverifikasi dan ditindaklanjuti</p>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-red-50/50 p-3">
                                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Ditolak</Badge>
                                        <p className="text-sm text-red-800">Laporan tidak dapat diverifikasi atau tidak valid</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabs for filtering */}
                        <Card className="border-2">
                            <CardHeader className="pb-0">
                                <CardTitle>Riwayat Laporan</CardTitle>
                                <CardDescription>Daftar laporan bencana yang telah Anda kirimkan</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Tabs value={activeTab} onValueChange={handleTabChange}>
                                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {(['semua', 'menunggu', 'diverifikasi', 'ditolak'] as TabType[]).map((tab) => (
                                            <TabsTrigger key={tab} value={tab} className="font-medium">
                                                {getTabLabel(tab)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <TabsContent value={activeTab} className="mt-15 min-h-[300px]">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                                        <p className="text-muted-foreground mt-2 text-sm">Memuat data laporan...</p>
                                    </div>
                                ) : laporans.length > 0 ? (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="font-semibold">Judul</TableHead>
                                                    <TableHead className="font-semibold">Jenis Bencana</TableHead>
                                                    <TableHead className="font-semibold">Lokasi</TableHead>
                                                    <TableHead className="font-semibold">Status</TableHead>
                                                    <TableHead className="font-semibold">Tanggal & Detail</TableHead>
                                                    <TableHead className="text-center font-semibold">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {laporans.map((laporan) => (
                                                    <TableRow key={laporan.id} className="hover:bg-muted/50">
                                                        <TableCell className="font-medium">{laporan.judul}</TableCell>
                                                        <TableCell>
                                                            <span className="capitalize">{laporan.jenis_bencana}</span>
                                                        </TableCell>
                                                        <TableCell>{laporan.lokasi}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusBadge(laporan.status)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            <div>
                                                                {formatDate(laporan.created_at)}
                                                            </div>
                                                            {laporan.deskripsi && (
                                                                <div className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                                                    {laporan.deskripsi}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedLaporan(laporan)}
                                                                className="hover:bg-primary hover:text-primary-foreground"
                                                            >
                                                                Lihat Detail
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
                                        <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                                            <svg className="text-muted-foreground h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-muted-foreground mb-2 text-lg font-medium">
                                            {activeTab === 'semua' ? 'Belum Ada Laporan' : 'Tidak Ada Data'}
                                        </h3>
                                        <p className="text-muted-foreground mb-4 max-w-sm text-sm text-center">{getEmptyStateMessage()}</p>
                                        {activeTab === 'semua' && (
                                            <Button onClick={handleCreateReport} size="sm" variant="outline" className="gap-2">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Buat Laporan Pertama
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* Modal Detail Laporan */}
                {selectedLaporan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setSelectedLaporan(null)}
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-bold mb-2">Detail Laporan</h2>
                            <div className="space-y-2">
                                <div><strong>Judul:</strong> {selectedLaporan.judul}</div>
                                <div><strong>Jenis Bencana:</strong> {selectedLaporan.jenis_bencana}</div>
                                <div><strong>Lokasi:</strong> {selectedLaporan.lokasi}</div>
                                <div><strong>Status:</strong> {getStatusBadge(selectedLaporan.status)}</div>
                                <div><strong>Tanggal:</strong> {formatDate(selectedLaporan.created_at)}</div>
                                {selectedLaporan.deskripsi && (
                                    <div><strong>Deskripsi:</strong> {selectedLaporan.deskripsi}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
