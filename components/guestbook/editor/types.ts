// 1. ✨ เปลี่ยนบรรทัดบนสุดให้ Import Type เข้ามาด้วยค่ะ
import { type PaperColorType } from './constants';

export interface StickerData {
    id: string;
    content: string;
    xPercent: number;
    yPx: number;
    widthPercent: number;
    rotation: number;
}

export type TextureType = 'plain' | 'dotted' | 'vintage-grid' | 'soft-paper';

export type TabType = 'write' | 'decorate' | 'paper';

export interface ModernEditorProps {
    content?: string;
    onChange?: (content: string) => void;
    paperColor?: PaperColorType;
}

export type MenuType = 'font' | 'typo' | 'color' | 'highlight' | 'link' | 'image' | 'sticker' | 'paper';

export type { PaperColorType };