import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const Divider: React.FC = () => (
    // ✨ ดึงสีเส้นแบ่งมาจากตีมเลยค่ะ
    <div className="w-px h-5 bg-[var(--theme-toolbar-border)] mx-0.5 sm:mx-1 flex-shrink-0" />
);

interface ToolButtonProps {
    onClick: () => void;
    isActive: boolean;
    icon: ReactNode;
}

export const ToolButton: React.FC<ToolButtonProps> = React.memo(({ onClick, isActive, icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "flex items-center justify-center h-8 rounded-md transition-colors duration-200 flex-shrink-0 px-2",
            // ✨ สถานะ Active vs Inactive วิ่งตามตีมเป๊ะๆ
            isActive
                ? "bg-[var(--theme-toolbar-icon-active)] text-[var(--theme-text-link)] font-bold"
                : "text-[var(--theme-toolbar-icon-idle)] hover:bg-[var(--theme-toolbar-icon-hover)] hover:text-[var(--theme-text-body)]"
        )}
    >
        <div className="flex items-center gap-1">{icon}</div>
    </button>
));
ToolButton.displayName = 'ToolButton';

interface DropdownProps {
    isOpen: boolean;
    children: ReactNode;
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ isOpen, children, className }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                // ✨ เปลี่ยนสีกล่องและเส้นขอบให้เข้ากับตีม
                className={cn("absolute top-full mt-2 left-0 bg-[var(--theme-toolbar-bg)] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[var(--theme-toolbar-border)] p-2 min-w-[150px] z-[100]", className)}
            >
                {children}
            </motion.div>
        )}
    </AnimatePresence>
);

interface MenuItemProps {
    onClick: () => void;
    isActive: boolean;
    icon?: ReactNode;
    label: string;
    className?: string;
}

export const MenuItem: React.FC<MenuItemProps> = React.memo(({ onClick, isActive, icon, label, className }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors text-left font-noto-sans",
            // ✨ เมนูย่อยก็เปลี่ยนสี Hover และ Active ตามตีมเช่นกันค่ะ
            isActive
                ? "bg-[var(--theme-toolbar-icon-active)] text-[var(--theme-text-body)] font-medium"
                : "text-[var(--theme-text-body)] opacity-80 hover:bg-[var(--theme-toolbar-icon-hover)] hover:opacity-100",
            className
        )}
    >
        {icon && <span className="text-[var(--theme-toolbar-icon-idle)]">{icon}</span>}
        {label}
    </button>
));
MenuItem.displayName = 'MenuItem';

interface ColorDotProps {
    onClick: () => void;
    isActive: boolean;
    color: string;
}

export const ColorDot: React.FC<ColorDotProps> = React.memo(({ onClick, isActive, color }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "w-6 h-6 rounded-full transition-all duration-200 border-2",
            // ✨ ใช้ border-black โปร่งแสงนิดๆ จะได้เนียนเข้ากับทุกตีมเลยค่ะ
            isActive ? "border-black/20 scale-110 shadow-sm" : "border-transparent hover:scale-110"
        )}
    >
        <div className={cn("w-full h-full rounded-full opacity-80", color)} />
    </button>
));
ColorDot.displayName = 'ColorDot';