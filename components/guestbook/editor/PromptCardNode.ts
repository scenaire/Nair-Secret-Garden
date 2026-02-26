import { Node, mergeAttributes } from '@tiptap/core';

export const PromptCardNode = Node.create({
    name: 'promptCard',
    group: 'block',
    atom: true, // read-only, ไม่ให้ cursor เข้าไปแก้ข้างใน

    addAttributes() {
        return {
            text: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="prompt-card"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        const text = HTMLAttributes.text || '';
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'prompt-card',
                style: `
                    position: relative;
                    margin: 2rem 0;
                    padding: 2rem 2.5rem;
                    border-radius: 1rem;
                    background: linear-gradient(135deg, #fdf6ec 0%, #f9ede0 50%, #fdf0e8 100%);
                    border: 1.5px solid #D4A882;
                    box-shadow: 0 4px 24px rgba(139,107,74,0.10), inset 0 1px 0 rgba(255,255,255,0.8);
                    text-align: center;
                    user-select: none;
                    overflow: hidden;
                `,
            }),
            // มุมตกแต่ง top-left
            ['span', {
                style: `
                    position: absolute; top: 10px; left: 14px;
                    font-size: 1.2rem; opacity: 0.35; line-height: 1;
                    color: #8B6B4A;
                `
            }, '✦'],
            // มุมตกแต่ง top-right
            ['span', {
                style: `
                    position: absolute; top: 10px; right: 14px;
                    font-size: 1.2rem; opacity: 0.35; line-height: 1;
                    color: #8B6B4A;
                `
            }, '✦'],
            // เส้นบน
            ['span', {
                style: `
                    position: absolute; top: 0; left: 10%; right: 10%; height: 3px;
                    background: linear-gradient(90deg, transparent, #C49A6C, transparent);
                    border-radius: 0 0 4px 4px;
                `
            }],
            // เส้นล่าง
            ['span', {
                style: `
                    position: absolute; bottom: 0; left: 10%; right: 10%; height: 3px;
                    background: linear-gradient(90deg, transparent, #C49A6C, transparent);
                    border-radius: 4px 4px 0 0;
                `
            }],
            // ข้อความ
            ['p', {
                style: `
                    margin: 0;
                    font-family: 'SOV_FanChan', serif;
                    font-size: 1.35rem;
                    line-height: 1.8;
                    color: #6B4C30;
                    position: relative;
                    z-index: 1;
                `
            }, text],
        ];
    },
});