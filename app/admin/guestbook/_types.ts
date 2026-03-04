export interface Sticker {
    id: string;
    content: string;
    type?: 'emoji' | 'image';  // เพิ่ม
    src?: string;               // เพิ่ม
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    rotation: number;
}

export interface GuestbookEntry {
    id: string;
    content: string;
    theme: string;
    paperColor: string;
    paperTexture: string;
    authorAlias: string;
    canvasWidth: number;
    canvasHeight: number;
    createdAt: string;
    stickers: Sticker[];
}