import React from 'react';
import { GripHorizontal, Grid3X3 } from 'lucide-react';
import { Dropdown, MenuItem } from '../../ui/ToolbarUI';
import { TextureType, PaperColorType } from '../../types';
import { PAPER_COLLECTIONS, PAPER_COLORS } from '../../constants';
import { cn } from '@/lib/utils';

interface PaperMenuProps {
    isOpen: boolean;
    texture: TextureType;
    setTexture: (t: TextureType) => void;
    paperColor: PaperColorType;
    setPaperColor: (c: PaperColorType) => void;
    close: () => void;
}

export const PaperMenu: React.FC<PaperMenuProps> = ({ isOpen, texture, setTexture, paperColor, setPaperColor, close }) => {
    return (
        <Dropdown isOpen={isOpen} className="right-0 sm:left-[60%] w-[280px] p-3 max-h-[400px] overflow-y-auto scrollbar-hide">

            {/* ✨ ส่วนเลือกลายกระดาษ */}
            <div className="mb-3">
                <p className="text-[10px] text-[#4A3B32]/50 mb-2 font-noto-sans uppercase tracking-wider">Texture</p>
                <div className="grid grid-cols-2 gap-1">
                    <MenuItem onClick={() => { setTexture('plain'); close(); }} isActive={texture === 'plain'} icon={<div className="w-4 h-4 rounded border border-[#4A3B32]/30 bg-[#FFFDF9]" />} label="Plain" />
                    <MenuItem onClick={() => { setTexture('dotted'); close(); }} isActive={texture === 'dotted'} icon={<GripHorizontal size={16} />} label="Dotted" />
                    <MenuItem onClick={() => { setTexture('vintage-grid'); close(); }} isActive={texture === 'vintage-grid'} icon={<Grid3X3 size={16} />} label="Grid" />
                    <MenuItem onClick={() => { setTexture('soft-paper'); close(); }} isActive={texture === 'soft-paper'} icon={<div className="w-4 h-4 rounded border border-[#4A3B32]/10" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />} label="Soft" />
                </div>
            </div>

            <div className="w-full h-px bg-[#4A3B32]/10 my-3" />

            {/* ✨ Paper Color  */}
            <div>
                <p className="text-[10px] text-[#4A3B32]/50 mb-4 font-noto-sans uppercase tracking-wider">
                    Paper Color
                </p>

                <div className="flex flex-col gap-6">
                    {Object.entries(PAPER_COLLECTIONS).map(
                        ([collectionName, colors]) => (
                            <div key={collectionName} className="space-y-3">

                                {/* Collection Label */}
                                <p className="text-[11px] text-[#4A3B32]/70 font-noto-sans tracking-wide">
                                    {collectionName}
                                </p>

                                {/* Swatches */}
                                <div className="flex gap-3">
                                    {colors.map((colorKey) => (
                                        <button
                                            key={colorKey}
                                            onClick={() => {
                                                setPaperColor(colorKey);
                                                close();
                                            }}
                                            type="button"
                                            title={colorKey}
                                            className={cn(
                                                "w-9 h-9 rounded-md border transition-all duration-150",
                                                "border-black/5 shadow-sm",
                                                PAPER_COLORS[colorKey],

                                                paperColor === colorKey
                                                    ? "ring-1 ring-[#4A3B32]/40"
                                                    : "hover:ring-1 hover:ring-[#4A3B32]/20"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

        </Dropdown>
    );
};