"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PAPER_COLORS, TEXTURE_STYLES, PAPER_LINK_COLORS, THEMES, ThemeKey } from '@/components/guestbook/editor/constants';
import { FONTS } from '@/components/guestbook/editor/styles/fontStyle';
import { StampCard } from '@/components/ui/StampCard';

export function MyGuestbookPage({ data, onEdit }: { data: any, onEdit: () => void }) {
    if (!data) return null;

    const themeKey = data.theme || 'cream';
    const paperColorKey = (data.paper_color || data.paperColor || 'cream') as keyof typeof PAPER_COLORS;
    const paperTextureKey = (data.paper_texture || data.paperTexture || 'plain') as keyof typeof TEXTURE_STYLES;
    const canvasWidth = data.canvas_width || data.canvasWidth;
    const canvasHeight = data.canvas_height || data.canvasHeight;
    const authorAlias = data.author_alias || data.authorAlias;

    const theme = THEMES[themeKey as ThemeKey] || THEMES['cream'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="w-full flex flex-col items-center gap-8"
            style={theme.cssVars as React.CSSProperties}
        >
            <div className="w-full overflow-x-auto custom-scrollbar pb-6 px-2 sm:px-0">
                <div
                    className="relative mx-auto rounded-xl shadow-[var(--shadow-soft)] border-2 border-[#E8DCC4]/50 overflow-hidden shrink-0 bg-[#FDFCF0]"
                    style={{ width: canvasWidth ? `${canvasWidth}px` : '100%' }}
                >
                    <div
                        className={cn(
                            "w-full h-full relative transition-colors duration-500",
                            PAPER_COLORS[paperColorKey]
                        )}
                        style={{
                            ...TEXTURE_STYLES[paperTextureKey],
                            '--theme-text-link': PAPER_LINK_COLORS[paperColorKey as keyof typeof PAPER_LINK_COLORS],
                            minHeight: canvasHeight ? `${canvasHeight}px` : '500px',
                        } as React.CSSProperties}
                    >
                        {/* ✨ เพิ่ม tiptap class เพื่อให้ CSS ใน globals.css ทำงานเหมือนใน editor */}
                        <div
                            className={cn(
                                'tiptap prose prose-sm max-w-none w-full min-h-[500px] p-8 md:p-12 pb-48',
                                'leading-[2.5rem] text-[#4A3B32]',
                                'prose-headings:font-serif',
                                '[&_[style*="center"]]:text-center [&_[style*="right"]]:text-right [&_[style*="left"]]:text-left',
                                '[&_[style*="center"]_img]:mx-auto [&_[style*="center"]_img]:block',
                                // ✨ รูปที่ style อยู่บน img โดยตรง (จาก Tiptap ResizableImage เก่า)
                                '[&_img[style*="center"]]:mx-auto [&_img[style*="center"]]:block [&_img[style*="center"]]:text-center',
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

                        {/* ✨ sticker */}
                        {data.stickers?.map((sticker: any) => {
                            const x = sticker.x_position ?? sticker.xPercent ?? 0;
                            const y = sticker.y_position ?? sticker.yPercent ?? 0;
                            const scale = sticker.scale ?? sticker.widthPercent ?? 25;
                            const type = sticker.sticker_type ?? sticker.content;
                            const rot = sticker.rotation ?? 0;
                            const isImage = typeof type === 'string' && (type.includes('/') || type.startsWith('data:'));

                            // ✨ คำนวณ widthPx จาก canvasWidth ที่เซฟไว้ เพื่อให้ขนาดตรงกับ editor
                            const resolvedCanvasWidth = canvasWidth || 700;
                            const widthPx = resolvedCanvasWidth * (scale / 100);

                            return (
                                <div
                                    key={sticker.id}
                                    className="absolute pointer-events-none drop-shadow-sm flex items-center justify-center"
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`,
                                        width: `${scale}%`,
                                        height: `${scale}%`,
                                        transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                                        zIndex: 10,
                                    }}
                                >
                                    {isImage ? (
                                        <img
                                            src={type}
                                            alt="sticker"
                                            className="w-full h-auto"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        // ✨ ใช้ font-size เป็น pixel เหมือนใน StickerCanvas
                                        <span style={{ fontSize: `${widthPx * 0.8}px`, lineHeight: 1 }} className="select-none">
                                            {type}
                                        </span>
                                    )}
                                </div>
                            );
                        })}

                    </div>
                </div>
            </div>

            <StampCard bgColor="var(--theme-btn-bg, #C49BAA)" teethRadius={7} teethDensity={0.9} borderColor="rgba(155,107,126,0.3)">
                <button
                    onClick={onEdit}
                    className="px-6 py-3 font-serif text-lg font-bold tracking-widest text-[var(--theme-accent-text)] transition-transform hover:scale-105"
                >
                    Touch up your page
                </button>
            </StampCard>
        </motion.div>
    );
}