import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useAvatarManager } from '@/hooks/use-avatar-manager';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    phone: string;
    profile_photo: File | null;
    _method: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const photoInput = useRef<HTMLInputElement>(null);
    
    // Get initial avatar URL from server path if available
    const initialAvatar = auth.user?.profile_photo_path 
        ? `/storage/${auth.user.profile_photo_path}` 
        : null;
    
    // Initialize avatar manager with the current user
    const { 
        avatarUrl: previewUrl, 
        updateGlobalAvatar, 
        saveToSessionStorage, 
        loadFromSessionStorage,
        cleanupSessionStorage
    } = useAvatarManager({
        userId: auth.user?.id,
        initialAvatar: initialAvatar,
        onAvatarChange: (newAvatarUrl) => {
            // When avatar changes, update the auth.user object
            if (auth.user) {
                if (newAvatarUrl) {
                    auth.user.avatar = newAvatarUrl;
                } else {
                    // Use UI Avatars fallback
                    auth.user.avatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(auth.user.name || '');
                }
            }
        }
    });
    
    // Initialize avatar on first render by checking session storage first
    useEffect(() => {
        const storedAvatar = loadFromSessionStorage();
        if (storedAvatar) {
            updateGlobalAvatar(storedAvatar);
        } else if (initialAvatar) {
            updateGlobalAvatar(initialAvatar);
        }
    }, [loadFromSessionStorage, updateGlobalAvatar, initialAvatar]);

    const { data, setData, post, errors, processing, recentlySuccessful, reset } = useForm<ProfileForm>({
        _method: 'PATCH',
        name: auth.user?.name || '',
        email: auth.user?.email || '',
        phone: auth.user?.phone?.toString() || '',
        profile_photo: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (photoInput.current?.files?.[0]) {
            setData('profile_photo', photoInput.current.files[0]);
        }

        // Store current preview URL to ensure it persists during request
        const currentPreviewUrl = previewUrl;

        post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: (response) => {
                if (photoInput.current) {
                    photoInput.current.value = '';
                }
                
                // Initial handling - maintain the preview URL we already have
                // This ensures the UI stays consistent and the avatar doesn't disappear 
                if (auth.user && currentPreviewUrl) {
                    // Update the avatar immediately to prevent flickering
                    updateGlobalAvatar(currentPreviewUrl);
                }
                
                // Process server response for more permanent storage
                if (response && typeof response === 'object' && 'props' in response) {
                    const typedResponse = response as { props: { auth?: { user?: { avatar?: string; profile_photo_path?: string } } } };
                    
                    // Update from server response if available
                    if (typedResponse.props?.auth?.user && auth.user) {
                        let newAvatarUrl = currentPreviewUrl;
                        
                        // If server returned profile_photo_path, this is the most authoritative
                        if (typedResponse.props.auth.user.profile_photo_path) {
                            auth.user.profile_photo_path = typedResponse.props.auth.user.profile_photo_path;
                            newAvatarUrl = `/storage/${typedResponse.props.auth.user.profile_photo_path}`;
                            
                            // Save to session storage as permanent path
                            saveToSessionStorage(newAvatarUrl, true);
                        }
                        
                        // If server specifically returned an avatar URL, use it
                        if (typedResponse.props.auth.user.avatar) {
                            newAvatarUrl = typedResponse.props.auth.user.avatar;
                        }
                        
                        // Update global avatar state with the most appropriate URL
                        updateGlobalAvatar(newAvatarUrl);
                    }
                }
            },
            onError: () => {
                // On error, maintain the current preview state
                if (auth.user && currentPreviewUrl) {
                    updateGlobalAvatar(currentPreviewUrl);
                }
            }
        });
    };

    const removePhoto = () => {
        post(route('profile-photo.delete'), {
            preserveScroll: true,
            onSuccess: (response) => {
                reset('profile_photo');
                if (photoInput.current) {
                    photoInput.current.value = '';
                }
                
                // Clear all stored avatar data
                cleanupSessionStorage();
                
                // Reset avatar to default fallback immediately for UI consistency
                if (auth.user) {
                    // Clear profile photo path
                    auth.user.profile_photo_path = undefined;
                    
                    // Set to null to trigger the default UI fallback
                    updateGlobalAvatar(null);
                }
                
                // Process server response for more authoritative state
                if (response && typeof response === 'object' && 'props' in response) {
                    const typedResponse = response as { props: { auth?: { user?: { avatar?: string; profile_photo_path?: string; name?: string } } } };
                    if (typedResponse.props?.auth?.user && auth.user) {
                        // If server returned an avatar (perhaps a default), use it
                        if (typedResponse.props.auth.user.avatar) {
                            updateGlobalAvatar(typedResponse.props.auth.user.avatar);
                        } else {
                            // Use name initials fallback based on the most current name
                            const userName = typedResponse.props.auth.user.name || auth.user.name || '';
                            updateGlobalAvatar('https://ui-avatars.com/api/?name=' + encodeURIComponent(userName));
                        }
                        
                        // Clear profile photo path from the user object
                        auth.user.profile_photo_path = undefined;
                    }
                }
            },
            onError: () => {
                // On error, maintain the current state which should be the UI fallback
                if (auth.user) {
                    updateGlobalAvatar(null); // This will use the UI avatar fallback
                }
            }
        });
    };

    // Create a preview when a file is selected
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_photo', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                
                // Update all instances of the avatar in the application
                if (auth.user) {
                    // Update global avatar to immediately update all components
                    updateGlobalAvatar(dataUrl);
                    
                    // Store in session storage as temporary preview
                    saveToSessionStorage(dataUrl, false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // The cleanup function is now provided by the useAvatarManager hook
    // Similarly, event listening for avatar updates is handled by the hook

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoComplete="name"
                                placeholder="Enter your name (optional)"
                                required
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="username"
                                placeholder="Enter your email address (optional)"
                                required
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone number</Label>

                            <Input
                                id="phone"
                                type="tel"
                                className="mt-1 block w-full"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                autoComplete="tel"
                                placeholder="Phone number"
                            />

                            <InputError className="mt-2" message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="profile_photo">Profile Photo</Label>

                            {(previewUrl || auth.user?.profile_photo_path) && (
                                <div className="mb-4 flex items-center gap-4">
                                    <img
                                        src={previewUrl || `/storage/${auth.user?.profile_photo_path}`}
                                        alt="Current profile"
                                        className="h-20 w-20 rounded-full object-cover"
                                        onError={(e) => {
                                            // Fallback if image doesn't load
                                            const fallbackUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(auth.user?.name || '');
                                            (e.target as HTMLImageElement).src = fallbackUrl;
                                            
                                            // Also update global avatar state if this is the current avatar
                                            if (auth.user && auth.user.avatar === previewUrl) {
                                                updateGlobalAvatar(fallbackUrl);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={removePhoto}
                                        size="sm"
                                    >
                                        Remove Photo
                                    </Button>
                                </div>
                            )}

                            <Input
                                id="profile_photo"
                                ref={photoInput}
                                type="file"
                                accept="image/*"
                                className="mt-1 block w-full"
                                onChange={handlePhotoChange}
                            />

                            <p className="text-sm text-gray-500">
                                Upload a new profile photo (max 2MB)
                            </p>

                            <InputError className="mt-2" message={errors.profile_photo} />
                        </div>

                        {mustVerifyEmail && auth.user?.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
