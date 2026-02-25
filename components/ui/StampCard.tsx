"use client";

import React, { useId, useRef, useEffect, useState } from 'react';

interface StampCardProps {
    children: React.ReactNode;
    className?: string;
    teethDensity?: number;
    teethRadius?: number;
    bgColor?: string;
    borderColor?: string;
    innerPadding?: number;
}

/**
 * สร้าง SVG path ขอบแสตมป์แบบโป่งออกด้านนอก
 * sweep=1 = arc โป่งออกจากขอบ (นูนออกนอก)
 *
 * วาดบน canvas ที่ใหญ่กว่า content จริง r px ทุกด้าน
 * เพื่อให้ฟันยื่นออกนอก content โดยไม่กัดเนื้อหา
 */
function buildOutwardStampPath(
    W: number,  // ความกว้าง content จริง
    H: number,  // ความสูง content จริง
    r: number,  // รัศมีฟัน
    cntX: number,
    cntY: number,
): string {
    // offset ให้ path เริ่มที่ (0,0) แต่ฟันยื่นออกไปถึง -r
    // โดยการวาด path บน coordinate เดิม แต่ arc sweep ออกนอก
    const stepX = W / (cntX + 1);
    const stepY = H / (cntY + 1);
    let d = '';

    d += `M 0 0 `;

    // ด้านบน → (ฟันโป่งขึ้นบน: y จาก 0 ไป -r)
    for (let i = 1; i <= cntX; i++) {
        const cx = stepX * i;
        d += `L ${cx - r} 0 A ${r} ${r} 0 0 1 ${cx + r} 0 `;
    }
    d += `L ${W} 0 `;

    // ด้านขวา ↓ (ฟันโป่งออกขวา)
    for (let i = 1; i <= cntY; i++) {
        const cy = stepY * i;
        d += `L ${W} ${cy - r} A ${r} ${r} 0 0 1 ${W} ${cy + r} `;
    }
    d += `L ${W} ${H} `;

    // ด้านล่าง ← (ฟันโป่งลงล่าง)
    for (let i = cntX; i >= 1; i--) {
        const cx = stepX * i;
        d += `L ${cx + r} ${H} A ${r} ${r} 0 0 1 ${cx - r} ${H} `;
    }
    d += `L 0 ${H} `;

    // ด้านซ้าย ↑ (ฟันโป่งออกซ้าย)
    for (let i = cntY; i >= 1; i--) {
        const cy = stepY * i;
        d += `L 0 ${cy + r} A ${r} ${r} 0 0 1 0 ${cy - r} `;
    }
    d += 'Z';
    return d;
}

export function StampCard({
    children,
    className = '',
    teethDensity = 1.0,
    teethRadius = 10,
    bgColor = '#FFFDF9',
    borderColor = 'rgba(74,59,50,0.18)',
    innerPadding = 14,
}: StampCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ w: 600, h: 160 });
    const uid = useId().replace(/:/g, '');

    useEffect(() => {
        if (!containerRef.current) return;
        const obs = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ w: Math.max(width, 1), h: Math.max(height, 1) });
        });
        obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, []);

    const { w, h } = size;
    const r = teethRadius;
    const cntX = Math.max(2, Math.floor((w / 100) * teethDensity * 5));
    const cntY = Math.max(1, Math.floor((h / 100) * teethDensity * 5));
    const path = buildOutwardStampPath(w, h, r, cntX, cntY);
    const clipId = `stamp-${uid}`;

    return (
        // ✨ outer wrapper มี padding = r เพื่อเว้นที่ให้ฟันยื่นออกนอก
        <div
            className={`relative ${className}`}
            style={{ padding: r }}
        >
            {/* inner ref วัดขนาด content จริง */}
            <div ref={containerRef} className="relative w-full h-full">

                {/* SVG วาดขอบหยักล้นออกนอก content */}
                <svg
                    className="absolute pointer-events-none"
                    width={w}
                    height={h}
                    // ขยับ SVG ออกไป r px ทุกด้านเพื่อให้ฟันยื่นออกนอก
                    style={{
                        top: -r,
                        left: -r,
                        width: w + r * 2,
                        height: h + r * 2,
                        overflow: 'visible',
                    }}
                    viewBox={`${-r} ${-r} ${w + r * 2} ${h + r * 2}`}
                    aria-hidden="true"
                >
                    <defs>
                        <clipPath id={clipId}>
                            <path d={path} />
                        </clipPath>
                    </defs>

                    {/* พื้นหลัง clip ด้วย stamp shape */}
                    <rect
                        x={-r} y={-r}
                        width={w + r * 2}
                        height={h + r * 2}
                        fill={bgColor}
                        clipPath={`url(#${clipId})`}
                    />

                    {/* เส้นขอบ */}
                    <path
                        d={path}
                        fill="none"
                        stroke={borderColor}
                        strokeWidth="1.5"
                    />
                </svg>

                {/* เนื้อหา */}
                <div className="relative z-10 w-full h-full" style={{ padding: innerPadding }}>
                    {children}
                </div>

            </div>
        </div>
    );
}