import { useForm, router } from '@inertiajs/react';
import { ArrowLeft, HeartHandshake, LoaderCircle, Upload, UserRound } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/useToast';

import PageTitle from '@/components/PageTitle';
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
    const { toast } = useToast();

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
            role: data.role, // Always include role
        };
        
        if (data.role === 'relawan') {
            payload.id_card = data.id_card;
            payload.organization = data.organization;
            payload.experience = data.experience;
            payload.motivation = data.motivation;
        }
        
        const isRelawan = data.role === 'relawan';
        
        // @ts-expect-error: Inertia Form post expects data as first argument
        post(route('register'), payload, {
            onSuccess: () => {
                // Reset form fields
                reset('password', 'password_confirmation');
                
                // Backend will handle the redirect to appropriate page based on role
                return true;
            },
            forceFormData: isRelawan
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('id_card', e.target.files[0]);
            setIdCardFileName(e.target.files[0].name);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
            },
        },
    };

    return (
        <div className="relative flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-white">
            <PageTitle title="Register" />

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

            <div className="flex w-full flex-col items-center justify-center px-6 pt-10 pb-10 lg:w-1/2">
                <motion.div
                    className="w-full max-w-md space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center">
                        <motion.h1
                            className="text-3xl font-bold tracking-tight text-blue-900"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            Buat Akun GeoSiaga
                        </motion.h1>
                        <motion.p
                            className="mt-3 text-sm text-gray-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            Masukkan detail Anda di bawah ini untuk membuat akun Anda dan mulai menggunakan GeoSiaga
                        </motion.p>
                        <motion.div
                            className="mx-auto mt-2 h-1 w-16 rounded-full bg-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: '4rem' }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        ></motion.div>
                    </div>

                    <motion.form
                        className="flex flex-col gap-4"
                        onSubmit={submit}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="grid gap-4">
                            <motion.div className="space-y-3" variants={itemVariants}>
                                <Label htmlFor="role" className="text-base font-medium text-gray-700">
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
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Label htmlFor="name" className="text-sm text-gray-700">
                                    Nama Lengkap
                                </Label>
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
                                    className="mt-1 rounded-lg border-gray-300 bg-white px-4 py-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <InputError message={errors.name} />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Label htmlFor="email" className="text-sm text-gray-700">
                                    Email
                                </Label>
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
                                    className="mt-1 rounded-lg border-gray-300 bg-white px-4 py-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <InputError message={errors.email} />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Label htmlFor="phone" className="text-sm text-gray-700">
                                    Nomor Telepon
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    tabIndex={3}
                                    autoComplete="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    disabled={processing}
                                    placeholder="Phone number"
                                    className="mt-1 rounded-lg border-gray-300 bg-white px-4 py-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <InputError message={errors.phone} />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Label htmlFor="password" className="text-sm text-gray-700">
                                    Password
                                </Label>
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
                                    className="mt-1 rounded-lg border-gray-300 bg-white px-4 py-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <InputError message={errors.password} />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Label htmlFor="password_confirmation" className="text-sm text-gray-700">
                                    Konfirmasi Password
                                </Label>
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
                                    className="mt-1 rounded-lg border-gray-300 bg-white px-4 py-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <InputError message={errors.password_confirmation} />
                            </motion.div>

                            {data.role === 'relawan' && (
                                <>
                                    <motion.div className="space-y-1" variants={itemVariants}>
                                        <Label htmlFor="id_card" className="text-sm text-gray-700">
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
                                                    accept=".jpg,.jpeg,.png"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    disabled={processing}
                                                    required
                                                />
                                            </Label>
                                        </div>
                                        <p className="text-xs text-gray-500">Format: JPG, PNG (max: 2MB)</p>
                                        <InputError message={errors.id_card as string} />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <Label htmlFor="organization" className="text-sm text-gray-700">
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
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <Label htmlFor="experience" className="text-sm text-gray-700">
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
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <Label htmlFor="motivation" className="text-sm text-gray-700">
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
                                    </motion.div>
                                </>
                            )}

                            <motion.div variants={itemVariants} className="flex justify-center">
                                <Button
                                    type="submit"
                                    className="w-full rounded-lg bg-blue-600 py-4 text-base font-semibold hover:bg-blue-700 transition-colors"
                                    tabIndex={6}
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Create account
                                </Button>
                            </motion.div>
                        </div>

                        <motion.div className="relative py-2" variants={itemVariants}>
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                        </motion.div>

                        <motion.div className="py-2 text-center text-sm text-gray-600 mb-4" variants={itemVariants}>
                            Sudah punya akun?{' '}
                            <TextLink href={route('login')} className="font-medium text-blue-600 hover:text-blue-800" tabIndex={7}>
                                Masuk
                            </TextLink>
                        </motion.div>
                    </motion.form>
                </motion.div>
            </div>
            <div className="hidden w-1/2 bg-blue-600 lg:flex lg:flex-col">
                <div className="fixed right-0 top-0 bottom-0 w-1/2 overflow-hidden">
                    <motion.div
                        className="absolute inset-0 opacity-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ duration: 0.8 }}
                    ></motion.div>
                    <img
                        src="/img/image2.jpg"
                        alt="Register Security"
                        className="h-full w-full object-cover object-center"
                    />
                    <motion.div
                        className="absolute z-10 inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
