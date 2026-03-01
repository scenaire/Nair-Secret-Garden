// components/overlay/JarSVG.tsx
"use client";

import { useEffect, useRef } from "react";

interface JarSVGProps {
    shimmerOpacity: number;
}

export function JarSVG({ shimmerOpacity }: JarSVGProps) {
    const animRef = useRef<SVGAnimateElement | null>(null);

    useEffect(() => {
        if (shimmerOpacity > 0.04 && animRef.current) {
            try { animRef.current.beginElement(); } catch (_) { }
        }
    }, [shimmerOpacity]);

    return (
        <svg
            viewBox="0 0 300 250"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", top: 0, left: 0, width: 300, height: 250, pointerEvents: "none", overflow: "visible" }}
        >
            <defs>
                {/* Jar interior clip for shimmer */}
                <clipPath id="jarClip">
                    <path d="M122,38 Q122,46 112,51 L80,58 Q64,63 64,78 L64,228 Q64,240 80,240 L220,240 Q236,240 236,228 L236,78 Q236,63 220,58 L188,51 Q178,46 178,38 Q178,31 150,31 Q122,31 122,38 Z" />
                </clipPath>
                {/* Dreamy horizontal glass gradient */}
                <linearGradient id="gH" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.30" />
                    <stop offset="25%" stopColor="#fff" stopOpacity="0.05" />
                    <stop offset="78%" stopColor="#fff" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0.16" />
                </linearGradient>
                <linearGradient id="gV" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.09" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0.01" />
                </linearGradient>
                {/* Shimmer sweep gradient */}
                <linearGradient id="shimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="44%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#fff" stopOpacity="0.20" />
                    <stop offset="56%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Jar body fill */}
            <path
                d="M122,38 Q122,46 112,51 L80,58 Q62,63 62,80 L62,229 Q62,242 80,242 L220,242 Q238,242 238,229 L238,80 Q238,63 220,58 L188,51 Q178,46 178,38 Q178,30 150,30 Q122,30 122,38 Z"
                fill="rgba(215,205,185,0.09)" stroke="#b09878" strokeWidth="1.1"
            />

            {/* Left highlight streak */}
            <path d="M76,80 L76,227 Q76,236 84,238" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="2.6" strokeLinecap="round" />
            {/* Right faint streak */}
            <path d="M224,80 L224,227 Q224,236 216,238" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.2" strokeLinecap="round" />
            {/* Shoulder highlight */}
            <path d="M112,51 Q150,46 188,51" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1.4" />

            {/* Shimmer sweep — clipped inside jar */}
            <g clipPath="url(#jarClip)" opacity={shimmerOpacity}>
                <rect x="-300" y="30" width="900" height="215" fill="url(#shimGrad)">
                    <animate
                        ref={animRef}
                        attributeName="x"
                        from="-300" to="500"
                        dur="4s"
                        repeatCount="indefinite"
                        begin="indefinite"
                    />
                </rect>
            </g>

            {/* Glass overlay — sits above balls */}
            <path
                d="M122,38 Q122,46 112,51 L80,58 Q62,63 62,80 L62,229 Q62,242 80,242 L220,242 Q238,242 238,229 L238,80 Q238,63 220,58 L188,51 Q178,46 178,38 Q178,30 150,30 Q122,30 122,38 Z"
                fill="url(#gH)" pointerEvents="none"
            />
            <path
                d="M122,38 Q122,46 112,51 L80,58 Q62,63 62,80 L62,229 Q62,242 80,242 L220,242 Q238,242 238,229 L238,80 Q238,63 220,58 L188,51 Q178,46 178,38 Q178,30 150,30 Q122,30 122,38 Z"
                fill="url(#gV)" pointerEvents="none"
            />

            {/* Cork */}
            <rect x="124" y="12" width="52" height="22" rx="4.5" fill="#c09060" stroke="#906828" strokeWidth="1" />
            <rect x="130" y="10" width="40" height="15" rx="3.5" fill="#cfa070" stroke="#a07830" strokeWidth="0.8" />
            {[138, 147, 156, 165].map(x => (
                <line key={x} x1={x} y1="11" x2={x - 2} y2="23" stroke="#906828" strokeWidth="0.5" opacity="0.4" />
            ))}
        </svg>
    );
}