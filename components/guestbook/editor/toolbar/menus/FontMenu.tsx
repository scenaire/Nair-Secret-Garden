import React from 'react';
import { Editor } from '@tiptap/react';
import { Dropdown, MenuItem } from '../../ui/ToolbarUI';
import { FONTS } from '@/components/guestbook/editor/styles/fontStyle';

interface FontMenuProps {
    isOpen: boolean;
    editor: Editor;
    close: () => void;
}

export const FontMenu: React.FC<FontMenuProps> = ({ isOpen, editor, close }) => {
    return (
        <Dropdown isOpen={isOpen} className="left-0 w-[200px]">
            {FONTS.map((font) => (
                <MenuItem
                    key={font.id}
                    onClick={() => {
                        editor.chain().focus().setFontFamily(font.value).run();
                        close();
                    }}
                    isActive={editor.isActive('textStyle', { fontFamily: font.value })}
                    label={font.name}
                    className={font.id}
                />
            ))}
        </Dropdown>
    );
};