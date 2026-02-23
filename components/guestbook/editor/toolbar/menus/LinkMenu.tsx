import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Trash2, Check } from 'lucide-react';
import { Dropdown } from '../../ui/ToolbarUI';

interface LinkMenuProps {
    isOpen: boolean;
    editor: Editor;
    close: () => void;
}

export const LinkMenu: React.FC<LinkMenuProps> = ({ isOpen, editor, close }) => {
    const [linkUrl, setLinkUrl] = useState('');
    const isEditingLink = editor.isActive('link');

    // Sync input with existing link when opening the menu
    useEffect(() => {
        if (isOpen) {
            setLinkUrl(editor.getAttributes('link').href || '');
        }
    }, [isOpen, editor]);

    const handleSetLink = () => {
        if (!linkUrl.trim()) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        }
        close();
    };

    const handleRemoveLink = () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        close();
    };

    return (
        <Dropdown isOpen={isOpen} className="left-[30%] md:left-[45%] w-[300px] p-2 flex items-center gap-2">
            <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 text-sm py-1.5 px-3 border-none bg-[#FFFDF9] text-[#4A3B32] focus:outline-none placeholder:text-[#4A3B32]/30"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSetLink()}
            />
            <div className="flex gap-1">
                {isEditingLink && (
                    <button onClick={handleRemoveLink} className="p-1.5 bg-red-100/50 text-red-500 rounded-md hover:bg-red-100 transition-colors" title="Remove Link" type="button">
                        <Trash2 size={16} />
                    </button>
                )}
                <button onClick={handleSetLink} className="p-1.5 bg-[#F2C6C2]/20 text-[#4A3B32] rounded-md hover:bg-[#F2C6C2]/40 transition-colors" title={isEditingLink ? "Update" : "Add"} type="button">
                    <Check size={16} />
                </button>
            </div>
        </Dropdown>
    );
};