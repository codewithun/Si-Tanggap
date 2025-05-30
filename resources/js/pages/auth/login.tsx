import { setAuthToken, setAuthUser } from '@/utils/api';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { motion } from 'framer-motion';

import PageTitle from '@/components/PageTitle';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const [apiError, setApiError] = useState('');
    const [, setUserRole] = useState<string | null>(null);

    const handleApiLogin = async () => {
        try {
            const response = await axios.post('/login', data, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            // If we get a token back, store it
            if (response.data.token) {
                setAuthToken(response.data.token);
                setAuthUser(response.data.user);
                setUserRole(response.data.user.role);
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error('Login error:', error);
            setApiError('Email atau password tidak valid');
            reset('password');
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setApiError('');

        // Auto-set remember to false for non-volunteer roles
        if (!data.email.includes('relawan')) {
            setData('remember', false);
        }

        if (window.location.search.includes('api=true')) {
            // Use API authentication for mobile/API clients
            handleApiLogin();
        } else {
            // Use standard Inertia form submission for web
            post(route('login'), {
                onFinish: () => reset('password'),
            });
        }
    };

    // Check if current email suggests volunteer role (simple check based on email pattern)
    const isVolunteerEmail = data.email.includes('relawan') || data.email.includes('volunteer');

    return (
        <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-white">
            <PageTitle title="Login" />

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

            <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
                <motion.div
                    className="w-full max-w-md space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center">
                        <motion.h1
                            className="text-3xl font-bold tracking-tight text-blue-900"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            Selamat datang di GeoSiaga!
                        </motion.h1>
                        <motion.p
                            className="mt-2 text-sm text-gray-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            Optimalkan pemantauan dan mitigasi bencana alam bersama GeoSiaga. Akses gratis sekarang.
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="email" className="text-sm text-gray-700">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Email"
                                    className="mt-1 rounded-lg border-gray-300 bg-white px-4 py-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.email && (
                                    <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-sm text-gray-700">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
                                    className="mt-1 rounded-lg border-gray-300 bg-white px-4 py-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center justify-between">
                                {isVolunteerEmail && (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            checked={data.remember}
                                            onClick={() => setData('remember', !data.remember)}
                                            tabIndex={3}
                                        />
                                        <Label htmlFor="remember" className="text-sm text-gray-600">
                                            Remember me
                                        </Label>
                                    </div>
                                )}

                                {canResetPassword && (
                                    <TextLink
                                        href={route('password.request')}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                        tabIndex={5}
                                    >
                                        Forgot Password?
                                    </TextLink>
                                )}
                            </div>

                            {apiError && <div className="text-sm font-medium text-red-600">{apiError}</div>}

                            <Button
                                type="submit"
                                className="rounded-lg bg-blue-600 py-4 text-base font-semibold hover:bg-blue-700 transition-colors"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs text-gray-500">
                                <span className="bg-gradient-to-br from-blue-50 to-white px-2">
                                    OR CONTINUE WITH
                                </span>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full rounded-lg border-gray-300 py-4 shadow-sm transition-all hover:bg-gray-50"
                                onClick={() => (window.location.href = route('google.login'))}
                            >
                                <svg width="20" height="20" fill="currentColor" className="mr-2">
                                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                                </svg>
                                Google
                            </Button>
                        </div>
                    </motion.form>

                    <div className="pt-2 text-center text-sm text-gray-600">
                        Buat akun?{' '}
                        <TextLink
                            href={route('register')}
                            className="font-medium text-blue-600 hover:text-blue-800"
                            tabIndex={6}
                        >
                            Daftar
                        </TextLink>
                    </div>

                    {status && <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>}
                </motion.div>
            </div>

            <div className="hidden w-1/2 bg-blue-600 lg:flex lg:flex-col">
                <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-blue-700 opacity-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ duration: 0.8 }}
                    ></motion.div>
                    <img
                        src="/img/image2.jpg"
                        alt="Login Security"
                        className="h-full w-full object-cover object-center"
                        style={{ position: 'absolute', inset: 0 }}
                    />
                    <motion.div
                        className="z-10 max-w-lg p-8 text-center text-white"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <h2 className="text-2xl font-bold">Secure Login</h2>
                        <p className="mt-2">Access your dashboard safely and securely</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
