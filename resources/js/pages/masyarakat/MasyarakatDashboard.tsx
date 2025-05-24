import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router } from '@inertiajs/react';
import axios, { type AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

type StatusType = 'menunggu' | 'diverifikasi' | 'ditolak';
type TabType = 'semua' | StatusType;

interface Laporan {
    id: number;
    judul: string;
    jenis_bencana: string;
    lokasi: string;
    status: StatusType;
    created_at: string;
}

interface ApiResponse {
    data: Laporan[];
    message?: string;
}

interface ErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

export default function MasyarakatDashboard() {
    const [laporans, setLaporans] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('semua');

    const getLaporanSaya = useCallback(async () => {
        try {
            setLoading(true);
            const params = activeTab !== 'semua' ? { status: activeTab } : {};
            const response = await axios.get<ApiResponse>('/api/laporan-saya', { params });
            
            if (response.data && Array.isArray(response.data.data)) {
                setLaporans(response.data.data);
            } else {
                setLaporans([]);
                console.warn('Unexpected API response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            
            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage = axiosError.response?.data?.message || 
                               axiosError.message || 
                               'Terjadi kesalahan tidak terduga';
            
            toast.error(`Gagal mengambil data laporan: ${errorMessage}`);
            setLaporans([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        getLaporanSaya();
    }, [getLaporanSaya]);

    const getStatusBadge = (status: StatusType) => {
        const statusConfig = {
            menunggu: {
                className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                label: 'Menunggu'
            },
            diverifikasi: {
                className: 'bg-green-100 text-green-800 border-green-300',
                label: 'Diverifikasi'
            },
            ditolak: {
                className: 'bg-red-100 text-red-800 border-red-300',
                label: 'Ditolak'
            }
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
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const handleCreateReport = () => {
        router.visit('/laporan-bencana/create');
    };

    const handleViewDetail = (laporanId: number) => {
        router.visit(`/laporans/${laporanId}`);
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
            ditolak: 'Ditolak'
        };
        return labels[tab];
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Masyarakat</CardTitle>
                    <CardDescription>
                        Selamat datang di Si-Tanggap. Di sini Anda dapat melihat dan mengelola 
                        laporan bencana yang pernah Anda kirimkan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Action Button */}
                    <div className="flex justify-between items-center">
                        <Button 
                            onClick={handleCreateReport}
                            className="font-medium"
                        >
                            + Buat Laporan Baru
                        </Button>
                        
                        {/* Summary Stats */}
                        <div className="text-sm text-muted-foreground">
                            Total laporan: {laporans.length}
                        </div>
                    </div>

                    {/* Tabs for filtering */}
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-4">
                            {(['semua', 'menunggu', 'diverifikasi', 'ditolak'] as TabType[]).map((tab) => (
                                <TabsTrigger key={tab} value={tab}>
                                    {getTabLabel(tab)}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Memuat data laporan...
                                    </p>
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
                                                <TableHead className="font-semibold">Tanggal</TableHead>
                                                <TableHead className="font-semibold text-center">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {laporans.map((laporan) => (
                                                <TableRow key={laporan.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">
                                                        {laporan.judul}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="capitalize">
                                                            {laporan.jenis_bencana}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{laporan.lokasi}</TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(laporan.status)}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {formatDate(laporan.created_at)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetail(laporan.id)}
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
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                        <svg 
                                            className="h-6 w-6 text-muted-foreground"
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
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                        {activeTab === 'semua' ? 'Belum Ada Laporan' : 'Tidak Ada Data'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                                        {getEmptyStateMessage()}
                                    </p>
                                    {activeTab === 'semua' && (
                                        <Button onClick={handleCreateReport} size="sm">
                                            Buat Laporan Pertama
                                        </Button>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}