import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Edit2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

// Define the breadcrumbs for the page
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Kelola Posko Evakuasi',
        href: '/admin/shelters',
    },
];

interface Posko {
    id: number;
    user_id: number;
    nama: string;
    deskripsi: string;
    alamat: string;
    kontak: string;
    jenis_posko: string;
    status: string;
    latitude: number;
    longitude: number;
    kapasitas: number;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Posko[];
}

const shelterIcon = icon({
    iconUrl: '/icons/shelter-marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const MarkerCreator = ({
    position,
    setPosition,
}: {
    position: [number, number] | null;
    setPosition: React.Dispatch<React.SetStateAction<[number, number] | null>>;
}) => {
    useMapEvents({
        click: (e) => {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} icon={shelterIcon} /> : null;
};

export default function PoskoForm() {
    const [poskoList, setPoskoList] = useState<Posko[]>([]);
    const [allPoskos, setAllPoskos] = useState<Posko[]>([]);
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [poskoName, setPoskoName] = useState('');
    const [poskoDesc, setPoskoDesc] = useState('');
    const [poskoAddress, setPoskoAddress] = useState('');
    const [poskoContact, setPoskoContact] = useState('');
    const [poskoType, setPoskoType] = useState('');
    const [poskoStatus, setPoskoStatus] = useState('aktif');
    const [poskoCapacity, setPoskoCapacity] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
    const { toast } = useToast();

    // Untuk edit
    const [editId, setEditId] = useState<number | null>(null);

    // Add these new state variables for delete confirmation dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const itemsPerPage = 10;
    const fetchedAllRef = useRef(false);

    // Fetch paginated posko for table
    const fetchExistingPoskos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/poskos', {
                params: {
                    page: currentPage,
                    per_page: itemsPerPage,
                },
            });

            if (response.data.data) {
                setPoskoList(response.data.data);
                setPaginationData({
                    current_page: response.data.current_page ?? 1,
                    last_page: response.data.last_page ?? 1,
                    per_page: response.data.per_page ?? itemsPerPage,
                    total: response.data.total ?? response.data.data.length,
                    data: response.data.data,
                });
            } else {
                setPoskoList(response.data);
                setPaginationData({
                    current_page: 1,
                    last_page: 1,
                    per_page: itemsPerPage,
                    total: response.data.length,
                    data: response.data,
                });
            }
        } catch (error) {
            console.error('Failed to fetch poskos:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data posko',
                variant: 'destructive',
            });
            setPoskoList([]);
        } finally {
            setLoading(false);
        }
    }, [toast, currentPage]);

    // Fetch all poskos for map
    const fetchAllPoskos = useCallback(async () => {
        if (fetchedAllRef.current) return;
        try {
            let page = 1;
            let allData: Posko[] = [];
            let lastPage = 1;
            do {
                const response = await axios.get('/poskos', {
                    params: { page, per_page: 100 },
                });
                allData = allData.concat(response.data.data ?? response.data);
                lastPage = response.data.last_page || 1;
                page++;
            } while (page <= lastPage);
            setAllPoskos(allData);
            fetchedAllRef.current = true;
        } catch {
            setAllPoskos([]);
        }
    }, []);

    useEffect(() => {
        fetchExistingPoskos();
    }, [fetchExistingPoskos]);

    useEffect(() => {
        fetchAllPoskos();
    }, [fetchAllPoskos]);

    // Refetch all poskos after add/delete
    const refetchAllPoskos = async () => {
        fetchedAllRef.current = false;
        await fetchAllPoskos();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!position) {
            toast({
                title: 'Peringatan',
                description: 'Tentukan lokasi posko pada peta',
                variant: 'destructive',
            });
            return;
        }

        if (!poskoName || !poskoDesc || !poskoAddress || !poskoType || !poskoCapacity) {
            toast({
                title: 'Peringatan',
                description: 'Lengkapi semua data yang diperlukan',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            if (editId) {
                // Update
                await axios.put(`/poskos/${editId}`, {
                    nama: poskoName,
                    deskripsi: poskoDesc,
                    alamat: poskoAddress,
                    kontak: poskoContact,
                    jenis_posko: poskoType,
                    status: poskoStatus,
                    latitude: position[0],
                    longitude: position[1],
                    kapasitas: parseInt(poskoCapacity),
                });

                toast({
                    title: 'Berhasil',
                    description: 'Posko berhasil diperbarui',
                });
            } else {
                // Add
                await axios.post('/poskos', {
                    nama: poskoName,
                    deskripsi: poskoDesc,
                    alamat: poskoAddress,
                    kontak: poskoContact,
                    jenis_posko: poskoType,
                    status: poskoStatus,
                    latitude: position[0],
                    longitude: position[1],
                    kapasitas: parseInt(poskoCapacity),
                });

                toast({
                    title: 'Berhasil',
                    description: 'Posko berhasil disimpan',
                });
            }

            // Reset form
            setPosition(null);
            setPoskoName('');
            setPoskoDesc('');
            setPoskoAddress('');
            setPoskoContact('');
            setPoskoType('');
            setPoskoCapacity('');
            setEditId(null);
            fetchExistingPoskos();
            refetchAllPoskos();
        } catch (error) {
            console.error('Failed to save posko:', error);
            toast({
                title: 'Error',
                description: editId ? 'Gagal memperbarui posko' : 'Gagal menyimpan posko',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Replace the current handleDelete function with these two functions
    const handleDeleteClick = (id: number) => {
        setDeleteTargetId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (deleteTargetId === null) return;

        try {
            await axios.delete(`/poskos/${deleteTargetId}`);
            toast({
                title: 'Berhasil',
                description: 'Posko berhasil dihapus',
            });
            // If currently editing this posko, reset the form
            if (editId === deleteTargetId) {
                setPosition(null);
                setPoskoName('');
                setPoskoDesc('');
                setPoskoAddress('');
                setPoskoContact('');
                setPoskoType('');
                setPoskoCapacity('');
                setEditId(null);
            }
            fetchExistingPoskos();
            refetchAllPoskos();
        } catch {
            toast({
                title: 'Error',
                description: 'Gagal menghapus posko',
                variant: 'destructive',
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteTargetId(null);
        }
    };

    const handleEdit = (posko: Posko) => {
        setEditId(posko.id);
        setPoskoName(posko.nama);
        setPoskoDesc(posko.deskripsi);
        setPoskoAddress(posko.alamat);
        setPoskoContact(posko.kontak);
        setPoskoType(posko.jenis_posko);
        setPoskoStatus(posko.status);
        setPoskoCapacity(posko.kapasitas.toString());
        setPosition([posko.latitude, posko.longitude]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Add useEffect for map z-index styling
    useEffect(() => {
        // Add custom style for map z-index
        const style = document.createElement('style');
        style.textContent = `
            /* Control map z-index to prevent overlapping UI elements */
            .leaflet-container {
                z-index: 1 !important;
            }
            .leaflet-pane,
            .leaflet-control,
            .leaflet-top,
            .leaflet-bottom {
                z-index: 400 !important;
            }
            /* Higher z-index for dialog components */
            .dialog-content {
                z-index: 1000 !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Posko Evakuasi" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold text-gray-800">Kelola Posko Evakuasi</h1>
                <p className="mb-6 text-gray-600">Tambah dan kelola posko evakuasi bencana yang akan ditampilkan di peta.</p>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{editId ? 'Edit Posko' : 'Tambah Posko'}</CardTitle>
                            <CardDescription>Tentukan lokasi posko pada peta dengan mengklik titik yang diinginkan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="h-[400px] w-full overflow-hidden rounded-md">
                                    <MapContainer center={[-7.150975, 110.140259]} zoom={6} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <MarkerCreator position={position} setPosition={setPosition} />
                                        {/* Display all poskos, not just current page */}
                                        {allPoskos.map((posko) => (
                                            <Marker key={posko.id} position={[posko.latitude, posko.longitude]} icon={shelterIcon} />
                                        ))}
                                    </MapContainer>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="poskoName">Nama Posko</Label>
                                            <Input
                                                id="poskoName"
                                                value={poskoName}
                                                onChange={(e) => setPoskoName(e.target.value)}
                                                placeholder="Masukkan nama posko"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="poskoType">Jenis Posko</Label>
                                            <Select value={poskoType} onValueChange={setPoskoType}>
                                                <SelectTrigger id="poskoType">
                                                    <SelectValue placeholder="Pilih jenis posko" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pengungsian">Pengungsian</SelectItem>
                                                    <SelectItem value="kesehatan">Kesehatan</SelectItem>
                                                    <SelectItem value="logistik">Logistik</SelectItem>
                                                    <SelectItem value="dapur-umum">Dapur Umum</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="poskoAddress">Alamat</Label>
                                            <Textarea
                                                id="poskoAddress"
                                                value={poskoAddress}
                                                onChange={(e) => setPoskoAddress(e.target.value)}
                                                placeholder="Masukkan alamat lengkap posko"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="poskoDesc">Deskripsi</Label>
                                            <Textarea
                                                id="poskoDesc"
                                                value={poskoDesc}
                                                onChange={(e) => setPoskoDesc(e.target.value)}
                                                placeholder="Masukkan deskripsi posko"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="poskoContact">Kontak</Label>
                                            <Input
                                                id="poskoContact"
                                                value={poskoContact}
                                                onChange={(e) => setPoskoContact(e.target.value)}
                                                placeholder="Masukkan nomor kontak"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="poskoCapacity">Kapasitas</Label>
                                            <Input
                                                id="poskoCapacity"
                                                type="number"
                                                value={poskoCapacity}
                                                onChange={(e) => setPoskoCapacity(e.target.value)}
                                                placeholder="Masukkan kapasitas posko"
                                                min="1"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="poskoStatus">Status</Label>
                                            <Select value={poskoStatus} onValueChange={setPoskoStatus}>
                                                <SelectTrigger id="poskoStatus">
                                                    <SelectValue placeholder="Pilih status posko" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="aktif">Aktif</SelectItem>
                                                    <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setPosition(null);
                                                setEditId(null);
                                                setPoskoName('');
                                                setPoskoDesc('');
                                                setPoskoAddress('');
                                                setPoskoContact('');
                                                setPoskoType('');
                                                setPoskoCapacity('');
                                            }}
                                        >
                                            Reset Form
                                        </Button>
                                        <div className="text-sm text-gray-500">{position ? 'Lokasi sudah ditentukan' : 'Belum ada lokasi'}</div>
                                    </div>
                                </form>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={loading || !position || !poskoName || !poskoDesc || !poskoAddress || !poskoType || !poskoCapacity}
                            >
                                {loading ? (editId ? 'Menyimpan Perubahan...' : 'Menyimpan...') : editId ? 'Update Posko' : 'Simpan Posko'}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Posko</CardTitle>
                            <CardDescription>Posko yang telah ditambahkan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-auto">
                                <div className="min-w-full rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium">Nama</th>
                                                <th className="px-4 py-2 text-left font-medium">Jenis</th>
                                                <th className="hidden px-4 py-2 text-left font-medium sm:table-cell">Status</th>
                                                <th className="hidden px-4 py-2 text-left font-medium sm:table-cell">Kapasitas</th>
                                                <th className="hidden px-4 py-2 text-left font-medium md:table-cell">Alamat</th>
                                                <th className="hidden px-4 py-2 text-left font-medium lg:table-cell">Kontak</th>
                                                <th className="hidden px-4 py-2 text-left font-medium lg:table-cell">Pembuat</th>
                                                <th className="hidden px-4 py-2 text-left font-medium xl:table-cell">Dibuat</th>
                                                <th className="hidden px-4 py-2 text-left font-medium xl:table-cell">Diperbarui</th>
                                                <th className="px-4 py-2 text-center font-medium">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {loading ? (
                                                Array(itemsPerPage)
                                                    .fill(0)
                                                    .map((_, idx) => (
                                                        <tr key={`skeleton-${idx}`}>
                                                            <td colSpan={10} className="px-4 py-3">
                                                                <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
                                                            </td>
                                                        </tr>
                                                    ))
                                            ) : poskoList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={10} className="px-4 py-4 text-center text-gray-500">
                                                        Belum ada posko yang ditambahkan
                                                    </td>
                                                </tr>
                                            ) : (
                                                poskoList.map((posko) => (
                                                    <tr key={posko.id}>
                                                        <td className="px-4 py-2">
                                                            <span className="block max-w-[120px] truncate sm:max-w-none">{posko.nama}</span>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs whitespace-nowrap">
                                                                {posko.jenis_posko}
                                                            </span>
                                                        </td>
                                                        <td className="hidden px-4 py-2 sm:table-cell">
                                                            <span
                                                                className={`rounded-full px-2 py-1 text-xs whitespace-nowrap ${
                                                                    posko.status === 'aktif'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}
                                                            >
                                                                {posko.status}
                                                            </span>
                                                        </td>
                                                        <td className="hidden px-4 py-2 sm:table-cell">{posko.kapasitas} orang</td>
                                                        <td className="hidden px-4 py-2 md:table-cell">
                                                            <span className="block max-w-[150px] truncate" title={posko.alamat}>
                                                                {posko.alamat}
                                                            </span>
                                                        </td>
                                                        <td className="hidden px-4 py-2 lg:table-cell">{posko.kontak || '-'}</td>
                                                        <td className="hidden px-4 py-2 lg:table-cell">{posko.user?.name || 'Unknown'}</td>
                                                        <td className="hidden px-4 py-2 text-gray-500 xl:table-cell">
                                                            {new Date(posko.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="hidden px-4 py-2 text-gray-500 xl:table-cell">
                                                            {new Date(posko.updated_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(posko)}>
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(posko.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

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
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add the delete confirmation dialog at the end of your component, right before closing the AppLayout tag */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="dialog-content">
                    <DialogHeader>
                        <DialogTitle>Hapus Posko</DialogTitle>
                        <DialogDescription>Apakah Anda yakin ingin menghapus posko ini? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
