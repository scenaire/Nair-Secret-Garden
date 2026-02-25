// lib/pixelEngine.ts

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

export type PixelColor = string; // hex e.g. "#FF88AA"

export interface Pixel {
    x: number;
    y: number;
    color: PixelColor;
    size: number; // 1 | 2 | 4
}

// วาด pixel บน offscreen canvas
export function drawPixel(ctx: CanvasRenderingContext2D, pixel: Pixel) {
    ctx.fillStyle = pixel.color;
    ctx.fillRect(
        Math.floor(pixel.x) * pixel.size,
        Math.floor(pixel.y) * pixel.size,
        pixel.size,
        pixel.size
    );
}

// แปลง screen coords → canvas pixel coords (คำนึง zoom + pan)
export function screenToCanvas(
    screenX: number,
    screenY: number,
    canvasRect: DOMRect,
    zoom: number,
    panX: number,
    panY: number,
    brushSize: number
): { x: number; y: number } {
    const relX = screenX - canvasRect.left;
    const relY = screenY - canvasRect.top;
    const cx = (relX - panX) / zoom;
    const cy = (relY - panY) / zoom;
    return {
        x: Math.floor(cx / brushSize),
        y: Math.floor(cy / brushSize),
    };
}

// BFS flood fill
export function floodFill(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    fillColor: PixelColor,
    brushSize: number
) {
    const px = startX * brushSize;
    const py = startY * brushSize;
    const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imageData.data;

    const idx = (x: number, y: number) => (y * CANVAS_WIDTH + x) * 4;
    const startIdx = idx(px, py);
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    const targetA = data[startIdx + 3];

    // parse fill color
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    if (targetR === fillR && targetG === fillG && targetB === fillB) return;

    const colorMatch = (x: number, y: number) => {
        const i = idx(x, y);
        return data[i] === targetR && data[i + 1] === targetG && data[i + 2] === targetB && data[i + 3] === targetA;
    };

    const queue: [number, number][] = [[px, py]];
    const visited = new Uint8Array(CANVAS_WIDTH * CANVAS_HEIGHT);

    while (queue.length > 0) {
        const [cx, cy] = queue.pop()!;
        if (cx < 0 || cx >= CANVAS_WIDTH || cy < 0 || cy >= CANVAS_HEIGHT) continue;
        const vi = cy * CANVAS_WIDTH + cx;
        if (visited[vi]) continue;
        if (!colorMatch(cx, cy)) continue;

        visited[vi] = 1;
        const i = idx(cx, cy);
        data[i] = fillR;
        data[i + 1] = fillG;
        data[i + 2] = fillB;
        data[i + 3] = 255;

        queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
}

// eyedropper — get color at canvas pixel
export function pickColor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    brushSize: number
): PixelColor {
    const px = x * brushSize;
    const py = y * brushSize;
    const d = ctx.getImageData(px, py, 1, 1).data;
    return `#${d[0].toString(16).padStart(2, "0")}${d[1].toString(16).padStart(2, "0")}${d[2].toString(16).padStart(2, "0")}`;
}

// Palette สี birthday — pastel + earth tone
export const PALETTE: PixelColor[] = [
    // Row 1 — neutrals
    "#FFFFFF", "#F5F0E8", "#E8D5C4", "#C4A882",
    "#8B7355", "#5C4A32", "#2C1810", "#000000",
    // Row 2 — pinks & reds
    "#FFE4EC", "#FFB7C5", "#FF8FAB", "#FF6B9D",
    "#E85D87", "#C94070", "#9B2050", "#6B0F2E",
    // Row 3 — warm tones
    "#FFF3E0", "#FFD08A", "#FFB347", "#FF8C42",
    "#E8723A", "#C45C2E", "#9B4020", "#6B2810",
    // Row 4 — greens
    "#E8F5E9", "#C8E6C9", "#A5D6A7", "#81C784",
    "#66BB6A", "#4CAF50", "#388E3C", "#1B5E20",
    // Row 5 — blues & purples
    "#E3F2FD", "#BBDEFB", "#90CAF9", "#64B5F6",
    "#B39DDB", "#9575CD", "#7E57C2", "#512DA8",
    // Row 6 — lavender & blush (theme colors)
    "#F8F5FF", "#E3D9F6", "#C8B8F0", "#A899E8",
    "#FFF3F6", "#F4C9D4", "#EBA0B4", "#D97090",
];