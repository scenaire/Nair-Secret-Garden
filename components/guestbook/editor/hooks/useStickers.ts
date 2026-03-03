import { useState, useCallback, RefObject } from 'react';
import { StickerData } from '../types';

export function useStickers(paperRef: RefObject<HTMLDivElement | null>) {
    const [stickers, setStickers] = useState<StickerData[]>([]);
    const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

    const addSticker = useCallback((data: Pick<StickerData, 'content' | 'type' | 'src'>) => {
        const newSticker: StickerData = {
            id: `sticker-${Date.now()}`,
            ...data,
            xPercent: 50,
            yPercent: 20,
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