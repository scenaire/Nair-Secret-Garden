// components/ui/PolaroidFrame.tsx
import React from "react";
import { motion } from "framer-motion";

export interface PolaroidFrameProps {
    children: React.ReactNode;
    caption?: string;
}

export function PolaroidFrame({ children, caption }: PolaroidFrameProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.88, rotate: -3, y: 30 }}
            animate={{ opacity: 1, scale: 1, rotate: -1.5, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
            style={{
                filter: "drop-shadow(0 8px 32px rgba(139,94,82,0.18))",
            }}
        >
            <div
                className="relative bg-white p-3 pb-10"
                style={{
                    boxShadow:
                        "0 4px 24px rgba(139,94,82,0.12), 0 1px 4px rgba(0,0,0,0.08)",
                }}
            >
                <div
                    className="relative overflow-hidden"
                    style={{
                        width: "min(72vw, 1066px)",
                        height: "min(60vw, 600px)",
                        borderRadius: 8,
                        backgroundColor: "#F9F0E8",
                    }}
                >
                    {children}
                </div>

                {caption && (
                    <p
                        className="text-center mt-3 text-xs italic opacity-60"
                        style={{ fontFamily: "'Noto Serif', serif", color: "#8B5E52" }}
                    >
                        {caption}
                    </p>
                )}
            </div>

            {/* เทปด้านบน */}
            <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 opacity-50 z-10"
                style={{
                    backgroundColor: "#FFE4B5",
                    transform: "translateX(-50%) rotate(-2deg)",
                }}
            />
        </motion.div>
    );
}