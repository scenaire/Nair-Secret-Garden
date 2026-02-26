// components/guestbook/editor/hooks/useStickers.ts
import { useState, useCallback, RefObject } from 'react';
import { StickerData } from './useAutoSave';

export function useStickers(paperRef: RefObject<HTMLDivElement>) {
    const [stickers, setStickers] = useState<StickerData[]>([]);
    const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

    const addSticker = useCallback((content: string) => {
        const newSticker: StickerData = {
            id: `sticker-${Date.now()}`,
            content,
            xPercent: 50,
            yPercent: 20, // ✨ ใช้ yPercent แทน yPx
            widthPercent: 25,
            rotation: Math.random() * 20 - 10,
        };
        setStickers(prev => [...prev, newSticker]);
        setActiveStickerId(newSticker.id);
    }, []);

    const updateSticker = useCallback((id: string, changes: Partial<StickerData>) => {
        setStickers(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s));
    }, []);

    const removeSticker = useCallback((id: string) => {
        setStickers(prev => prev.filter(s => s.id !== id));
        setActiveStickerId(null);
    }, []);

    const clearActiveSticker = useCallback(() => {
        setActiveStickerId(null);
    }, []);

    return { stickers, setStickers, activeStickerId, setActiveStickerId, addSticker, updateSticker, removeSticker, clearActiveSticker };
}