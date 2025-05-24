import { setAuthToken, setAuthUser } from '@/utils/api';
import axios from 'axios';
import { ArrowLeft, Facebook, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// If you intend to use Inertia's useForm:
import { useForm } from '@inertiajs/react';

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
            {/* Back button */}
            <div className="absolute top-4 left-4 z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (window.location.href = '/')}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Button>
            </div>

            <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Simplify your workflow and boost your productivity with Si-Tanggap App. Get started for free.
                        </p>
                    </div>

                    <form className="mt-8 flex flex-col gap-6" onSubmit={submit}>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
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
                                    className="rounded-lg px-4 py-5"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Password"
                                        className="rounded-lg px-4 py-5"
                                    />
                                </div>
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
                                className="rounded-lg bg-black py-5 text-base font-semibold hover:bg-gray-800"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">or continue with</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-lg py-5"
                                onClick={() => (window.location.href = route('auth.google'))}
                            >
                                <svg width="20" height="20" fill="currentColor" className="mr-2">
                                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                                </svg>
                                Google
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-lg py-5"
                                onClick={() => (window.location.href = route('auth.apple'))}
                            >
                                <svg width="20" height="20" fill="currentColor" className="mr-2">
                                    <path d="M8.023 6.272c-.573 0-1.286-.194-2.089-.742C5.177 5.019 4.515 4.571 3.781 4.571c-.449 0-.803.146-1.145.426C1.562 5.898.793 7.681.793 9.501c0 2.876 2.129 5.736 3.722 5.736.661 0 1.138-.315 1.723-.642.603-.338 1.282-.722 2.196-.722.878 0 1.521.374 2.09.705.541.314 1.022.593 1.634.593 2.053 0 3.622-4.156 3.622-6.059 0-.617-.047-.982-.047-.982-.868.152-1.453-.22-1.953-.553-.653-.434-1.223-.811-2.52-.811-1.197 0-1.875.467-2.527.868-.397.244-.731.447-1.068.502-.03.004-.006-.391-.006-.391s.377-.657.734-.935c.661-.513 1.663-.981 2.785-.981.871 0 1.83.211 2.607.981.154.152.274.331.37.523l.002.005c-.65.693-1.364 1.122-2.014 1.122-.691 0-1.25-.302-1.82-.612-.578-.313-1.174-.636-2.037-.636z" />
                                    <path d="M8.03 4.458c1.062-.808 1.792-1.935 1.792-3.059 0-.096-.008-.192-.02-.285-.816.078-1.783.54-2.385 1.246-.709.747-1.26 1.818-1.26 2.94 0 .106.012.208.022.31.052.005.104.013.16.013.686 0 1.372-.349 1.691-.665z" />
                                </svg>
                                Apple
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-lg py-5"
                                onClick={() => (window.location.href = route('auth.facebook'))}
                            >
                                <Facebook className="mr-2 h-5 w-5" />
                                Facebook
                            </Button>
                        </div>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                        Not a member?{' '}
                        <TextLink href={route('register')} className="font-medium" tabIndex={6}>
                            Register now
                        </TextLink>
                    </div>

                    {status && <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>}
                </div>
            </div>

            <div className="hidden w-1/2 bg-slate-50 lg:flex lg:flex-col">
                <div className="flex flex-1 flex-col items-center justify-center p-16">
                    <div className="relative">
                        <div className="absolute top-0 -left-28">
                            <div className="h-12 w-12 overflow-hidden rounded-full border-4 border-white bg-gray-100">
                                <img src="/images/avatar-1.png" alt="" className="h-full w-full object-cover" />
                            </div>
                        </div>
                        <div className="absolute -top-12 -right-32">
                            <div className="h-12 w-12 overflow-hidden rounded-full border-4 border-white bg-gray-100">
                                <img src="/images/avatar-2.png" alt="" className="h-full w-full object-cover" />
                            </div>
                        </div>
                        <div className="mb-12 w-[450px]">
                            <img src="/images/login-illustration.svg" alt="Login" className="h-auto w-full" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="mb-2 text-2xl font-bold">Make your work easier and organized</h2>
                        <h3 className="text-lg">
                            with <span className="font-semibold">Si-Tanggap App</span>
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
