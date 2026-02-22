export interface StickerData {
    id: string;
    content: string; // Emoji หรือ URL รูปภาพ
    xPercent: number;
    yPx: number;     // เก็บเป็น Pixel เพราะหน้ากระดาษเรายืดลงได้เรื่อยๆ
    widthPercent: number;
    rotation: number;
}

export type TextureType = 'plain' | 'dotted' | 'vintage-grid';

export type TabType = 'write' | 'decorate' | 'paper';

export interface ModernEditorProps {
    content?: string;
    onChange?: (content: string) => void;
    paperColor?: 'cream' | 'blush' | 'sky';
}