import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import L from 'leaflet';
import { CheckCircleIcon, MapPinIcon, XCircleIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Relawan',
        href: '/relawan/dashboard',
    },
    {
        title: 'Verifikasi Laporan',
        href: '/relawan/disaster-report-verification',
    },
];

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

// Function to get a specific disaster icon based on type
const getDisasterMapIcon = (type: string) => {
    return L.icon({
        iconUrl: `/icons/${type}.svg`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

export default function DisasterReportVerification() {
    const [reports, setReports] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState<number[]>([]);
    const { toast } = useToast();

    // Added state for verification dialog
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Laporan | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'diverifikasi' | 'ditolak'>('diverifikasi');
    const [adminNote, setAdminNote] = useState('');
    const [showMapDialog, setShowMapDialog] = useState(false);

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

    const openVerifyDialog = (report: Laporan) => {
        setSelectedReport(report);
        setVerificationStatus('diverifikasi');
        setAdminNote('');
        setIsVerifyDialogOpen(true);
    };

    const handleVerification = async () => {
        if (!selectedReport) return;

        if (verificationStatus === 'ditolak' && !adminNote.trim()) {
            toast({
                title: 'Error',
                description: 'Catatan admin wajib diisi untuk penolakan laporan',
                variant: 'destructive',
            });
            return;
        }

        setProcessingIds((prev) => [...prev, selectedReport.id]);

        try {
            const endpoint =
                verificationStatus === 'diverifikasi' ? `/admin/laporans/${selectedReport.id}/verify` : `/admin/laporans/${selectedReport.id}/reject`;

            await axios.put(endpoint, {
                catatan_admin: adminNote.trim() || null,
            });

            toast({
                title: 'Berhasil',
                description: `Laporan berhasil ${verificationStatus === 'diverifikasi' ? 'diverifikasi' : 'ditolak'}`,
            });

            setIsVerifyDialogOpen(false);
            // Update local state
            setReports((prevReports) => prevReports.filter((report) => report.id !== selectedReport.id));
        } catch (error: unknown) {
            console.error('Error verifying report:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memproses verifikasi laporan';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setProcessingIds((prev) => prev.filter((reportId) => reportId !== selectedReport.id));
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Verifikasi Laporan" />
                <div className="space-y-4 p-6">
                    <h2 className="text-xl font-bold sm:text-2xl">Verifikasi Laporan Bencana</h2>
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
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Verifikasi Laporan" />
            <div className="space-y-4 p-6">
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
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm">{report.lokasi}</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    setShowMapDialog(true);
                                                }}
                                            >
                                                <MapPinIcon className="h-4 w-4" />
                                                <span className="sr-only">Lihat di peta</span>
                                            </Button>
                                        </div>
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
                                        <Button
                                            variant="outline"
                                            onClick={() => openVerifyDialog(report)}
                                            disabled={processingIds.includes(report.id)}
                                        >
                                            Verifikasi Laporan
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Map Dialog */}
                <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Lokasi Bencana</DialogTitle>
                            <DialogDescription>{selectedReport?.lokasi || 'Tidak ada informasi lokasi'}</DialogDescription>
                        </DialogHeader>
                        <div className="h-[300px] w-full overflow-hidden rounded-md border">
                            {selectedReport && (
                                <MapContainer
                                    center={[selectedReport.latitude, selectedReport.longitude]}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker
                                        position={[selectedReport.latitude, selectedReport.longitude]}
                                        icon={getDisasterMapIcon(selectedReport.jenis_bencana)}
                                    >
                                        <Popup>
                                            <div className="font-semibold">{selectedReport.judul}</div>
                                            <div>{selectedReport.lokasi}</div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowMapDialog(false)}>
                                Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Verify Report Dialog */}
                <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Verifikasi Laporan Bencana</DialogTitle>
                            <DialogDescription>Verifikasi laporan yang diajukan oleh masyarakat</DialogDescription>
                        </DialogHeader>
                        {selectedReport && (
                            <div className="space-y-4 py-4">
                                <h3 className="font-medium">{selectedReport.judul}</h3>
                                <p className="text-sm text-gray-500">
                                    {selectedReport.jenis_bencana} - {selectedReport.lokasi}
                                </p>

                                <div className="space-y-2">
                                    <label htmlFor="verification-status" className="text-sm font-medium">
                                        Status Verifikasi
                                    </label>
                                    <Select
                                        value={verificationStatus}
                                        onValueChange={(value: 'diverifikasi' | 'ditolak') => setVerificationStatus(value)}
                                    >
                                        <SelectTrigger id="verification-status">
                                            <SelectValue placeholder="Pilih status verifikasi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="diverifikasi">
                                                <div className="flex items-center">
                                                    <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                                                    <span>Verifikasi</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="ditolak">
                                                <div className="flex items-center">
                                                    <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />
                                                    <span>Tolak</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="admin-note" className="text-sm font-medium">
                                        Catatan {verificationStatus === 'ditolak' && <span className="text-red-500">*</span>}
                                    </label>
                                    <Textarea
                                        id="admin-note"
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder={
                                            verificationStatus === 'ditolak'
                                                ? 'Berikan alasan penolakan (wajib diisi)'
                                                : 'Masukkan catatan tambahan (opsional)'
                                        }
                                        rows={4}
                                        required={verificationStatus === 'ditolak'}
                                    />
                                    {verificationStatus === 'ditolak' && !adminNote.trim() && (
                                        <p className="text-xs text-red-500">Catatan admin wajib diisi untuk penolakan laporan</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button
                                variant={verificationStatus === 'diverifikasi' ? 'default' : 'destructive'}
                                onClick={handleVerification}
                                disabled={(verificationStatus === 'ditolak' && !adminNote.trim()) || processingIds.includes(selectedReport?.id || 0)}
                            >
                                {verificationStatus === 'diverifikasi' ? 'Verifikasi' : 'Tolak'} Laporan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
