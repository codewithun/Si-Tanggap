// Save this as resources/js/hooks/use-auth-avatar.ts
import { useCallback, useEffect, useState } from 'react';
import { type User } from '@/types';

/**
 * This hook helps maintain avatar consistency throughout the app
 */
export function useAuthAvatar(user: User | null | undefined) {
  // Helper to generate fallback avatar URL
  const generateFallbackAvatar = useCallback((name?: string) => {
    if (!name) return undefined;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  }, []);
  
  // Initial avatar state
  const [avatar, setAvatar] = useState<string | null | undefined>(
    user?.avatar || generateFallbackAvatar(user?.name)
  );
  
  // Listen for avatar update events
  useEffect(() => {
    if (!user) return;
    
    const handleAvatarUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ avatar: string, userId: number }>;
      if (customEvent.detail && user.id === customEvent.detail.userId) {
        setAvatar(customEvent.detail.avatar);
      }
    };
    
    window.addEventListener('avatar-updated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, [user]);
  
  // Update avatar when user changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar);
    } else if (user?.name) {
      setAvatar(generateFallbackAvatar(user.name));
    } else {
      setAvatar(undefined);
    }
  }, [user, generateFallbackAvatar]);
  
  // Return avatar URL and utility functions
  return {
    avatar,
    setAvatar,
    generateFallbackAvatar,
  };
}
