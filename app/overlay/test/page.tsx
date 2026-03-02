// app/overlay/test/page.tsx
// หน้าสำหรับทดสอบ overlay events — ใช้ใน dev เท่านั้น
// วิธีใช้:
//   1. เปิด tab 1 → /overlay/wish  (หรือ /overlay สำหรับ terrarium)
//   2. เปิด tab 2 → /overlay/test
//   3. กดปุ่มใน tab 2 แล้วดู tab 1 ตอบสนอง real-time

import { OverlayTestPanel } from "@/components/overlay/OverlayTestPanel";

export default function OverlayTestPage() {
    if (process.env.NODE_ENV === "production") {
        return (
            <div style={{ padding: 32, fontFamily: "sans-serif", color: "#888" }}>
                Test page is not available in production.
            </div>
        );
    }
    return <OverlayTestPanel />;
}