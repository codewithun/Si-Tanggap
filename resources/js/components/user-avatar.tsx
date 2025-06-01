import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { useEventListener } from '@/hooks/use-event-listener';

export function UserAvatar({ user }: { user: User }) {
    const getInitials = useInitials();
    const [avatarSrc, setAvatarSrc] = useState<string | undefined>(user.avatar);
    
    // Listen for avatar updates across the application
    useEventListener('avatar-updated', (event) => {
        const customEvent = event as CustomEvent<{ avatar: string, userId: number }>;
        if (customEvent.detail && user.id === customEvent.detail.userId) {
            setAvatarSrc(customEvent.detail.avatar);
        }
    });
    
    // Update avatar source when user prop changes
    useEffect(() => {
        setAvatarSrc(user.avatar);
    }, [user.avatar]);
    
    return (
        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
            <AvatarImage 
                src={avatarSrc} 
                alt={user.name} 
                onError={() => {
                    // Fallback to initials if image fails to load
                    setAvatarSrc(undefined);
                }}
            />
            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                {getInitials(user.name)}
            </AvatarFallback>
        </Avatar>
    );
}
