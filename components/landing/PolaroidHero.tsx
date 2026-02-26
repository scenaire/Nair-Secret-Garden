// components/landing/PolaroidHero.tsx
import React from "react";
import { motion } from "framer-motion";
import { PolaroidFrame } from "@/components/ui/PolaroidFrame";

const StickyNote: React.FC = () => (
    <motion.div
        initial={{ opacity: 0, rotate: -8, y: 20 }}
        animate={{ opacity: 1, rotate: -6, y: 0 }}
        transition={{
            delay: 1.0,
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute -left-8 top-8 w-36 p-3 shadow-md z-20"
        style={{ backgroundColor: "#FFF9C4", transform: "rotate(-6deg)" }}
    >
        <p
            className="text-[14px] leading-relaxed"
            style={{ fontFamily: "'Noto Serif', serif", color: "#7A6147" }}
        >
            happy birthday
            <br />
            to myself.
            <br />
            i hope we&apos;re all
            <br />
            having a good time.
        </p>
    </motion.div>
);

const TagLabel: React.FC = () => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute -right-4 top-1/4 z-20 flex items-center"
        style={{ transform: "rotate(90deg) translateX(50%)" }}
    >
        <div className="w-3 h-3 rounded-full border-2 border-[#C4A882] bg-white mr-1" />
        <div
            className="px-3 py-1 border border-[#C4A882] bg-[#FDFBF4] shadow-sm"
            style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: "10px",
                color: "#8B5E52",
                letterSpacing: "0.1em",
            }}
        >
            27 Feb 2025
        </div>
    </motion.div>
);

/**
 * Hero section เฉพาะหน้า landing
 */
export const PolaroidHero: React.FC = () => {
    return (
        <div className="relative">
            <PolaroidFrame caption="Nair's Secret Garden ✦">
                <img
                    src="/images/landing/event-hero.png"
                    alt="Nair's Secret Garden"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </PolaroidFrame>
            <StickyNote />
            <TagLabel />
        </div>
    );
};