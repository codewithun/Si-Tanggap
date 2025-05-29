import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, BellIcon, InfoIcon, MailIcon } from 'lucide-react';
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
    const [type, setType] = useState('info');
    const [target, setTarget] = useState('all');
    const [useEmail, setUseEmail] = useState(false);
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

            if (success) {
                toast({
                    title: 'Berhasil',
                    description: `Notifikasi berhasil dikirim${useEmail ? ' (email & in-app)' : ''}`,
                });

                // Reset form
                setTitle('');
                setContent('');
            } else {
                throw error; // Rethrow the last error
            }
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Gagal mengirim notifikasi. Silakan coba lagi.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getNotificationTypeIcon = () => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'emergency':
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            default:
                return <InfoIcon className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kirim Notifikasi" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold text-gray-800">Kirim Notifikasi</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Kirim Notifikasi Bencana</CardTitle>

                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
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
                                    <Label htmlFor="type">Jenis Notifikasi</Label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis notifikasi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="info">Informasi</SelectItem>
                                            <SelectItem value="warning">Peringatan</SelectItem>
                                            <SelectItem value="emergency">Darurat</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="target">Target Penerima</Label>
                                    <Select value={target} onValueChange={setTarget}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih target penerima" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Pengguna</SelectItem>
                                            <SelectItem value="masyarakat">Masyarakat</SelectItem>
                                            <SelectItem value="relawan">Relawan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2 pt-8">
                                    <Switch id="useEmail" checked={useEmail} onCheckedChange={setUseEmail} />
                                    <Label htmlFor="useEmail" className="flex items-center gap-2">
                                        <MailIcon className="h-4 w-4" />
                                        Kirim juga melalui Email
                                    </Label>
                                </div>
                            </div>
                        </form>
                    </CardContent>
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
