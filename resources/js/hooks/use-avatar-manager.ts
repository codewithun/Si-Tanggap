import { useCallback, useEffect, useState } from 'react';

// Avatar storage keys
export const AVATAR_PREVIEW_KEY = 'temp_avatar_preview';
export const AVATAR_PATH_KEY = 'current_avatar_path';

type AvatarEventDetail = {
    avatar: string;
    userId: number;
};

interface UseAvatarManagerOptions {
    userId?: number;
    initialAvatar?: string | null;
    onAvatarChange?: (avatarUrl: string | null) => void;
}

export function useAvatarManager({ userId, initialAvatar = null, onAvatarChange }: UseAvatarManagerOptions = {}) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar);

    // Function to update avatar in all places
    const updateGlobalAvatar = useCallback(
        (newAvatarUrl: string | null) => {
            // Update local state
            setAvatarUrl(newAvatarUrl);

            // Call the callback if provided
            if (onAvatarChange) {
                onAvatarChange(newAvatarUrl);
            }

            // Dispatch event for other components
            if (userId) {
                window.dispatchEvent(
                    new CustomEvent<AvatarEventDetail>('avatar-updated', {
                        detail: {
                            avatar: newAvatarUrl || '',
                            userId,
                        },
                    }),
                );
            }
        },
        [userId, onAvatarChange],
    );

    // Listen for avatar update events
    useEffect(() => {
        if (!userId) return;

        const handleAvatarUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<AvatarEventDetail>;
            if (customEvent.detail && userId === customEvent.detail.userId) {
                setAvatarUrl(customEvent.detail.avatar || null);
            }
        };

        window.addEventListener('avatar-updated', handleAvatarUpdate);
        return () => {
            window.removeEventListener('avatar-updated', handleAvatarUpdate);
        };
    }, [userId]);

    // Save to session storage
    const saveToSessionStorage = useCallback((url: string | null, isPermanent = false) => {
        try {
            if (url) {
                // If permanent, save to path key, otherwise to preview key
                const key = isPermanent ? AVATAR_PATH_KEY : AVATAR_PREVIEW_KEY;
                sessionStorage.setItem(key, url);

                // If saving a permanent URL, clear the temporary one
                if (isPermanent) {
                    sessionStorage.removeItem(AVATAR_PREVIEW_KEY);
                }
            } else {
                // If null, clear both
                sessionStorage.removeItem(AVATAR_PREVIEW_KEY);
                sessionStorage.removeItem(AVATAR_PATH_KEY);
            }
        } catch (e) {
            console.warn('Could not access session storage for avatar', e);
        }
    }, []);

    // Load from session storage
    const loadFromSessionStorage = useCallback(() => {
        try {
            // First try temporary preview
            const tempPreview = sessionStorage.getItem(AVATAR_PREVIEW_KEY);
            if (tempPreview) return tempPreview;

            // Then try permanent path
            return sessionStorage.getItem(AVATAR_PATH_KEY);
        } catch (e) {
            console.warn('Could not access session storage for avatar', e);
            return null;
        }
    }, []);

    // Clean up session storage
    const cleanupSessionStorage = useCallback(() => {
        try {
            sessionStorage.removeItem(AVATAR_PREVIEW_KEY);
            sessionStorage.removeItem(AVATAR_PATH_KEY);
        } catch {
            // Ignore storage errors
        }
    }, []);

    return {
        avatarUrl,
        updateGlobalAvatar,
        saveToSessionStorage,
        loadFromSessionStorage,
        cleanupSessionStorage,
    };
}
