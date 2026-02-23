// components/guestbook/editor/VintageToolbar.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Type, Sticker, Layout,
    GripHorizontal, Grid3X3, Link as LinkIcon,
    Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
    Highlighter, CaseSensitive, ChevronDown, Check,
    Trash2, Palette // ✨ เพิ่มไอคอน Palette
} from 'lucide-react';
import { TextureType } from './types';
import { ToolButton, Divider, Dropdown, MenuItem, ColorDot } from './ToolbarUI';
import { cn } from '@/lib/utils';
import { FONTS } from '@/styles/fontStyle';
import { INK_COLORS } from '@/styles/inkColors'; // ✨ อิมพอร์ตสีเข้ามา

interface VintageToolbarProps { editor: Editor | null; texture: TextureType; setTexture: (t: TextureType) => void; addSticker: (content: string) => void; }
const stickerPacks = { floral: ['🌸', '🌹', '🌻', '🌷', '🌺', '🌼'], cute: ['🧸', '🎀', '🍓', '🍰', '💌', '💖'], vintage: ['☕', '🕊️', '🕰️', '📜', '🗝️', '🕯️'] };
type MenuType = 'font' | 'typo' | 'highlight' | 'link' | 'image' | 'sticker' | 'paper' | 'color' | null; // ✨ เพิ่ม 'color'

export function VintageToolbar({ editor, texture, setTexture, addSticker }: VintageToolbarProps) {
    const [activeDropdown, setActiveDropdown] = useState<MenuType>(null);
    const [activeStickerTab, setActiveStickerTab] = useState<keyof typeof stickerPacks>('floral');
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const toolbarRef = useRef<HTMLDivElement>(null);
    const [, setRevision] = useState(0);

    // ✨ State สำหรับจำสี Custom
    const [recentColors, setRecentColors] = useState<string[]>([]);

    // ดึงค่าสีปัจจุบัน
    const currentColor = editor?.getAttributes('textStyle')?.color || '#4A3B32';

    // ✨ เวทมนตร์จำสี: ถ้าสีอยู่นิ่งๆ เกิน 0.5 วินาที และไม่ใช่สีมาตรฐาน ให้จำไว้!
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (currentColor) {
                const upperColor = currentColor.toUpperCase();
                const isStandardColor = INK_COLORS.map(c => c.toUpperCase()).includes(upperColor);

                if (!isStandardColor && upperColor !== '#4A3B32') {
                    setRecentColors(prev => {
                        const filtered = prev.filter(c => c !== upperColor); // ลบสีซ้ำเดิมออก (เพื่อดันขึ้นมาหน้าสุด)
                        return [upperColor, ...filtered].slice(0, 7); // จำสูงสุดแค่ 7 สี
                    });
                }
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [currentColor]);


    useEffect(() => {
        if (!editor) return;
        const updateToolbar = () => {
            setRevision(r => r + 1);
            if (editor.isActive('link')) setLinkUrl(editor.getAttributes('link').href || '');
            else if (activeDropdown !== 'link') setLinkUrl('');

            if (editor.isActive('resizableImage') || editor.isActive('image')) {
                const attrs = editor.getAttributes('resizableImage');
                setImageUrl(attrs.src || '');
            } else if (activeDropdown !== 'image') setImageUrl('');
        };

        editor.on('transaction', updateToolbar);
        editor.on('selectionUpdate', updateToolbar);
        return () => {
            editor.off('transaction', updateToolbar);
            editor.off('selectionUpdate', updateToolbar);
        };
    }, [editor, activeDropdown]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => { if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) setActiveDropdown(null); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!editor) return null;

    const toggleDropdown = (menu: MenuType) => setActiveDropdown(activeDropdown === menu ? null : menu);

    const handleSetLink = () => {
        if (linkUrl === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
        else editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        setActiveDropdown(null);
    };

    const handleRemoveLink = () => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); setActiveDropdown(null); setLinkUrl(''); };

    const handleSetImage = () => {
        if (imageUrl) {
            if (editor.isActive('resizableImage')) editor.commands.updateAttributes('resizableImage', { src: imageUrl });
            else editor.chain().focus().setResizableImage({ src: imageUrl }).run();
        }
        setActiveDropdown(null);
    };

    const handleRemoveImage = () => { editor.chain().focus().deleteSelection().run(); setActiveDropdown(null); setImageUrl(''); };

    const getTypoIcon = () => {
        if (editor.isActive('heading', { level: 1 })) return <Heading1 size={18} />;
        if (editor.isActive('heading', { level: 2 })) return <Heading2 size={18} />;
        return <Type size={18} />;
    };

    const isEditingLink = editor.isActive('link');
    const isEditingImage = editor.isActive('resizableImage');


    return (
        <div className="sticky top-0 z-50 w-full bg-[#FFFDF9]/95 backdrop-blur-md shadow-sm border-b border-[#F2C6C2]/30" ref={toolbarRef}>

            <div className="flex items-center gap-1 md:gap-2 p-2 w-full overflow-x-auto scrollbar-hide max-w-4xl mx-auto relative">

                <ToolButton onClick={() => toggleDropdown('font')} isActive={activeDropdown === 'font'} icon={<div className="flex items-center gap-0.5"><CaseSensitive size={18} /><ChevronDown size={14} className="opacity-50" /></div>} />


                <ToolButton onClick={() => toggleDropdown('typo')} isActive={activeDropdown === 'typo'} icon={<div className="flex items-center gap-0.5">{getTypoIcon()}<ChevronDown size={14} className="opacity-50" /></div>} />
                <Divider />

                <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={<UnderlineIcon size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={<Strikethrough size={18} />} />

                {/* ✨ ปุ่มเลือกสีหมึก (โชว์เส้นใต้ตามสีปัจจุบัน) */}
                <ToolButton
                    onClick={() => toggleDropdown('color')}
                    isActive={activeDropdown === 'color'}
                    icon={
                        <div className="flex flex-col items-center justify-center gap-[2px]">
                            <span className="font-noto-sans text-[14px] leading-none font-bold">A</span>
                            <div className="w-3 h-[3px] rounded-full transition-colors" style={{ backgroundColor: currentColor }} />
                        </div>
                    }
                />

                <ToolButton onClick={() => toggleDropdown('highlight')} isActive={activeDropdown === 'highlight'} icon={<div className="flex items-center gap-0.5"><Highlighter size={18} /></div>} />
                <Divider />

                <ToolButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={18} />} />
                <ToolButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={18} />} />
                <Divider />

                <ToolButton onClick={() => { toggleDropdown('link'); if (!isEditingLink) setLinkUrl(''); }} isActive={editor.isActive('link') || activeDropdown === 'link'} icon={<LinkIcon size={18} />} />
                <ToolButton onClick={() => { toggleDropdown('image'); if (!isEditingImage) setImageUrl(''); }} isActive={editor.isActive('resizableImage') || editor.isActive('image') || activeDropdown === 'image'} icon={<ImageIcon size={18} />} />
                <Divider />

                <ToolButton onClick={() => toggleDropdown('sticker')} isActive={activeDropdown === 'sticker'} icon={<Sticker size={18} className={activeDropdown === 'sticker' ? "text-[#F2C6C2]" : ""} />} />
                <Divider />

                <ToolButton onClick={() => toggleDropdown('paper')} isActive={activeDropdown === 'paper'} icon={<Layout size={18} />} />

            </div>

            <div className="absolute top-full left-0 w-full max-w-4xl mx-auto flex justify-start pl-2 pointer-events-none">
                <div className="relative w-full pointer-events-auto">

                    <Dropdown isOpen={activeDropdown === 'font'} className="left-0 w-[200px]">
                        {FONTS.map((font) => (
                            <MenuItem key={font.id} onClick={() => { editor.chain().focus().setFontFamily(font.value).run(); setActiveDropdown(null); }} isActive={editor.isActive('textStyle', { fontFamily: font.value })} label={font.name} className={font.id} />
                        ))}
                    </Dropdown>

                    <Dropdown isOpen={activeDropdown === 'typo'} className="left-10 w-[160px]">
                        <MenuItem onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setActiveDropdown(null); }} isActive={editor.isActive('heading', { level: 1 })} icon={<Heading1 size={16} />} label="Heading 1" />
                        <MenuItem onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setActiveDropdown(null); }} isActive={editor.isActive('heading', { level: 2 })} icon={<Heading2 size={16} />} label="Heading 2" />
                        <MenuItem onClick={() => { editor.chain().focus().setParagraph().run(); setActiveDropdown(null); }} isActive={editor.isActive('paragraph')} icon={<Type size={16} />} label="Normal Text" />
                    </Dropdown>

                    {/* ✨ เมนู Dropdown เลือกสีหมึก 20+1 สี + Recent */}
                    <Dropdown isOpen={activeDropdown === 'color'} className="left-[15%] md:left-[25%] w-[210px] p-3">
                        {/* 20 สีพื้นฐาน */}
                        <div className="grid grid-cols-5 gap-2 mb-2">
                            {INK_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => { editor.chain().focus().setColor(color).run(); setActiveDropdown(null); }}
                                    className={cn(
                                        "w-6 h-6 rounded-full border border-black/10 transition-transform",
                                        currentColor.toUpperCase() === color.toUpperCase() ? "scale-125 shadow-sm border-white" : "hover:scale-110"
                                    )}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>

                        {/* เครื่องมือเลือกสีอิสระ & รีเซ็ต */}
                        <div className="flex items-center justify-between border-t border-[#4A3B32]/10 pt-2 mt-2">
                            <label className="text-xs font-noto-sans text-[#4A3B32]/70 cursor-pointer flex items-center gap-1 hover:text-[#4A3B32] transition-colors relative overflow-hidden group">
                                <Palette size={14} className="group-hover:scale-110 transition-transform" /> Custom
                                <input
                                    type="color"
                                    value={currentColor}
                                    onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                />
                            </label>
                            <button onClick={() => { editor.chain().focus().unsetColor().run(); setActiveDropdown(null); }} className="text-[10px] text-[#4A3B32]/50 hover:text-[#4A3B32] underline">Reset</button>
                        </div>

                        {/* ✨ โซน History (โชว์เฉพาะตอนที่มีสีที่จำไว้) */}
                        {recentColors.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-[#4A3B32]/10">
                                <p className="text-[10px] text-[#4A3B32]/50 mb-1.5 font-noto-sans uppercase tracking-wider">Recent</p>
                                <div className="flex gap-2 flex-wrap">
                                    {recentColors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => { editor.chain().focus().setColor(color).run(); setActiveDropdown(null); }}
                                            className={cn(
                                                "w-5 h-5 rounded-full border border-black/10 transition-transform",
                                                currentColor.toUpperCase() === color ? "scale-125 shadow-sm border-white" : "hover:scale-110"
                                            )}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Dropdown>

                    <Dropdown isOpen={activeDropdown === 'highlight'} className="left-[25%] md:left-[40%] flex flex-row gap-3 p-3">
                        <ColorDot onClick={() => { editor.chain().focus().toggleHighlight({ color: '#FDE68A' }).run(); setActiveDropdown(null); }} isActive={editor.isActive('highlight', { color: '#FDE68A' })} color="bg-yellow-200" />
                        <ColorDot onClick={() => { editor.chain().focus().toggleHighlight({ color: '#FBCFE8' }).run(); setActiveDropdown(null); }} isActive={editor.isActive('highlight', { color: '#FBCFE8' })} color="bg-pink-200" />
                        <ColorDot onClick={() => { editor.chain().focus().toggleHighlight({ color: '#BBF7D0' }).run(); setActiveDropdown(null); }} isActive={editor.isActive('highlight', { color: '#BBF7D0' })} color="bg-green-200" />
                        <ColorDot onClick={() => { editor.chain().focus().toggleHighlight({ color: '#BFDBFE' }).run(); setActiveDropdown(null); }} isActive={editor.isActive('highlight', { color: '#BFDBFE' })} color="bg-blue-200" />
                        <button onClick={() => { editor.chain().focus().unsetHighlight().run(); setActiveDropdown(null); }} className="w-6 h-6 rounded-full border border-[#4A3B32]/10 flex items-center justify-center text-[10px] text-[#4A3B32]/50 hover:bg-[#4A3B32]/5">✕</button>
                    </Dropdown>

                    <Dropdown isOpen={activeDropdown === 'link'} className="left-[30%] md:left-[45%] w-[300px] p-2 flex items-center gap-2">
                        <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1 text-sm py-1.5 px-3 border-none bg-[#FFFDF9] text-[#4A3B32] focus:outline-none placeholder:text-[#4A3B32]/30" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSetLink()} />
                        <div className="flex gap-1">
                            {isEditingLink && <button onClick={handleRemoveLink} className="p-1.5 bg-red-100/50 text-red-500 rounded-md hover:bg-red-100 transition-colors" title="Remove Link"><Trash2 size={16} /></button>}
                            <button onClick={handleSetLink} className="p-1.5 bg-[#F2C6C2]/20 text-[#4A3B32] rounded-md hover:bg-[#F2C6C2]/40 transition-colors" title={isEditingLink ? "Update" : "Add"}><Check size={16} /></button>
                        </div>
                    </Dropdown>

                    <Dropdown isOpen={activeDropdown === 'image'} className="left-[40%] md:left-[50%] w-[300px] p-2 flex items-center gap-2">
                        <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL..." className="flex-1 text-sm py-1.5 px-3 border-none bg-[#FFFDF9] text-[#4A3B32] focus:outline-none placeholder:text-[#4A3B32]/30" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSetImage()} />
                        <div className="flex gap-1">
                            {isEditingImage && <button onClick={handleRemoveImage} className="p-1.5 bg-red-100/50 text-red-500 rounded-md hover:bg-red-100 transition-colors" title="Delete Image"><Trash2 size={16} /></button>}
                            <button onClick={handleSetImage} className="p-1.5 bg-[#BCD7E6]/30 text-[#4A3B32] rounded-md hover:bg-[#BCD7E6]/50 transition-colors" title={isEditingImage ? "Update" : "Add"}><Check size={16} /></button>
                        </div>
                    </Dropdown>

                    <Dropdown isOpen={activeDropdown === 'sticker'} className="right-5 sm:left-[60%] w-[280px] p-3">
                        <div className="flex gap-2 mb-3 border-b border-[#4A3B32]/10 pb-2">
                            <button onClick={() => setActiveStickerTab('floral')} className={cn("text-xs font-noto-sans px-2 py-1 rounded", activeStickerTab === 'floral' ? "bg-[#F2C6C2]/20 text-[#4A3B32]" : "text-[#4A3B32]/50 hover:bg-gray-50")}>Floral</button>
                            <button onClick={() => setActiveStickerTab('cute')} className={cn("text-xs font-noto-sans px-2 py-1 rounded", activeStickerTab === 'cute' ? "bg-[#F2C6C2]/20 text-[#4A3B32]" : "text-[#4A3B32]/50 hover:bg-gray-50")}>Cute</button>
                            <button onClick={() => setActiveStickerTab('vintage')} className={cn("text-xs font-noto-sans px-2 py-1 rounded", activeStickerTab === 'vintage' ? "bg-[#F2C6C2]/20 text-[#4A3B32]" : "text-[#4A3B32]/50 hover:bg-gray-50")}>Vintage</button>
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