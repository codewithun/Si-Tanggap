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
import L from 'leaflet';
import { CheckCircleIcon, ExternalLinkIcon, ImageIcon, XCircleIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
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

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Laporan[];
}

const addMapZIndexFix = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Control map z-index */
        .leaflet-container {
            z-index: 1 !important;
        }
        .leaflet-pane,
        .leaflet-control,
        .leaflet-top,
        .leaflet-bottom {
            z-index: 400 !important;
        }
        /* Ensure dialogs appear above maps */
        .dialog-content {
            z-index: 1000 !important;
        }
    `;
    document.head.appendChild(style);
    return style;
};

export default function ReportManagement() {
    const [reports, setReports] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Laporan | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'diverifikasi' | 'ditolak'>('diverifikasi');
    const [adminNote, setAdminNote] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
    const itemsPerPage = 10;

    // Add state for image preview dialog
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Add state for image loading status
    const [imageLoadError, setImageLoadError] = useState<{ [key: number]: boolean }>({});
    const [loadingImages, setLoadingImages] = useState<{ [key: number]: boolean }>({});

    const { toast } = useToast();

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/laporans', {
                params: {
                    page: currentPage,
                    per_page: itemsPerPage,
                },
            });

            if (response.data && response.data.data) {
                setReports(response.data.data);
                setPaginationData({
                    current_page: response.data.current_page ?? 1,
                    last_page: response.data.last_page ?? 1,
                    per_page: response.data.per_page ?? itemsPerPage,
                    total: response.data.total ?? response.data.data.length,
                    data: response.data.data,
                });
            } else {
                setReports(response.data);
                setPaginationData({
                    current_page: 1,
                    last_page: 1,
                    per_page: itemsPerPage,
                    total: response.data.length,
                    data: response.data,
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data laporan bencana',
                variant: 'destructive',
            });
            setReports([]);
            setLoading(false);
        }
    }, [toast, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    useEffect(() => {
        // Add z-index fix for maps
        const styleElement = addMapZIndexFix();

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    // Function to format image URL properly
    const getFormattedImageUrl = (imageUrl: string): string => {
        if (!imageUrl) return '/images/placeholder-image.png';

        // If it's already a full URL, return it
        if (imageUrl.startsWith('http')) return imageUrl;

        // Ensure the path starts with a slash
        if (!imageUrl.startsWith('/')) {
            imageUrl = '/' + imageUrl;
        }

        // Add a cache buster
        return `${imageUrl}?v=${new Date().getTime()}`;
    };

    // Image error handling
    const handleImageError = (reportId: number, imgElement: HTMLImageElement) => {
        // Get the current URL that failed
        const currentUrl = imgElement.src;
        console.log(`Image load failed for report ${reportId}:`, currentUrl);

        // Count retry attempts
        const retryCount = parseInt(imgElement.dataset.retryCount || '0');

        // If we've tried too many times, show placeholder
        if (retryCount >= 3) {
            console.log(`Giving up after ${retryCount} retries for report ${reportId}`);
            setImageLoadError((prev) => ({ ...prev, [reportId]: true }));
            toast({
                title: 'Peringatan',
                description: 'Gambar tidak dapat dimuat. Menggunakan gambar placeholder.',
                variant: 'default',
            });
            imgElement.src = '/images/placeholder-image.png';
            return;
        }

        // Increment retry counter
        imgElement.dataset.retryCount = (retryCount + 1).toString();

        // Get the report data
        const report = reports.find((r) => r.id === reportId);
        if (!report || !report.foto) return;

        console.log(`Retrying image load (attempt ${retryCount + 1}) for report ${reportId}`);

        // Try different fallback strategies based on retry count
        let newSrc = '';

        if (retryCount === 0) {
            // First retry: try direct path with storage
            const cleanPath = report.foto.replace(/^public\/|^storage\/|^\//g, '');
            newSrc = `/storage/${cleanPath}?v=${new Date().getTime()}`;
        } else if (retryCount === 1) {
            // Second retry: try with just the filename
            const filename = report.foto.split('/').pop() || report.foto;
            newSrc = `/storage/laporans/${filename}?v=${new Date().getTime()}`;
        } else {
            // Last retry: try without /storage prefix
            const cleanPath = report.foto.replace(/^public\/|^storage\/|^\//g, '');
            newSrc = `/${cleanPath}?v=${new Date().getTime()}`;
        }

        console.log(`Trying alternate URL: ${newSrc}`);
        imgElement.src = newSrc;
    };

    const openImagePreview = (report: Laporan) => {
        setSelectedReport(report);

        // Get image URL with fallback strategies
        const imageUrl = getFormattedImageUrl(report.foto);
        console.log(`Opening image preview for report ${report.id} with URL: ${imageUrl}`);
        setSelectedImage(imageUrl);
        setShowImageDialog(true);

        // Reset any previous error state for this image in the preview
        setImageLoadError((prev) => {
            const newState = { ...prev };
            delete newState[report.id];
            return newState;
        });
    };

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
                verificationStatus === 'diverifikasi' ? `/admin/laporans/${selectedReport.id}/verify` : `/admin/laporans/${selectedReport.id}/reject`;

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
        // Add a timestamp to prevent browser caching
        const cacheBuster = `?v=${Date.now()}`;

        // Map each disaster type to its specific icon
        switch (type.toLowerCase()) {
            case 'banjir':
                return `/icons/icon-banjir.png${cacheBuster}`;
            case 'kebakaran':
                return `/icons/icon-kebakaran.png${cacheBuster}`;
            case 'gempa':
                return `/icons/icon-gempa.png${cacheBuster}`;
            case 'longsor':
                return `/icons/icon-tanahlongsor.png${cacheBuster}`;
            case 'angin_topan':
                return `/icons/default-marker.svg${cacheBuster}`;
            case 'tsunami':
                return `/icons/icon-tsunami.png${cacheBuster}`;
            case 'kekeringan':
                return `/icons/icon-kekeringan.png${cacheBuster}`;
            default:
                return `/icons/disaster.svg${cacheBuster}`;
        }
    };

    // Function to get a specific disaster icon based on type
    const getDisasterMapIcon = (type: string) => {
        return L.icon({
            iconUrl: getDisasterIconPath(type),
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });
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

                                    {/* Pagination Controls */}
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
                                                {[...Array(paginationData.last_page)].map((_, index) => {
                                                    const pageNumber = index + 1;
                                                    const showPage =
                                                        pageNumber === 1 ||
                                                        pageNumber === paginationData.last_page ||
                                                        Math.abs(pageNumber - paginationData.current_page) <= 1;

                                                    if (!showPage) {
                                                        if (pageNumber === 2 || pageNumber === paginationData.last_page - 1) {
                                                            return (
                                                                <span key={`dot-${pageNumber}`} className="px-2 py-1">
                                                                    ...
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    }

                                                    return (
                                                        <Button
                                                            key={pageNumber}
                                                            variant={paginationData.current_page === pageNumber ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(pageNumber)}
                                                            className="min-w-[32px]"
                                                        >
                                                            {pageNumber}
                                                        </Button>
                                                    );
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
                            )}
                        </CardContent>
                    </Card>

                    {/* View Report Dialog */}
                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                        <DialogContent className="dialog-content max-w-3xl overflow-y-auto p-2 sm:max-h-[90vh] sm:p-6 md:max-h-[85vh]">
                            <DialogHeader className="pb-1 sm:pb-3">
                                <DialogTitle className="text-sm sm:text-lg">Detail Laporan Bencana</DialogTitle>
                            </DialogHeader>
                            {selectedReport && (
                                <div className="-mt-1 space-y-2 sm:-mt-2 sm:space-y-4">
                                    <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2">
                                        {/* Report Info Section - Full width on mobile, left column on desktop */}
                                        <div className="space-y-1.5 sm:space-y-3">
                                            <h3 className="line-clamp-2 text-sm font-semibold sm:text-lg" title={selectedReport.judul}>
                                                {selectedReport.judul}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                <img
                                                    src={getDisasterIconPath(selectedReport.jenis_bencana)}
                                                    alt={selectedReport.jenis_bencana}
                                                    className="h-3.5 w-3.5 sm:h-5 sm:w-5"
                                                />
                                                <span className="text-xs sm:text-sm">{selectedReport.jenis_bencana}</span>
                                                <span
                                                    className={`rounded-full px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-xs ${getStatusBadgeClass(selectedReport.status)}`}
                                                >
                                                    {selectedReport.status}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="text-[11px] font-medium text-gray-500 sm:text-sm">Deskripsi</h4>
                                                <p className="mt-0.5 max-h-[60px] overflow-y-auto text-[11px] sm:mt-1 sm:max-h-[120px] sm:text-sm">
                                                    {selectedReport.deskripsi}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-[11px] font-medium text-gray-500 sm:text-sm">Lokasi</h4>
                                                <p className="mt-0.5 line-clamp-2 text-[11px] sm:mt-1 sm:text-sm" title={selectedReport.lokasi}>
                                                    {selectedReport.lokasi}
                                                </p>
                                                <div className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
                                                    Koordinat: {selectedReport.latitude}, {selectedReport.longitude}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-[11px] font-medium text-gray-500 sm:text-sm">Dilaporkan oleh</h4>
                                                <p className="mt-0.5 text-[11px] sm:text-sm">{selectedReport.user.name}</p>
                                                <p className="truncate text-[10px] text-gray-400 sm:text-xs" title={selectedReport.user.email}>
                                                    {selectedReport.user.email}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-[11px] font-medium text-gray-500 sm:text-sm">Tanggal Laporan</h4>
                                                <p className="mt-0.5 text-[11px] sm:text-sm">{formatDate(selectedReport.created_at)}</p>
                                            </div>

                                            {selectedReport.catatan_admin && (
                                                <div>
                                                    <h4 className="text-[11px] font-medium text-gray-500 sm:text-sm">Catatan Admin</h4>
                                                    <p className="mt-0.5 text-[11px] sm:text-sm">{selectedReport.catatan_admin}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Media Section - Full width on mobile, right column on desktop */}
                                        <div className="space-y-2 sm:space-y-4">
                                            {/* Photo section with responsive sizing */}
                                            {selectedReport.foto ? (
                                                <div>
                                                    <h4 className="mb-0.5 text-[11px] font-medium text-gray-500 sm:mb-2 sm:text-sm">Foto Kejadian</h4>
                                                    <div className="relative overflow-hidden rounded-md border">
                                                        {imageLoadError[selectedReport.id] ? (
                                                            <div className="flex h-24 w-full items-center justify-center rounded-md border bg-gray-100 sm:h-40">
                                                                <div className="p-2 text-center sm:p-4">
                                                                    <ImageIcon className="mx-auto mb-1 h-5 w-5 text-gray-400 sm:mb-2 sm:h-8 sm:w-8" />
                                                                    <p className="text-[10px] text-gray-500 sm:text-sm">Gambar tidak dapat dimuat</p>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="mt-0.5 h-6 px-1.5 text-[10px] sm:mt-1 sm:h-7 sm:px-2 sm:text-xs"
                                                                        onClick={() => {
                                                                            // Reset error state and try again
                                                                            setImageLoadError((prev) => {
                                                                                const newState = { ...prev };
                                                                                delete newState[selectedReport.id];
                                                                                return newState;
                                                                            });
                                                                            // Set loading state
                                                                            setLoadingImages((prev) => ({ ...prev, [selectedReport.id]: true }));
                                                                        }}
                                                                    >
                                                                        Coba Lagi
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="cursor-pointer touch-manipulation"
                                                                onClick={() => openImagePreview(selectedReport)}
                                                            >
                                                                {loadingImages[selectedReport.id] && (
                                                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
                                                                        <div className="border-primary h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 sm:h-8 sm:w-8"></div>
                                                                    </div>
                                                                )}
                                                                <img
                                                                    src={getFormattedImageUrl(selectedReport.foto)}
                                                                    alt="Foto Laporan"
                                                                    className="h-auto max-h-[100px] w-full object-contain object-center sm:max-h-[180px]"
                                                                    data-retry-count="0"
                                                                    onLoad={() => {
                                                                        // Remove loading state when image loads successfully
                                                                        setLoadingImages((prev) => {
                                                                            const newState = { ...prev };
                                                                            delete newState[selectedReport.id];
                                                                            return newState;
                                                                        });
                                                                    }}
                                                                    onError={(e) => handleImageError(selectedReport.id, e.target as HTMLImageElement)}
                                                                />
                                                                <div className="absolute right-0 bottom-0 left-0 bg-black/50 p-0.5 text-center text-[9px] text-white sm:p-1 sm:text-xs">
                                                                    Klik untuk memperbesar
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null}

                                            {/* Map with responsive height */}
                                            <div>
                                                <h4 className="text-[11px] font-medium text-gray-500 sm:text-sm">Lokasi di Peta</h4>
                                                <div className="mt-0.5 h-[120px] w-full overflow-hidden rounded-md border sm:mt-2 sm:h-[200px]">
                                                    <MapContainer
                                                        center={[selectedReport.latitude, selectedReport.longitude]}
                                                        zoom={13}
                                                        style={{ height: '100%', width: '100%' }}
                                                        attributionControl={false}
                                                        zoomControl={false}
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
                                                                <div className="text-[10px] font-semibold sm:text-sm">{selectedReport.judul}</div>
                                                                <div className="text-[9px] sm:text-xs">{selectedReport.lokasi}</div>
                                                            </Popup>
                                                        </Marker>
                                                    </MapContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="flex flex-col gap-1.5 border-t pt-2 sm:flex-row sm:justify-between sm:gap-2 sm:pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsViewDialogOpen(false)}
                                            className="h-7 w-full text-xs sm:h-9 sm:w-auto sm:text-sm"
                                        >
                                            Tutup
                                        </Button>
                                        {selectedReport.status === 'menunggu' && (
                                            <Button
                                                onClick={() => {
                                                    setIsViewDialogOpen(false);
                                                    openVerifyDialog(selectedReport);
                                                }}
                                                className="h-7 w-full text-xs sm:h-9 sm:w-auto sm:text-sm"
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
                        <DialogContent className="dialog-content">
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

                    {/* Image Preview Dialog */}
                    <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                        <DialogContent className="dialog-content sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Foto Kejadian</DialogTitle>
                                <DialogDescription>{selectedReport?.judul || 'Detail foto kejadian'}</DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center overflow-hidden rounded-md p-2">
                                <div className="mb-2 text-xs text-gray-500">{selectedReport && <span>Lokasi: {selectedReport.lokasi}</span>}</div>
                                {selectedImage ? (
                                    <div className="relative">
                                        <div className="relative flex min-h-[300px] items-center justify-center">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
                                            </div>
                                            <img
                                                src={selectedImage}
                                                alt="Foto kejadian"
                                                className="relative z-10 max-h-[600px] w-auto object-contain opacity-0 transition-opacity duration-300"
                                                data-retry-count="0"
                                                onLoad={(e) => {
                                                    // Hide spinner when image loads
                                                    const target = e.target as HTMLImageElement;
                                                    target.classList.remove('opacity-0');
                                                    target.classList.add('opacity-100');
                                                    // Hide spinner element (assuming it's the parent's first child)
                                                    const spinnerEl = target.parentElement?.querySelector('div:first-of-type');
                                                    if (spinnerEl) {
                                                        spinnerEl.classList.add('hidden');
                                                    }
                                                }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;

                                                    // Count retry attempts
                                                    const retryCount = parseInt(target.dataset.retryCount || '0');

                                                    // If we've tried too many times, show placeholder
                                                    if (retryCount >= 2) {
                                                        console.log(`Preview image load failed after ${retryCount} retries`);
                                                        target.src = '/images/placeholder-image.png';
                                                        target.onerror = null; // Prevent further error handling
                                                        toast({
                                                            title: 'Peringatan',
                                                            description: 'Gambar tidak dapat dimuat dengan benar.',
                                                            variant: 'default',
                                                        });
                                                        // Show the image anyway with the placeholder
                                                        target.classList.remove('opacity-0');
                                                        target.classList.add('opacity-100');
                                                        // Hide spinner element
                                                        const spinnerEl = target.parentElement?.querySelector('div:first-of-type');
                                                        if (spinnerEl) {
                                                            spinnerEl.classList.add('hidden');
                                                        }
                                                        return;
                                                    }

                                                    // Increment retry counter
                                                    target.dataset.retryCount = (retryCount + 1).toString();

                                                    if (selectedReport && selectedReport.foto) {
                                                        let newSrc = '';

                                                        if (retryCount === 0) {
                                                            // First retry: try with direct filename approach
                                                            const filename = selectedReport.foto.split('/').pop() || selectedReport.foto;
                                                            newSrc = `/storage/laporans/${filename}?v=${new Date().getTime()}`;
                                                        } else {
                                                            // Last retry: try with raw path
                                                            newSrc = `/${selectedReport.foto}?v=${new Date().getTime()}`;
                                                        }

                                                        console.log(`Preview retry with: ${newSrc}`);
                                                        target.src = newSrc;
                                                    } else {
                                                        target.src = '/images/placeholder-image.png';
                                                        target.onerror = null;
                                                        // Show the image anyway with the placeholder
                                                        target.classList.remove('opacity-0');
                                                        target.classList.add('opacity-100');
                                                        // Hide spinner element
                                                        const spinnerEl = target.parentElement?.querySelector('div:first-of-type');
                                                        if (spinnerEl) {
                                                            spinnerEl.classList.add('hidden');
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-[300px] w-full items-center justify-center rounded-md bg-gray-100">
                                        <div className="p-4 text-center">
                                            <ImageIcon className="mx-auto mb-3 h-16 w-16 text-gray-400" />
                                            <p className="text-gray-500">Tidak ada gambar yang tersedia</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <div className="flex space-x-2">
                                    {selectedReport?.foto && (
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                // Open image in new tab if available
                                                const imgUrl = selectedImage || getFormattedImageUrl(selectedReport?.foto || '');
                                                window.open(imgUrl, '_blank');
                                            }}
                                        >
                                            Lihat Gambar Asli
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                                        Tutup
                                    </Button>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
