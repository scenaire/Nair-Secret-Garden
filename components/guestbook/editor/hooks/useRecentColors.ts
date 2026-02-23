import { useState, useEffect } from 'react';
import { INK_COLORS } from '@/components/guestbook/editor/styles/inkColors';

const MAX_RECENT_COLORS = 7;
const COLOR_SAVE_DELAY = 500;
const DEFAULT_COLOR = '#4A3B32';

export function useRecentColors(currentColor: string | undefined) {
    const [recentColors, setRecentColors] = useState<string[]>([]);

    useEffect(() => {
        const activeColor = currentColor?.toUpperCase() || '';
        if (!activeColor || activeColor === DEFAULT_COLOR) return;

        const isStandardColor = INK_COLORS.some(c => c.toUpperCase() === activeColor);
        if (isStandardColor) return;

        const timeout = setTimeout(() => {
            setRecentColors(prev => {
                const filtered = prev.filter(c => c !== activeColor);
                return [activeColor, ...filtered].slice(0, MAX_RECENT_COLORS);
            });
        }, COLOR_SAVE_DELAY);

        return () => clearTimeout(timeout);
    }, [currentColor]);

    return recentColors;
}