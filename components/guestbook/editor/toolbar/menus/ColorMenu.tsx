import React from 'react';
import { Editor } from '@tiptap/react';
import { Palette } from 'lucide-react';
import { Dropdown } from '../../ui/ToolbarUI';
import { INK_COLORS } from '@/components/guestbook/editor/styles/inkColors';
import { cn } from '@/lib/utils';

interface ColorMenuProps {
    isOpen: boolean;
    editor: Editor;
    currentColor: string;
    recentColors: string[];
    close: () => void;
}

export const ColorMenu: React.FC<ColorMenuProps> = ({ isOpen, editor, currentColor, recentColors, close }) => {
    const handleSetColor = (color: string) => {
        editor.chain().focus().setColor(color).run();
        close();
    };

    return (
        <Dropdown isOpen={isOpen} className="left-[15%] md:left-[25%] w-[210px] p-3">
            {/* 20 Standard Colors */}
            <div className="grid grid-cols-5 gap-2 mb-2">
                {INK_COLORS.map(color => (
                    <button
                        key={color}
                        onClick={() => handleSetColor(color)}
                        className={cn(
                            "w-6 h-6 rounded-full border border-black/10 transition-transform",
                            currentColor.toUpperCase() === color.toUpperCase() ? "scale-125 shadow-sm border-white" : "hover:scale-110"
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                        type="button"
                    />
                ))}
            </div>

            {/* Custom Color Picker & Reset */}
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
                <button
                    onClick={() => { editor.chain().focus().unsetColor().run(); close(); }}
                    className="text-[10px] font-noto-sans text-[#4A3B32]/50 hover:text-[#4A3B32] underline"
                    type="button"
                >
                    Reset
                </button>
            </div>

            {/* Recent Colors History */}
            {recentColors.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#4A3B32]/10">
                    <p className="text-[10px] text-[#4A3B32]/50 mb-1.5 font-noto-sans uppercase tracking-wider">Recent</p>
                    <div className="flex gap-2 flex-wrap">
                        {recentColors.map(color => (
                            <button
                                key={color}
                                onClick={() => handleSetColor(color)}
                                className={cn(
                                    "w-5 h-5 rounded-full border border-black/10 transition-transform",
                                    currentColor.toUpperCase() === color ? "scale-125 shadow-sm border-white" : "hover:scale-110"
                                )}
                                style={{ backgroundColor: color }}
                                title={color}
                                type="button"
                            />
                        ))}
                    </div>
                </div>
            )}
        </Dropdown>
    );
};