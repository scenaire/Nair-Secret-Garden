// components/canvas/PixelCanvas.tsx
"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import {
    CANVAS_WIDTH, CANVAS_HEIGHT,
    screenToCanvas, drawPixel, floodFill, pickColor,
    type Pixel, type PixelColor,
} from "@/lib/pixelEngine";

export type Tool = "pencil" | "eraser" | "fill" | "eyedropper";

interface PixelCanvasProps {
    tool: Tool;
    color: PixelColor;
    brushSize: number;
    onColorPick: (color: PixelColor) => void;
    onStroke: (pixels: Pixel[]) => void;
    userId: string;
}

// expose ref สำหรับ parent ใช้ (saveSnapshot, download)
export interface PixelCanvasRef {
    getCanvas: () => HTMLCanvasElement | null;
    applyRemotePixels: (pixels: Pixel[]) => void;
    loadSnapshotFromUrl: (url: string) => void; // ✨ ใหม่
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 16;

export const PixelCanvas = React.forwardRef<PixelCanvasRef, PixelCanvasProps>(
    ({ tool, color, brushSize, onColorPick, onStroke, userId }, ref) => {

        const offscreenRef = useRef<HTMLCanvasElement | null>(null); // full-res 960×540
        const displayRef = useRef<HTMLCanvasElement | null>(null); // on-screen scaled
        const containerRef = useRef<HTMLDivElement | null>(null);

        const [zoom, setZoom] = useState(1);
        const [pan, setPan] = useState({ x: 0, y: 0 });

        const isDrawing = useRef(false);
        const lastPixel = useRef<{ x: number; y: number } | null>(null);
        const strokeBuf = useRef<Pixel[]>([]);
        const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
        const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

        // ── init offscreen canvas ──────────────────────────────────────────────
        useEffect(() => {
            // ถ้ามีคนเรียก loadSnapshotFromUrl ก่อนหน้านี้แล้ว
            // ไม่ต้องสร้าง/ทับ offscreen ซ้ำ
            if (offscreenRef.current) return;

            const off = document.createElement("canvas");
            off.width = CANVAS_WIDTH;
            off.height = CANVAS_HEIGHT;
            const ctx = off.getContext("2d")!;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            offscreenRef.current = off;
        }, []);

        // ── expose ref ─────────────────────────────────────────────────────────
        React.useImperativeHandle(ref, () => ({
            getCanvas: () => offscreenRef.current,

            applyRemotePixels: (pixels: Pixel[]) => {
                const off = offscreenRef.current;
                if (!off) return;
                const ctx = off.getContext("2d")!;
                pixels.forEach((p) => drawPixel(ctx, p));
                renderDisplay();
            },

            // ✨ โหลด snapshot จาก URL แล้ววาดลง offscreen
            loadSnapshotFromUrl: (url: string) => {
                // ถ้ายังไม่มี offscreen ให้สร้างเลย
                let off = offscreenRef.current;
                if (!off) {
                    off = document.createElement("canvas");
                    off.width = CANVAS_WIDTH;
                    off.height = CANVAS_HEIGHT;
                    offscreenRef.current = off;
                }

                const img = new Image();
                img.crossOrigin = "anonymous";

                img.onload = () => {
                    const ctx = off!.getContext("2d");
                    if (!ctx) return;

                    // เคลียร์ก่อน เผื่อมีอะไรค้างอยู่
                    ctx.clearRect(0, 0, off!.width, off!.height);
                    // วาดเต็มพื้นที่ canvas
                    ctx.drawImage(img, 0, 0, off!.width, off!.height);

                    // ให้จอแสดงผลตาม offscreen
                    renderDisplay();
                };

                img.onerror = () => {
                    console.error("[PixelCanvas] failed to load snapshot image", url);
                };

                img.src = url;
            },
        }));

        // ── render offscreen → display (apply zoom/pan) ───────────────────────
        const renderDisplay = useCallback(() => {
            const display = displayRef.current;
            const off = offscreenRef.current;
            if (!display || !off) return;
            const ctx = display.getContext("2d")!;
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, display.width, display.height);
            ctx.save();
            ctx.translate(pan.x, pan.y);
            ctx.scale(zoom, zoom);
            ctx.drawImage(off, 0, 0);
            // grid overlay เมื่อ zoom ≥ 4
            if (zoom >= 4) {
                ctx.strokeStyle = "rgba(180,140,120,0.2)";
                ctx.lineWidth = 1 / zoom;
                for (let x = 0; x <= CANVAS_WIDTH; x += brushSize) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
                }
                for (let y = 0; y <= CANVAS_HEIGHT; y += brushSize) {
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
                }
            }
            ctx.restore();
        }, [zoom, pan, brushSize]);

        useEffect(() => { renderDisplay(); }, [renderDisplay]);

        // ── resize display canvas to container ────────────────────────────────
        useEffect(() => {
            const observer = new ResizeObserver(() => {
                const el = displayRef.current;
                const ct = containerRef.current;
                if (!el || !ct) return;
                el.width = ct.clientWidth;
                el.height = ct.clientHeight;
                renderDisplay();
            });
            if (containerRef.current) observer.observe(containerRef.current);
            return () => observer.disconnect();
        }, [renderDisplay]);

        // ── fit canvas to view on mount ───────────────────────────────────────
        useEffect(() => {
            const ct = containerRef.current;
            if (!ct) return;
            const fitZoom = Math.min(ct.clientWidth / CANVAS_WIDTH, ct.clientHeight / CANVAS_HEIGHT) * 0.9;
            const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fitZoom));
            setZoom(z);
            setPan({
                x: (ct.clientWidth - CANVAS_WIDTH * z) / 2,
                y: (ct.clientHeight - CANVAS_HEIGHT * z) / 2,
            });
        }, []);

        // ── flush stroke buffer to parent ─────────────────────────────────────
        const flushStroke = useCallback(() => {
            if (strokeBuf.current.length === 0) return;
            onStroke([...strokeBuf.current]);
            strokeBuf.current = [];
        }, [onStroke]);

        // ── get canvas pixel from event ───────────────────────────────────────
        const getPixelCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
            const display = displayRef.current;
            if (!display) return null;
            const rect = display.getBoundingClientRect();
            const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
            const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
            return screenToCanvas(clientX, clientY, rect, zoom, pan.x, pan.y, brushSize);
        }, [zoom, pan, brushSize]);

        // ── draw pixel(s) on offscreen ─────────────────────────────────────────
        const paintAt = useCallback((x: number, y: number) => {
            const off = offscreenRef.current;
            if (!off) return;
            const ctx = off.getContext("2d")!;
            const c = tool === "eraser" ? "#FFFFFF" : color;
            const p: Pixel = { x, y, color: c, size: brushSize };
            drawPixel(ctx, p);
            strokeBuf.current.push(p);
            renderDisplay();

            // throttle flush
            if (flushTimer.current) clearTimeout(flushTimer.current);
            flushTimer.current = setTimeout(flushStroke, 32);
        }, [tool, color, brushSize, renderDisplay, flushStroke]);

        // ── line interpolation (Bresenham) ────────────────────────────────────
        const paintLine = useCallback((x0: number, y0: number, x1: number, y1: number) => {
            const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
            const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
            let err = dx - dy;
            while (true) {
                paintAt(x0, y0);
                if (x0 === x1 && y0 === y1) break;
                const e2 = 2 * err;
                if (e2 > -dy) { err -= dy; x0 += sx; }
                if (e2 < dx) { err += dx; y0 += sy; }
            }
        }, [paintAt]);

        // ── Mouse events ──────────────────────────────────────────────────────
        const handleMouseDown = useCallback((e: React.MouseEvent) => {
            // middle click / space+drag → pan mode
            if (e.button === 1 || (e.button === 0 && e.altKey)) {
                panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
                return;
            }
            if (e.button !== 0) return;
            const coords = getPixelCoords(e);
            if (!coords) return;

            const off = offscreenRef.current;
            if (!off) return;
            const ctx = off.getContext("2d")!;

            if (tool === "eyedropper") {
                const picked = pickColor(ctx, coords.x, coords.y, brushSize);
                onColorPick(picked);
                return;
            }
            if (tool === "fill") {
                floodFill(ctx, coords.x, coords.y, color, brushSize);
                const fillPixels: Pixel[] = [{ x: coords.x, y: coords.y, color: `FILL:${color}`, size: brushSize }];
                onStroke(fillPixels);
                renderDisplay();
                return;
            }

            isDrawing.current = true;
            lastPixel.current = coords;
            strokeBuf.current = [];
            paintAt(coords.x, coords.y);
        }, [tool, color, brushSize, pan, getPixelCoords, paintAt, floodFill, onColorPick, onStroke, renderDisplay]);

        const handleMouseMove = useCallback((e: React.MouseEvent) => {
            // pan
            if (panStart.current) {
                const dx = e.clientX - panStart.current.mx;
                const dy = e.clientY - panStart.current.my;
                setPan({ x: panStart.current.px + dx, y: panStart.current.py + dy });
                return;
            }
            if (!isDrawing.current) return;
            const coords = getPixelCoords(e);
            if (!coords) return;
            const last = lastPixel.current;
            if (last) paintLine(last.x, last.y, coords.x, coords.y);
            lastPixel.current = coords;
        }, [getPixelCoords, paintLine]);

        const handleMouseUp = useCallback(() => {
            panStart.current = null;
            if (!isDrawing.current) return;
            isDrawing.current = false;
            lastPixel.current = null;
            flushStroke();
        }, [flushStroke]);

        // ── Wheel zoom ────────────────────────────────────────────────────────
        const handleWheel = useCallback((e: React.WheelEvent) => {
            e.preventDefault();
            const display = displayRef.current;
            if (!display) return;
            const rect = display.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
            const newZ = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor));
            // zoom toward cursor
            setPan(p => ({
                x: mx - (mx - p.x) * (newZ / zoom),
                y: my - (my - p.y) * (newZ / zoom),
            }));
            setZoom(newZ);
        }, [zoom]);

        // cursor style
        const cursorStyle =
            tool === "eyedropper" ? "crosshair" :
                tool === "fill" ? "cell" : "crosshair";

        return (
            <div
                ref={containerRef}
                className="relative w-full h-full overflow-hidden rounded-xl"
                style={{
                    backgroundColor: "#E0D8C5",
                    backgroundImage: `
      /* ช่องสีเขียวทึบ */
      linear-gradient(
        0deg,
        rgba(131, 158, 81, 0.18) 50%,
        transparent 50%
      ),
      linear-gradient(
        90deg,
        rgba(131, 158, 81, 0.18) 50%,
        transparent 50%
      ),

      /* ลายเฉียงในอีกครึ่งช่อง */
      repeating-linear-gradient(
        45deg,
        rgba(131, 158, 81, 0.22) 0px,
        rgba(131, 158, 81, 0.22) 2px,
        transparent 2px,
        transparent 6px
      )
    `,
                    backgroundSize: "48px 48px, 48px 48px, 48px 48px",
                    backgroundBlendMode: "multiply",
                }}
            >

                <canvas
                    ref={displayRef}
                    className="absolute inset-0"
                    style={{ cursor: cursorStyle, touchAction: "none" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                />
                {/* Zoom indicator */}
                <div className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-lg pointer-events-none"
                    style={{ backgroundColor: "rgba(44,24,16,0.6)", color: "#F4C9D4", fontFamily: "'Noto Sans', sans-serif", backdropFilter: "blur(8px)" }}>
                    {Math.round(zoom * 100)}%
                </div>
            </div>
        );
    });

PixelCanvas.displayName = "PixelCanvas";