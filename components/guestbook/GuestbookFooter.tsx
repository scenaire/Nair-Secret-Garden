"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { StampCard } from "@/components/ui/StampCard";
import { PetalTransition } from "@/components/guestbook/PetalTransition";
import { useRouter } from "next/navigation";

interface GuestbookFooterProps {
    /** content จาก editor (html string) */
    content: string;
    /** เรียกหลัง submit + animation จบ */
    redirectTo?: string;
    /** override redirect ด้วย custom fn */
    onAfterSubmit?: () => void;
}

export function GuestbookFooter({
    content,
    redirectTo = "/",
    onAfterSubmit,
}: GuestbookFooterProps) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPetals, setShowPetals] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [touched, setTouched] = useState(false);

    const isEmpty = content.replace(/<[^>]*>/g, "").trim().length === 0;
    const canSubmit = !isEmpty && !isSubmitting;

    const handleSubmit = useCallback(async () => {
        setTouched(true);
        if (!canSubmit) return;

        setIsSubmitting(true);
        setPressed(true);

        // TODO: ส่ง API จริงตรงนี้
        // await fetch("/api/guestbook", {
        //     method: "POST",
        //     body: JSON.stringify({ name, content }),
        // });

        // simulate network delay เล็กน้อย
        await new Promise((r) => setTimeout(r, 300));

        setShowPetals(true);
    }, [canSubmit, name, content]);

    const handlePetalComplete = useCallback(() => {
        if (onAfterSubmit) {
            onAfterSubmit();
        } else {
            router.push(redirectTo);
        }
    }, [onAfterSubmit, redirectTo, router]);

    return (
        <>
            {/* 🌸 Petal Transition Overlay */}
            {showPetals && (
                <PetalTransition
                    onComplete={handlePetalComplete}
                    message="Your wish has been sealed 💌"
                    subMessage="See you at the party~"
                    petalCount={65}
                />
            )}

            {/* ─── Footer Section ─── */}
            <div className="w-full flex flex-col gap-3 mt-2">



                {/* Name input + Submit button */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3 w-full"
                >
                    {/* ── ช่องชื่อ (StampCard) ── */}
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
                                    fontSize: "1.2rem",        // ใหญ่ขึ้นชัดเจน
                                    fontWeight: 400,
                                    lineHeight: 1.2,
                                    letterSpacing: "0.02em",
                                }}>🌸</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name..."
                                    maxLength={40}
                                    className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[#4A3B32] placeholder:text-[#9B8B82]/40"
                                    style={{
                                        fontFamily: "'Playpen Sans Thai', cursive",
                                        fontSize: "1.2rem",        // ใหญ่ขึ้นชัดเจน
                                        fontWeight: 400,
                                        lineHeight: 1.2,
                                        letterSpacing: "0.02em",
                                    }}
                                />
                            </div>
                        </StampCard>
                    </div>

                    {/* ── ปุ่มส่ง (StampCard) ── */}
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
                                className="px-5 py-2.5 font-serif text-sm tracking-wide select-none cursor-pointer disabled:cursor-not-allowed"
                                style={{
                                    color: canSubmit ? "#fff" : "#A09288",
                                    transition: "color 0.3s",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {isSubmitting ? "Sealing..." : "Leave your mark ✦"}
                            </motion.button>
                        </StampCard>
                    </div>
                </motion.div>

                {/* ✦ Flavor text ✦ */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-xs font-serif italic tracking-widest text-[#9B8B82]/60 select-none"
                >
                    ✦ &nbsp;Thank you for coming to my birthday&nbsp; ✦
                </motion.p>

                {/* isEmpty warning */}
                {isEmpty && touched && (
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