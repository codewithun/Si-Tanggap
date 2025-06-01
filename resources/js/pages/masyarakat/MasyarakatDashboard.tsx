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

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Laporan[];
}

interface ApiResponse {
    data: Laporan[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
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
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
    const [statistics, setStatistics] = useState<Statistics>({
        totalLaporan: 0,
        menunggu: 0,
        diverifikasi: 0,
        ditolak: 0,
        tingkatResiko: {
            rendah: 0,
            sedang: 0,
            tinggi: 0,
        },
    });
    const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);
    const itemsPerPage = 10;

    const getLaporanSaya = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number> = activeTab !== 'semua' ? { status: activeTab } : {};
            if (userId) params.user_id = userId;
            params.page = currentPage;
            params.per_page = itemsPerPage;

            const response = await axios.get<ApiResponse>('/api/laporan-saya', { params });

            if (response.data) {
                if (Array.isArray(response.data.data)) {
                    setLaporans(response.data.data);
                    setPaginationData({
                        current_page: response.data.current_page ?? 1,
                        last_page: response.data.last_page ?? 1,
                        per_page: response.data.per_page ?? itemsPerPage,
                        total: response.data.total ?? response.data.data.length,
                        data: response.data.data,
                    });
                } else {
                    setLaporans([]);
                    setPaginationData(null);
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
            setPaginationData(null);
        } finally {
            setLoading(false);
        }
    }, [activeTab, userId, currentPage, itemsPerPage]);

    useEffect(() => {
        getLaporanSaya();
    }, [getLaporanSaya]);

    useEffect(() => {
        // Reset to page 1 when changing tabs
        setCurrentPage(1);
    }, [activeTab]);

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
            <div className="container mx-auto px-3 py-6 lg:px-4">
                <Card className="w-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-semibold">Dashboard</CardTitle>
                        <CardDescription>
                            Selamat datang di GeoSiaga. Di sini Anda dapat melihat dan mengelola laporan bencana yang pernah Anda kirimkan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Action Button */}
                        <div className="flex items-center justify-between">
                            <Button onClick={handleCreateReport} size="lg" className="font-medium">
                                + Buat Laporan Baru
                            </Button>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Keterangan Status</CardTitle>
                                    <CardDescription>Makna warna setiap status laporan</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 rounded-lg bg-yellow-50/50 p-3">
                                        <Badge variant="outline" className="border-yellow-300 bg-yellow-100 text-yellow-800">
                                            Menunggu
                                        </Badge>
                                        <p className="text-sm text-yellow-800">Laporan sedang dalam proses verifikasi oleh relawan</p>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-green-50/50 p-3">
                                        <Badge variant="outline" className="border-green-300 bg-green-100 text-green-800">
                                            Diverifikasi
                                        </Badge>
                                        <p className="text-sm text-green-800">Laporan telah diverifikasi dan ditindaklanjuti</p>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-red-50/50 p-3">
                                        <Badge variant="outline" className="border-red-300 bg-red-100 text-red-800">
                                            Ditolak
                                        </Badge>
                                        <p className="text-sm text-red-800">Laporan tidak dapat diverifikasi atau tidak valid</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabs for filtering */}
                        <Card className="border">
                            <CardHeader className="pb-0">
                                <CardTitle>Riwayat Laporan</CardTitle>
                                <CardDescription>Daftar laporan bencana yang telah Anda kirimkan</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Tabs value={activeTab} onValueChange={handleTabChange}>
                                    <div className="relative">
                                        <TabsList className="grid w-full grid-cols-4 gap-0.5 rounded-md p-0.5">
                                            {(['semua', 'menunggu', 'diverifikasi', 'ditolak'] as TabType[]).map((tab) => (
                                                <TabsTrigger
                                                    key={tab}
                                                    value={tab}
                                                    className="rounded-md px-1 py-0 text-xs whitespace-nowrap data-[state=active]:shadow-none sm:px-2 sm:text-sm"
                                                >
                                                    {getTabLabel(tab)}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    <TabsContent value={activeTab} className="mt-4 min-h-[300px]">
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                                                <p className="text-muted-foreground mt-2 text-sm">Memuat data laporan...</p>
                                            </div>
                                        ) : laporans.length > 0 ? (
                                            <div className="overflow-x-auto rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="font-semibold whitespace-nowrap">Judul</TableHead>
                                                            <TableHead className="font-semibold whitespace-nowrap">Jenis Bencana</TableHead>
                                                            <TableHead className="font-semibold whitespace-nowrap">Lokasi</TableHead>
                                                            <TableHead className="font-semibold whitespace-nowrap">Status</TableHead>
                                                            <TableHead className="font-semibold whitespace-nowrap">Tanggal & Detail</TableHead>
                                                            <TableHead className="text-center font-semibold whitespace-nowrap">Aksi</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {laporans.map((laporan) => (
                                                            <TableRow key={laporan.id} className="hover:bg-muted/50">
                                                                <TableCell className="max-w-[150px] truncate font-medium">{laporan.judul}</TableCell>
                                                                <TableCell className="whitespace-nowrap">
                                                                    <span className="capitalize">{laporan.jenis_bencana}</span>
                                                                </TableCell>
                                                                <TableCell className="max-w-[150px] truncate">{laporan.lokasi}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center space-x-2">
                                                                        {getStatusBadge(laporan.status)}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-sm whitespace-nowrap">
                                                                    <div>{formatDate(laporan.created_at)}</div>
                                                                    {laporan.deskripsi && (
                                                                        <div className="mt-1 max-w-[150px] truncate text-xs text-gray-500">
                                                                            {laporan.deskripsi}
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-center whitespace-nowrap">
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

                                                {/* Pagination */}
                                                {paginationData && paginationData.last_page > 1 && (
                                                    <div className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
                                                        <div className="text-sm text-gray-500">
                                                            Showing {(paginationData.current_page - 1) * paginationData.per_page + 1} to{' '}
                                                            {Math.min(paginationData.current_page * paginationData.per_page, paginationData.total)} of{' '}
                                                            {paginationData.total} entries
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                                                disabled={paginationData.current_page === 1}
                                                            >
                                                                Previous
                                                            </Button>
                                                            {Array.from({ length: paginationData.last_page }).map((_, index) => {
                                                                const pageNumber = index + 1;
                                                                // Only show pages close to current page to avoid too many buttons
                                                                if (
                                                                    pageNumber === 1 ||
                                                                    pageNumber === paginationData.last_page ||
                                                                    Math.abs(pageNumber - paginationData.current_page) <= 1
                                                                ) {
                                                                    return (
                                                                        <Button
                                                                            key={pageNumber}
                                                                            variant={
                                                                                paginationData.current_page === pageNumber ? 'default' : 'outline'
                                                                            }
                                                                            size="sm"
                                                                            onClick={() => setCurrentPage(pageNumber)}
                                                                            className="min-w-[32px]"
                                                                        >
                                                                            {pageNumber}
                                                                        </Button>
                                                                    );
                                                                }

                                                                // Show ellipsis for gaps in page numbers
                                                                if (
                                                                    pageNumber === paginationData.current_page - 2 ||
                                                                    pageNumber === paginationData.current_page + 2
                                                                ) {
                                                                    return (
                                                                        <span key={`ellipsis-${pageNumber}`} className="flex items-center px-2">
                                                                            ...
                                                                        </span>
                                                                    );
                                                                }

                                                                return null;
                                                            })}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCurrentPage((page) => Math.min(paginationData.last_page, page + 1))}
                                                                disabled={paginationData.current_page === paginationData.last_page}
                                                            >
                                                                Next
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
                                                <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                                                    <svg
                                                        className="text-muted-foreground h-6 w-6"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
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
                                                <p className="text-muted-foreground mb-4 max-w-sm text-center text-sm">{getEmptyStateMessage()}</p>
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

                {/* Modal Detail Laporan - Enhanced with modern & clean styling */}
                {selectedLaporan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setSelectedLaporan(null)}
                                    className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6">
                                <h2 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">{selectedLaporan.judul}</h2>
                                <p className="mb-5 text-sm text-gray-500">Dilaporkan pada {formatDate(selectedLaporan.created_at)}</p>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Jenis Bencana</p>
                                            <p className="font-medium capitalize">{selectedLaporan.judul}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Status</p>
                                            <div>{getStatusBadge(selectedLaporan.status)}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Lokasi</p>
                                        <p className="font-medium">{selectedLaporan.lokasi}</p>
                                    </div>

                                    {selectedLaporan.tingkat_bahaya && (
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Tingkat Bahaya</p>
                                            <div>
                                                <Badge
                                                    className={
                                                        selectedLaporan.tingkat_bahaya === 'rendah'
                                                            ? 'border-blue-200 bg-blue-100 text-blue-800'
                                                            : selectedLaporan.tingkat_bahaya === 'sedang'
                                                              ? 'border-yellow-200 bg-yellow-100 text-yellow-800'
                                                              : 'border-red-200 bg-red-100 text-red-800'
                                                    }
                                                >
                                                    {selectedLaporan.tingkat_bahaya.charAt(0).toUpperCase() + selectedLaporan.tingkat_bahaya.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {selectedLaporan.deskripsi && (
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Deskripsi</p>
                                            <div className="prose prose-sm max-w-none">
                                                <p className="whitespace-pre-line text-gray-700">{selectedLaporan.deskripsi}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <Button variant="outline" onClick={() => setSelectedLaporan(null)} className="mr-2">
                                    Tutup
                                </Button>

                                {selectedLaporan.status === 'menunggu' && (
                                    <Button variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100">
                                        Menunggu Verifikasi
                                    </Button>
                                )}

                                {selectedLaporan.status === 'diverifikasi' && (
                                    <Button variant="outline" className="border-green-200 bg-green-50 text-green-800 hover:bg-green-100">
                                        Terverifikasi
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
