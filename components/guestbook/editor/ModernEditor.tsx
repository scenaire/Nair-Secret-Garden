// components/guestbook/editor/ModernEditor.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { ResizableImage } from './ResizableImage';
import TextAlign from '@tiptap/extension-text-align';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { cn } from '@/lib/utils';
import { FONTS } from '@/styles/fontStyle';

// Import ชิ้นส่วนที่เราแยกไว้
import { VintageToolbar } from './VintageToolbar';
import { StickerCanvas } from './StickerCanvas';
import { StickerData, TextureType, ModernEditorProps } from './types';

export function ModernEditor({ content, onChange, paperColor = 'cream' }: ModernEditorProps) {
    const [texture, setTexture] = useState<TextureType>('vintage-grid');
    const [stickers, setStickers] = useState<StickerData[]>([]);
    const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

    const paperRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit, Underline, Highlight.configure({ multicolor: true }),
            Placeholder.configure({ placeholder: 'บันทึกเรื่องราวในสวนแห่งนี้...' }),
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph', 'resizableImage'] }),
            TextStyle,
            FontFamily,
            ResizableImage,
        ],
        content: content || '',
        onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm max-w-none focus:outline-none w-full min-h-[500px] p-8 md:p-12 pb-48',
                    'leading-[2.5rem] text-[#4A3B32]',
                    FONTS[0].id,
                    FONTS[0].sizeClass,
                ),
            },
        },
    });

    // ยกเลิกการเลือกสติกเกอร์เมื่อคลิกที่ว่าง
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.sticker-node') &&
                !(e.target as Element).closest('.sticker-controls') &&
                !(e.target as Element).closest('.sticker-drawer')) {
                setActiveStickerId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addSticker = (emoji: string) => {
        const newSticker: StickerData = {
            id: Math.random().toString(36).substring(7),
            content: emoji,
            xPercent: Math.random() * 40 + 20,
            yPx: paperRef.current?.scrollTop ? paperRef.current.scrollTop + 150 : 150,
            widthPercent: 25,
            rotation: (Math.random() - 0.5) * 20,
        };
        setStickers([...stickers, newSticker]);
        setActiveStickerId(newSticker.id);
    };

    const updateSticker = (id: string, updates: Partial<StickerData>) => {
        setStickers(stickers.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const removeSticker = (id: string) => {
        setStickers(stickers.filter(s => s.id !== id));
    };

    // 🎨 สีกระดาษและ Texture
    const paperColors = { cream: "bg-[#FFFDF9]", blush: "bg-[#FFF0F0]", sky: "bg-[#F0F7FA]" };
    const textureStyles = {
        plain: {},
        dotted: { backgroundImage: "radial-gradient(rgba(74, 59, 50, 0.15) 1.5px, transparent 1.5px)", backgroundSize: "28px 2.5rem", backgroundPosition: "0 0.5rem" },
        'vintage-grid': {
            backgroundImage: `
        linear-gradient(rgba(74, 59, 50, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(74, 59, 50, 0.1) 1px, transparent 1px),
        repeating-linear-gradient(45deg, rgba(242, 198, 194, 0.2) 0, rgba(242, 198, 194, 0.2) 2px, transparent 2px, transparent 6px)
      `,
            backgroundSize: "36px 36px, 36px 36px, 12px 12px"
        }
    };

    if (!editor) return null;

    return (
        <div className="relative w-full max-w-3xl mx-auto rounded-xl shadow-[var(--shadow-soft)] border-2 border-[#E8DCC4]/50 flex flex-col bg-[#FDFCF0]">

            {/* 🎀 Toolbar เรียกใช้จากไฟล์นอก */}
            <VintageToolbar
                editor={editor}
                texture={texture}
                setTexture={setTexture}
                addSticker={addSticker}
            />

            <div ref={paperRef} className={cn("w-full h-full relative transition-colors duration-500", paperColors[paperColor])} style={textureStyles[texture]}>

                {/* 📝 ตัวหนังสือ */}
                <EditorContent editor={editor} className="relative z-10" />

                {/* ✨ ชั้นสติกเกอร์ เรียกใช้จากไฟล์นอก */}
                <StickerCanvas
                    stickers={stickers}
                    activeStickerId={activeStickerId}
                    setActiveStickerId={setActiveStickerId}
                    updateSticker={updateSticker}
                    removeSticker={removeSticker}
                    paperRef={paperRef}
                />

            </div>
        </div>
    );
}