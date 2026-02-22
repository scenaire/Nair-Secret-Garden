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

// 1. หน้าตาของรูปภาพ (React Component)
const ImageNode = (props: any) => {
    const { node, updateAttributes, selected } = props;
    const { src, alt, width, textAlign } = node.attrs;
    const imgRef = useRef<HTMLImageElement>(null);

    // ฟังก์ชันคำนวณตอนลากเมาส์ย่อ-ขยาย
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.pageX;
        const startWidth = imgRef.current?.clientWidth || 0;

        const onMouseMove = (moveEvent: MouseEvent) => {
            // คำนวณความกว้างใหม่ (บังคับไม่ให้เล็กกว่า 100px)
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

    // ดึงค่าการจัดหน้าจากปุ่ม Align มาแปลงเป็นคลาส Tailwind
    let alignClass = "flex justify-center"; // ค่าตั้งต้นคือตรงกลาง
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

                {/* ✨ จุดกลมๆ สำหรับจับลาก (โชว์เฉพาะตอนคลิกรูป) */}
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

// 2. ตั้งค่า Tiptap Extension
export const ResizableImage = Node.create({
    name: 'resizableImage',
    group: 'block', // 🚨 สำคัญ: ต้องเป็น block ถึงจะจัด ซ้าย-กลาง-ขวา ได้
    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            width: { default: '50%' }, // ตั้งขนาดเริ่มต้นที่ 50% ของหน้ากระดาษ
            textAlign: { default: 'center' }, // เชื่อมกับ Extension TextAlign
        };
    },

    parseHTML() { return [{ tag: 'img[src]' }]; },
    renderHTML({ HTMLAttributes }) { return ['img', mergeAttributes(HTMLAttributes)]; },
    addNodeView() { return ReactNodeViewRenderer(ImageNode); },

    addCommands() {
        return {
            setResizableImage: (options: { src: string; alt?: string }) => ({ commands }: any) => {
                return commands.insertContent({ type: this.name, attrs: options });
            },
        };
    },
});