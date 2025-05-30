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
import { CheckCircleIcon, ImageIcon, MapPinIcon, XCircleIcon } from 'lucide-react';
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
    // Add cache buster to prevent caching issues
    const cacheBuster = `?v=${new Date().getTime()}`;

    switch (type.toLowerCase()) {
        case 'banjir':
            return L.icon({
                iconUrl: `/icons/icon-banjir.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'kebakaran':
            return L.icon({
                iconUrl: `/icons/icon-kebakaran.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'gempa':
            return L.icon({
                iconUrl: `/icons/icon-gempa.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'longsor':
            return L.icon({
                iconUrl: `/icons/icon-tanahlongsor.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'angin-topan':
        case 'angin_topan':
            return L.icon({
                iconUrl: `/icons/icon-angin-topan.svg${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'tsunami':
            return L.icon({
                iconUrl: `/icons/icon-tsunami.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'kekeringan':
            return L.icon({
                iconUrl: `/icons/icon-kekeringan.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        default:
            return L.icon({
                iconUrl: `/icons/disaster-marker.svg${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
    }
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

    // Add state for image preview dialog
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Add state for image loading status
    const [imageLoadError, setImageLoadError] = useState<{ [key: number]: boolean }>({});

    // Add state for image loading indicators
    const [loadingImages, setLoadingImages] = useState<{ [key: number]: boolean }>({});

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            // Use the correct endpoint - adjust it based on your API setup
            const response = await axios.get('/api/relawan/laporans');

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
                verificationStatus === 'diverifikasi'
                    ? `/api/relawan/laporans/${selectedReport.id}/verify`
                    : `/api/relawan/laporans/${selectedReport.id}/reject`;

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

    // Better image error handling
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
                                            <div className="relative">
                                                {imageLoadError[report.id] ? (
                                                    <div className="flex h-40 w-full items-center justify-center rounded-md border bg-gray-100">
                                                        <div className="p-4 text-center">
                                                            <ImageIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                            <p className="text-sm text-gray-500">Gambar tidak dapat dimuat</p>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="mt-1 text-xs"
                                                                onClick={() => {
                                                                    // Reset error state and try again
                                                                    setImageLoadError((prev) => {
                                                                        const newState = { ...prev };
                                                                        delete newState[report.id];
                                                                        return newState;
                                                                    });
                                                                    // Set loading state
                                                                    setLoadingImages((prev) => ({ ...prev, [report.id]: true }));
                                                                }}
                                                            >
                                                                Coba Lagi
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="relative h-40 w-full cursor-pointer overflow-hidden rounded-md bg-gray-100 transition-opacity hover:opacity-90"
                                                        onClick={() => openImagePreview(report)}
                                                    >
                                                        {loadingImages[report.id] && (
                                                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
                                                                <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
                                                            </div>
                                                        )}
                                                        <img
                                                            src={getFormattedImageUrl(report.foto)}
                                                            alt="Foto kejadian"
                                                            className="h-full w-full object-cover"
                                                            data-retry-count="0"
                                                            onLoad={() => {
                                                                // Remove loading state when image loads successfully
                                                                setLoadingImages((prev) => {
                                                                    const newState = { ...prev };
                                                                    delete newState[report.id];
                                                                    return newState;
                                                                });
                                                            }}
                                                            onError={(e) => handleImageError(report.id, e.target as HTMLImageElement)}
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
                                                    </div>
                                                )}
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="absolute right-2 bottom-2 h-8 w-8 bg-white/70 p-0 hover:bg-white/90"
                                                    onClick={() => openImagePreview(report)}
                                                >
                                                    <ImageIcon className="h-4 w-4" />
                                                    <span className="sr-only">Lihat foto</span>
                                                </Button>
                                            </div>
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

                {/* Image Preview Dialog */}
                <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                    <DialogContent className="sm:max-w-2xl">
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
