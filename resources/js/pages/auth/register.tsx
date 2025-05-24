import { useForm } from '@inertiajs/react';
import { ArrowLeft, Facebook, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
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
                        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
                        <p className="mt-2 text-sm text-gray-500">Enter your details below to create your account and get started with Si-Tanggap</p>
                    </div>

                    <form className="mt-8 flex flex-col gap-6" onSubmit={submit}>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
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
                                    className="rounded-lg px-4 py-5"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
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
                                    className="rounded-lg px-4 py-5"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Input
                                    id="phone"
                                    type="tel"
                                    tabIndex={3}
                                    autoComplete="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    disabled={processing}
                                    placeholder="Phone number"
                                    className="rounded-lg px-4 py-5"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
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
                                    className="rounded-lg px-4 py-5"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
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
                                    className="rounded-lg px-4 py-5"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 rounded-lg bg-black py-5 text-base font-semibold hover:bg-gray-800"
                                tabIndex={6}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Create account
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">or sign up with</span>
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
                                onClick={() => (window.location.href = route('auth.facebook'))}
                            >
                                <Facebook className="mr-2 h-5 w-5" />
                                Facebook
                            </Button>
                        </div>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <TextLink href={route('login')} className="font-medium" tabIndex={7}>
                            Log in
                        </TextLink>
                    </div>
                </div>
            </div>

            <div className="hidden w-1/2 bg-slate-50 lg:flex lg:flex-col">
                <div className="flex flex-1 flex-col items-center justify-center p-16">
                    <div className="relative">
                        <div className="absolute -top-8 -left-16">
                            <div className="h-12 w-12 overflow-hidden rounded-full border-4 border-white bg-gray-100">
                                <img src="/images/avatar-3.png" alt="" className="h-full w-full object-cover" />
                            </div>
                        </div>
                        <div className="absolute top-4 -right-20">
                            <div className="h-12 w-12 overflow-hidden rounded-full border-4 border-white bg-gray-100">
                                <img src="/images/avatar-4.png" alt="" className="h-full w-full object-cover" />
                            </div>
                        </div>
                        <div className="mb-12 w-[450px]">
                            <img src="/images/register-illustration.svg" alt="Register" className="h-auto w-full" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="mb-2 text-2xl font-bold">Join our community of responders</h2>
                        <h3 className="text-lg">
                            Help others with <span className="font-semibold">Si-Tanggap App</span>
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
