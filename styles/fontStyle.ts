export const FONTS = [
    {
        id: 'font-anuphan',
        name: 'Anuphan',
        value: '"Anuphan", sans-serif', // ค่าที่ Tiptap จะเอาไปใช้ตั้ง font-family
        sizeClass: 'text-[14px] md:text-[18px]', // ขนาดที่ดูพอดีที่สุดสำหรับฟอนต์นี้
    },
    {
        id: 'font-google-sans',
        name: 'Google Sans',
        value: '"Google Sans", sans-serif',
        sizeClass: 'text-[14px] md:text-[18px]',
    },
    {
        id: 'font-pani',
        name: 'PANI New Year',
        value: '"GivePANINewYear2026", cursive',
        sizeClass: 'text-[16px] md:text-[20px]',
    },
];

// ดึงฟอนต์ตัวแรกมาเป็นค่าเริ่มต้นเสมอ
export const DEFAULT_FONT = FONTS[0];