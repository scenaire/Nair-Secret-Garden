"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
// Tiptap Extensions
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { ResizableImage } from './ResizableImage';

import { cn } from '@/lib/utils';
import { FONTS } from '@/components/guestbook/editor/styles/fontStyle';
import { VintageToolbar } from './toolbar/VintageToolbar';
import { StickerCanvas } from './StickerCanvas';
import { TextureType, ModernEditorProps, PaperColorType } from './types';
import { PAPER_COLORS, TEXTURE_STYLES, PAPER_LINK_COLORS } from './constants';
import { useStickers } from './hooks/useStickers';
import { useAutoSave } from './hooks/useAutoSave';

export function ModernEditor({ content, onChange, paperColor: defaultPaperColor = 'cream' }: ModernEditorProps) {
    const [texture, setTexture] = useState<TextureType>('plain');

    const [activePaperColor, setActivePaperColor] = useState<PaperColorType>(defaultPaperColor);
    useEffect(() => {
        setActivePaperColor(defaultPaperColor);
    }, [defaultPaperColor]);

    const paperRef = useRef<HTMLDivElement>(null);

    // Abstracted Business Logic
    const {
        stickers, activeStickerId, setActiveStickerId,
        addSticker, updateSticker, removeSticker, clearActiveSticker
    } = useStickers(paperRef);

    // Auto-Save
    const [editorContent, setEditorContent] = useState(content || '');
    const { loadDraft, clearDraft, isSaving } = useAutoSave(editorContent, 1500); // หน่วง 1.5 วิ

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit, Underline,
            Highlight.configure({ multicolor: true }),
            Placeholder.configure({ placeholder: 'บันทึกเรื่องราวในสวนแห่งนี้...' }),
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph', 'resizableImage'] }),
            TextStyle, Color, FontFamily, ResizableImage,
        ],
        content: loadDraft() || content || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setEditorContent(html);
            onChange?.(html);
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm max-w-none focus:outline-none w-full min-h-[500px] p-8 md:p-12 pb-48',
                    'leading-[2.5rem] text-[#4A3B32]',
                    FONTS[0].id,
                ),
            },
        },
    });

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Element;
            if (!target.closest('.sticker-node') && !target.closest('.sticker-controls') && !target.closest('.sticker-drawer')) {
                clearActiveSticker();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [clearActiveSticker]);

    if (!editor) return null;

    return (
        <div className="relative w-full max-w-3xl mx-auto rounded-xl shadow-[var(--shadow-soft)] border-2 border-[#E8DCC4]/50 flex flex-col bg-[#FDFCF0]">
            <VintageToolbar
                editor={editor}
                texture={texture}
                setTexture={setTexture}
                paperColor={activePaperColor}
                setPaperColor={setActivePaperColor}
                addSticker={addSticker}
            />

            <div
                ref={paperRef}
                className={cn("w-full h-full relative transition-colors duration-500", PAPER_COLORS[activePaperColor])}
                style={{
                    ...TEXTURE_STYLES[texture],
                    '--theme-text-link': PAPER_LINK_COLORS[activePaperColor]
                } as React.CSSProperties}
            >
                <EditorContent editor={editor} className="relative z-10" />
                <StickerCanvas
                    stickers={stickers}
                    activeStickerId={activeStickerId}
                    setActiveStickerId={setActiveStickerId}
                    updateSticker={updateSticker}
                    removeSticker={removeSticker}
                    paperRef={paperRef}
                />

                {/* ✨ สถานะ Auto-Save มุมล่างขวา */}
                <div className="absolute bottom-6 right-8 z-20 pointer-events-none transition-opacity duration-300">
                    {isSaving ? (
                        <span className="text-xs text-[#4A3B32]/40 font-noto-sans animate-pulse">
                            กำลังแอบจด... 🪄
                        </span>
                    ) : editorContent ? (
                        <span className="text-xs text-[#4A3B32]/30 font-noto-sans">
                            บันทึกในความทรงจำแล้ว 🌸
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}