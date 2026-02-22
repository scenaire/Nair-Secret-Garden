// components/guestbook/editor/StickerCanvas.tsx
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
                return (
                    <Rnd
                        key={sticker.id}
                        className={`sticker-node absolute z-20 ${isActive ? 'ring-1 ring-[#F2C6C2] ring-dashed bg-white/5' : ''}`}
                        default={{
                            x: (paperRef.current?.offsetWidth || 600) * (sticker.xPercent / 100),
                            y: sticker.yPx,
                            width: `${sticker.widthPercent}%`,
                            height: 'auto'
                        }}
                        bounds="parent"
                        lockAspectRatio={true}
                        onDragStart={() => setActiveStickerId(sticker.id)}
                        onDragStop={(e, d) => {
                            const parent = paperRef.current;
                            if (!parent) return;
                            updateSticker(sticker.id, { xPercent: (d.x / parent.offsetWidth) * 100, yPx: d.y });
                        }}
                        onResizeStop={(e, dir, ref, delta, pos) => {
                            const parent = paperRef.current;
                            if (!parent) return;
                            updateSticker(sticker.id, {
                                widthPercent: (ref.offsetWidth / parent.offsetWidth) * 100,
                                xPercent: (pos.x / parent.offsetWidth) * 100,
                                yPx: pos.y
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
                        <div className="w-full h-full cursor-grab active:cursor-grabbing">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible" style={{ transform: `rotate(${sticker.rotation}deg)`, transition: 'transform 0.2s ease' }}>
                                <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="80" className="drop-shadow-sm">{sticker.content}</text>
                            </svg>
                        </div>
                    </Rnd>
                );
            })}
        </>
    );
}