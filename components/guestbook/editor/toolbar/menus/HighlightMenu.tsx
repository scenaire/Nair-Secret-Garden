import React from 'react';
import { Editor } from '@tiptap/react';
import { Dropdown } from '../../ui/ToolbarUI';
import { cn } from '@/lib/utils';

interface HighlightMenuProps {
    isOpen: boolean;
    editor: Editor | null;
    close: () => void;
}

// พาเลตสีไฮไลต์ (เลือกโทนนุ่ม อ่านง่าย)
const HIGHLIGHT_COLORS = [
    '#FFD7D6', // soft pink
    '#FFE2A6', // pastel yellow
    '#DBE098', // soft yellow-green
    '#D5EDF8', // light sky
    '#E5DACA', // warm cream
];

export const HighlightMenu: React.FC<HighlightMenuProps> = ({
    isOpen,
    editor,
    close,
}) => {
    if (!editor) return null;

    const applyHighlight = (color: string) => {
        editor
            .chain()
            .focus()
            .setHighlight({ color })
            .run();
        close();
    };

    const clearHighlight = () => {
        editor
            .chain()
            .focus()
            .unsetHighlight()
            .run();
        close();
    };

    const isColorActive = (color: string) =>
        editor.isActive('highlight', { color });

    return (
        <Dropdown
            isOpen={isOpen}
            className="left-[25%] md:left-[40%] flex flex-row items-center gap-3 p-3"
        >
            {/* ปุ่มสีไฮไลต์ */}
            <div className="flex items-center gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => applyHighlight(color)}
                        className={cn(
                            'w-6 h-6 rounded-full border border-black/10 transition-transform',
                            isColorActive(color)
                                ? 'scale-110 ring-2 ring-offset-2 ring-black/15 shadow-sm'
                                : 'hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                        aria-label={`Highlight ${color}`}
                    />
                ))}
            </div>

            {/* ปุ่มเอาไฮไลต์ออก */}
            <button
                type="button"
                onClick={clearHighlight}
                className="
          w-7 h-7 rounded-full border border-[#4A3B32]/20
          flex items-center justify-center
          text-[11px] font-medium
          text-[#4A3B32]/60
          bg-white/80
          hover:bg-white hover:text-[#4A3B32]
          transition-colors
        "
                title="ลบไฮไลต์"
            >
                ✕
            </button>
        </Dropdown>
    );
};