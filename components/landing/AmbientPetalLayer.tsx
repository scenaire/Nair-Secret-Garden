// components/landing/AmbientPetalLayer.tsx
import React from "react";
import { motion } from "framer-motion";

const PETAL_COLORS: readonly string[] = [
    "#FFB7C5",
    "#FFCDD6",
    "#FFC8D8",
    "#FFD6E0",
    "#F9A8C9",
    "#FADADD",
    "#FFE4EC",
];

const PETAL_PATH =
    "M10,0 C15,5 15,15 10,20 C5,15 5,5 10,0Z";

interface AmbientPetalProps {
    index: number;
}

const AmbientPetal: React.FC<AmbientPetalProps> = ({ index }) => {
    const x = (index * 17 + 5) % 100;
    const delay = (index * 1.1) % 7;
    const duration = 8 + (index % 6);
    const size = 9 + (index % 9);
    const color = PETAL_COLORS[index % PETAL_COLORS.length];

    return (
        <motion.div
            style={{
                position: "fixed",
                left: `${x}%`,
                top: 0,
                width: size,
                height: size,
                pointerEvents: "none",
                zIndex: 1,
            }}
            animate={{
                y: ["0vh", "110vh"],
                x: [0, 35, -25, 20, 0],
                rotate: [0, 200, 360],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "linear",
            }}
        >
            <svg viewBox="0 0 20 20" width={size} height={size} opacity={0.55}>
                <path d={PETAL_PATH} fill={color} />
            </svg>
        </motion.div>
    );
};

interface AmbientPetalLayerProps {
    count?: number;
}

/**
 * ชั้นกลีบดอกไม้ทั้งหน้า
 * memo เพื่อกัน re-render ไม่จำเป็น
 */
export const AmbientPetalLayer = React.memo(function AmbientPetalLayer({
    count = 14,
}: AmbientPetalLayerProps) {
    return (
        <>
            {Array.from({ length: count }, (_, i) => (
                <AmbientPetal key={i} index={i} />
            ))}
        </>
    );
});