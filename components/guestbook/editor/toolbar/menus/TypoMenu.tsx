import React from 'react';
import { Editor } from '@tiptap/react';
import { Heading, Heading1, Heading2, Type } from 'lucide-react';
import { Dropdown, MenuItem } from '../../ui/ToolbarUI';

interface TypoMenuProps {
    isOpen: boolean;
    editor: Editor;
    close: () => void;
}

export const TypoMenu: React.FC<TypoMenuProps> = ({ isOpen, editor, close }) => {
    return (
        <Dropdown isOpen={isOpen} className="left-10 w-[160px]">
            <MenuItem
                onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); close(); }}
                isActive={editor.isActive('heading', { level: 1 })}
                icon={<Heading1 size={16} />}
                label="Heading 1"
            />
            <MenuItem
                onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); close(); }}
                isActive={editor.isActive('heading', { level: 2 })}
                icon={<Heading2 size={16} />}
                label="Heading 2"
            />
            <MenuItem
                onClick={() => { editor.chain().focus().setParagraph().run(); close(); }}
                isActive={editor.isActive('paragraph')}
                icon={<Heading size={16} />}
                label="Normal Text"
            />
        </Dropdown>
    );
};