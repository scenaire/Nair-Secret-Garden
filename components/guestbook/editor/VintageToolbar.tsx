// components/guestbook/editor/VintageToolbar.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Type, Sticker, Layout,
    GripHorizontal, Grid3X3, Link as LinkIcon,
    Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
    Highlighter, CaseSensitive, ChevronDown, Check
} from 'lucide-react';
import { TextureType } from './types';
import { ToolButton, Divider, Dropdown, MenuItem, ColorDot } from './ToolbarUI';
import { cn } from '@/lib/utils';
import { FONTS } from '@/styles/fontStyle';

interface VintageToolbarProps { editor: Editor | null; texture: TextureType; setTexture: (t: TextureType) => void; addSticker: (content: string) => void; }
const stickerPacks = { floral: ['🌸', '🌹', '🌻', '🌷', '🌺', '🌼'], cute: ['🧸', '🎀', '🍓', '🍰', '💌', '💖'], vintage: ['☕', '🕊️', '🕰️', '📜', '🗝️', '🕯️'] };
type MenuType = 'font' | 'typo' | 'highlight' | 'link' | 'image' | 'sticker' | 'paper' | null;

export function VintageToolbar({ editor, texture, setTexture, addSticker }: VintageToolbarProps) {
    const [activeDropdown, setActiveDropdown] = useState<MenuType>(null);
    const [activeStickerTab, setActiveStickerTab] = useState<keyof typeof stickerPacks>('floral');
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const toolbarRef = useRef<HTMLDivElement>(null);
    const [, setRevision] = useState(0); // สร้าง state ดัมมี่ไว้สะกิดให้อัปเดต
    useEffect(() => {
        if (!editor) return;

        // สั่งให้อัปเดต UI ทุกครั้งที่มีการขยับเคอร์เซอร์ หรือแก้ไขข้อความ
        const updateToolbar = () => setRevision(r => r + 1);

        editor.on('transaction', updateToolbar);
        editor.on('selectionUpdate', updateToolbar);

        return () => {
            editor.off('transaction', updateToolbar);
            editor.off('selectionUpdate', updateToolbar);
        };
    }, [editor]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => { if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) setActiveDropdown(null); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!editor) return null;

    const toggleDropdown = (menu: MenuType) => setActiveDropdown(activeDropdown === menu ? null : menu);

    const handleSetLink = () => {
        if (linkUrl === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); }
        else { editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run(); }
        setActiveDropdown(null); setLinkUrl('');
    };

    const handleSetImage = () => {
        if (imageUrl) {
            editor.chain().focus().setResizableImage({ src: imageUrl }).run();
        }
        setActiveDropdown(null); setImageUrl('');
    };

    // ✨ ฟังก์ชันเพื่อดึงไอคอน Typo ปัจจุบัน
    const getTypoIcon = () => {
        if (editor.isActive('heading', { level: 1 })) return <Heading1 size={18} />; // ปรับขนาดให้เท่ากัน (18)
        if (editor.isActive('heading', { level: 2 })) return <Heading2 size={18} />;
        return <Type size={18} />;
    };

    return (
        <div className="sticky top-0 z-50 w-full bg-[#FFFDF9]/95 backdrop-blur-md shadow-sm border-b border-[#4A3B32]/10" ref={toolbarRef}>

            <div className="p-2 flex items-center justify-start overflow-x-auto no-scrollbar gap-1 w-full max-w-4xl mx-auto relative">

                {/* 1. FONT (ปรับขนาดไอคอนและ Flexbox ให้เป๊ะ) */}
                <ToolButton
                    onClick={() => toggleDropdown('font')}
                    isActive={activeDropdown === 'font'}
                    icon={<div className="flex items-center gap-0.5"><CaseSensitive size={18} /><ChevronDown size={14} className="opacity-50" /></div>}
                />
                <Divider />

                {/* 2. TYPO (Dynamic Icon) */}
                <ToolButton
                    onClick={() => toggleDropdown('typo')}
                    isActive={editor.isActive('heading', { level: 1 }) || editor.isActive('heading', { level: 2 })}
                    icon={<div className="flex items-center gap-0.5">{getTypoIcon()}<ChevronDown size={14} className="opacity-50" /></div>}
                />
                <Divider />

                {/* 3. FORMATTING (ปรับขนาดให้สม่ำเสมอเป็น 18) */}
                <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={<UnderlineIcon size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={<Strikethrough size={18} />} />
                <Divider />

                {/* 4. ALIGNMENT */}
                <ToolButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={18} />} />
                <Divider />

                {/* 5. HIGHLIGHT */}
                <ToolButton
                    onClick={() => toggleDropdown('highlight')}
                    isActive={editor.isActive('highlight')}
                    icon={<div className="flex items-center gap-0.5"><Highlighter size={18} /><ChevronDown size={14} className="opacity-50" /></div>}
                />
                <Divider />

                {/* 6. LINK (ปรับขนาด) */}
                <ToolButton onClick={() => { toggleDropdown('link'); setLinkUrl(editor.getAttributes('link').href || ''); }} isActive={editor.isActive('link') || activeDropdown === 'link'} icon={<LinkIcon size={18} />} />

                {/* 7. IMAGE (ปรับขนาด) */}
                <ToolButton onClick={() => toggleDropdown('image')} isActive={editor.isActive('image') || activeDropdown === 'image'} icon={<ImageIcon size={18} />} />
                <Divider />

                {/* 8. STICKER (ปรับขนาด) */}
                <ToolButton onClick={() => toggleDropdown('sticker')} isActive={activeDropdown === 'sticker'} icon={<Sticker size={18} className={activeDropdown === 'sticker' ? "text-[#F2C6C2]" : ""} />} />
                <Divider />

                {/* 9. PAPER (ปรับขนาด) */}
                <ToolButton onClick={() => toggleDropdown('paper')} isActive={activeDropdown === 'paper'} icon={<Layout size={18} />} />

            </div>

            {/* ✨ พื้นที่ลอยตัว (Dropdown Area) */}
            <div className="absolute top-full left-0 w-full max-w-4xl mx-auto flex justify-start pl-2 pointer-events-none">

                <div className="relative w-full pointer-events-auto">

                    <Dropdown isOpen={activeDropdown === 'font'} className="left-0 w-[200px]">
                        {/* ✨ Map ข้อมูลจาก FONTS มาสร้างเป็นปุ่ม MenuItem อัตโนมัติ */}
                        {FONTS.map((font) => (
                            <MenuItem
                                key={font.id}
                                onClick={() => {
                                    editor.chain().focus().setFontFamily(font.value).run();
                                    setActiveDropdown(null);
                                }}
                                isActive={editor.isActive('textStyle', { fontFamily: font.value })}
                                label={font.name}
                                className={font.id} // ใส่คลาสเช่น font-anuphan เพื่อให้แสดงผลล่วงหน้า (Preview) ในเมนู
                            />
                        ))}
                    </Dropdown>

                    <Dropdown isOpen={activeDropdown === 'typo'} className="left-10 w-[160px]">
                        <MenuItem onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setActiveDropdown(null); }} isActive={editor.isActive('heading', { level: 1 })} icon={<Heading1 size={16} />} label="Heading 1" />
                        <MenuItem onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setActiveDropdown(null); }} isActive={editor.isActive('heading', { level: 2 })} icon={<Heading2 size={16} />} label="Heading 2" />
                        <MenuItem onClick={() => { editor.chain().focus().setParagraph().run(); setActiveDropdown(null); }} isActive={editor.isActive('paragraph')} icon={<Type size={16} />} label="Normal Text" />
                    </Dropdown>

                    <Dropdown isOpen={activeDropdown === 'highlight'} className="left-[40%] flex flex-row gap-3 p-3">
                        <ColorDot onClick={() => { editor.chain().focus().toggleHighlight({ color: '#FDE68A' }).run(); setActiveDropdown(null); }} isActive={editor.isActive('highlight', { color: '#FDE68A' })} color="bg-yellow-200" />
                        <ColorDot onClick={() => { editor.chain().focus().toggleHighlight({ color: '#FBCFE8' }).run(); setActiveDropdown(null); }} isActive={editor.isActive('highlight', { color: '#FBCFE8' })} color="bg-pink-200" />
                        <ColorDot onClick={() => { editor.chain().focus().toggleHighlight({ color: '#BBF7D0' }).run(); setActiveDropdown(null); }} isActive={editor.isActive('highlight', { color: '#BBF7D0' })} color="bg-green-200" />
                        <ColorDot onClick={() => { editor.chain().focus().toggleHighlight({ color: '#BFDBFE' }).run(); setActiveDropdown(null); }} isActive={editor.isActive('highlight', { color: '#BFDBFE' })} color="bg-blue-200" />
                        <button onClick={() => { editor.chain().focus().unsetHighlight().run(); setActiveDropdown(null); }} className="w-6 h-6 rounded-full border border-[#4A3B32]/10 flex items-center justify-center text-[10px] text-[#4A3B32]/50 hover:bg-[#4A3B32]/5">✕</button>
                    </Dropdown>

                    {/* ✨ แก้ไข Dropdown ของ Link & Image (ให้คล้าย Highlight) */}
                    <Dropdown isOpen={activeDropdown === 'link'} className="left-[45%] w-[260px] p-2 flex items-center gap-2">
                        <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1 text-sm py-1.5 px-3 border-none bg-[#FFFDF9] text-[#4A3B32] focus:outline-none placeholder:text-[#4A3B32]/30" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSetLink()} />
                        <button onClick={handleSetLink} className="p-1.5 bg-[#F2C6C2]/20 text-[#4A3B32] rounded-md hover:bg-[#F2C6C2]/40 transition-colors"><Check size={16} /></button>
                    </Dropdown>

                    <Dropdown isOpen={activeDropdown === 'image'} className="left-[50%] w-[260px] p-2 flex items-center gap-2">
                        <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL..." className="flex-1 text-sm py-1.5 px-3 border-none bg-[#FFFDF9] text-[#4A3B32] focus:outline-none placeholder:text-[#4A3B32]/30" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSetImage()} />
                        <button onClick={handleSetImage} className="p-1.5 bg-[#BCD7E6]/30 text-[#4A3B32] rounded-md hover:bg-[#BCD7E6]/50 transition-colors"><Check size={16} /></button>
                    </Dropdown>

                    <Dropdown isOpen={activeDropdown === 'sticker'} className="right-10 sm:left-[60%] w-[280px] p-3">
                        <div className="flex gap-2 mb-3 border-b border-[#4A3B32]/10 pb-2">
                            <button onClick={() => setActiveStickerTab('floral')} className={cn("text-xs font-serif px-2 py-1 rounded", activeStickerTab === 'floral' ? "bg-[#F2C6C2]/20 text-[#4A3B32]" : "text-[#4A3B32]/50 hover:bg-gray-50")}>Floral</button>
                            <button onClick={() => setActiveStickerTab('cute')} className={cn("text-xs font-serif px-2 py-1 rounded", activeStickerTab === 'cute' ? "bg-[#F2C6C2]/20 text-[#4A3B32]" : "text-[#4A3B32]/50 hover:bg-gray-50")}>Cute</button>
                            <button onClick={() => setActiveStickerTab('vintage')} className={cn("text-xs font-serif px-2 py-1 rounded", activeStickerTab === 'vintage' ? "bg-[#F2C6C2]/20 text-[#4A3B32]" : "text-[#4A3B32]/50 hover:bg-gray-50")}>Vintage</button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {stickerPacks[activeStickerTab].map(emoji => (
                                <button key={emoji} onClick={() => { addSticker(emoji); setActiveDropdown(null); }} className="text-3xl hover:scale-125 transition-transform p-1">{emoji}</button>
                            ))}
                        </div>
                    </Dropdown>

                    <Dropdown isOpen={activeDropdown === 'paper'} className="right-0 sm:left-[70%] w-[160px]">
                        <MenuItem onClick={() => { setTexture('plain'); setActiveDropdown(null); }} isActive={texture === 'plain'} icon={<div className="w-4 h-4 rounded border border-[#4A3B32]/30 bg-[#FFFDF9]" />} label="Plain" />
                        <MenuItem onClick={() => { setTexture('dotted'); setActiveDropdown(null); }} isActive={texture === 'dotted'} icon={<GripHorizontal size={16} />} label="Dotted" />
                        <MenuItem onClick={() => { setTexture('vintage-grid'); setActiveDropdown(null); }} isActive={texture === 'vintage-grid'} icon={<Grid3X3 size={16} />} label="Grid" />
                    </Dropdown>

                </div>
            </div>

        </div>
    );
}