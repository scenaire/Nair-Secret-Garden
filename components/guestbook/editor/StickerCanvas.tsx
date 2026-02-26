"use client";

import React from 'react';
import { Rnd } from 'react-rnd';
import { RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { StickerData } from './types';

interface StickerCanvasProps {
    stickers: StickerData[];
    activeStickerId: string | null;
    setActiveStickerId: (id: string | null) => void;
    updateSticker: (id: string, updates: Partial<StickerData>) => void;
    removeSticker: (id: string) => void;
    paperRef: React.RefObject<HTMLDivElement | null>;
}

export function StickerCanvas({
    stickers, activeStickerId, setActiveStickerId, updateSticker, removeSticker, paperRef
}: StickerCanvasProps) {
    return (
        <>
            {stickers.map((sticker) => {
                const isActive = activeStickerId === sticker.id;
                const parent = paperRef.current;
                const parentWidth = parent?.offsetWidth || 600;
                const parentHeight = parent?.offsetHeight || 800;

                const xPx = parentWidth * (sticker.xPercent / 100);
                const yPx = sticker.yPercent != null
                    ? parentHeight * (sticker.yPercent / 100)
                    : (sticker.yPx ?? 0);

                // ✨ แปลง widthPercent → pixel จริงๆ เพื่อให้ Rnd รู้ขนาด
                const widthPx = parentWidth * (sticker.widthPercent / 100);

                return (
                    <Rnd
                        key={sticker.id}
                        className={`sticker-node absolute z-20 ${isActive ? 'ring-1 ring-[#F2C6C2] ring-dashed bg-white/5' : ''}`}
                        position={{ x: xPx - widthPx / 2, y: yPx - widthPx / 2 }}
                        size={{ width: widthPx, height: widthPx }}
                        bounds="parent"
                        lockAspectRatio={true}
                        onDragStart={() => setActiveStickerId(sticker.id)}
                        onDragStop={(e, d) => {
                            const p = paperRef.current;
                            if (!p) return;
                            updateSticker(sticker.id, {
                                xPercent: ((d.x + widthPx / 2) / p.offsetWidth) * 100,
                                yPercent: ((d.y + widthPx / 2) / p.offsetHeight) * 100,
                            });
                        }}
                        onResizeStop={(e, dir, ref, delta, pos) => {
                            const p = paperRef.current;
                            if (!p) return;
                            const newWidthPx = ref.offsetWidth;
                            updateSticker(sticker.id, {
                                widthPercent: (newWidthPx / p.offsetWidth) * 100,
                                xPercent: ((pos.x + newWidthPx / 2) / p.offsetWidth) * 100,
                                yPercent: ((pos.y + newWidthPx / 2) / p.offsetHeight) * 100,
                            });
                        }}
                    >
                        {isActive && (
                            <div className="sticker-controls absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 border border-[#4A3B32]/10 shadow-md rounded-full p-1 z-50">
                                <button onClick={() => updateSticker(sticker.id, { rotation: sticker.rotation - 15 })} className="p-1.5 hover:bg-[#F0F7FA] rounded-full text-[#4A3B32]/70"><RotateCcw size={14} /></button>
                                <button onClick={() => updateSticker(sticker.id, { rotation: sticker.rotation + 15 })} className="p-1.5 hover:bg-[#F0F7FA] rounded-full text-[#4A3B32]/70"><RotateCw size={14} /></button>
                                <div className="w-px h-3 bg-[#4A3B32]/20 mx-0.5" />
                                <button onClick={() => removeSticker(sticker.id)} className="p-1.5 hover:bg-red-50 rounded-full text-red-400"><Trash2 size={14} /></button>
                            </div>
                        )}
                        {/* ✨ เปลี่ยนจาก SVG เป็น span เพื่อให้ขนาด emoji สัมพันธ์กับ container จริงๆ */}
                        <div
                            className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
                            style={{ transform: `rotate(${sticker.rotation}deg)`, transition: 'transform 0.2s ease' }}
                        >
                            <span style={{ fontSize: `${widthPx * 0.8}px`, lineHeight: 1 }} className="select-none">
                                {sticker.content}
                            </span>
                        </div>
                    </Rnd>
                );
            })}
        </>
    );
}