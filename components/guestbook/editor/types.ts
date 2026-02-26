import { type PaperColorType } from './constants';

export interface StickerData {
    id: string;
    content: string;
    xPercent: number;
    yPercent: number;
    yPx?: number; // backward compat สำหรับ draft เก่า
    widthPercent: number;
    rotation: number;
}

export type TextureType = 'plain' | 'dotted' | 'vintage-grid' | 'soft-paper';

export type TabType = 'write' | 'decorate' | 'paper';

export interface ThemeConfig {
    id: string;
    name: string;
    coverImage: string;
    defaultPaper: PaperColorType;
    cssVars: {
        '--theme-bg': string;
        '--theme-icon': string;
        '--theme-btn-bg': string;
        '--theme-btn-text': string;
        '--theme-accent-text': string;
        '--theme-toolbar-bg': string;
        '--theme-toolbar-border': string;
        '--theme-toolbar-icon-idle': string;
        '--theme-toolbar-icon-active': string;
        '--theme-toolbar-icon-hover': string;
        '--theme-text-body': string;
        '--theme-selection': string;
        '--theme-scrollbar-thumb': string;
        '--theme-scrollbar-track': string;
        [key: `--${string}`]: string;
    }
}

export interface ModernEditorProps {
    content?: string;
    onChange?: (content: string) => void;
    paperColor?: PaperColorType;
    theme?: string;
    onThemeChange?: (theme: string) => void;
    insertPrompt?: string | null;
    onPromptInserted?: () => void;
}

export type MenuType = 'font' | 'typo' | 'color' | 'highlight' | 'link' | 'image' | 'sticker' | 'paper';

export type { PaperColorType };

export type MoodType = "warm" | "playful" | "shy" | "sincere" | "teasing" | "nostalgic" |
    "proud" |
    "comforting";

export interface Question {
    text: string;
    mood: MoodType;
}