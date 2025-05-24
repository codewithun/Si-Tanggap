import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { type AxiosError } from 'axios';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Akun Saya',
        href: '/akun-saya',
    },
];

interface ProfileFormData {
    name: string;
    email: string;
    phone: string;
    profile_photo: File | null;
    [key: string]: string | number | boolean | File | null;
}

interface ErrorResponse {
    errors: Record<string, string[]>;
    message: string;
}

export default function AkunSaya() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(typeof user.profile_photo_path === 'string' ? user.profile_photo_path : null);

    const { data, setData, errors } = useForm<ProfileFormData>({
        name: user.name || '',
        email: user.email || '',
        phone: typeof user.phone === 'string' ? user.phone : '',
        profile_photo: null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 2MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar');
            return;
        }

        setData('profile_photo', file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('phone', data.phone);
            formData.append('_method', 'PUT');

            if (data.profile_photo) {
                formData.append('profile_photo', data.profile_photo);
            }

            toast.success('Profil berhasil diperbarui');

            // Reset form after successful update
            setData('profile_photo', null);
        } catch (error) {
            console.error('Error updating profile:', error);

            const axiosError = error as AxiosError<ErrorResponse>;

            if (axiosError.response?.data?.errors) {
                const serverErrors = axiosError.response.data.errors;
                Object.keys(serverErrors).forEach((key) => {
                    toast.error(serverErrors[key][0]);
                });
            } else {
                const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Terjadi kesalahan tidak terduga';
                toast.error(`Gagal memperbarui profil: ${errorMessage}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Akun Saya" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Profil</CardTitle>
                        <CardDescription>Perbarui informasi profil dan alamat email Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Photo Section */}
                            <div className="grid gap-2">
                                <Label htmlFor="profile_photo">Foto Profil</Label>
                                <div className="flex items-center space-x-4">
                                    {previewImage && (
                                        <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200">
                                            <img src={previewImage} alt="Profile preview" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <Input
                                        id="profile_photo"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif"
                                        onChange={handleFileChange}
                                        className="max-w-sm"
                                    />
                                </div>
                                <p className="text-muted-foreground text-xs">JPG, GIF atau PNG. Maksimal 2MB.</p>
                                <InputError message={errors.profile_photo} />
                            </div>

                            {/* Name Field */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Nama <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    className="max-w-sm"
                                    placeholder="Masukkan nama lengkap"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email Field */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="max-w-sm"
                                    placeholder="contoh@email.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Phone Field */}
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="max-w-sm"
                                    placeholder="08xxxxxxxxxx"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-start">
                                <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                                    {isSubmitting ? (
                                        <div className="flex items-center">
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                            Menyimpan...
                                        </div>
                                    ) : (
                                        'Simpan Perubahan'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
