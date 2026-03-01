"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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

export function ModernEditor({
    content,
    onChange,
    paperColor: defaultPaperColor = 'cream',
    theme = 'cream',
    onThemeChange,
    insertPrompt,
    onPromptInserted
}: ModernEditorProps) {
    const paperRef = useRef<HTMLDivElement>(null);

    const {
        stickers, activeStickerId, setActiveStickerId,
        addSticker, updateSticker, removeSticker, clearActiveSticker,
        setStickers
    } = useStickers(paperRef) as any;

    const [texture, setTexture] = useState<TextureType>('plain');
    const [activePaperColor, setActivePaperColor] = useState<PaperColorType>(defaultPaperColor);
    const [editorContent, setEditorContent] = useState(content || '');

    const draftData = {
        content: editorContent,
        canvasWidth: paperRef.current?.clientWidth || 0,
        canvasHeight: paperRef.current?.clientHeight || 0,
        theme: theme, // <--- ใช้ตัวนี้เลย!
        paperColor: activePaperColor,
        paperTexture: texture,
        stickers: stickers
    };

    const { loadDraft, clearDraft, isSaving } = useAutoSave(draftData, 1500);

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
        content: content || '',
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

                    // ✨ เวทมนตร์ Pull Quote สไตล์นิตยสาร (แก้ไวยากรณ์ให้ Tailwind เข้าใจแล้วค่ะ) ✨

                    // 1. เคลียร์สไตล์เดิมของ Blockquote (ลบขอบซ้าย ลบพื้นหลัง ลบเครื่องหมายคำพูด)
                    'prose-blockquote:text-center prose-blockquote:border-l-0 prose-blockquote:bg-transparent',
                    'prose-blockquote:before:content-none prose-blockquote:after:content-none',

                    // 2. เปลี่ยนฟอนต์ให้ใหญ่ หรูหรา และเอียง
                    'prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-2xl md:prose-blockquote:text-3xl prose-blockquote:leading-relaxed',

                    // 3. ใส่สีให้ตรงกับ Theme 
                    'prose-blockquote:text-[var(--theme-btn-bg)]',

                    // 4. ใส่เส้นประดับบน-ล่าง
                    'prose-blockquote:border-y-2 prose-blockquote:border-solid prose-blockquote:border-[var(--theme-btn-bg)]/40',

                    // 5. ปรับช่องไฟ
                    'prose-blockquote:py-8 prose-blockquote:my-10 prose-blockquote:px-6',

                    FONTS[0].id,
                ),
            },
        },
    });

    useEffect(() => {
        const draft = loadDraft();
        if (draft && editor) {
            if (draft.paperColor) setActivePaperColor(draft.paperColor as PaperColorType);
            if (draft.paperTexture) setTexture(draft.paperTexture as TextureType);
            if (draft.stickers && setStickers) setStickers(draft.stickers);

            // ✨ โหลด Theme แล้วส่งไปให้ page.tsx รับรู้
            if (draft.theme && onThemeChange) {
                onThemeChange(draft.theme);
            }

            if (draft.content && draft.content !== editor.getHTML()) {
                editor.commands.setContent(draft.content);
                setEditorContent(draft.content);
                onChange?.(draft.content);
            }
        } else if (!draft) {
            setActivePaperColor(defaultPaperColor);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

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

    useEffect(() => {
        if (!editor || !insertPrompt) return;

        editor
            .chain()
            .focus('end')
            .insertContent({
                type: 'paragraph',
                attrs: { textAlign: 'center' },
                content: [{ type: 'text', marks: [{ type: 'textStyle', attrs: { color: '#6B4C30', fontFamily: "'Noto Serif Thai', serif" } }], text: `✦  ${insertPrompt}  ✦` }]
            })
            .insertContent({ type: 'paragraph', content: [] })
            .focus('end')
            .run();

        if (onPromptInserted) onPromptInserted();
    }, [editor, insertPrompt, onPromptInserted]);

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