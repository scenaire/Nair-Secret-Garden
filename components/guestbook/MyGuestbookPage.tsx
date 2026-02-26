"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PAPER_COLORS, TEXTURE_STYLES, PAPER_LINK_COLORS, THEMES, ThemeKey } from '@/components/guestbook/editor/constants';
import { FONTS } from '@/components/guestbook/editor/styles/fontStyle';
import { StampCard } from '@/components/ui/StampCard';

export function MyGuestbookPage({ data, onEdit }: { data: any, onEdit: () => void }) {
    if (!data) return null;

    const theme = THEMES[data.theme as ThemeKey] || THEMES['cream'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="w-full flex flex-col items-center gap-8"
            style={theme.cssVars as React.CSSProperties}
        >
            <div
                className="relative mx-auto rounded-xl shadow-[var(--shadow-soft)] border-2 border-[#E8DCC4]/50 overflow-hidden"
                style={{
                    width: data.canvasWidth ? `${data.canvasWidth}px` : '100%',
                    maxWidth: '100%',
                }}
            >
                <div
                    className={cn(
                        "w-full min-h-[500px] p-8 md:p-12 relative",
                        PAPER_COLORS[data.paperColor as keyof typeof PAPER_COLORS]
                    )}
                    style={{
                        ...TEXTURE_STYLES[data.paperTexture as keyof typeof TEXTURE_STYLES],
                        '--theme-text-link': PAPER_LINK_COLORS[data.paperColor as keyof typeof PAPER_LINK_COLORS],
                        height: data.canvasHeight ? `${data.canvasHeight}px` : 'auto',
                    } as React.CSSProperties}
                >
                    {/* ✨ ใช้ class เดียวกับ editor เป๊ะๆ เพื่อให้ render เหมือนกัน */}
                    <div
                        className={cn(
                            // base — ตรงกับ editorProps ใน ModernEditor
                            'prose prose-sm max-w-none w-full min-h-[500px] p-8 md:p-12 pb-48',
                            'leading-[2.5rem] text-[#4A3B32]',

                            // headings — Tiptap เซฟ color ไว้เป็น inline style
                            // prose จะไม่ override inline style ดังนั้น heading จะใช้สีจาก mark ของ Tiptap เองถูกต้อง
                            'prose-headings:font-serif',

                            // image alignment จาก Tiptap textAlign
                            '[&_[style*="text-align: center"]]:text-center',
                            '[&_[style*="text-align: right"]]:text-right',
                            '[&_[style*="text-align: left"]]:text-left',
                            '[&_[style*="text-align: center"]_img]:mx-auto',
                            '[&_[style*="text-align: center"]_img]:block',

                            // blockquote — ตรงกับ editor
                            'prose-blockquote:text-center prose-blockquote:border-l-0 prose-blockquote:bg-transparent',
                            'prose-blockquote:before:content-none prose-blockquote:after:content-none',
                            'prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-2xl md:prose-blockquote:text-3xl prose-blockquote:leading-relaxed',
                            'prose-blockquote:text-[var(--theme-btn-bg)]',
                            'prose-blockquote:border-y-2 prose-blockquote:border-solid prose-blockquote:border-[var(--theme-btn-bg)]/40',
                            'prose-blockquote:py-8 prose-blockquote:my-10 prose-blockquote:px-6',

                            FONTS[0].id,
                        )}
                        dangerouslySetInnerHTML={{ __html: data.content }}
                    />

                    {/* sticker */}
                    {data.stickers?.map((sticker: any) => (
                        <div
                            key={sticker.id}
                            className="absolute pointer-events-none drop-shadow-sm"
                            style={{
                                left: `${sticker.xPercent}%`,
                                top: `${sticker.yPercent ?? sticker.yPx}${sticker.yPercent != null ? '%' : 'px'}`,
                                width: `${sticker.widthPercent}%`,
                                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                                zIndex: 10,
                            }}
                        >
                            <img
                                src={sticker.content}
                                alt="sticker"
                                className="w-full h-auto"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    ))}

                    <div className="mt-16 text-right font-serif italic text-[var(--theme-text-body)]/70">
                        With love, <br />
                        <span className="text-xl text-[var(--theme-text-body)]">{data.authorAlias}</span>
                    </div>
                </div>
            </div>

            <StampCard bgColor="var(--theme-btn-bg, #C49BAA)" teethRadius={7} teethDensity={0.9} borderColor="rgba(155,107,126,0.3)">
                <button
                    onClick={onEdit}
                    className="px-6 py-3 font-serif text-sm tracking-widest text-white transition-transform hover:scale-105"
                >
                    Touch up your page 🎨
                </button>
            </StampCard>
        </motion.div>
    );
}