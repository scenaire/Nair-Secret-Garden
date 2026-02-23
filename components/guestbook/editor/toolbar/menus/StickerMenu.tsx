import React, { useState } from 'react';
import { Dropdown } from '../../ui/ToolbarUI';
import { STICKER_PACKS } from '../../constants';
import { cn } from '@/lib/utils';

interface StickerMenuProps {
    isOpen: boolean;
    addSticker: (emoji: string) => void;
    close: () => void;
}

type StickerTab = keyof typeof STICKER_PACKS;

export const StickerMenu: React.FC<StickerMenuProps> = ({ isOpen, addSticker, close }) => {
    const [activeTab, setActiveTab] = useState<StickerTab>('floral');

    return (
        <Dropdown isOpen={isOpen} className="right-5 sm:left-[60%] w-[280px] p-3">
            {/* Tabs */}
            <div className="flex gap-2 mb-3 border-b border-[#4A3B32]/10 pb-2">
                {(Object.keys(STICKER_PACKS) as StickerTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "text-xs font-noto-sans px-2 py-1 rounded capitalize transition-colors",
                            activeTab === tab ? "bg-[#F2C6C2]/20 text-[#4A3B32] font-medium" : "text-[#4A3B32]/50 hover:bg-gray-50"
                        )}
                        type="button"
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-2">
                {STICKER_PACKS[activeTab].map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => { addSticker(emoji); close(); }}
                        className="text-3xl hover:scale-125 transition-transform p-1"
                        type="button"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </Dropdown>
    );
};