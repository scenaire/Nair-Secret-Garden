import { useState, useCallback, RefObject } from 'react';
import { StickerData } from '../types';

export function useStickers(paperRef: RefObject<HTMLDivElement | null>) {
    const [stickers, setStickers] = useState<StickerData[]>([]);
    const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

    const addSticker = useCallback((emoji: string) => {
        const scrollTop = paperRef.current?.scrollTop || 0;
        const newSticker: StickerData = {
            id: Math.random().toString(36).substring(7),
            content: emoji,
            xPercent: Math.random() * 40 + 20,
            yPx: scrollTop + 150,
            widthPercent: 25,
            rotation: (Math.random() - 0.5) * 20,
        };
        setStickers((prev) => [...prev, newSticker]);
        setActiveStickerId(newSticker.id);
    }, [paperRef]);

    const updateSticker = useCallback((id: string, updates: Partial<StickerData>) => {
        setStickers((prev) => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, []);

    const removeSticker = useCallback((id: string) => {
        setStickers((prev) => prev.filter(s => s.id !== id));
        setActiveStickerId(null);
    }, []);

    const clearActiveSticker = useCallback(() => setActiveStickerId(null), []);

    return {
        stickers,
        activeStickerId,
        setActiveStickerId,
        addSticker,
        updateSticker,
        removeSticker,
        clearActiveSticker
    };
}