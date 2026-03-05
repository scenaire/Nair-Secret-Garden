"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { SoftButton } from "@/components/ui/SoftButton";
import { StampCard } from "@/components/ui/StampCard";
import { Navbar } from "@/components/layout/GardenNavbar";
import { useAuth } from "@/hooks/useAuth"; // ✨ นำเข้า hook Auth (ปรับพาธตามที่แนร์ใช้จริงได้เลยน้า)

// 🎨 แมตช์สีจาก Theme ของแนร์
const GUESTBOOK_THEMES = [
    { id: "cream", color: "#E6D7BD", sealColor: "#7A6147" },
    { id: "blush", color: "#F4C9D4", sealColor: "#A85F75" },
    { id: "sky", color: "#D2E6F6", sealColor: "#3A6F9E" },
    { id: "sage", color: "#CFE7DA", sealColor: "#3D7558" },
    { id: "lavender", color: "#E3D9F6", sealColor: "#6B5A9E" },
    { id: "butter", color: "#F6E7B8", sealColor: "#A27B1E" },
];

const EnvelopeIcon = ({ color, sealColor }: { color: string; sealColor: string }) => (
    <svg viewBox="0 0 100 70" className="w-full h-full drop-shadow-sm">
        <rect x="0" y="0" width="100" height="70" rx="6" fill={color} />
        <path d="M 0 0 L 50 40 L 100 0" fill="rgba(255,255,255,0.5)" />
        <path d="M 0 70 L 40 35 M 100 70 L 60 35" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        <circle cx="50" cy="40" r="10" fill={sealColor} opacity="0.85" />
    </svg>
);

export default function ThankYouPage() {
    const router = useRouter();
    const [envelopes, setEnvelopes] = useState<any[]>([]);

    // ✨ ดึง State จาก Auth Hook สำหรับ Navbar
    const { isLoggedIn, user, rawUser, loginWithTwitch, logout } = useAuth();


    useEffect(() => {
        const generatedEnvelopes = Array.from({ length: 30 }).map((_, i) => {
            let left, top;
            // โซนเว้นว่างตรงกลางให้ซองจดหมายเข้ามาใกล้ขึ้นนิดๆ
            do {
                left = Math.random() * 100;
                top = Math.random() * 100;
            } while (left > 28 && left < 72 && top > 22 && top < 78);

            const randomTheme = GUESTBOOK_THEMES[Math.floor(Math.random() * GUESTBOOK_THEMES.length)];

            return {
                id: i,
                left: `${left}%`,
                top: `${top}%`,
                rotate: Math.random() * 60 - 30,
                scale: 0.4 + Math.random() * 0.5, // ✨ ลดสเกลลงเหลือ 40% - 90% ของขนาดฐาน
                theme: randomTheme,
                delay: Math.random() * 1.2,
            };
        });
        setEnvelopes(generatedEnvelopes);
    }, []);

    return (
        // ✨ เปลี่ยนเป็น flex-col เพื่อแบ่งโซน Navbar ด้านบน และ Content ด้านล่าง
        <div className="min-h-screen flex flex-col bg-[#FDF6F5]">

            {/* 🌟 แทรก Navbar ตรงนี้ */}
            <Navbar isLoggedIn={isLoggedIn} user={user} userId={rawUser?.id} onLogin={loginWithTwitch} onLogout={logout} />

            {/* 💌 โซนหลัก (ผ้าปูโต๊ะ Plaid และการ์ดขอบคุณ) */}
            <main
                className="flex-1 relative flex items-center justify-center p-4 overflow-hidden"
                style={{
                    backgroundImage: `
        linear-gradient(0deg, rgba(170, 198, 140, 0.12) 50%, transparent 50%),
        linear-gradient(90deg, rgba(170, 198, 140, 0.12) 50%, transparent 50%),
        repeating-linear-gradient(45deg, rgba(170, 198, 140, 0.12) 0px, rgba(170, 198, 140, 0.12) 2px, transparent 2px, transparent 6px)
    `,
                    backgroundSize: "48px 48px, 48px 48px, 48px 48px",
                    backgroundBlendMode: "multiply",
                }}
            >
                <div className="absolute inset-0 pointer-events-none">
                    {envelopes.map((env) => (
                        <motion.div
                            key={env.id}
                            initial={{ opacity: 0, y: -60, rotate: env.rotate - 20, scale: env.scale }}
                            animate={{ opacity: 1, y: 0, rotate: env.rotate, scale: env.scale }}
                            transition={{ duration: 0.9, delay: env.delay, ease: "easeOut" }}
                            className="absolute w-16 h-12" // ✨ ลดขนาดฐานซองจดหมายลง
                            style={{ left: env.left, top: env.top }}
                        >
                            <EnvelopeIcon color={env.theme.color} sealColor={env.theme.sealColor} />
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative z-10 max-w-md w-full"
                >
                    <StampCard
                        bgColor="#FFFDF9"
                        borderColor="rgba(139, 94, 82, 0.2)"
                        teethDensity={1.2}
                        innerPadding={24}
                    >
                        <div className="text-center flex flex-col items-center py-6 px-2">
                            <MailCheck
                                className="w-14 h-14 mb-6 text-[#A27B1E]"
                                strokeWidth={1.5}
                            />

                            <h1
                                className="text-3xl font-bold mb-3 text-[#4A3B32]"
                                style={{ fontFamily: "'GivePANINewYear2026', sans-serif" }}
                            >
                                ขอบคุณน้า~
                            </h1>

                            <p className="text-[#6B705C] mb-8 font-medium">
                                ได้รับข้อความแล้วนะคะ ดีใจมากๆ เลยที่แวะมาเขียนอวยพรให้แนร์ 🤍
                            </p>

                            <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-center">
                                <SoftButton
                                    variant="outline"
                                    onClick={() => router.push('/guestbook')}
                                    className="border-[#8A9A5B] text-[#8A9A5B] hover:bg-[#8A9A5B]/10 hover:border-[#8A9A5B]"
                                >
                                    กลับไปแก้ไขข้อความ
                                </SoftButton>

                                <SoftButton
                                    variant="secondary"
                                    onClick={() => router.push('/')}
                                    className="bg-[#F5EFE6] text-[#4A3B32] border border-[#E8DCC4] hover:bg-[#EAE0D1]"
                                >
                                    กลับหน้าหลัก
                                </SoftButton>
                            </div>
                        </div>
                    </StampCard>
                </motion.div>
            </main>
        </div>
    );
}