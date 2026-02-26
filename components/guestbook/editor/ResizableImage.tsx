// components/guestbook/editor/ResizableImage.tsx
import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        resizableImage: {
            setResizableImage: (options: { src: string; alt?: string }) => ReturnType;
        }
    }
}

const ImageNode = (props: any) => {
    const { node, updateAttributes, selected } = props;
    const { src, alt, width, textAlign } = node.attrs;
    const imgRef = useRef<HTMLImageElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.pageX;
        const startWidth = imgRef.current?.clientWidth || 0;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.max(100, startWidth + (moveEvent.pageX - startX));
            updateAttributes({ width: newWidth });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    let alignClass = "flex justify-center";
    if (textAlign === 'left') alignClass = "flex justify-start";
    if (textAlign === 'right') alignClass = "flex justify-end";

    return (
        <NodeViewWrapper className={cn("react-component w-full my-4", alignClass)}>
            <div className="relative inline-block group" style={{ width: width || '50%', maxWidth: '100%' }}>
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt || "image"}
                    className={cn(
                        "rounded-lg transition-all duration-200 border-2",
                        selected ? "border-[#F2C6C2] shadow-md" : "border-transparent"
                    )}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                {selected && (
                    <div
                        className="absolute -right-2 -bottom-2 w-5 h-5 bg-[#F2C6C2] border-2 border-[#FFFDF9] rounded-full cursor-nwse-resize z-10 hover:scale-110 shadow-sm transition-transform"
                        onMouseDown={handleMouseDown}
                    />
                )}
            </div>
        </NodeViewWrapper>
    );
};

export const ResizableImage = Node.create({
    name: 'resizableImage',
    group: 'block',
    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            width: { default: '50%' },
            textAlign: { default: 'center' },
        };
    },

    parseHTML() {
        return [{
            tag: 'div[data-type="resizable-image"]',
            getAttrs: (el) => {
                const div = el as HTMLElement;
                const img = div.querySelector('img');
                return {
                    src: img?.getAttribute('src'),
                    alt: img?.getAttribute('alt'),
                    width: img?.style.width || '50%',
                    textAlign: div.getAttribute('data-align') || 'center',
                };
            }
        }, {
            // ✨ backward compat: parse <img> เดิมที่เคยเซฟไว้
            tag: 'img[src]',
            getAttrs: (el) => {
                const img = el as HTMLImageElement;
                return {
                    src: img.getAttribute('src'),
                    alt: img.getAttribute('alt'),
                    width: img.style.width || img.getAttribute('width') || '50%',
                    textAlign: img.getAttribute('data-align') || 'center',
                };
            }
        }];
    },

    // ✨ renderHTML เป็น div wrapper เพื่อให้ MyGuestbookPage อ่าน alignment ได้
    renderHTML({ HTMLAttributes }) {
        const { src, alt, width, textAlign } = HTMLAttributes;
        return [
            'div',
            {
                'data-type': 'resizable-image',
                'data-align': textAlign || 'center',
                style: `display:flex; justify-content:${textAlign === 'left' ? 'flex-start'
                        : textAlign === 'right' ? 'flex-end'
                            : 'center'
                    }; width:100%; margin:1rem 0;`
            },
            ['img', mergeAttributes({ src, alt, style: `width:${typeof width === 'number' ? `${width}px` : (width || '50%')}; max-width:100%; height:auto; display:block; border-radius:0.5rem;` })]
        ];
    },

    addNodeView() { return ReactNodeViewRenderer(ImageNode); },

    addCommands() {
        return {
            setResizableImage: (options: { src: string; alt?: string }) => ({ commands }: any) => {
                return commands.insertContent({ type: this.name, attrs: options });
            },
        };
    },
});