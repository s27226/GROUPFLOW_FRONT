import { useEffect, useRef, RefObject } from "react";

/**
 * Custom hook to detect clicks outside of a referenced element
 * @param {Function} handler - Callback function to execute when click outside is detected
 * @param {boolean} enabled - Whether the click outside detection is enabled (default: true)
 * @returns {React.RefObject} - Ref to attach to the element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    handler: () => void,
    enabled: boolean = true
): RefObject<T | null> {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event: MouseEvent): void => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handler, enabled]);

    return ref;
}
