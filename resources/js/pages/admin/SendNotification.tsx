import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { BellIcon } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Kirim Notifikasi',
        href: '/admin/notifications',
    },
];

export default function SendNotification() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            toast({
                title: 'Peringatan',
                description: 'Judul dan isi notifikasi harus diisi',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/notifikasi', {
                judul: title,
                isi: content,
            });

            toast({
                title: 'Berhasil',
                description: 'Notifikasi berhasil dikirim ke semua pengguna',
            });

            // Reset form
            setTitle('');
            setContent('');
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Gagal mengirim notifikasi',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kirim Notifikasi" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold text-gray-800">Kirim Notifikasi</h1>
                <p className="mb-6 text-gray-600">Kirim notifikasi peringatan bencana ke semua pengguna aplikasi.</p>

                <Card>
                    <CardHeader>
                        <CardTitle>Kirim Notifikasi Bencana</CardTitle>
                        <CardDescription>Kirim notifikasi ke semua pengguna aplikasi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Notifikasi</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Masukkan judul notifikasi"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Isi Notifikasi</Label>
                                    <Textarea
                                        id="content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Masukkan isi notifikasi yang ingin disampaikan"
                                        rows={6}
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <p className="text-sm text-gray-500">Notifikasi akan dikirim ke semua pengguna aplikasi</p>
                        <Button type="submit" onClick={handleSubmit} disabled={loading || !title.trim() || !content.trim()}>
                            <BellIcon className="mr-2 h-4 w-4" />
                            {loading ? 'Mengirim...' : 'Kirim Notifikasi'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
