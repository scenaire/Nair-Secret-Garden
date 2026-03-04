// components/guestbook/editor/hooks/useAutoSave.ts
import { useState, useEffect, useCallback } from 'react';

const DRAFT_KEY = 'guestbook_draft_data';

// useAutoSave.ts — แก้ StickerData interface
export interface StickerData {
    id: string;
    content: string;
    type?: 'emoji' | 'image';  // เพิ่ม
    src?: string;               // เพิ่ม
    xPercent: number;
    yPercent: number;
    yPx?: number;
    widthPercent: number;
    rotation: number;
}

export interface GuestbookDraftData {
    content: string;
    canvasWidth: number;
    canvasHeight: number;
    theme: string;
    paperColor: string;
    paperTexture: string;
    stickers: StickerData[];
}

export function useAutoSave(draftData: GuestbookDraftData, delay: number = 1000) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const loadDraft = useCallback((): GuestbookDraftData | null => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved) as GuestbookDraftData;
                } catch (error) {
                    console.error('Failed to parse draft data:', error);
                    return null;
                }
            }
        }
        return null;
    }, []);

    const stringifiedData = JSON.stringify(draftData);

    useEffect(() => {
        if (!draftData || (draftData.content === '' || draftData.content === '<p></p>') && draftData.stickers.length === 0) {
            return;
        }

        setIsSaving(true);
        const handler = setTimeout(() => {
            localStorage.setItem(DRAFT_KEY, stringifiedData);
            setLastSaved(new Date());
            setIsSaving(false);
        }, delay);

        return () => clearTimeout(handler);
    }, [stringifiedData, delay]);

    const clearDraft = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(DRAFT_KEY);
        }
    }, []);

    return { loadDraft, clearDraft, isSaving, lastSaved };
}