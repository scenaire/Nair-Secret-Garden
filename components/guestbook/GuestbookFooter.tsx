"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { StampCard } from "@/components/ui/StampCard";
import { PetalTransition } from "@/components/guestbook/PetalTransition";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr'; // ✨ นำเข้า Supabase

import { useSubmitEntry } from "./editor/hooks/useSubmitEntry";

interface GuestbookFooterProps {
    content: string;
    redirectTo?: string;
    onAfterSubmit?: () => void;
}

export function GuestbookFooter({
    content,
    redirectTo = "/",
    onAfterSubmit,
}: GuestbookFooterProps) {
    const router = useRouter();
    const [name, setName] = useState("");
    const { submitEntry, isSubmitting: isDbSubmitting, error: submitError } = useSubmitEntry();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPetals, setShowPetals] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [touched, setTouched] = useState(false);

    // ✨ ฟังก์ชันตั้งค่าชื่อเริ่มต้น (Twitch -> LocalStorage)
    useEffect(() => {
        const initName = async () => {
            // 1. ลองดึงชื่อที่เคยพิมพ์ค้างไว้จาก Draft ก่อน
            const savedName = localStorage.getItem('guestbook_draft_name');
            if (savedName && savedName !== "Anonymous") {
                setName(savedName);
                return;
            }

            // 2. ดึงชื่อจาก Twitch Auth
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data: { user } } = await supabase.auth.getUser();

            if (user && user.user_metadata) {
                // ✨ แก้ไขตรงนี้: ดึงจาก 'Display name' หรือ 'display_name'
                const twitchName = user.user_metadata['Display name']
                    || user.user_metadata.display_name
                    || user.user_metadata.preferred_username
                    || user.user_metadata.name
                    || "Anonymous";

                if (twitchName !== "Anonymous") {
                    setName(twitchName);
                    localStorage.setItem('guestbook_draft_name', twitchName);
                }
            }
        };
        initName();
    }, []);

    // ✨ อัปเดต State และ LocalStorage พร้อมๆ กันตอนพิมพ์
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        localStorage.setItem('guestbook_draft_name', val);
    };

    const isEmpty = content.replace(/<[^>]*>/g, "").trim().length === 0;
    const canSubmit = !isEmpty && !isSubmitting && !isDbSubmitting;

    const handleSubmit = useCallback(async () => {
        setTouched(true);
        if (!canSubmit) return;

        setIsSubmitting(true);
        setPressed(true);

        const finalName = name.trim() !== "" ? name.trim() : "Anonymous";
        const success = await submitEntry(finalName);

        if (success) {
            setShowPetals(true);
        } else {
            setIsSubmitting(false);
        }
    }, [canSubmit, name, submitEntry]);

    const handlePetalComplete = useCallback(() => {
        if (onAfterSubmit) {
            onAfterSubmit();
        } else {
            router.push(redirectTo);
        }
    }, [onAfterSubmit, redirectTo, router]);

    return (
        <>
            {showPetals && (
                <PetalTransition
                    onComplete={handlePetalComplete}
                    message="Your wish has been sealed 💌"
                    subMessage="See you at the party~"
                    petalCount={65}
                />
            )}

            <div className="w-full flex flex-col gap-3 mt-2">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center gap-3 w-full"
                >
                    <div className="flex-1 min-w-0">
                        <StampCard
                            bgColor="#FFFDF9"
                            teethRadius={7}
                            teethDensity={0.9}
                            borderColor="rgba(155,107,126,0.2)"
                        >
                            <div className="flex items-center gap-2 px-4 py-2.5">
                                <span className="text-lg leading-none select-none flex-shrink-0" style={{
                                    fontFamily: "'Playpen Sans Thai', cursive",
                                    fontSize: "1.2rem",
                                    fontWeight: 400,
                                    lineHeight: 1.2,
                                    letterSpacing: "0.02em",
                                }}>🌸</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange} // ✨ เปลี่ยนมาใช้ฟังก์ชันที่เราเขียนใหม่
                                    placeholder="Your name..."
                                    maxLength={40}
                                    className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[#4A3B32] placeholder:text-[#9B8B82]/40"
                                    style={{
                                        fontFamily: "'Playpen Sans Thai', cursive",
                                        fontSize: "1.2rem",
                                        fontWeight: 400,
                                        lineHeight: 1.2,
                                        letterSpacing: "0.02em",
                                    }}
                                />
                            </div>
                        </StampCard>
                    </div>

                    <div className="flex-shrink-0">
                        <StampCard
                            bgColor={canSubmit ? "var(--theme-btn-bg, #C49BAA)" : "#D9CFC8"}
                            teethRadius={7}
                            teethDensity={0.9}
                            borderColor={canSubmit ? "rgba(155,107,126,0.3)" : "rgba(0,0,0,0.08)"}
                        >
                            <motion.button
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                animate={pressed ? { scale: [1, 0.93, 1.04, 1] } : {}}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                onAnimationComplete={() => setPressed(false)}
                                className="px-5 py-2.5 font-serif text-lg font-bold tracking-wide select-none cursor-pointer disabled:cursor-not-allowed"
                                style={{
                                    color: canSubmit ? "var(--theme-accent-text)" : "#A09288",
                                    transition: "color 0.3s",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {isSubmitting || isDbSubmitting ? "Sealing..." : "Leave your mark ✦"}
                            </motion.button>
                        </StampCard>
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-xs font-serif italic tracking-widest text-[#9B8B82]/60 select-none"
                >
                    ✦ &nbsp;Thank you for coming to my birthday&nbsp; ✦
                </motion.p>

                {submitError && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-xs text-red-400 font-sans mt-1"
                    >
                        {submitError}
                    </motion.p>
                )}

                {isEmpty && touched && !submitError && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-[10px] text-[#C49BAA]/70 font-sans italic"
                    >
                        Write something first before leaving your mark
                    </motion.p>
                )}
            </div>
        </>
    );
}