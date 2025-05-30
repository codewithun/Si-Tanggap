import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { AnimatePresence, motion, PanInfo } from 'framer-motion'; // Import PanInfo for swipe handling
import { ArrowUp, CalendarIcon, ChevronLeft, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BnpbNews {
    title: string;
    description: string;
    link: string;
    image: string;
    date?: string;
    published_date?: string;
    source?: string;
}

interface NewsItem {
    id: number;
    title: string;
    content: string;
    image: string;
    category: string;
    author: string;
    date: string;
    slug: string;
    link?: string; // Add the link property as optional
    source?: string; // Add the source property as optional
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

            // Use the merged news endpoint which combines BNPB and Detik news
            const response = await axios.get('/berita-merged');

            // Check if we have berita data and it's an array
            if (response.data && response.data.berita && Array.isArray(response.data.berita)) {
                console.log(`Fetched ${response.data.berita.length} news items from API`);

                // Transform the data to match our NewsItem format
                const transformedNews = response.data.berita.map((item: BnpbNews, index: number) => {
                    // Check if image URL is valid (has proper http/https prefix)
                    let imageUrl = item.image || '';

                    // Handle different source formats correctly
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        // If image URL doesn't start with http/https, assume it's relative and convert to absolute
                        if (item.source === 'bnpb') {
                            imageUrl = `https://bnpb.go.id${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                        } else if (item.source === 'detik-bencana') {
                            // For Detik images that often start with //
                            if (imageUrl.startsWith('//')) {
                                imageUrl = `https:${imageUrl}`;
                            } else {
                                imageUrl = `https://akcdn.detik.net.id${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                            }
                        } else {
                            // Default prefix for other sources
                            imageUrl = `https:${imageUrl.startsWith('//') ? '' : '//'}${imageUrl}`;
                        }
                    }

                    // If still no valid image, use fallback
                    if (!imageUrl) {
                        imageUrl = 'https://via.placeholder.com/800x400?text=Berita+Bencana';
                    }

                    return {
                        id: index + 1,
                        title: item.title,
                        content: item.description,
                        image: imageUrl,
                        category: determineCategory(item.title),
                        author: item.source === 'detik-bencana' ? 'Detik.com' : 'BNPB',
                        date: item.published_date || item.date || new Date().toISOString(),
                        slug: generateSlug(item.title),
                        link: item.link || '',
                    };
                });

                setNews(transformedNews);
                setFilteredNews(transformedNews);

                // Log the number of items loaded into state
                console.log(`Successfully loaded ${transformedNews.length} news items into state`);
            } else {
                // Handle the case when no berita data or empty array
                console.error('Invalid berita data format:', response.data);
                toast({
                    title: 'Error',
                    description: 'Format data berita tidak valid.',
                    variant: 'destructive',
                });
            }

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

    // Helper function to generate a slug from title
    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    };

    // Helper function to determine category based on title keywords
    const determineCategory = (title: string): string => {
        const lowerTitle = title.toLowerCase();

        if (
            lowerTitle.includes('bencana') ||
            lowerTitle.includes('banjir') ||
            lowerTitle.includes('gempa') ||
            lowerTitle.includes('longsor') ||
            lowerTitle.includes('tsunami')
        ) {
            return 'bencana alam';
        } else if (
            lowerTitle.includes('peringatan') ||
            lowerTitle.includes('warning') ||
            lowerTitle.includes('siaga') ||
            lowerTitle.includes('waspada')
        ) {
            return 'peringatan dini';
        } else if (lowerTitle.includes('evakuasi') || lowerTitle.includes('pengungsian')) {
            return 'evakuasi';
        } else if (
            lowerTitle.includes('pemulihan') ||
            lowerTitle.includes('rehabilitasi') ||
            lowerTitle.includes('rekonstruksi') ||
            lowerTitle.includes('bantuan')
        ) {
            return 'pemulihan';
        } else if (
            lowerTitle.includes('edukasi') ||
            lowerTitle.includes('latihan') ||
            lowerTitle.includes('simulasi') ||
            lowerTitle.includes('workshop')
        ) {
            return 'edukasi';
        } else {
            return 'edukasi'; // Default category
        }
    };

    useEffect(() => {
        fetchNews();

        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [fetchNews]);

    useEffect(() => {
        filterNews();
    }, [filterNews]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredNews.length / itemsPerPage));
    }, [filteredNews, itemsPerPage]);

    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredNews.slice(startIndex, endIndex);
    };

    // Handle page change with optional animation direction
    const handlePageChange = (page: number, animate: boolean = true) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);

            if (animate) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0 });
            }
        }
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

    useEffect(() => {
        // Debug untuk menampilkan jumlah artikel
        console.log(`Filtered news length: ${filteredNews.length}`);
        console.log(`Current page: ${currentPage}`);
        console.log(`Items per page: ${itemsPerPage}`);
        console.log(`Total pages: ${totalPages}`);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        console.log(`Current page items: ${startIndex}-${endIndex}`);
    }, [filteredNews, currentPage, itemsPerPage, totalPages]);

    // Function to generate page numbers with ellipsis
    const getPageNumbers = () => {
        let pages = [];
        const maxPagesToShow = 5; // Max number of page buttons to show (excluding prev/next buttons)

        if (totalPages <= maxPagesToShow) {
            // If we have few pages, show all page numbers
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            // Always include first page
            pages.push(1);

            // Calculate start and end of page numbers around current page
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Adjust the range to show maxPagesToShow - 2 pages (excluding first and last page)
            if (endPage - startPage < maxPagesToShow - 3) {
                if (currentPage < totalPages / 2) {
                    // If current page is closer to start, extend endPage
                    endPage = Math.min(startPage + maxPagesToShow - 3, totalPages - 1);
                } else {
                    // If current page is closer to end, lower startPage
                    startPage = Math.max(2, endPage - (maxPagesToShow - 3));
                }
            }

            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pages.push('ellipsis-start');
            }

            // Add the range of pages around current page
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pages.push('ellipsis-end');
            }

            // Always include last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    // Reference to the news grid container for swipe actions
    const newsContainerRef = useRef<HTMLDivElement>(null);

    // State to track swipe feedback
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

    // Handle swipe on news container
    const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Only process horizontal swipes with significant movement
        if (Math.abs(info.offset.x) > 100) {
            if (info.offset.x > 0) {
                // Swipe right (go to previous page)
                setSwipeDirection('right');
                if (currentPage > 1) {
                    handlePageChange(currentPage - 1);
                }
            } else {
                // Swipe left (go to next page)
                setSwipeDirection('left');
                if (currentPage < totalPages) {
                    handlePageChange(currentPage + 1);
                }
            }

            // Reset swipe direction after animation
            setTimeout(() => setSwipeDirection(null), 300);
        }
    };

    return (
        <>
            <Head title="Berita & Informasi Bencana - GeoSiaga" />

            <div className="flex min-h-screen flex-col">
                <Navbar isAuthenticated={isAuthenticated} userRole={userRole} isLandingPage={false} />

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
                                    Berita & Informasi BNPB
                                </motion.h1>

                                <motion.p className="mb-8 text-lg text-blue-100 sm:text-xl" variants={fadeInUp}>
                                    Informasi terkini seputar kebencanaan, panduan evakuasi, dan pemulihan pasca bencana di Indonesia
                                </motion.p>

                                <motion.div className="flex flex-col justify-center gap-4 sm:flex-row" variants={fadeInUp}>
                                    <motion.a
                                        href="/?section=news" // Ubah ke landing page section news
                                        className="rounded-lg bg-white px-6 py-3 font-medium text-blue-700 shadow-lg transition-all hover:shadow-xl"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Lihat Semua Berita
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

                    {/* News Grid Section with Swipe Support */}
                    <section className="py-12" id="news-list">
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
                                        className="mb-8 flex flex-wrap items-center justify-between gap-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {category === 'all' ? 'Semua Berita BNPB' : `Berita - ${category}`}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                            <span className="rounded-full bg-blue-50 px-3 py-1">{filteredNews.length} artikel ditemukan</span>
                                            <span>
                                                Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
                                                {Math.min(currentPage * itemsPerPage, filteredNews.length)} dari {filteredNews.length}
                                            </span>
                                        </div>
                                    </motion.div>

                                    {/* News container with swipe gesture support */}
                                    <motion.div
                                        ref={newsContainerRef}
                                        className="relative touch-pan-y" // Enable touch panning
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={0.1}
                                        onDragEnd={handleSwipe}
                                        animate={swipeDirection === 'left' ? { x: [-20, 0] } : swipeDirection === 'right' ? { x: [20, 0] } : {}}
                                    >
                                        {/* Visual indicators for swipe actions */}
                                        <div
                                            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 transition-opacity duration-300 md:hidden"
                                            style={{ opacity: currentPage > 1 ? 0.7 : 0 }}
                                        ></div>

                                        <div
                                            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-blue-500/10 to-transparent opacity-0 transition-opacity duration-300 md:hidden"
                                            style={{ opacity: currentPage < totalPages ? 0.7 : 0 }}
                                        ></div>

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
                                                            onError={(e) => {
                                                                // Fallback if image fails to load
                                                                e.currentTarget.src = 'https://via.placeholder.com/800x400?text=BNPB';
                                                            }}
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
                                                        <p className="mb-4 line-clamp-3 text-gray-600">{item.content}</p>
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

                                        {/* Mobile swipe hint - show only on small screens on first page load */}
                                        {currentPage === 1 && (
                                            <motion.div
                                                className="mt-4 flex items-center justify-center text-sm text-gray-500 md:hidden"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 1 }}
                                            >
                                                <span>← Geser untuk navigasi halaman →</span>
                                            </motion.div>
                                        )}
                                    </motion.div>

                                    {/* Desktop Pagination - hide on mobile */}
                                    {totalPages > 1 && (
                                        <motion.div
                                            className="mt-12 hidden md:block"
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

                                                    {getPageNumbers().map((page, i) =>
                                                        typeof page === 'number' ? (
                                                            <PaginationItem key={`page-${page}`}>
                                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                                                    <PaginationLink
                                                                        isActive={currentPage === page}
                                                                        onClick={() => handlePageChange(page)}
                                                                    >
                                                                        {page}
                                                                    </PaginationLink>
                                                                </motion.div>
                                                            </PaginationItem>
                                                        ) : (
                                                            <PaginationItem key={`${page}-${i}`}>
                                                                <span className="flex h-9 w-9 items-center justify-center text-sm text-gray-400">
                                                                    &hellip;
                                                                </span>
                                                            </PaginationItem>
                                                        ),
                                                    )}

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

                                    {/* Mobile-friendly pagination indicator */}
                                    {totalPages > 1 && (
                                        <div className="mt-8 flex items-center justify-center gap-2 md:hidden">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                        currentPage === 1 ? 'text-gray-300' : 'bg-blue-100 text-blue-700'
                                                    }`}
                                                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>

                                                <span className="mx-2 text-sm">
                                                    Halaman {currentPage} dari {totalPages}
                                                </span>

                                                <button
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                        currentPage === totalPages ? 'text-gray-300' : 'bg-blue-100 text-blue-700'
                                                    }`}
                                                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="m9 18 6-6-6-6" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
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
                                            <img
                                                src={selectedNews.image}
                                                alt={selectedNews.title}
                                                className="h-auto w-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/800x400?text=BNPB';
                                                }}
                                            />
                                        </motion.div>

                                        <motion.div
                                            className="space-y-4 text-gray-700"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            {selectedNews.content.split('\n').map((paragraph, idx) => (
                                                <p key={idx}>{paragraph}</p>
                                            ))}
                                        </motion.div>

                                        {selectedNews.link && (
                                            <motion.div
                                                className="mt-6"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.7 }}
                                            >
                                                <a
                                                    href={selectedNews.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                                                >
                                                    {selectedNews.source === 'detik-bencana' || selectedNews.author === 'Detik.com'
                                                        ? 'Baca artikel lengkap di Detik.com'
                                                        : 'Baca artikel lengkap di situs BNPB'}
                                                </a>
                                            </motion.div>
                                        )}

                                        <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
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
