import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, CalendarIcon, ChevronLeft, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface NewsItem {
    id: number;
    title: string;
    content: string;
    image: string;
    category: string;
    author: string;
    date: string;
    slug: string;
}

export default function NewsPage() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth.user;
    const userRole = auth.user?.role || null;
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const itemsPerPage = 9;
    const categories = ['all', 'bencana alam', 'peringatan dini', 'evakuasi', 'pemulihan', 'edukasi'];

    const filterNews = useCallback(() => {
        let filtered = [...news];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.content.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        // Filter by category
        if (category !== 'all') {
            filtered = filtered.filter((item) => item.category === category);
        }

        setFilteredNews(filtered);
        setCurrentPage(1);
    }, [news, searchQuery, category]);

    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            // For the demo we'll use mock data, but in production this would be an API call
            // const response = await axios.get('/api/news');
            // setNews(response.data);

            // Mock data for demonstration
            const mockData: NewsItem[] = [
                {
                    id: 1,
                    title: 'Pemulihan Pasca Banjir di Jakarta Timur',
                    content:
                        'Upaya pemulihan infrastruktur di kawasan Jakarta Timur terus dilakukan setelah banjir besar minggu lalu. Tim relawan dari berbagai organisasi bersama dengan warga lokal bergotong royong membersihkan puing dan mengembalikan kondisi lingkungan seperti semula.\n\nDinas Sosial juga telah mendirikan tenda darurat dan menyalurkan bantuan untuk warga yang terdampak. Menurut data terakhir, sekitar 70% wilayah terdampak telah berhasil dipulihkan dalam waktu yang relatif singkat berkat koordinasi yang baik antar lembaga.',
                    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'pemulihan',
                    author: 'Dinas Penanggulangan Bencana',
                    date: '2023-11-15T08:30:00Z',
                    slug: 'pemulihan-pasca-banjir-jakarta-timur',
                },
                {
                    id: 2,
                    title: 'Peringatan Dini: Potensi Longsor di Kawasan Perbukitan',
                    content:
                        'BMKG mengeluarkan peringatan dini terkait potensi longsor di beberapa kawasan perbukitan Indonesia. Hal ini dikarenakan intensitas hujan yang terus meningkat dalam seminggu terakhir.\n\nMasyarakat yang tinggal di kawasan perbukitan diminta untuk waspada terhadap tanda-tanda longsor seperti retakan tanah, pergerakan tanah, dan perubahan struktur bangunan. Pihak berwenang juga telah menyiapkan lokasi evakuasi sementara sebagai langkah antisipasi.',
                    image: 'https://images.unsplash.com/photo-1573209676048-4b48051b3881?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'peringatan dini',
                    author: 'BMKG',
                    date: '2023-11-17T14:15:00Z',
                    slug: 'peringatan-dini-potensi-longsor-perbukitan',
                },
                {
                    id: 3,
                    title: 'Workshop Kesigapan Menghadapi Gempa Bumi',
                    content:
                        'Dinas Pendidikan bekerja sama dengan BNPB menggelar workshop kesigapan menghadapi gempa bumi di sekolah-sekolah. Program ini bertujuan untuk memberikan pemahaman dan keterampilan dasar bagi siswa dan guru tentang tindakan yang tepat saat terjadi gempa.\n\nDalam workshop tersebut, peserta dilatih untuk melakukan teknik berlindung, evakuasi, dan penanganan pertama pada korban. Inisiatif ini merupakan bagian dari kampanye nasional untuk meningkatkan kesadaran dan kesiapsiagaan masyarakat dalam menghadapi bencana alam.',
                    image: 'https://images.unsplash.com/photo-1629949005190-585d78a6915b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'edukasi',
                    author: 'BNPB',
                    date: '2023-11-10T09:45:00Z',
                    slug: 'workshop-kesigapan-menghadapi-gempa-bumi',
                },
                {
                    id: 4,
                    title: 'Jalur Evakuasi Baru di Kawasan Gunung Berapi',
                    content:
                        'Pemerintah daerah telah meresmikan jalur evakuasi baru di kawasan pemukiman sekitar Gunung Merapi. Jalur ini didesain untuk memudahkan masyarakat melakukan evakuasi cepat saat terjadi peningkatan aktivitas gunung berapi.\n\nSelain jalur fisik, sistem informasi digital juga telah diimplementasikan untuk memberikan petunjuk arah evakuasi melalui aplikasi smartphone. Jalur ini telah diuji melalui simulasi evakuasi yang melibatkan ribuan warga dan terbukti dapat mempercepat proses evakuasi hingga 40% dibandingkan jalur sebelumnya.',
                    image: 'https://images.unsplash.com/photo-1599809322458-32a3de599521?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'evakuasi',
                    author: 'Badan Geologi',
                    date: '2023-11-05T16:20:00Z',
                    slug: 'jalur-evakuasi-baru-kawasan-gunung-berapi',
                },
                {
                    id: 5,
                    title: 'Sistem Peringatan Tsunami Terbaru Dipasang di Pesisir Barat',
                    content:
                        'Sistem peringatan tsunami terbaru telah dipasang di sepanjang pesisir barat Sumatera untuk meningkatkan kesiapsiagaan menghadapi bencana tsunami. Sistem ini menggunakan teknologi terkini yang dapat mendeteksi gelombang tsunami lebih awal dan memberikan peringatan lebih cepat kepada masyarakat.\n\nDengan adanya sistem ini, diharapkan waktu evakuasi dapat lebih panjang sehingga dapat mengurangi jumlah korban jiwa jika terjadi tsunami. Sistem ini telah terhubung dengan pusat data nasional dan regional untuk memastikan koordinasi yang efektif.',
                    image: 'https://images.unsplash.com/photo-1544825490-6feafaad6e85?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'peringatan dini',
                    author: 'BMKG',
                    date: '2023-10-28T11:10:00Z',
                    slug: 'sistem-peringatan-tsunami-terbaru-pesisir-barat',
                },
                {
                    id: 6,
                    title: 'Bencana Tanah Longsor di Kabupaten Garut',
                    content:
                        'Bencana tanah longsor telah melanda beberapa desa di Kabupaten Garut akibat curah hujan yang tinggi selama beberapa hari terakhir. Longsor tersebut telah mengakibatkan kerusakan infrastruktur dan pemukiman warga.\n\nTim SAR masih melakukan pencarian korban yang diperkirakan tertimbun. Sementara itu, otoritas setempat telah membuka posko pengungsian untuk warga terdampak. Bantuan logistik, medis, dan kebutuhan dasar terus didistribusikan ke lokasi bencana.',
                    image: 'https://images.unsplash.com/photo-1621617208998-3cf36d48cb70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'bencana alam',
                    author: 'BNPB',
                    date: '2023-10-20T18:05:00Z',
                    slug: 'bencana-tanah-longsor-kabupaten-garut',
                },
                {
                    id: 7,
                    title: 'Sosialisasi Mitigasi Bencana untuk Anak Sekolah',
                    content:
                        'Program sosialisasi mitigasi bencana untuk anak sekolah telah diluncurkan di 100 sekolah dasar dan menengah di seluruh Indonesia. Program ini bertujuan untuk membangun kesadaran dan kesiapan generasi muda dalam menghadapi bencana alam.\n\nMelalui metode pembelajaran interaktif seperti simulasi, permainan edukatif, dan cerita, anak-anak diajarkan tentang berbagai jenis bencana alam dan tindakan yang tepat saat menghadapinya. Program ini merupakan kolaborasi antara Kementerian Pendidikan dan BNPB.',
                    image: 'https://images.unsplash.com/photo-1602839911108-bf70f0b04a27?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'edukasi',
                    author: 'Kementerian Pendidikan',
                    date: '2023-10-15T09:30:00Z',
                    slug: 'sosialisasi-mitigasi-bencana-anak-sekolah',
                },
                {
                    id: 8,
                    title: 'Pemulihan Ekonomi Pasca Gempa di Sulawesi Barat',
                    content:
                        'Program pemulihan ekonomi untuk masyarakat terdampak gempa di Sulawesi Barat mulai menunjukkan hasil positif. Berbagai UMKM lokal telah kembali beroperasi dengan bantuan modal dan pelatihan dari pemerintah serta lembaga non-pemerintah.\n\nSelain itu, sektor pariwisata juga mulai bangkit dengan promosi destinasi wisata baru yang aman dari bencana. Program ini tidak hanya berfokus pada pemulihan ekonomi jangka pendek, tetapi juga membangun ketahanan ekonomi masyarakat dalam menghadapi bencana di masa depan.',
                    image: 'https://images.unsplash.com/photo-1569577074291-3168f1e8944d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'pemulihan',
                    author: 'Kementerian UMKM',
                    date: '2023-10-10T14:20:00Z',
                    slug: 'pemulihan-ekonomi-pasca-gempa-sulawesi-barat',
                },
                {
                    id: 9,
                    title: 'Kebakaran Hutan dan Lahan di Kalimantan Timur',
                    content:
                        'Kebakaran hutan dan lahan kembali terjadi di beberapa titik di Kalimantan Timur. Kondisi cuaca yang panas dan kering menjadi faktor utama penyebaran api yang cepat.\n\nTim pemadaman dari BNPB, TNI, dan Polri telah dikerahkan untuk memadamkan api, sementara pesawat water bombing juga digunakan untuk area yang sulit dijangkau darat. Masyarakat di sekitar area kebakaran diminta untuk memakai masker dan mengurangi aktivitas di luar ruangan karena kualitas udara yang buruk.',
                    image: 'https://images.unsplash.com/photo-1572974251010-accbd530c298?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'bencana alam',
                    author: 'Dinas Kehutanan',
                    date: '2023-10-05T16:45:00Z',
                    slug: 'kebakaran-hutan-lahan-kalimantan-timur',
                },
                {
                    id: 10,
                    title: 'Rumah Tahan Gempa untuk Daerah Rawan Bencana',
                    content:
                        'Inovasi desain rumah tahan gempa telah diperkenalkan untuk masyarakat yang tinggal di daerah rawan gempa. Rumah-rumah ini dirancang dengan struktur khusus yang dapat menahan goncangan gempa hingga skala tertentu.\n\nSelain aspek keamanan, desain rumah ini juga memperhatikan aspek keterjangkauan biaya dan kemudahan pembangunan agar dapat diimplementasikan secara luas di masyarakat. Proyek percontohan telah dibangun di beberapa daerah dan mendapatkan respons positif dari masyarakat.',
                    image: 'https://images.unsplash.com/photo-1578284642086-494e15fcff68?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'edukasi',
                    author: 'Kementerian PUPR',
                    date: '2023-09-28T10:50:00Z',
                    slug: 'rumah-tahan-gempa-daerah-rawan-bencana',
                },
                {
                    id: 11,
                    title: 'Distribusi Bantuan untuk Korban Banjir Bandang',
                    content:
                        'Distribusi bantuan untuk korban banjir bandang di beberapa kabupaten terus dilakukan. Bantuan berupa makanan, selimut, obat-obatan, dan kebutuhan dasar lainnya telah disalurkan ke pengungsian-pengungsian.\n\nProses distribusi bantuan ini melibatkan berbagai pihak termasuk pemerintah, TNI/Polri, relawan, dan organisasi kemanusiaan. Tantangan utama dalam distribusi adalah akses ke beberapa lokasi yang masih terisolir akibat rusaknya infrastruktur jalan dan jembatan.',
                    image: 'https://images.unsplash.com/photo-1622032493533-6323725bf6c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'pemulihan',
                    author: 'BNPB',
                    date: '2023-09-20T08:15:00Z',
                    slug: 'distribusi-bantuan-korban-banjir-bandang',
                },
                {
                    id: 12,
                    title: 'Aplikasi Mobile untuk Peringatan Dini Bencana',
                    content:
                        'Aplikasi mobile baru untuk peringatan dini bencana telah diluncurkan oleh BMKG. Aplikasi ini memberikan informasi real-time tentang potensi bencana dan rekomendasi tindakan yang perlu dilakukan.\n\nFitur utama aplikasi ini termasuk notifikasi darurat, peta risiko bencana, panduan evakuasi, dan informasi kontak penting. Aplikasi ini juga memungkinkan pengguna untuk melaporkan kejadian bencana secara langsung, sehingga membantu otoritas dalam respons cepat.',
                    image: 'https://images.unsplash.com/photo-1617976083875-7e45359e6f21?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    category: 'peringatan dini',
                    author: 'BMKG',
                    date: '2023-09-15T13:40:00Z',
                    slug: 'aplikasi-mobile-peringatan-dini-bencana',
                },
            ];

            setNews(mockData);
            setFilteredNews(mockData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching news:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data berita.',
                variant: 'destructive',
            });
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchNews();

        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [fetchNews]); // Added fetchNews as a dependency

    useEffect(() => {
        filterNews();
    }, [filterNews]); // Added filterNews as a dependency

    useEffect(() => {
        setTotalPages(Math.ceil(filteredNews.length / itemsPerPage));
    }, [filteredNews, itemsPerPage]); // Added itemsPerPage as a dependency since it's used in the calculation

    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredNews.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openNewsDetail = (item: NewsItem) => {
        setSelectedNews(item);
        setIsModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy');
    };

    const getCategoryBadgeClasses = (category: string) => {
        switch (category) {
            case 'bencana alam':
                return 'bg-red-100 text-red-800';
            case 'peringatan dini':
                return 'bg-amber-100 text-amber-800';
            case 'evakuasi':
                return 'bg-blue-100 text-blue-800';
            case 'pemulihan':
                return 'bg-green-100 text-green-800';
            case 'edukasi':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: 'easeOut',
            },
        }),
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <>
            <Head title="Berita & Informasi Bencana - GeoSiaga" />

            <div className="flex min-h-screen flex-col">
                <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />

                <main className="flex-1 bg-gray-50">
                    {/* Hero Section with Animation */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-blue-900 py-16 text-white"
                    >
                        {/* Animated particles in background */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full bg-white opacity-20"
                                    style={{
                                        width: Math.random() * 10 + 5,
                                        height: Math.random() * 10 + 5,
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                    }}
                                    animate={{
                                        y: [0, Math.random() * 100 - 50],
                                        opacity: [0.2, 0.1, 0.2],
                                    }}
                                    transition={{
                                        duration: Math.random() * 10 + 10,
                                        repeat: Infinity,
                                        repeatType: 'reverse',
                                    }}
                                />
                            ))}
                        </div>

                        <div className="relative z-10 container mx-auto px-4">
                            <motion.div
                                className="mx-auto max-w-4xl text-center"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.2,
                                            delayChildren: 0.3,
                                        },
                                    },
                                }}
                            >
                                <motion.h1 className="mb-4 text-4xl font-bold sm:text-5xl" variants={fadeInUp}>
                                    Berita & Informasi Bencana
                                </motion.h1>

                                <motion.p className="mb-8 text-lg text-blue-100 sm:text-xl" variants={fadeInUp}>
                                    Informasi terkini seputar kebencanaan, panduan evakuasi, dan pemulihan pasca bencana di Indonesia
                                </motion.p>

                                <motion.div className="flex flex-col justify-center gap-4 sm:flex-row" variants={fadeInUp}>
                                    <motion.a
                                        href="#berita-terbaru"
                                        className="rounded-lg bg-white px-6 py-3 font-medium text-blue-700 shadow-lg transition-all hover:shadow-xl"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Lihat Berita Terbaru
                                    </motion.a>

                                    <motion.a
                                        href="/map"
                                        className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Lihat Peta Bencana
                                    </motion.a>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Animated wave effect at bottom */}
                        <div className="absolute right-0 bottom-0 left-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="h-auto w-full text-gray-50">
                                <motion.path
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                                    fill="currentColor"
                                    d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,218.7C960,192,1056,128,1152,112C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                                ></motion.path>
                            </svg>
                        </div>
                    </motion.section>

                    {/* Filter and Search Section with Animation */}
                    <section id="berita-terbaru" className="sticky top-16 z-20 bg-white py-6 shadow-sm">
                        <div className="container mx-auto px-4">
                            <motion.div
                                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className="relative flex w-full max-w-md items-center overflow-hidden rounded-lg border bg-white p-2">
                                    <Search className="ml-2 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Cari berita..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="border-0 focus-visible:ring-0 focus-visible:ring-transparent"
                                    />
                                    {/* Animated highlight effect */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
                                        initial={{ width: '0%' }}
                                        animate={{ width: searchQuery ? '100%' : '0%' }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>

                                <div className="flex items-center">
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat === 'all' ? 'Semua Kategori' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* News Grid Section with Animations */}
                    <section className="py-12">
                        <div className="container mx-auto px-4">
                            {loading ? (
                                // Loading animation
                                <div className="flex flex-col items-center justify-center py-12">
                                    <motion.div
                                        className="relative h-20 w-20"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                                    >
                                        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-t-blue-600 border-r-blue-200 border-b-blue-300 border-l-blue-500"></div>
                                    </motion.div>
                                    <motion.p
                                        className="mt-4 text-gray-600"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Memuat berita terbaru...
                                    </motion.p>
                                </div>
                            ) : filteredNews.length > 0 ? (
                                <>
                                    <motion.div
                                        className="mb-8 flex items-center justify-between"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {category === 'all' ? 'Semua Berita' : `Berita - ${category}`}
                                        </h2>
                                        <span className="text-sm text-gray-500">{filteredNews.length} artikel ditemukan</span>
                                    </motion.div>

                                    <motion.div
                                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {getCurrentPageItems().map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                className="overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                                                variants={cardVariants}
                                                custom={index}
                                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                            >
                                                <div className="aspect-video w-full overflow-hidden">
                                                    <motion.img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover"
                                                        whileHover={{ scale: 1.08 }}
                                                        transition={{ duration: 0.4 }}
                                                    />
                                                </div>
                                                <div className="p-6">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <motion.span
                                                            className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryBadgeClasses(item.category)}`}
                                                            whileHover={{ scale: 1.05 }}
                                                        >
                                                            {item.category}
                                                        </motion.span>
                                                    </div>
                                                    <h3
                                                        className="mb-3 line-clamp-2 cursor-pointer text-xl font-bold transition-colors hover:text-blue-600"
                                                        onClick={() => openNewsDetail(item)}
                                                    >
                                                        {item.title}
                                                    </h3>
                                                    <p className="mb-4 line-clamp-3 text-gray-600">{item.content.split('\n\n')[0]}</p>
                                                    <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <CalendarIcon className="h-4 w-4" />
                                                            <span>{formatDate(item.date)}</span>
                                                        </div>
                                                        <motion.button
                                                            className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
                                                            onClick={() => openNewsDetail(item)}
                                                            whileHover={{ x: 3 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            Baca selengkapnya
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>

                                    {/* Pagination with Animation */}
                                    {totalPages > 1 && (
                                        <motion.div
                                            className="mt-12"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                        >
                                            <Pagination>
                                                <PaginationContent>
                                                    {currentPage > 1 && (
                                                        <PaginationItem>
                                                            <motion.div whileHover={{ scale: 1.1 }}>
                                                                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                                                            </motion.div>
                                                        </PaginationItem>
                                                    )}

                                                    {[...Array(totalPages)].map((_, i) => (
                                                        <PaginationItem key={i}>
                                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                                                <PaginationLink
                                                                    isActive={currentPage === i + 1}
                                                                    onClick={() => handlePageChange(i + 1)}
                                                                >
                                                                    {i + 1}
                                                                </PaginationLink>
                                                            </motion.div>
                                                        </PaginationItem>
                                                    ))}

                                                    {currentPage < totalPages && (
                                                        <PaginationItem>
                                                            <motion.div whileHover={{ scale: 1.1 }}>
                                                                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                                                            </motion.div>
                                                        </PaginationItem>
                                                    )}
                                                </PaginationContent>
                                            </Pagination>
                                        </motion.div>
                                    )}
                                </>
                            ) : (
                                <motion.div
                                    className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <motion.div
                                        className="mb-4 rounded-full bg-gray-100 p-4"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                                    >
                                        <Search className="h-6 w-6 text-gray-400" />
                                    </motion.div>
                                    <motion.h3
                                        className="mb-2 text-lg font-medium text-gray-700"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Tidak ada berita ditemukan
                                    </motion.h3>
                                    <motion.p
                                        className="max-w-md text-gray-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Tidak ada berita yang sesuai dengan kriteria pencarian Anda. Silakan coba pencarian lain atau reset filter.
                                    </motion.p>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setCategory('all');
                                            }}
                                            className="mt-4"
                                        >
                                            Reset Filter
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </div>
                    </section>
                </main>

                {/* News Detail Modal with Animation */}
                <AnimatePresence>
                    {isModalOpen && (
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto sm:rounded-lg">
                                {selectedNews && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <DialogHeader className="space-y-2">
                                            <motion.div
                                                className="mb-2 flex items-center gap-2"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryBadgeClasses(selectedNews.category)}`}
                                                >
                                                    {selectedNews.category}
                                                </span>
                                            </motion.div>
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                                <DialogTitle className="text-2xl font-bold sm:text-3xl">{selectedNews.title}</DialogTitle>
                                            </motion.div>
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                                <DialogDescription className="flex items-center justify-between text-gray-500">
                                                    <div className="flex flex-wrap gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <CalendarIcon className="h-4 w-4" />
                                                            <span>{formatDate(selectedNews.date)}</span>
                                                        </div>
                                                        <div>Oleh: {selectedNews.author}</div>
                                                    </div>
                                                </DialogDescription>
                                            </motion.div>
                                        </DialogHeader>

                                        <motion.div
                                            className="mt-4 mb-6 overflow-hidden rounded-lg"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, duration: 0.4 }}
                                        >
                                            <img src={selectedNews.image} alt={selectedNews.title} className="h-auto w-full object-cover" />
                                        </motion.div>

                                        <motion.div
                                            className="space-y-4 text-gray-700"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            {selectedNews.content.split('\n\n').map((paragraph, idx) => (
                                                <p key={idx}>{paragraph}</p>
                                            ))}
                                        </motion.div>

                                        <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                                            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex items-center gap-1">
                                                <ChevronLeft className="h-4 w-4" />
                                                Kembali ke daftar berita
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </DialogContent>
                        </Dialog>
                    )}
                </AnimatePresence>

                {/* Back to Top Button with Animation */}
                <AnimatePresence>
                    {showBackToTop && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={scrollToTop}
                            className="fixed right-8 bottom-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                            aria-label="Back to top"
                        >
                            <ArrowUp size={20} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
