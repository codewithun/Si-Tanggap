import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Edit2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import { useToast } from '../../hooks/useToast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Kelola Jalur Evakuasi',
        href: '/admin/evacuation-routes',
    },
];

interface JalurEvakuasi {
    id: number;
    user_id: number;
    nama: string;
    koordinat: { lat: number; lng: number }[];
    jenis_bencana: string;
    warna: string;
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
    data: JalurEvakuasi[];
}

const PolylineCreator = ({
    points,
    setPoints,
    color,
}: {
    points: [number, number][];
    setPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
    color: string;
}) => {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            setPoints((current) => [...current, [lat, lng]]);
        },
    });

    return (
        <>
            <Polyline positions={points} pathOptions={{ color }} />
            {points.map((position, idx) => (
                <Marker key={`marker-${idx}`} position={position} />
            ))}
        </>
    );
};

export default function EvacuationRouteForm() {
    const [jalurList, setJalurList] = useState<JalurEvakuasi[]>([]);
    const [allRoutes, setAllRoutes] = useState<JalurEvakuasi[]>([]);
    const [points, setPoints] = useState<[number, number][]>([]);
    const [routeName, setRouteName] = useState('');
    const [disasterType, setDisasterType] = useState('');
    const [routeColor, setRouteColor] = useState('#FF5733');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
    // Add state to track the ID of the route being edited
    const [editRouteId, setEditRouteId] = useState<number | null>(null);
    const { toast } = useToast();
    const fetchedAllRef = useRef(false);

    // Fetch for table with pagination (current page only)
    const fetchExistingRoutes = useCallback(async () => {
        try {
            const response = await axios.get(`/jalur-evakuasi?page=${currentPage}&per_page=10`);
            setPaginationData(response.data);
            setJalurList(response.data.data);
        } catch (error) {
            console.error('Failed to fetch evacuation routes:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat jalur evakuasi',
                variant: 'destructive',
            });
            setJalurList([]);
        }
    }, [currentPage, toast]);

    // Fetch all routes for map display (run once, or after data change)
    const fetchAllRoutes = useCallback(async () => {
        if (fetchedAllRef.current) return; // prevent double fetch
        try {
            let page = 1;
            let allData: JalurEvakuasi[] = [];
            let lastPage = 1;
            do {
                const response = await axios.get(`/jalur-evakuasi?page=${page}&per_page=100`);
                allData = allData.concat(response.data.data);
                lastPage = response.data.last_page || 1;
                page++;
            } while (page <= lastPage);
            setAllRoutes(allData);
            fetchedAllRef.current = true;
        } catch (error) {
            setAllRoutes([]);
        }
    }, []);

    useEffect(() => {
        fetchExistingRoutes();
    }, [fetchExistingRoutes]);

    useEffect(() => {
        fetchAllRoutes();
    }, [fetchAllRoutes]);

    // Refetch all routes after add/delete
    const refetchAllRoutes = async () => {
        fetchedAllRef.current = false;
        await fetchAllRoutes();
    };

    interface ApiError {
        response?: {
            data?: {
                message?: string;
            };
        };
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (points.length < 2) {
            toast({
                title: 'Peringatan',
                description: 'Tentukan minimal 2 titik untuk jalur evakuasi',
                variant: 'destructive',
            });
            return;
        }

        if (!routeName || !disasterType) {
            toast({
                title: 'Peringatan',
                description: 'Isi nama jalur dan jenis bencana',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const formData = {
                nama: routeName,
                deskripsi: 'Jalur evakuasi',
                koordinat: points.map(([lat, lng]) => ({
                    lat: parseFloat(lat.toFixed(6)),
                    lng: parseFloat(lng.toFixed(6)),
                })),
                jenis_bencana: disasterType,
                warna: routeColor,
            };

            // Check if we're editing or creating new
            if (editRouteId !== null) {
                // Update existing route
                await axios.put(`/jalur-evakuasi/${editRouteId}`, formData);
                toast({
                    title: 'Berhasil',
                    description: 'Jalur evakuasi berhasil diperbarui',
                });
            } else {
                // Create new route
                await axios.post('/jalur-evakuasi', formData);
                toast({
                    title: 'Berhasil',
                    description: 'Jalur evakuasi berhasil disimpan',
                });
            }

            // Reset form after successful operation
            resetForm();
            fetchExistingRoutes();
            refetchAllRoutes();
        } catch (error: unknown) {
            console.error('Failed to save evacuation route:', error);
            const typedError = error as ApiError;
            const errorMessage = typedError?.response?.data?.message || 'Gagal menyimpan jalur evakuasi';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Add a function to reset the form
    const resetForm = () => {
        setPoints([]);
        setRouteName('');
        setDisasterType('');
        setRouteColor('#FF5733');
        setEditRouteId(null);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus jalur evakuasi ini?')) {
            try {
                await axios.delete(`/jalur-evakuasi/${id}`);
                toast({
                    title: 'Berhasil',
                    description: 'Jalur evakuasi berhasil dihapus',
                });
                // If currently editing this route, reset the form
                if (editRouteId === id) {
                    resetForm();
                }
                fetchExistingRoutes();
                refetchAllRoutes();
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Gagal menghapus jalur evakuasi',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleEdit = (jalur: JalurEvakuasi) => {
        setRouteName(jalur.nama);
        setDisasterType(jalur.jenis_bencana);
        setRouteColor(jalur.warna);
        
        // Check the structure of koordinat and convert appropriately
        let pointsArray: [number, number][] = [];
        
        if (Array.isArray(jalur.koordinat)) {
            if (jalur.koordinat.length > 0) {
                if (typeof jalur.koordinat[0] === 'number') {
                    // Format is [lat, lng, lat, lng, ...] (flat array)
                    for (let i = 0; i < jalur.koordinat.length; i += 2) {
                        pointsArray.push([jalur.koordinat[i], jalur.koordinat[i + 1]] as unknown as [number, number]);
                    }
                } else if (Array.isArray(jalur.koordinat[0])) {
                    // Format is [[lat, lng], [lat, lng], ...] (array of arrays)
                    pointsArray = jalur.koordinat as unknown as [number, number][];
                } else if (jalur.koordinat[0] && 'lat' in jalur.koordinat[0] && 'lng' in jalur.koordinat[0]) {
                    // Format is [{lat, lng}, {lat, lng}, ...] (array of objects)
                    pointsArray = jalur.koordinat.map(coord => 
                        [coord.lat, coord.lng] as [number, number]
                    );
                }
            }
        }
        
        setPoints(pointsArray);
        setEditRouteId(jalur.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Jalur Evakuasi" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold text-gray-800">Kelola Jalur Evakuasi</h1>
                <p className="mb-6 text-gray-600">Tambah dan kelola jalur evakuasi bencana yang akan ditampilkan di peta.</p>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{editRouteId ? 'Edit Jalur Evakuasi' : 'Tambah Jalur Evakuasi'}</CardTitle>
                            <CardDescription>Tentukan jalur evakuasi pada peta dengan mengklik beberapa titik untuk membuat polyline</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="h-[400px] w-full overflow-hidden rounded-md">
                                    <MapContainer center={[-7.150975, 110.140259]} zoom={6} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <PolylineCreator points={points} setPoints={setPoints} color={routeColor} />

                                {/* Tampilkan semua jalur di map */}
                                {allRoutes.map((jalur) => {
                                    return jalur.koordinat && jalur.koordinat.length > 0 ? (
                                        <Polyline
                                            key={jalur.id}
                                            positions={jalur.koordinat}
                                            pathOptions={{
                                                color: jalur.warna || '#FF0000',
                                                weight: 3,
                                                opacity: 0.8,
                                            }}
                                        />
                                    ) : null;
                                })}
                            </MapContainer>
                        </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="routeName">Nama Jalur</Label>
                                            <Input
                                                id="routeName"
                                                value={routeName}
                                                onChange={(e) => setRouteName(e.target.value)}
                                                placeholder="Masukkan nama jalur evakuasi"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="disasterType">Jenis Bencana</Label>
                                            <Select value={disasterType} onValueChange={setDisasterType}>
                                                <SelectTrigger id="disasterType">
                                                    <SelectValue placeholder="Pilih jenis bencana" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="banjir">Banjir</SelectItem>
                                                    <SelectItem value="gempa">Gempa Bumi</SelectItem>
                                                    <SelectItem value="longsor">Tanah Longsor</SelectItem>
                                                    <SelectItem value="tsunami">Tsunami</SelectItem>
                                                    <SelectItem value="angin-topan">Angin Topan</SelectItem>
                                                    <SelectItem value="kebakaran">Kebakaran</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="routeColor">Warna Jalur</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    type="color"
                                                    id="routeColor"
                                                    value={routeColor}
                                                    onChange={(e) => setRouteColor(e.target.value)}
                                                    className="h-8 w-12 cursor-pointer p-0"
                                                />
                                                <span className="text-sm text-gray-500">{routeColor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setPoints([])}>
                                            Reset Titik
                                        </Button>
                                        <div className="text-sm text-gray-500">{points.length} titik ditentukan</div>
                                    </div>
                                </form>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            {editRouteId && (
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Batal Edit
                                </Button>
                            )}
                            <Button type="submit" onClick={handleSubmit} disabled={loading || points.length < 2 || !routeName || !disasterType}>
                                {loading ? 'Menyimpan...' : editRouteId ? 'Perbarui Jalur Evakuasi' : 'Simpan Jalur Evakuasi'}
                            </Button>
                        </CardFooter>
                    </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Jalur Evakuasi</CardTitle>
                    <CardDescription>Jalur evakuasi yang telah ditambahkan</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Nama</th>
                                    <th className="px-4 py-2 text-left font-medium">Jenis Bencana</th>
                                    <th className="px-4 py-2 text-left font-medium">Pembuat</th>
                                    <th className="px-4 py-2 text-left font-medium">Titik</th>
                                    <th className="px-4 py-2 text-left font-medium">Dibuat</th>
                                    <th className="px-4 py-2 text-left font-medium">Diperbarui</th>
                                    <th className="px-4 py-2 text-center font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {jalurList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                                            Belum ada jalur evakuasi yang ditambahkan
                                        </td>
                                    </tr>
                                ) : (
                                    jalurList.map((jalur) => (
                                        <tr key={jalur.id}>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: jalur.warna }} />
                                                    {jalur.nama}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{jalur.jenis_bencana}</span>
                                            </td>
                                            <td className="px-4 py-2">{jalur.user?.name || 'Unknown'}</td>
                                            <td className="px-4 py-2">{jalur.koordinat.length} titik</td>
                                            <td className="px-4 py-2 text-gray-500">{new Date(jalur.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 text-gray-500">{new Date(jalur.updated_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(jalur)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(jalur.id)}>
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
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <div className="text-sm text-gray-500">
                                    Showing {(paginationData.current_page - 1) * paginationData.per_page + 1} to{' '}
                                    {Math.min(paginationData.current_page * paginationData.per_page, paginationData.total)} of {paginationData.total}{' '}
                                    entries
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    {[...Array(paginationData.last_page)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        const showPage =
                                            pageNumber === 1 || pageNumber === paginationData.last_page || Math.abs(pageNumber - currentPage) <= 1;

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
                                                variant={currentPage === pageNumber ? 'default' : 'outline'}
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
                                        disabled={currentPage === paginationData.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
                </div>
            </div>
        </AppLayout>
    );
}