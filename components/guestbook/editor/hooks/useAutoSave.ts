// components/guestbook/editor/hooks/useAutoSave.ts
import { useState, useEffect, useCallback } from 'react';

const DRAFT_KEY = 'guestbook_draft_content';

export function useAutoSave(content: string, delay: number = 1000) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // ✨ ฟังก์ชันดึงข้อมูลเก่า (ใช้ตอนโหลดหน้าเว็บครั้งแรก)
    const loadDraft = useCallback(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(DRAFT_KEY) || '';
        }
        return '';
    }, []);

    // ✨ ระบบ Auto Save (จะทำงานเมื่อหยุดพิมพ์ตามเวลา delay)
    useEffect(() => {
        // ถ้าเป็นข้อความว่างๆ ตอนเริ่มโหลดหน้า จะยังไม่เซฟทับของเดิมค่ะ
        if (content === '' || content === '<p></p>') return;

        setIsSaving(true);
        const handler = setTimeout(() => {
            localStorage.setItem(DRAFT_KEY, content);
            setLastSaved(new Date());
            setIsSaving(false);

            // 💡 อนาคต: เราจะเอาฟังก์ชันยิง API เข้า Database มาเสียบตรงนี้ค่ะ!

        }, delay);

        return () => clearTimeout(handler);
    }, [content, delay]);

    // ✨ ฟังก์ชันล้างข้อมูล (ใช้ตอนกดยืนยันส่งข้อความลง Guestbook สำเร็จ)
    const clearDraft = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(DRAFT_KEY);
        }
    }, []);

    return { loadDraft, clearDraft, isSaving, lastSaved };
}