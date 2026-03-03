import React, { useState } from 'react';
import Image from 'next/image';
import { Dropdown } from '../../ui/ToolbarUI';
import { STICKER_PACKS, TWITCH_STICKERS } from '../../constants';
import { StickerData } from '../../types';
import { cn } from '@/lib/utils';

interface StickerMenuProps {
    isOpen: boolean;
    // เปลี่ยน signature: รับ StickerData บางส่วนแทน string เดิม
    addSticker: (sticker: Pick<StickerData, 'content' | 'type' | 'src'>) => void;
    close: () => void;
}

type EmojiTab = keyof typeof STICKER_PACKS;
type StickerTab = EmojiTab | 'twitch';

const ALL_TABS: StickerTab[] = ['twitch', ...(Object.keys(STICKER_PACKS) as EmojiTab[])];

export const StickerMenu: React.FC<StickerMenuProps> = ({ isOpen, addSticker, close }) => {
    const [activeTab, setActiveTab] = useState<StickerTab>('twitch');

    return (
        <Dropdown isOpen={isOpen} className="right-5 sm:left-[60%] w-[280px] p-3">
            {/* Tabs */}
            <div className="flex gap-2 mb-3 border-b border-[#4A3B32]/10 pb-2 flex-wrap">
                {ALL_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "text-xs font-noto-sans px-2 py-1 rounded capitalize transition-colors",
                            activeTab === tab
                                ? "bg-[#F2C6C2]/20 text-[#4A3B32] font-medium"
                                : "text-[#4A3B32]/50 hover:bg-gray-50"
                        )}
                        type="button"
                    >
                        {tab === 'twitch' ? '✦ cnairs' : tab}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-2">
                {activeTab === 'twitch'
                    ? TWITCH_STICKERS.map((s) => (
                        <button
                            key={s.name}
                            onClick={() => {
                                addSticker({ content: s.name, type: 'image', src: s.src });
                                close();
                            }}
                            className="hover:scale-125 transition-transform p-1 flex items-center justify-center"
                            type="button"
                            title={s.name}
                        >
                            <Image
                                src={s.src}
                                alt={s.name}
                                width={48}
                                height={48}
                                className="w-10 h-10 object-contain"
                                unoptimized // จำเป็นสำหรับ .gif
                            />
                        </button>
                    ))
                    : STICKER_PACKS[activeTab as EmojiTab].map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => { addSticker({ content: emoji, type: 'emoji' }); close(); }}
                            className="text-3xl hover:scale-125 transition-transform p-1"
                            type="button"
                        >
                            {emoji}
                        </button>
                    ))
                }
            </div>
        </Dropdown>
    );
};