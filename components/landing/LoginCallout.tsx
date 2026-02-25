// components/landing/LoginCallout.tsx
import React from "react";
import { motion } from "framer-motion";
import { StampCard } from "@/components/ui/StampCard";

export interface LoginCalloutProps {
    onLogin: () => void;
}

export const LoginCallout: React.FC<LoginCalloutProps> = ({ onLogin }) => {
    return (
        <motion.div
            key="login"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ delay: 0.7, duration: 0.5 }}
        >
            <StampCard
                bgColor="#E6D7BD"
                teethRadius={9}
                teethDensity={0.85}
                borderColor="rgba(180,140,120,0.3)"
            >
                <motion.button
                    type="button"
                    onClick={onLogin}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-8 py-3 flex items-center gap-2.5"
                    style={{
                        fontFamily: "'Noto Sans', sans-serif",
                        fontSize: 14,
                        color: "#7A6147",
                    }}
                >
                    {/* Twitch icon */}
                    <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4 flex-shrink-0"
                        fill="#7A6147"
                    >
                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                    </svg>
                    Login with Twitch to Enter
                </motion.button>
            </StampCard>
        </motion.div>
    );
};