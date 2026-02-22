// components/guestbook/editor/ToolbarUI.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export function Divider() {
    return <div className="w-px h-5 bg-[#4A3B32]/15 mx-0.5 sm:mx-1 flex-shrink-0" />;
}

export function ToolButton({ onClick, isActive, icon }: { onClick: () => void, isActive: boolean, icon: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center justify-center h-8 rounded-md transition-colors duration-200 flex-shrink-0 px-2",
                isActive ? "bg-[#F2C6C2]/30 text-[#B85C57] font-bold" : "text-[#4A3B32]/50 hover:bg-[#4A3B32]/5 hover:text-[#4A3B32]"
            )}
        >
            <div className="flex items-center gap-1">
                {icon}
            </div>
        </button>
    );
}

// ✨ Dropdown Portal: บังคับให้ลอยอยู่บนสุด ไม่โดนตัดขอบด้วย overflow-hidden
export function Dropdown({ isOpen, children, className }: { isOpen: boolean, children: React.ReactNode, className?: string }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={cn("absolute top-full mt-2 left-0 bg-[#FFFDF9] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#4A3B32]/10 p-2 min-w-[150px] z-[100]", className)}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function MenuItem({ onClick, isActive, icon, label, className }: { onClick: () => void, isActive: boolean, icon?: React.ReactNode, label: string, className?: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors text-left font-serif",
                isActive ? "bg-[#F2C6C2]/20 text-[#4A3B32] font-medium" : "text-[#4A3B32]/70 hover:bg-[#4A3B32]/5",
                className
            )}
        >
            {icon && <span className="text-[#4A3B32]/60">{icon}</span>}
            {label}
        </button>
    );
}

export function ColorDot({ onClick, isActive, color }: { onClick: () => void, isActive: boolean, color: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "w-6 h-6 rounded-full transition-transform duration-200 border-2",
                isActive ? "border-[#4A3B32]/50 scale-110 shadow-sm" : "border-transparent hover:scale-110"
            )}
        >
            <div className={cn("w-full h-full rounded-full opacity-80", color)} />
        </button>
    );
}