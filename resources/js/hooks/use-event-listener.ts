import { useEffect, useRef } from 'react';

// A custom hook for adding event listeners with cleanup
export function useEventListener<K extends keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void,
    element: Window | Document | HTMLElement | null = window,
    options?: boolean | AddEventListenerOptions,
) {
    // Create a reference that stores the handler
    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        // Make sure element supports addEventListener
        if (!element?.addEventListener) return;

        // Create event listener that calls handler function stored in ref
        const listener: typeof handler = (event) => savedHandler.current(event);

        // Add event listener
        element.addEventListener(eventName, listener as EventListener, options);

        // Remove event listener on cleanup
        return () => {
            element.removeEventListener(eventName, listener as EventListener, options);
        };
    }, [eventName, element, options]);
}
