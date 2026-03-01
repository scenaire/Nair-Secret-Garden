// components/overlay/RibbonLabel.tsx
"use client";

import { useEffect, useRef } from "react";

interface RibbonLabelProps {
    lastType: "seed" | "bloom" | null;
    lastUsername: string | null;
    count: number;
}

export function RibbonLabel({ lastType, lastUsername, count }: RibbonLabelProps) {
    const ribbonRef = useRef<HTMLDivElement>(null);
    const prevCount = useRef(count);

    // Flash animation on every update
    useEffect(() => {
        if (count !== prevCount.current && ribbonRef.current) {
            ribbonRef.current.style.animation = "none";
            void ribbonRef.current.offsetWidth;
            ribbonRef.current.style.animation = "ribbonUpdate 0.6s ease-out";
            prevCount.current = count;
        }
    }, [count]);

    const typeLabel = lastType === "seed" ? "last wish" : lastType === "bloom" ? "last fanart" : "—";

    return (
        <div style={{ position: "absolute", top: 254, left: 50, width: 200, pointerEvents: "none", zIndex: 30 }}>
            <div
                ref={ribbonRef}
                style={{
                    width: "100%",
                    background: "rgba(16,11,7,0.58)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    borderRadius: 4,
                    padding: "7px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                }}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 8, fontWeight: 300, letterSpacing: "2.5px",
                        textTransform: "uppercase",
                        color: "rgba(200,170,110,0.75)",
                        lineHeight: 1, marginBottom: 3,
                    }}>
                        {typeLabel}
                    </div>
                    <div style={{
                        fontFamily: "'Noto Sans Thai', 'DM Sans', sans-serif",
                        fontSize: 11, fontWeight: 500,
                        color: "rgba(255,240,215,0.92)",
                        lineHeight: 1.2,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                        {lastUsername ?? "—"}
                    </div>
                </div>
                <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 20, fontWeight: 300,
                    color: "rgba(255,240,215,0.88)",
                    letterSpacing: "-0.5px", flexShrink: 0,
                }}>
                    {count}
                </div>
            </div>
        </div>
    );
}