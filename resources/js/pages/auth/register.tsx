import { useForm } from '@inertiajs/react';
import { ArrowLeft, HeartHandshake, LoaderCircle, Upload, UserRound } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    role: string;
    id_card?: File | null;
    organization?: string;
    experience?: string;
    motivation?: string;
};

export default function Register() {
    const [idCardFileName, setIdCardFileName] = useState<string>('');

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'masyarakat', // Default role
        id_card: null,
        organization: '',
        experience: '',
        motivation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Filter data sesuai role
        const payload: Partial<RegisterForm> = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            password_confirmation: data.password_confirmation,
        };
        if (data.role === 'relawan') {
            payload.role = data.role;
            payload.id_card = data.id_card;
            payload.organization = data.organization;
            payload.experience = data.experience;
            payload.motivation = data.motivation;
        }
        // @ts-expect-error: Inertia Form post expects data as first argument
        post(route('register'), payload, {
            onFinish: () => reset('password', 'password_confirmation'),
            forceFormData: data.role === 'relawan',
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('id_card', e.target.files[0]);
            setIdCardFileName(e.target.files[0].name);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full">
            {/* Back button */}
            <div className="absolute top-4 left-4 z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (window.location.href = '/')}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Button>
            </div>

            <div className="flex w-full flex-col items-center justify-center px-6 pt-16 lg:w-1/2">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Buat Akun GeoSiaga</h1>
                        <p className="mt-3 text-sm text-gray-500">
                            Masukkan detail Anda di bawah ini untuk membuat akun Anda dan mulai menggunakan GeoSiaga
                        </p>
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={submit}>
                        <div className="grid gap-4">
                            <div className="space-y-3">
                                <Label htmlFor="role" className="text-base font-medium">
                                    Pilih Peran Anda
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border p-4 transition-all ${
                                            data.role === 'masyarakat' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setData('role', 'masyarakat')}
                                    >
                                        <UserRound className={`h-8 w-8 ${data.role === 'masyarakat' ? 'text-blue-500' : 'text-gray-400'}`} />

                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-4 w-4 rounded-full border ${
                                                    data.role === 'masyarakat' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                }`}
                                            >
                                                {data.role === 'masyarakat' && (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <Label className="cursor-pointer text-base font-medium">Masyarakat</Label>
                                        </div>
                                    </div>

                                    <div
                                        className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border p-4 transition-all ${
                                            data.role === 'relawan' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setData('role', 'relawan')}
                                    >
                                        <HeartHandshake className={`h-8 w-8 ${data.role === 'relawan' ? 'text-blue-500' : 'text-gray-400'}`} />

                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-4 w-4 rounded-full border ${
                                                    data.role === 'relawan' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                }`}
                                            >
                                                {data.role === 'relawan' && (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <Label className="cursor-pointer text-base font-medium">Relawan</Label>
                                        </div>
                                    </div>
                                </div>
                                <InputError message={errors.role} />
                            </div>

                            <div>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    placeholder="Full name"
                                    className="rounded-lg bg-white px-4 py-4"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                    placeholder="Email address"
                                    className="rounded-lg bg-white px-4 py-4"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <Input
                                    id="phone"
                                    type="tel"
                                    tabIndex={3}
                                    autoComplete="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    disabled={processing}
                                    placeholder="Phone number"
                                    className="rounded-lg bg-white px-4 py-4"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
                                    placeholder="Password"
                                    className="rounded-lg bg-white px-4 py-4"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    disabled={processing}
                                    placeholder="Confirm password"
                                    className="rounded-lg bg-white px-4 py-4"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {data.role === 'relawan' && (
                                <>
                                    <div className="space-y-1">
                                        <Label htmlFor="id_card" className="text-sm">
                                            Unggah Kartu Identitas (KTP/SIM/Kartu Pelajar)
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Label
                                                htmlFor="id_card"
                                                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                            >
                                                <Upload className="h-4 w-4" />
                                                <span>{idCardFileName || 'Pilih File'}</span>
                                                <Input
                                                    id="id_card"
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    disabled={processing}
                                                    required
                                                />
                                            </Label>
                                        </div>
                                        <p className="text-xs text-gray-500">Format: JPG, PNG, atau PDF (max: 2MB)</p>
                                        <InputError message={errors.id_card as string} />
                                    </div>

                                    <div>
                                        <Label htmlFor="organization" className="text-sm">
                                            Organisasi (opsional)
                                        </Label>
                                        <Input
                                            id="organization"
                                            value={data.organization}
                                            onChange={(e) => setData('organization', e.target.value)}
                                            placeholder="Nama organisasi (jika ada)"
                                            className="mt-1 rounded-lg bg-white px-4 py-4"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.organization} />
                                    </div>

                                    <div>
                                        <Label htmlFor="experience" className="text-sm">
                                            Pengalaman
                                        </Label>
                                        <Textarea
                                            id="experience"
                                            value={data.experience}
                                            onChange={(e) => setData('experience', e.target.value)}
                                            placeholder="Ceritakan pengalaman Anda dalam kegiatan kerelawanan"
                                            className="mt-1 min-h-[80px] rounded-lg bg-white px-4 py-3"
                                            disabled={processing}
                                            required
                                        />
                                        <InputError message={errors.experience} />
                                    </div>

                                    <div>
                                        <Label htmlFor="motivation" className="text-sm">
                                            Alasan
                                        </Label>
                                        <Textarea
                                            id="motivation"
                                            value={data.motivation}
                                            onChange={(e) => setData('motivation', e.target.value)}
                                            placeholder="Ceritakan alasan Anda untuk menjadi relawan"
                                            className="mt-1 min-h-[80px] rounded-lg bg-white px-4 py-3"
                                            disabled={processing}
                                            required
                                        />
                                        <InputError message={errors.motivation} />
                                    </div>
                                </>
                            )}

                            <Button
                                type="submit"
                                className="rounded-lg bg-black py-4 text-base font-semibold hover:bg-gray-800"
                                tabIndex={6}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Create account
                            </Button>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs text-gray-500">
                                <span className="bg-white px-2">OR SIGN UP WITH</span>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full rounded-lg border-gray-300 py-4"
                                onClick={() => (window.location.href = route('auth.google'))}
                            >
                                <svg width="20" height="20" fill="currentColor" className="mr-2">
                                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                                </svg>
                                Google
                            </Button>
                        </div>
                    </form>

                    <div className="pt-2 text-center text-sm text-gray-500">
                        Sudah punya akun?{' '}
                        <TextLink href={route('login')} className="font-medium" tabIndex={7}>
                            Masuk
                        </TextLink>
                    </div>
                </div>
            </div>

            <div className="hidden w-1/2 bg-slate-50 lg:flex lg:flex-col">
                <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                    <img
                        src="/img/image2.jpg"
                        alt="Register Security"
                        className="h-full w-full object-cover object-center"
                        style={{ position: 'absolute', inset: 0 }}
                    />
                </div>
            </div>
        </div>
    );
}
