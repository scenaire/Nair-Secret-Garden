// components/overlay/NotifToast.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export interface ToastItem {
    id: string;
    username: string;
    type: "seed" | "bloom";
    dotColor: string;
}

interface NotifToastProps {
    queue: ToastItem[];
    onDone: (id: string) => void;
}

export function NotifToast({ queue, onDone }: NotifToastProps) {
    const [active, setActive] = useState<ToastItem | null>(null);
    const [hiding, setHiding] = useState(false);
    const busyRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (busyRef.current || queue.length === 0) return;
        busyRef.current = true;
        const item = queue[0];
        setActive(item);
        setHiding(false);

        timerRef.current = setTimeout(() => {
            setHiding(true);
            setTimeout(() => {
                setActive(null);
                setHiding(false);
                busyRef.current = false;
                onDone(item.id);
            }, 400);
        }, 5000);

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [queue, onDone]);

    if (!active) return null;

    const action = active.type === "seed" ? "planted a seed" : "a bloom arrived";

    return (
        <div style={{
            position: "absolute", left: 50, width: 200, top: 100, zIndex: 40, pointerEvents: "none",
        }}>
            <div style={{
                width: "100%",
                background: "rgba(14,9,5,0.78)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(190,150,90,0.28)",
                borderLeft: "2.5px solid rgba(190,150,90,0.65)",
                borderRadius: 3,
                padding: "7px 10px",
                animation: hiding ? "cardOut 0.38s ease-in forwards" : "cardIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
            }}>
                <div style={{
                    fontFamily: "'Noto Sans Thai', 'DM Sans', sans-serif",
                    fontSize: 11, fontWeight: 500, color: "rgba(255,238,210,0.96)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                    <span style={{
                        display: "inline-block", width: 5, height: 5, borderRadius: "50%",
                        background: active.dotColor,
                        boxShadow: `0 0 4px ${active.dotColor}88`,
                        marginRight: 5, verticalAlign: "middle", position: "relative", top: -1,
                    }} />
                    {active.username}
                </div>
                <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 10, fontStyle: "italic", fontWeight: 300,
                    color: "rgba(190,150,90,0.82)", marginTop: 1,
                }}>
                    {action}
                </div>
            </div>
        </div>
    );
}