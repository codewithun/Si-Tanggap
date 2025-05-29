import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarIcon, ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Interface for raw data from BNPB API
interface BnpbNewsItem {
    title: string;
    description: string;
    link: string;
    image: string;
}

// Interface for transformed news items used in component
interface NewsItem {
    id: number;
    title: string;
    excerpt: string;
    image_url: string;
    published_at: string;
    author: string;
    slug: string;
    link: string;
}

// Helper function to generate a slug from a title
const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
};

// Helper function to determine category based on title keywords

const NewsSection: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Add new state variables for modal and selected news
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);

                // Use the BNPB news endpoint
                const response = await axios.get('/berita-bnpb');

                if (response.data && response.data.berita && response.data.berita.length > 0) {
                    // Log raw data for debugging image URLs
                    console.log('Raw news data first item:', response.data.berita[0]);

                    // Transform BNPB news format to our NewsItem format
                    const transformedNews = response.data.berita.slice(0, 3).map((item: BnpbNewsItem, index: number) => {
                        // Check if image URL is valid (has proper http/https prefix)
                        let imageUrl = item.image || '';
                        if (imageUrl && !imageUrl.startsWith('http')) {
                            // If image URL doesn't start with http/https, assume it's relative and convert to absolute
                            imageUrl = `https://bnpb.go.id${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                        }

                        // If still no valid image, use fallback
                        if (!imageUrl) {
                            imageUrl = 'https://via.placeholder.com/300x200?text=BNPB+News';
                        }

                        return {
                            id: index + 1,
                            title: item.title,
                            excerpt: item.description.length > 140 ? `${item.description.substring(0, 140)}...` : item.description,
                            image_url: imageUrl,
                            published_at: new Date().toISOString(), // Using current date since BNPB data doesn't have dates
                            author: 'BNPB',
                            slug: generateSlug(item.title),
                            link: item.link,
                        };
                    });

                    console.log(
                        'Transformed news with image URLs:',
                        transformedNews.map((item: NewsItem) => ({
                            title: item.title.substring(0, 30),
                            image_url: item.image_url,
                        })),
                    );

                    // First set error to null, then set the news data after a small delay
                    setError(null);
                    // Set news immediately without delay for faster UI update
                    setNews(transformedNews);
                } else {
                    throw new Error('No news data available');
                }
            } catch (err) {
                console.error('Failed to fetch news:', err);
                setError('Gagal memuat berita terbaru');

                // Fallback data for development/preview
                setNews([
                    {
                        id: 1,
                        title: 'BMKG: Peringatan Dini Potensi Banjir di Wilayah Jakarta',
                        excerpt: 'Badan Meteorologi Klimatologi dan Geofisika (BMKG) mengeluarkan peringatan dini terkait potensi banjir...',
                        image_url: 'https://source.unsplash.com/random/300x200?weather',
                        published_at: '2023-06-15T09:30:00Z',
                        author: 'Tim Redaksi',
                        slug: 'bmkg-peringatan-dini-banjir-jakarta',
                        link: 'https://bnpb.go.id/berita/bmkg-peringatan-dini-banjir-jakarta',
                    },
                    {
                        id: 2,
                        title: 'Latihan Evakuasi Bencana di 5 Provinsi Rawan Gempa',
                        excerpt: 'BNPB dan Pemerintah Daerah menggelar simulasi evakuasi bencana gempa bumi di lima provinsi...',
                        image_url: 'https://source.unsplash.com/random/300x200?earthquake',
                        published_at: '2023-06-12T14:45:00Z',
                        author: 'Ardiansyah',
                        slug: 'latihan-evakuasi-bencana-5-provinsi',
                        link: 'https://bnpb.go.id/berita/latihan-evakuasi-bencana-5-provinsi',
                    },
                    {
                        id: 3,
                        title: 'Pembaruan Sistem Peringatan Dini Tsunami Pantai Selatan',
                        excerpt: 'Sistem peringatan dini tsunami di wilayah pantai selatan Jawa kini telah diperbarui dengan teknologi...',
                        image_url: 'https://source.unsplash.com/random/300x200?tsunami',
                        published_at: '2023-06-10T08:15:00Z',
                        author: 'Bambang Suryo',
                        slug: 'pembaruan-sistem-peringatan-tsunami',
                        link: 'https://bnpb.go.id/berita/pembaruan-sistem-peringatan-tsunami',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Add function to open news detail
    const openNewsDetail = (item: NewsItem) => {
        setSelectedNews(item);
        setIsModalOpen(true);
    };

    return (
        <section className="bg-white py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="mb-16 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900">Berita BNPB Terbaru</h2>
                    <motion.div
                        className="mx-auto mt-2 h-1 w-24 rounded-full bg-blue-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: '6rem' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    ></motion.div>
                    <p className="mt-4 text-lg text-gray-600">Informasi terkini dari Badan Nasional Penanggulangan Bencana</p>
                </motion.div>

                {loading && (
                    <motion.div className="flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <motion.div
                            className="h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-600"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        ></motion.div>
                    </motion.div>
                )}

                {error && <div className="mb-8 text-center text-red-500">{error}</div>}

                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="grid grid-cols-1 gap-10 md:grid-cols-3"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.2,
                                },
                            },
                        }}
                    >
                        {news.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="group overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            duration: 0.6,
                                            ease: [0.22, 1, 0.36, 1],
                                        },
                                    },
                                }}
                                whileHover={{ y: -8 }}
                            >
                                <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                                    <motion.img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.4 }}
                                        loading="eager" // Add eager loading for faster image rendering
                                        onError={(e) => {
                                            console.log(`Image failed to load: ${item.image_url}`);
                                            // First try with https if http failed
                                            if (e.currentTarget.src.startsWith('http://')) {
                                                e.currentTarget.src = e.currentTarget.src.replace('http://', 'https://');
                                            } else {
                                                // Use a more descriptive fallback image with the title
                                                e.currentTarget.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(
                                                    item.title.substring(0, 20) + (item.title.length > 20 ? '...' : ''),
                                                )}`;
                                            }
                                        }}
                                    />
                                </div>
                                <div className="p-6">
                                    <motion.div
                                        className="mb-3 flex items-center text-sm text-gray-500"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                    >
                                        <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
                                        <span className="mx-2">•</span>
                                        <span>{item.author}</span>
                                    </motion.div>
                                    <motion.h3
                                        className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                    >
                                        {item.title}
                                    </motion.h3>
                                    <motion.p
                                        className="mb-5 text-gray-600"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                    >
                                        {item.excerpt}
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        {/* Changed: Replace Link with button for opening modal */}
                                        <button
                                            onClick={() => openNewsDetail(item)}
                                            className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            <motion.span whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                                Baca selengkapnya
                                                <motion.svg
                                                    className="ml-2 h-5 w-5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    whileHover={{ x: 3 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </motion.svg>
                                            </motion.span>
                                        </button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        className="mt-12 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        <Link
                            href="/news"
                            className="inline-flex items-center rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                        >
                            Lihat Semua Berita
                            <motion.svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-2 h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                initial={{ x: 0 }}
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </motion.svg>
                        </Link>
                    </motion.div>
                </div>

                {/* Add News Detail Modal with Animation */}
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
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                                <DialogTitle className="text-2xl font-bold sm:text-3xl">{selectedNews.title}</DialogTitle>
                                            </motion.div>
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                                <DialogDescription className="flex items-center justify-between text-gray-500">
                                                    <div className="flex flex-wrap gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <CalendarIcon className="h-4 w-4" />
                                                            <span>{formatDate(selectedNews.published_at)}</span>
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
                                                src={selectedNews.image_url}
                                                alt={selectedNews.title}
                                                className="h-auto w-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = `https://via.placeholder.com/800x400?text=${encodeURIComponent(
                                                        selectedNews.title.substring(0, 30),
                                                    )}`;
                                                }}
                                            />
                                        </motion.div>

                                        <motion.div
                                            className="space-y-4 text-gray-700"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <p>{selectedNews.excerpt}</p>

                                            {/* Show "Read More" link to original source if available */}
                                            {selectedNews.link && (
                                                <p className="mt-6">
                                                    <a
                                                        href={selectedNews.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                                                    >
                                                        Baca artikel lengkap di situs BNPB
                                                    </a>
                                                </p>
                                            )}
                                        </motion.div>

                                        <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                                            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex items-center gap-1">
                                                <ChevronLeft className="h-4 w-4" />
                                                Kembali
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </DialogContent>
                        </Dialog>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default NewsSection;
