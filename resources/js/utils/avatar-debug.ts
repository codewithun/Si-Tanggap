// Save this in resources/js/utils/avatar-debug.ts
/**
 * Utility functions for debugging avatar issues
 */

// Constants for avatar storage keys
export const AVATAR_PREVIEW_KEY = 'temp_avatar_preview';
export const AVATAR_PATH_KEY = 'current_avatar_path';

// Define interface for auth user
interface AuthUser {
    avatar?: string | null;
    profile_photo_path?: string | null;
    name?: string | null;
}

/**
 * Logs the current avatar state for debugging purposes
 */
export function logAvatarState(authUser?: AuthUser) {
    console.group('Avatar State Debug');

    try {
        const sessionPreview = sessionStorage.getItem(AVATAR_PREVIEW_KEY);
        const sessionPath = sessionStorage.getItem(AVATAR_PATH_KEY);

        console.log('Session Storage:');
        console.log(`- Preview: ${sessionPreview ? 'exists (data URL)' : 'null'}`);
        console.log(`- Path: ${sessionPath || 'null'}`);

        if (authUser) {
            console.log('Auth User State:');
            console.log(`- avatar: ${authUser.avatar || 'null'}`);
            console.log(`- profile_photo_path: ${authUser.profile_photo_path || 'null'}`);
            console.log(`- name: ${authUser.name || 'null'} (for fallback generation)`);
        } else {
            console.log('Auth User: Not available');
        }
    } catch (e) {
        console.error('Error accessing avatar state:', e);
    }

    console.groupEnd();
}

/**
 * Clears all avatar session storage for testing purposes
 */
export function clearAvatarStorage() {
    try {
        sessionStorage.removeItem(AVATAR_PREVIEW_KEY);
        sessionStorage.removeItem(AVATAR_PATH_KEY);
        console.log('Avatar session storage cleared');
    } catch (e) {
        console.error('Error clearing avatar storage:', e);
    }
}

/**
 * Triggers a global avatar update event
 */
export function broadcastAvatarUpdate(avatar: string, userId: number) {
    window.dispatchEvent(
        new CustomEvent('avatar-updated', {
            detail: {
                avatar,
                userId,
            },
        }),
    );
    console.log(`Avatar update broadcast: ${userId} -> ${avatar.substring(0, 30)}...`);
}
