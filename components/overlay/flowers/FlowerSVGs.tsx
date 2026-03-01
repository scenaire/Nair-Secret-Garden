// components/overlay/flowers/FlowerSVGs.tsx
// All 5 flower types as pure SVG renderers

interface FlowerProps {
    palette: { center: string; petal: string; stem: string };
    stemH: number;
    flowerW: number;
    uid: string;
    scaleFactor: number;
}

// ── Shared stem + leaf ────────────────────────────────────────────────────────
function Stem({ cx, stemH, color, flowerW }: { cx: number; stemH: number; color: string; flowerW: number }) {
    return (
        <>
            <path
                d={`M${cx},${stemH + 12} Q${cx + 2},${stemH * 0.5 + 12} ${cx},12`}
                fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round"
            />
            <path
                d={`M${cx},${stemH * 0.55 + 12} Q${cx + 12},${stemH * 0.4 + 12} ${cx + 7},${stemH * 0.33 + 12}`}
                fill={color} fillOpacity="0.6" stroke={color} strokeWidth="0.4"
            />
        </>
    );
}

// ── Center disc with inner glow ───────────────────────────────────────────────
function CenterDisc({ cx, cy, r, color, uid }: { cx: number; cy: number; r: number; color: string; uid: string }) {
    return (
        <>
            <defs>
                <radialGradient id={`cg${uid}`} cx="38%" cy="35%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
                <filter id={`cf${uid}`}>
                    <feGaussianBlur stdDeviation="1.1" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <circle cx={cx} cy={cy} r={r} fill={color} stroke="rgba(180,130,40,0.3)" strokeWidth="0.5" filter={`url(#cf${uid})`} />
            <circle cx={cx} cy={cy} r={r} fill={`url(#cg${uid})`} />
            <circle cx={cx + 1.5} cy={cy - 1.5} r="0.9" fill="rgba(255,255,255,0.6)" />
        </>
    );
}

// ── Daisy (50%) ───────────────────────────────────────────────────────────────
export function DaisySVG({ palette, stemH, flowerW, uid, scaleFactor }: FlowerProps) {
    const cx = flowerW / 2, cy = 12, petalR = 4 * scaleFactor, petalRY = 2.8 * scaleFactor;
    const petals = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const px = cx + Math.cos(a) * 9, py = cy + Math.sin(a) * 9;
        return (
            <ellipse key={i} cx={px} cy={py} rx={petalR} ry={petalRY}
                fill={palette.petal} fillOpacity="0.92" stroke={palette.center} strokeWidth="0.3"
                transform={`rotate(${(a * 180) / Math.PI},${px},${py})`}
            />
        );
    });
    return (
        <svg width={flowerW} height={stemH + 16} viewBox={`0 0 ${flowerW} ${stemH + 16}`} overflow="visible">
            <Stem cx={cx} stemH={stemH} color={palette.stem} flowerW={flowerW} />
            {petals}
            <CenterDisc cx={cx} cy={cy} r={5 * scaleFactor} color={palette.center} uid={uid} />
        </svg>
    );
}

// ── Tulip (20%) ───────────────────────────────────────────────────────────────
export function TulipSVG({ palette, stemH, flowerW, uid, scaleFactor }: FlowerProps) {
    const cx = flowerW / 2, cy = 12;
    return (
        <svg width={flowerW} height={stemH + 16} viewBox={`0 0 ${flowerW} ${stemH + 16}`} overflow="visible">
            <Stem cx={cx} stemH={stemH} color={palette.stem} flowerW={flowerW} />
            <path
                d={`M${cx},${cy + 8} C${cx - 7},${cy + 4} ${cx - 8},${cy - 4} ${cx},${cy - 10} C${cx + 8},${cy - 4} ${cx + 7},${cy + 4} ${cx},${cy + 8}Z`}
                fill={palette.petal} fillOpacity="0.9" stroke={palette.center} strokeWidth="0.5"
            />
            <path
                d={`M${cx - 2},${cy + 7} C${cx - 6},${cy + 2} ${cx - 6},${cy - 3} ${cx - 1},${cy - 9}`}
                fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6"
            />
            <CenterDisc cx={cx} cy={cy - 2} r={2.5 * scaleFactor} color={palette.center} uid={uid} />
        </svg>
    );
}

// ── Cosmos (15%) ──────────────────────────────────────────────────────────────
export function CosmosSVG({ palette, stemH, flowerW, uid, scaleFactor }: FlowerProps) {
    const cx = flowerW / 2, cy = 12;
    const petals = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const px = cx + Math.cos(a) * 11, py = cy + Math.sin(a) * 11;
        return (
            <ellipse key={i} cx={px} cy={py} rx={2.5 * scaleFactor} ry={5 * scaleFactor}
                fill={palette.petal} fillOpacity="0.88" stroke={palette.center} strokeWidth="0.3"
                transform={`rotate(${(a * 180) / Math.PI},${px},${py})`}
            />
        );
    });
    return (
        <svg width={flowerW} height={stemH + 16} viewBox={`0 0 ${flowerW} ${stemH + 16}`} overflow="visible">
            <Stem cx={cx} stemH={stemH} color={palette.stem} flowerW={flowerW} />
            {petals}
            <CenterDisc cx={cx} cy={cy} r={4 * scaleFactor} color={palette.center} uid={uid} />
        </svg>
    );
}

// ── Rose (10%) ────────────────────────────────────────────────────────────────
export function RoseSVG({ palette, stemH, flowerW, uid, scaleFactor }: FlowerProps) {
    const cx = flowerW / 2, cy = 12;
    const layers = [
        { r: 8 * scaleFactor, fill: "rgba(255,200,210,0.9)" },
        { r: 6 * scaleFactor, fill: "rgba(255,170,185,0.85)" },
        { r: 4 * scaleFactor, fill: "rgba(240,140,160,0.8)" },
    ];
    return (
        <svg width={flowerW} height={stemH + 16} viewBox={`0 0 ${flowerW} ${stemH + 16}`} overflow="visible">
            <Stem cx={cx} stemH={stemH} color={palette.stem} flowerW={flowerW} />
            {layers.map(({ r, fill }, i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill={fill} stroke="rgba(200,100,120,0.3)" strokeWidth="0.4" />
            ))}
            <path d={`M${cx - 3},${cy} Q${cx},${cy - 4} ${cx + 3},${cy}`} fill="rgba(255,255,255,0.3)" />
            <CenterDisc cx={cx} cy={cy} r={2 * scaleFactor} color={palette.center} uid={uid} />
        </svg>
    );
}

// ── Lily (5%) ─────────────────────────────────────────────────────────────────
export function LilySVG({ palette, stemH, flowerW, uid, scaleFactor }: FlowerProps) {
    const cx = flowerW / 2, cy = 12;
    const petals = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const px = cx + Math.cos(a) * 10, py = cy + Math.sin(a) * 10;
        const mx = cx + Math.cos(a + 0.4) * 6, my = cy + Math.sin(a + 0.4) * 6;
        return (
            <path key={i}
                d={`M${cx},${cy} Q${mx.toFixed(1)},${my.toFixed(1)} ${px.toFixed(1)},${py.toFixed(1)}`}
                fill={palette.petal} fillOpacity="0.85" stroke={palette.center} strokeWidth="0.4"
            />
        );
    });
    const stamens = Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        const sx = cx + Math.cos(a) * 4, sy = cy + Math.sin(a) * 4;
        return (
            <g key={i}>
                <line x1={cx} y1={cy} x2={sx} y2={sy} stroke={palette.center} strokeWidth="0.8" />
                <circle cx={sx} cy={sy} r="0.9" fill={palette.center} />
            </g>
        );
    });
    return (
        <svg width={flowerW} height={stemH + 16} viewBox={`0 0 ${flowerW} ${stemH + 16}`} overflow="visible">
            <Stem cx={cx} stemH={stemH} color={palette.stem} flowerW={flowerW} />
            {petals}
            {stamens}
            <CenterDisc cx={cx} cy={cy} r={3 * scaleFactor} color={palette.center} uid={uid} />
        </svg>
    );
}