import { Head, Link } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';

export default function CreateReport() {
    type FormData = {
        disasterType: string;
        locationName: string;
        lat: string;
        lng: string;
        date: string;
        time: string;
        severity: string;
        victims: string;
        description: string;
        photos: File[];
    };

    const [formData, setFormData] = useState<FormData>({
        disasterType: '',
        locationName: '',
        lat: '',
        lng: '',
        date: '',
        time: '',
        severity: 'Rendah',
        victims: '',
        description: '',
        photos: [],
    });

    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        // Create map instance
        mapInstance.current = L.map(mapRef.current).setView([-2.5489, 118.0149], 5); // Center of Indonesia

        // Add tile layer (basemap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(mapInstance.current);

        // Add click event to map for location selection
        mapInstance.current.on('click', (e) => {
            const { lat, lng } = e.latlng;

            // Update form data
            setFormData((prev) => ({
                ...prev,
                lat: lat.toFixed(6),
                lng: lng.toFixed(6),
            }));

            // Add or update marker
            if (markerRef.current && mapInstance.current) {
                mapInstance.current.removeLayer(markerRef.current);
            }

            markerRef.current = L.marker([lat, lng]).addTo(mapInstance.current!);
        });

        // Cleanup function
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Handle form changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type, files } = e.target as HTMLInputElement;

        if (type === 'file') {
            setFormData((prev) => ({
                ...prev,
                photos: files ? Array.from(files) : [],
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log('Form submitted:', formData);
        alert('Laporan berhasil dikirim!');
    };

    // Set current date and time as default
    useEffect(() => {
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0];
        const formattedTime = now.toTimeString().split(' ')[0].substring(0, 5);

        setFormData((prev) => ({
            ...prev,
            date: formattedDate,
            time: formattedTime,
        }));
    }, []);

    return (
        <>
            <Head title="Laporkan Bencana - Si Tanggap">
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                />
            </Head>

            <div className="flex min-h-screen flex-col">
                {/* Header */}
                <header className="z-10 bg-white px-4 py-2 shadow-sm">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/webgis" className="flex items-center">
                                <img src="/logo.svg" alt="Si Tanggap Logo" className="mr-2 h-8 w-8" />
                                <span className="text-xl font-bold text-blue-600">Si Tanggap</span>
                            </Link>
                        </div>

                        <div className="hidden items-center space-x-4 md:flex">
                            {/* Navigation links */}
                            <Link href="/webgis" className="text-gray-700 hover:text-blue-600">
                                Beranda
                            </Link>
                            <Link href="/webgis/map" className="text-gray-700 hover:text-blue-600">
                                Peta
                            </Link>
                            <Link href="/webgis/reports" className="text-gray-700 hover:text-blue-600">
                                Laporan
                            </Link>
                            <Link href="/webgis/data" className="text-gray-700 hover:text-blue-600">
                                Data
                            </Link>
                            <Link href="/webgis/about" className="text-gray-700 hover:text-blue-600">
                                Tentang
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button className="text-gray-500 md:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </header>

                <main className="container mx-auto flex-1 px-4 py-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-6 flex items-center">
                            <Link href="/webgis/reports" className="mr-2 text-blue-600 hover:text-blue-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-2xl font-bold">Laporkan Bencana</h1>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-lg">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Left Column */}
                                    <div>
                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Jenis Bencana *</label>
                                            <select
                                                name="disasterType"
                                                value={formData.disasterType}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="">Pilih Jenis Bencana</option>
                                                <option value="Banjir">Banjir</option>
                                                <option value="Gempa">Gempa</option>
                                                <option value="Tanah Longsor">Tanah Longsor</option>
                                                <option value="Kebakaran Hutan">Kebakaran Hutan</option>
                                                <option value="Tsunami">Tsunami</option>
                                                <option value="Gunung Meletus">Gunung Meletus</option>
                                                <option value="Angin Topan">Angin Topan</option>
                                                <option value="Kekeringan">Kekeringan</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Nama Lokasi *</label>
                                            <input
                                                type="text"
                                                name="locationName"
                                                value={formData.locationName}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nama desa, kecamatan, kabupaten"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Koordinat Lokasi *</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    name="lat"
                                                    value={formData.lat}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Latitude"
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    name="lng"
                                                    value={formData.lng}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Longitude"
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">Klik pada peta untuk memilih lokasi</p>
                                        </div>

                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Waktu Kejadian *</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <input
                                                    type="time"
                                                    name="time"
                                                    value={formData.time}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Tingkat Kerusakan</label>
                                            <select
                                                name="severity"
                                                value={formData.severity}
                                                onChange={handleChange}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="Rendah">Rendah</option>
                                                <option value="Sedang">Sedang</option>
                                                <option value="Tinggi">Tinggi</option>
                                                <option value="Ekstrem">Ekstrem</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Jumlah Korban (jika ada)</label>
                                            <input
                                                type="number"
                                                name="victims"
                                                value={formData.victims}
                                                onChange={handleChange}
                                                min="0"
                                                placeholder="0"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div>
                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Pilih Lokasi pada Peta *</label>
                                            <div id="map" ref={mapRef} className="h-[300px] w-full rounded-md border border-gray-300"></div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Deskripsi Kejadian</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={4}
                                                placeholder="Jelaskan detail kejadian bencana..."
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            ></textarea>
                                        </div>

                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Unggah Foto (Opsional)</label>
                                            <input
                                                type="file"
                                                name="photos"
                                                onChange={handleChange}
                                                multiple
                                                accept="image/*"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Maksimal 5 foto, ukuran maks. 5MB per foto</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <Link
                                        href="/webgis/reports"
                                        className="mr-2 rounded-md bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-300 hover:bg-gray-400"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors duration-300 hover:bg-blue-700"
                                    >
                                        Kirim Laporan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-12 bg-gray-900 py-8 text-white">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col justify-between md:flex-row">
                            <div className="mb-4 md:mb-0">
                                <h3 className="mb-2 text-lg font-semibold">Si Tanggap</h3>
                                <p className="text-sm text-gray-400">Sistem Informasi Tanggap Bencana</p>
                            </div>
                            <div className="flex space-x-4">
                                <Link href="/webgis" className="text-gray-400 hover:text-white">
                                    Beranda
                                </Link>
                                <Link href="/webgis/map" className="text-gray-400 hover:text-white">
                                    Peta
                                </Link>
                                <Link href="/webgis/reports" className="text-gray-400 hover:text-white">
                                    Laporan
                                </Link>
                                <Link href="/webgis/data" className="text-gray-400 hover:text-white">
                                    Data
                                </Link>
                                <Link href="/webgis/about" className="text-gray-400 hover:text-white">
                                    Tentang Kami
                                </Link>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
                            <p>&copy; {new Date().getFullYear()} Si Tanggap - Sistem Informasi Tanggap Bencana. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
