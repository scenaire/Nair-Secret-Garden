// components/ui/SoftButton.tsx
import React from "react";
import { cn } from "@/lib/utils";

export interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
}

export const SoftButton = React.forwardRef<HTMLButtonElement, SoftButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {

        // จัดการสไตล์ตาม Variant ที่เลือก
        const variants = {
            primary: "bg-blush text-charcoal border-blush hover:brightness-105",
            secondary: "bg-cream text-charcoal border-cream hover:brightness-105",
            outline: "bg-transparent text-sage border-sage/50 hover:bg-sage/5 hover:border-sage",
        };

        const sizes = {
            sm: "px-4 py-1.5 text-sm",
            md: "px-6 py-2.5 text-base",
            lg: "px-8 py-3 text-lg font-medium",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    // Base Styles (กฎพื้นฐานของปุ่ม)
                    "inline-flex items-center justify-center rounded-lg border transition-all duration-300 ease-out",
                    "focus:outline-none focus:ring-2 focus:ring-blush/50 focus:ring-offset-2 focus:ring-offset-paper",
                    // Hover & Active Effects (ความรู้สึก Dreamlike)
                    "hover:-translate-y-[2px] hover:shadow-[var(--shadow-soft)]",
                    "active:translate-y-0 active:shadow-none",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

SoftButton.displayName = "SoftButton";