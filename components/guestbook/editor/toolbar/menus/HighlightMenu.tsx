import React from 'react';
import { Editor } from '@tiptap/react';
import { Dropdown, ColorDot } from '../../ui/ToolbarUI';

interface HighlightMenuProps {
    isOpen: boolean;
    editor: Editor;
    close: () => void;
}

export const HighlightMenu: React.FC<HighlightMenuProps> = ({ isOpen, editor, close }) => {
    const setHighlight = (color: string) => {
        editor.chain().focus().toggleHighlight({ color }).run();
        close();
    };

    return (
        <Dropdown isOpen={isOpen} className="left-[25%] md:left-[40%] flex flex-row gap-3 p-3">
            <ColorDot onClick={() => setHighlight('#FDE68A')} isActive={editor.isActive('highlight', { color: '#FDE68A' })} color="bg-yellow-200" />
            <ColorDot onClick={() => setHighlight('#FBCFE8')} isActive={editor.isActive('highlight', { color: '#FBCFE8' })} color="bg-pink-200" />
            <ColorDot onClick={() => setHighlight('#BBF7D0')} isActive={editor.isActive('highlight', { color: '#BBF7D0' })} color="bg-green-200" />
            <ColorDot onClick={() => setHighlight('#BFDBFE')} isActive={editor.isActive('highlight', { color: '#BFDBFE' })} color="bg-blue-200" />
            <button
                onClick={() => { editor.chain().focus().unsetHighlight().run(); close(); }}
                className="w-6 h-6 rounded-full border border-[#4A3B32]/10 flex items-center justify-center text-[10px] text-[#4A3B32]/50 hover:bg-[#4A3B32]/5"
                type="button"
            >
                ✕
            </button>
        </Dropdown>
    );
};