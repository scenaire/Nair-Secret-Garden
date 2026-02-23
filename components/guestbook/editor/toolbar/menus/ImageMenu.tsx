import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Trash2, Check } from 'lucide-react';
import { Dropdown } from '../../ui/ToolbarUI';

interface ImageMenuProps {
    isOpen: boolean;
    editor: Editor;
    close: () => void;
}

export const ImageMenu: React.FC<ImageMenuProps> = ({ isOpen, editor, close }) => {
    const [imageUrl, setImageUrl] = useState('');
    const isEditingImage = editor.isActive('resizableImage') || editor.isActive('image');

    useEffect(() => {
        if (isOpen) {
            const attrs = editor.getAttributes('resizableImage');
            setImageUrl(attrs.src || '');
        }
    }, [isOpen, editor]);

    const handleSetImage = () => {
        if (imageUrl) {
            if (editor.isActive('resizableImage')) {
                editor.commands.updateAttributes('resizableImage', { src: imageUrl });
            } else {
                editor.chain().focus().setResizableImage({ src: imageUrl }).run();
            }
        }
        close();
    };

    const handleRemoveImage = () => {
        editor.chain().focus().deleteSelection().run();
        close();
    };

    return (
        <Dropdown isOpen={isOpen} className="left-[40%] md:left-[50%] w-[300px] p-2 flex items-center gap-2">
            <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL..."
                className="flex-1 text-sm py-1.5 px-3 border-none bg-[#FFFDF9] text-[#4A3B32] focus:outline-none placeholder:text-[#4A3B32]/30"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSetImage()}
            />
            <div className="flex gap-1">
                {isEditingImage && (
                    <button onClick={handleRemoveImage} className="p-1.5 bg-red-100/50 text-red-500 rounded-md hover:bg-red-100 transition-colors" title="Delete Image" type="button">
                        <Trash2 size={16} />
                    </button>
                )}
                <button onClick={handleSetImage} className="p-1.5 bg-[#BCD7E6]/30 text-[#4A3B32] rounded-md hover:bg-[#BCD7E6]/50 transition-colors" title={isEditingImage ? "Update" : "Add"} type="button">
                    <Check size={16} />
                </button>
            </div>
        </Dropdown>
    );
};