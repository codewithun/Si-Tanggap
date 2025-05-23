import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

interface Laporan {
    id: number;
    judul: string;
    deskripsi: string;
    lokasi: string;
    latitude: number;
    longitude: number;
    foto: string;
    status: 'menunggu' | 'diverifikasi' | 'ditolak';
    created_at: string;
    jenis_bencana: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export default function DisasterReportVerification() {
    const [reports, setReports] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState<number[]>([]);
    const { toast } = useToast();

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/laporans');
            // Filter reports that are not verified
            const data = response.data.data || response.data;
            const unverifiedReports = Array.isArray(data) ? data.filter((report: Laporan) => report.status === 'menunggu') : [];
            setReports(unverifiedReports);
        } catch (error: unknown) {
            console.error('Failed to fetch disaster reports:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data laporan bencana';

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleVerify = async (id: number) => {
        setProcessingIds((prev) => [...prev, id]);
        try {
            await axios.put(`/laporans/${id}/verify`);
            toast({
                title: 'Sukses',
                description: 'Laporan berhasil diverifikasi',
            });
            // Update local state
            setReports((prevReports) => prevReports.filter((report) => report.id !== id));
        } catch (error: unknown) {
            console.error('Failed to verify report:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memverifikasi laporan';

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setProcessingIds((prev) => prev.filter((reportId) => reportId !== id));
        }
    };

    const handleReject = async (id: number) => {
        setProcessingIds((prev) => [...prev, id]);
        try {
            await axios.put(`/laporans/${id}/reject`);
            toast({
                title: 'Sukses',
                description: 'Laporan berhasil ditolak',
            });
            // Update local state
            setReports((prevReports) => prevReports.filter((report) => report.id !== id));
        } catch (error: unknown) {
            console.error('Failed to reject report:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal menolak laporan';

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setProcessingIds((prev) => prev.filter((reportId) => reportId !== id));
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Verifikasi Laporan Bencana</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-5 w-3/4 rounded bg-gray-200"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-3 w-full rounded bg-gray-200"></div>
                                    <div className="h-3 w-full rounded bg-gray-200"></div>
                                </div>
                                <div className="mt-4 h-32 rounded bg-gray-200"></div>
                            </CardContent>
                            <CardFooter>
                                <div className="flex w-full justify-end space-x-2">
                                    <div className="h-9 w-20 rounded bg-gray-200"></div>
                                    <div className="h-9 w-20 rounded bg-gray-200"></div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold sm:text-2xl">Verifikasi Laporan Bencana</h2>
                <Button variant="outline" size="sm" onClick={() => fetchReports()} disabled={loading}>
                    {loading ? 'Memuat...' : 'Refresh'}
                </Button>
            </div>

            {reports.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center sm:p-8">
                    <p className="text-base font-medium text-gray-600 sm:text-lg">Tidak ada laporan yang perlu diverifikasi</p>
                    <p className="text-xs text-gray-500 sm:text-sm">Semua laporan sudah ditinjau</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reports.map((report) => (
                        <Card key={report.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{report.judul}</CardTitle>
                                    <Badge variant="outline">{report.jenis_bencana}</Badge>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Dilaporkan pada{' '}
                                    {new Date(report.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                                <p className="text-xs text-gray-500">Oleh: {report.user?.name || 'Tidak diketahui'}</p>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium">Lokasi:</p>
                                    <p className="text-sm">{report.lokasi}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Deskripsi:</p>
                                    <p className="text-sm">{report.deskripsi}</p>
                                </div>{' '}
                                {report.foto && (
                                    <div className="mt-2">
                                        <p className="mb-1 text-sm font-medium">Foto Kejadian:</p>
                                        <img src={report.foto} alt={report.judul} className="h-40 w-full rounded-md object-cover" />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <div className="flex w-full justify-end space-x-2">
                                    <Button variant="outline" onClick={() => handleReject(report.id)} disabled={processingIds.includes(report.id)}>
                                        Tolak
                                    </Button>
                                    <Button onClick={() => handleVerify(report.id)} disabled={processingIds.includes(report.id)}>
                                        Verifikasi
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
