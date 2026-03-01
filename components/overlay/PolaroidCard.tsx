// components/overlay/PolaroidCard.tsx
"use client";

import { useEffect, useRef } from "react";

interface PolaroidCardProps {
    username: string;
    imageUrl?: string;
    rotation: number;
    onReady?: () => void;
}

export function PolaroidCard({ username, imageUrl, rotation, onReady }: PolaroidCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Notify parent after entrance animation completes
        const t = setTimeout(() => onReady?.(), 550);
        return () => clearTimeout(t);
    }, [onReady]);

    return (
        <div
            ref={ref}
            style={{
                position: "relative",
                width: 120,
                background: "#fefefe",
                borderRadius: 3,
                padding: "6px 6px 22px 6px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
                transformOrigin: "bottom center",
                overflow: "hidden",
                animation: `pIn 0.55s cubic-bezier(0.34,1.5,0.64,1) forwards`,
                ["--p-rot" as any]: `${rotation}deg`,
            }}
        >
            {/* Image or placeholder */}
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={`${username}'s fan art`}
                    crossOrigin="anonymous"
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 1, display: "block" }}
                />
            ) : (
                <div style={{
                    width: "100%", aspectRatio: "1", borderRadius: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg,rgba(200,180,150,0.15),rgba(180,160,130,0.08))",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 10, fontStyle: "italic",
                    color: "rgba(0,0,0,0.25)", letterSpacing: 1,
                }}>
                    fan art
                </div>
            )}

            {/* Caption */}
            <div style={{
                marginTop: 4,
                fontFamily: "'Noto Sans Thai', 'DM Sans', sans-serif",
                fontSize: 9, fontWeight: 400,
                color: "rgba(0,0,0,0.5)", textAlign: "center",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                letterSpacing: "0.2px",
            }}>
                {username}
            </div>

            {/* Shimmer — clipped by overflow:hidden on parent */}
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.55) 50%,transparent 70%)",
                animation: "polShimmer 1.2s ease-in-out 0.4s 1 forwards",
                borderRadius: 3, pointerEvents: "none",
            }} />
        </div>
    );
}