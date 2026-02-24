"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Type, Sticker, Layout,
    Link as LinkIcon, Image as ImageIcon,
    AlignLeft, AlignCenter, AlignRight, Highlighter, CaseSensitive, ChevronDown,
    Heading
} from 'lucide-react';

import { TextureType, MenuType, PaperColorType } from '../types';
import { ToolButton, Divider } from '../ui/ToolbarUI';
import { useRecentColors } from '../hooks/useRecentColors';

// Extracted Menus (Conceptual imports based on suggested architecture)
import { ColorMenu } from './menus/ColorMenu';
import { LinkMenu } from './menus/LinkMenu';
import { ImageMenu } from './menus/ImageMenu';
import { StickerMenu } from './menus/StickerMenu';
import { PaperMenu } from './menus/PaperMenu';
import { FontMenu } from './menus/FontMenu';
import { TypoMenu } from './menus/TypoMenu';
import { HighlightMenu } from './menus/HighlightMenu';

interface VintageToolbarProps {
    editor: Editor;
    texture: TextureType;
    setTexture: (t: TextureType) => void;
    paperColor: PaperColorType;
    setPaperColor: (c: PaperColorType) => void;
    addSticker: (content: string) => void;
}

export function VintageToolbar({ editor, texture, setTexture, paperColor, setPaperColor, addSticker }: VintageToolbarProps) {
    const [activeDropdown, setActiveDropdown] = useState<MenuType | null>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const currentColor = editor.getAttributes('textStyle')?.color || 'var(--theme-text-body)';
    const recentColors = useRecentColors(currentColor);

    // Sync Editor State efficiently
    useEffect(() => {
        const updateToolbar = () => setActiveDropdown((prev) => prev); // Force re-eval
        editor.on('transaction', updateToolbar);
        editor.on('selectionUpdate', updateToolbar);
        return () => {
            editor.off('transaction', updateToolbar);
            editor.off('selectionUpdate', updateToolbar);
        };
    }, [editor]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = useCallback((menu: MenuType) => {
        setActiveDropdown(prev => prev === menu ? null : menu);
    }, []);

    const getTypoIcon = () => {
        if (editor.isActive('heading', { level: 1 })) return <Heading1 size={18} />;
        if (editor.isActive('heading', { level: 2 })) return <Heading2 size={18} />;
        return <Heading size={18} />;
    };

    return (
        <div className="sticky top-0 z-50 w-full bg-[var(--theme-toolbar-bg)] backdrop-blur-md shadow-sm border-b border-[var(--theme-toolbar-border)] transition-colors duration-500" ref={toolbarRef}>
            <div className="flex items-center gap-1 md:gap-2 p-2 w-full overflow-x-auto scrollbar-hide max-w-4xl mx-auto relative">

                {/* Font & Typo */}
                <ToolButton onClick={() => toggleMenu('font')} isActive={activeDropdown === 'font'} icon={<div className="flex items-center gap-0.5"><CaseSensitive size={18} /><ChevronDown size={14} className="opacity-50" /></div>} />
                <ToolButton onClick={() => toggleMenu('typo')} isActive={activeDropdown === 'typo'} icon={<div className="flex items-center gap-0.5">{getTypoIcon()}<ChevronDown size={14} className="opacity-50" /></div>} />
                <Divider />

                {/* Marks */}
                <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={<UnderlineIcon size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={<Strikethrough size={18} />} />

                {/* Colors */}
                <ToolButton onClick={() => toggleMenu('color')} isActive={activeDropdown === 'color'} icon={
                    <div className="flex flex-col items-center justify-center gap-[2px]">
                        <span className="font-noto-sans text-[14px] leading-none font-bold">A</span>
                        <div className="w-3 h-[3px] rounded-full transition-colors" style={{ backgroundColor: currentColor }} />
                    </div>
                } />
                <ToolButton onClick={() => toggleMenu('highlight')} isActive={activeDropdown === 'highlight'} icon={<Highlighter size={18} />} />
                <Divider />

                {/* Alignment */}
                <ToolButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={18} />} />
                <Divider />

                {/* Inserts */}
                <ToolButton onClick={() => toggleMenu('link')} isActive={editor.isActive('link') || activeDropdown === 'link'} icon={<LinkIcon size={18} />} />
                <ToolButton onClick={() => toggleMenu('image')} isActive={editor.isActive('resizableImage') || editor.isActive('image') || activeDropdown === 'image'} icon={<ImageIcon size={18} />} />
                <Divider />

                {/* Decorations */}
                <ToolButton onClick={() => toggleMenu('sticker')} isActive={activeDropdown === 'sticker'} icon={<Sticker size={18} className={activeDropdown === 'sticker' ? "text-[var(--theme-icon)]" : ""} />} />
                <Divider />
                <ToolButton onClick={() => toggleMenu('paper')} isActive={activeDropdown === 'paper'} icon={<Layout size={18} />} />
            </div>

            {/* Render Menus declaratively based on state */}
            <div className="absolute top-full left-0 w-full max-w-4xl mx-auto flex justify-start pl-2 pointer-events-none">
                <div className="relative w-full pointer-events-auto">
                    <FontMenu isOpen={activeDropdown === 'font'} editor={editor} close={() => setActiveDropdown(null)} />
                    <TypoMenu isOpen={activeDropdown === 'typo'} editor={editor} close={() => setActiveDropdown(null)} />
                    <ColorMenu isOpen={activeDropdown === 'color'} editor={editor} currentColor={currentColor} recentColors={recentColors} close={() => setActiveDropdown(null)} />
                    <HighlightMenu isOpen={activeDropdown === 'highlight'} editor={editor} close={() => setActiveDropdown(null)} />
                    <LinkMenu isOpen={activeDropdown === 'link'} editor={editor} close={() => setActiveDropdown(null)} />
                    <ImageMenu isOpen={activeDropdown === 'image'} editor={editor} close={() => setActiveDropdown(null)} />
                    <StickerMenu isOpen={activeDropdown === 'sticker'} addSticker={addSticker} close={() => setActiveDropdown(null)} />
                    <PaperMenu isOpen={activeDropdown === 'paper'} texture={texture} setTexture={setTexture} paperColor={paperColor} setPaperColor={setPaperColor} close={() => setActiveDropdown(null)} />
                </div>
            </div>
        </div>
    );
}