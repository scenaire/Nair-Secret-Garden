// components/ui/ArchedFrame.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface ArchedFrameProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hasShadow?: boolean;
}

export const ArchedFrame = React.forwardRef<HTMLDivElement, ArchedFrameProps>(
    ({ className, children, hasShadow = true, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative overflow-hidden bg-surface border border-charcoal/10",
                    "rounded-t-[999px] rounded-b-2xl", // ตัดขอบบนเป็นซุ้มโค้ง ขอบล่างมนนิดๆ
                    hasShadow && "shadow-[var(--shadow-soft)]",
                    "transition-all duration-500 hover:shadow-[var(--shadow-glow)]", // แสง Glow เบาๆ ตอนเอาเมาส์วาง
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

ArchedFrame.displayName = "ArchedFrame";