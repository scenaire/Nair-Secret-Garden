"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✨ SVG path กลีบดอกหลายแบบ
const PETAL_PATHS = [
    "M10,0 C15,5 15,15 10,20 C5,15 5,5 10,0Z",
    "M10,0 C14,3 16,10 14,17 C12,21 8,21 6,17 C4,10 6,3 10,0Z",
    "M10,2 C16,2 18,8 18,12 C18,17 14,20 10,20 C6,20 2,17 2,12 C2,8 4,2 10,2Z",
    "M10,18 C10,18 2,12 2,7 C2,4 4,2 7,2 C8.5,2 10,3.5 10,3.5 C10,3.5 11.5,2 13,2 C16,2 18,4 18,7 C18,12 10,18 10,18Z",
];

const PETAL_COLORS = [
    "#FFB7C5", "#FFCDD6", "#FFC8D8", "#FFD6E0",
    "#F9A8C9", "#FADADD", "#FFB6C1", "#FFC0CB",
    "#E8B4CB", "#F4C2C2", "#FFE4E1", "#FDB9C8",
];

interface Petal {
    id: number;
    x: number;           // % จากซ้าย
    delay: number;       // ms
    duration: number;    // ms
    size: number;        // px
    rotation: number;    // องศาเริ่มต้น
    rotationEnd: number; // องศาสิ้นสุด
    swayAmount: number;  // ความโยก px
    pathIndex: number;
    colorIndex: number;
    opacity: number;
}

function generatePetals(count: number): Petal[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 110 - 5,
        delay: Math.random() * 2000,
        duration: 2800 + Math.random() * 2000,
        size: 12 + Math.random() * 18,
        rotation: Math.random() * 360,
        rotationEnd: Math.random() * 360 - 180,
        swayAmount: 40 + Math.random() * 80,
        pathIndex: Math.floor(Math.random() * PETAL_PATHS.length),
        colorIndex: Math.floor(Math.random() * PETAL_COLORS.length),
        opacity: 0.65 + Math.random() * 0.35,
    }));
}

interface PetalParticleProps {
    petal: Petal;
    windowHeight: number;
}

function PetalParticle({ petal, windowHeight }: PetalParticleProps) {
    const swayKeyframes = [0, petal.swayAmount, -petal.swayAmount * 0.5, petal.swayAmount * 0.7, 0];

    return (
        <motion.div
            key={petal.id}
            style={{
                position: "fixed",
                left: `${petal.x}%`,
                top: 0,
                width: petal.size,
                height: petal.size,
                pointerEvents: "none",
                zIndex: 9999,
                opacity: petal.opacity,
            }}
            initial={{ y: -petal.size * 2, x: 0, rotate: petal.rotation }}
            animate={{
                y: windowHeight + petal.size * 2,
                x: swayKeyframes,
                rotate: petal.rotation + petal.rotationEnd,
            }}
            transition={{
                duration: petal.duration / 1000,
                delay: petal.delay / 1000,
                ease: "linear",
                x: {
                    duration: petal.duration / 1000,
                    delay: petal.delay / 1000,
                    ease: "easeInOut",
                    repeat: 0,
                    times: [0, 0.25, 0.5, 0.75, 1],
                },
            }}
        >
            <svg
                viewBox="0 0 20 20"
                width={petal.size}
                height={petal.size}
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.08))" }}
            >
                <path
                    d={PETAL_PATHS[petal.pathIndex]}
                    fill={PETAL_COLORS[petal.colorIndex]}
                />
            </svg>
        </motion.div>
    );
}

interface PetalTransitionProps {
    /** เรียกใช้เมื่อ animation จบแล้ว redirect ได้เลย */
    onComplete: () => void;
    /** จำนวนกลีบ default 60 */
    petalCount?: number;
    /** ข้อความตรงกลาง */
    message?: string;
    /** sub message */
    subMessage?: string;
}

export function PetalTransition({
    onComplete,
    petalCount = 60,
    message = "Your wish has been sealed 💌",
    subMessage = "See you at the party~",
}: PetalTransitionProps) {
    const [petals] = useState(() => generatePetals(petalCount));
    const [windowHeight, setWindowHeight] = useState(800);
    const [showText, setShowText] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(true);

    useEffect(() => {
        setWindowHeight(window.innerHeight);

        // แสดง message หลัง 0.4s
        const t1 = setTimeout(() => setShowText(true), 400);

        // เริ่ม fade out overlay + redirect หลัง 3.2s
        const t2 = setTimeout(() => {
            setOverlayVisible(false);
        }, 3200);

        const t3 = setTimeout(() => {
            onComplete();
        }, 3800);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {overlayVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9998,
                        background: "radial-gradient(ellipse at center, #fff5f7 0%, #fce8ef 50%, #f9d6e4 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    {/* กลีบดอกทั้งหมด */}
                    {petals.map((petal) => (
                        <PetalParticle
                            key={petal.id}
                            petal={petal}
                            windowHeight={windowHeight}
                        />
                    ))}

                    {/* ข้อความกลาง */}
                    <AnimatePresence>
                        {showText && (
                            <>
                                <motion.p
                                    initial={{ opacity: 0, y: 16, scale: 0.94 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    style={{
                                        fontFamily: "'Noto Serif', 'Noto Serif Thai', Georgia, serif",
                                        fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                                        color: "#9B6B7E",
                                        letterSpacing: "0.04em",
                                        textAlign: "center",
                                        zIndex: 10000,
                                        position: "relative",
                                        textShadow: "0 2px 12px rgba(255,183,197,0.4)",
                                    }}
                                >
                                    {message}
                                </motion.p>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                                    style={{
                                        fontFamily: "'Noto Serif', Georgia, serif",
                                        fontSize: "clamp(0.8rem, 2vw, 1rem)",
                                        color: "#C49BAA",
                                        letterSpacing: "0.08em",
                                        fontStyle: "italic",
                                        zIndex: 10000,
                                        position: "relative",
                                    }}
                                >
                                    {subMessage}
                                </motion.p>
                            </>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}