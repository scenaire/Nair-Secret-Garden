// components/landing/GardenMap.tsx
import React from "react";
import { motion } from "framer-motion";
import { StampCard } from "@/components/ui/StampCard";

export interface GardenFeature {
    href: string;
    emoji: string;
    title: string;
    subtitle: string;
    spanClassName?: string;
    badge: string;
    primary?: boolean;
}

const FEATURES: readonly GardenFeature[] = [
    {
        href: "/guestbook",
        emoji: "📖",
        title: "The Guestbook",
        subtitle: "Leave a wish for Nair",
        spanClassName: "md:col-span-2",
        badge: "Sign the book",
        primary: true,
    },
    {
        href: "/gallery",
        emoji: "🎨",
        title: "Art Pavilion",
        subtitle: "Fan art gallery",
        spanClassName: "",
        badge: "Submit art",
    },
    {
        href: "/canvas",
        emoji: "🖌️",
        title: "Picnic Canvas",
        subtitle: "Draw together, live",
        spanClassName: "",
        badge: "3 drawing now",
    },
    {
        href: "/wishlist",
        emoji: "⛲",
        title: "Wishing Well",
        subtitle: "Nair's wishlist",
        spanClassName: "md:col-span-2 max-w-sm mx-auto w-full",
        badge: "Make a wish",
    },
];

export interface GardenMapProps {
    onNavigate: (href: string) => void;
}

export const GardenMap: React.FC<GardenMapProps> = ({ onNavigate }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
        >
            {FEATURES.map((feature, index) => (
                <motion.div
                    key={feature.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    whileHover={{ scale: 1.03, rotate: 0.4 }}
                    className={feature.spanClassName}
                >
                    <StampCard
                        bgColor={feature.primary ? "#7C5E54" : "#FFFDF9"}
                        teethRadius={8}
                        teethDensity={0.9}
                        borderColor={
                            feature.primary
                                ? "rgba(0,0,0,0.15)"
                                : "rgba(180,140,120,0.2)"
                        }
                    >
                        <button
                            type="button"
                            onClick={() => onNavigate(feature.href)}
                            className="w-full px-5 py-4 flex items-center gap-4 text-left"
                        >
                            <span className="text-2xl flex-shrink-0">{feature.emoji}</span>

                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        fontFamily: "'Noto Sans', sans-serif",
                                        color: feature.primary ? "#FDFBF4" : "#8B5E52",
                                    }}
                                >
                                    {feature.title}
                                </p>
                                <p
                                    className="text-xs italic mt-0.5"
                                    style={{
                                        fontFamily: "'Noto Serif', serif",
                                        color: feature.primary
                                            ? "rgba(253,251,244,0.75)"
                                            : "rgba(139,94,82,0.75)",
                                    }}
                                >
                                    {feature.subtitle}
                                </p>
                            </div>

                            <span
                                className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{
                                    fontFamily: "'Noto Sans', sans-serif",
                                    backgroundColor: feature.primary
                                        ? "rgba(253,251,244,0.22)"
                                        : "rgba(230,215,189,0.5)",
                                    color: feature.primary ? "#FDFBF4" : "#7A6147",
                                }}
                            >
                                {feature.badge}
                            </span>
                        </button>
                    </StampCard>
                </motion.div>
            ))}
        </motion.div>
    );
};