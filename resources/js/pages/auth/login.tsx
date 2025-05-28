import { setAuthToken, setAuthUser } from '@/utils/api';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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

    return (
        <div className="flex min-h-screen w-full">
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
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Selamat datang di GeoSiaga!</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Optimalkan pemantauan dan mitigasi bencana alam bersama GeoSiaga. Akses gratis sekarang.
                        </p>
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={submit}>
                        <div className="grid gap-4">
                            <div>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Username"
                                    className="rounded-lg bg-white px-4 py-4"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
                                    className="rounded-lg bg-white px-4 py-4"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onClick={() => setData('remember', !data.remember)}
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember" className="text-sm">
                                        Remember me
                                    </Label>
                                </div>

                                {canResetPassword && (
                                    <TextLink href={route('password.request')} className="text-sm" tabIndex={5}>
                                        Forgot Password?
                                    </TextLink>
                                )}
                            </div>

                            {apiError && <div className="text-sm font-medium text-red-600">{apiError}</div>}

                            <Button
                                type="submit"
                                className="rounded-lg bg-black py-4 text-base font-semibold hover:bg-gray-800"
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
                                <span className="bg-white px-2">OR CONTINUE WITH</span>
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
                        Buat akun?{' '}
                        <TextLink href={route('register')} className="font-medium" tabIndex={6}>
                            Daftar
                        </TextLink>
                    </div>

                    {status && <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>}
                </div>
            </div>

            <div className="hidden w-1/2 bg-slate-50 lg:flex lg:flex-col">
                <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                    <img
                        src="/img/image2.jpg"
                        alt="Login Security"
                        className="h-full w-full object-cover object-center"
                        style={{ position: 'absolute', inset: 0 }}
                    />
                </div>
            </div>
        </div>
    );
}
