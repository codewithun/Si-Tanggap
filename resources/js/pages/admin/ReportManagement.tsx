import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { CheckCircleIcon, ExternalLinkIcon, XCircleIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../hooks/useToast';

// Define the breadcrumbs for the page
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Kelola Laporan Bencana',
        href: '/admin/reports',
    },
];

interface Laporan {
    id: number;
    judul: string;
    jenis_bencana: string;
    deskripsi: string;
    lokasi: string;
    latitude: number;
    longitude: number;
    foto: string;
    status: 'menunggu' | 'diverifikasi' | 'ditolak';
    catatan_admin?: string;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
}

export default function ReportManagement() {
    const [reports, setReports] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Laporan | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'diverifikasi' | 'ditolak'>('diverifikasi');
    const [adminNote, setAdminNote] = useState('');

    const { toast } = useToast();

    const fetchReports = useCallback(async () => {
        try {
            const response = await axios.get('/laporan-bencana');
            if (response.data && response.data.data) {
                setReports(response.data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data laporan bencana',
                variant: 'destructive',
            });
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const openViewDialog = (report: Laporan) => {
        setSelectedReport(report);
        setIsViewDialogOpen(true);
    };

    const openVerifyDialog = (report: Laporan) => {
        setSelectedReport(report);
        setVerificationStatus('diverifikasi');
        setAdminNote(report.catatan_admin || '');
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

        try {
            const endpoint =
                verificationStatus === 'diverifikasi' ? `/laporans/${selectedReport.id}/verify` : `/laporans/${selectedReport.id}/reject`;

            await axios.put(endpoint, {
                catatan_admin: adminNote.trim() || null,
            });

            toast({
                title: 'Berhasil',
                description: `Laporan berhasil ${verificationStatus === 'diverifikasi' ? 'diverifikasi' : 'ditolak'}`,
            });

            setIsVerifyDialogOpen(false);
            fetchReports();
        } catch (error: unknown) {
            console.error('Error verifying report:', error);
            const axiosError = error as AxiosError<{ message: string }>;
            toast({
                title: 'Error',
                description: axiosError.response?.data?.message || 'Gagal memproses verifikasi laporan',
                variant: 'destructive',
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'diverifikasi':
                return 'bg-green-100 text-green-800';
            case 'ditolak':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getDisasterIconPath = (type: string) => {
        return `/icons/${type}.svg`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Laporan Bencana" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold text-gray-800">Kelola Laporan Bencana</h1>
                <p className="mb-6 text-gray-600">Verifikasi dan kelola laporan bencana yang masuk dari masyarakat.</p>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manajemen Laporan Bencana</CardTitle>
                            <CardDescription>Verifikasi dan kelola laporan bencana yang masuk dari masyarakat</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="mb-4 h-8 rounded bg-gray-200"></div>
                                    <div className="space-y-2">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="h-12 rounded bg-gray-200"></div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Judul</TableHead>
                                                <TableHead>Jenis Bencana</TableHead>
                                                <TableHead>Lokasi</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Tanggal Dibuat</TableHead>
                                                <TableHead>Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reports.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                                                        Tidak ada data laporan bencana
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                reports.map((report) => (
                                                    <TableRow key={report.id}>
                                                        <TableCell>{report.id}</TableCell>
                                                        <TableCell className="font-medium">{report.judul}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <img
                                                                    src={getDisasterIconPath(report.jenis_bencana)}
                                                                    alt={report.jenis_bencana}
                                                                    className="h-5 w-5"
                                                                />
                                                                <span>{report.jenis_bencana}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px] truncate" title={report.lokasi}>
                                                            {report.lokasi}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`rounded-full px-2 py-1 text-xs ${getStatusBadgeClass(report.status)}`}>
                                                                {report.status}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>{formatDate(report.created_at)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-end space-x-2">
                                                                <Button variant="outline" size="sm" onClick={() => openViewDialog(report)}>
                                                                    <ExternalLinkIcon className="h-4 w-4" />
                                                                </Button>
                                                                {report.status === 'menunggu' && (
                                                                    <Button variant="default" size="sm" onClick={() => openVerifyDialog(report)}>
                                                                        <CheckCircleIcon className="mr-1 h-4 w-4" />
                                                                        Verifikasi
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* View Report Dialog */}
                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Detail Laporan Bencana</DialogTitle>
                            </DialogHeader>
                            {selectedReport && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <h3 className="text-lg font-semibold">{selectedReport.judul}</h3>
                                            <div className="mt-1 flex items-center">
                                                <img
                                                    src={getDisasterIconPath(selectedReport.jenis_bencana)}
                                                    alt={selectedReport.jenis_bencana}
                                                    className="mr-2 h-5 w-5"
                                                />
                                                <span className="text-sm">{selectedReport.jenis_bencana}</span>
                                                <span
                                                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${getStatusBadgeClass(selectedReport.status)}`}
                                                >
                                                    {selectedReport.status}
                                                </span>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-500">Deskripsi</h4>
                                                <p className="mt-1">{selectedReport.deskripsi}</p>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-500">Lokasi</h4>
                                                <p className="mt-1">{selectedReport.lokasi}</p>
                                                <div className="mt-1 text-xs text-gray-400">
                                                    Koordinat: {selectedReport.latitude}, {selectedReport.longitude}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-500">Dilaporkan oleh</h4>
                                                <p className="mt-1">{selectedReport.user.name}</p>
                                                <p className="text-xs text-gray-400">{selectedReport.user.email}</p>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-500">Tanggal Laporan</h4>
                                                <p className="mt-1">{formatDate(selectedReport.created_at)}</p>
                                            </div>

                                            {selectedReport.catatan_admin && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-medium text-gray-500">Catatan Admin</h4>
                                                    <p className="mt-1">{selectedReport.catatan_admin}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            {selectedReport.foto && (
                                                <div className="overflow-hidden rounded-md border">
                                                    <img src={selectedReport.foto} alt="Foto Laporan" className="h-auto w-full object-cover" />
                                                </div>
                                            )}

                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-500">Lokasi di Peta</h4>
                                                <div className="mt-2 h-[250px] w-full overflow-hidden rounded-md border">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        style={{ border: 0 }}
                                                        loading="lazy"
                                                        allowFullScreen
                                                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${selectedReport.latitude},${selectedReport.longitude}`}
                                                    ></iframe>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-400">
                                                    Catatan: Perlu menambahkan API key Google Maps untuk menampilkan peta
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                                            Tutup
                                        </Button>
                                        {selectedReport.status === 'menunggu' && (
                                            <Button
                                                onClick={() => {
                                                    setIsViewDialogOpen(false);
                                                    openVerifyDialog(selectedReport);
                                                }}
                                            >
                                                Verifikasi Laporan
                                            </Button>
                                        )}
                                    </DialogFooter>
                                </div>
                            )}
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
                                            Catatan Admin {verificationStatus === 'ditolak' && <span className="text-red-500">*</span>}
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
                                    disabled={verificationStatus === 'ditolak' && !adminNote.trim()}
                                >
                                    {verificationStatus === 'diverifikasi' ? 'Verifikasi' : 'Tolak'} Laporan
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
