// app/overlay/layout.tsx
// Nested layouts in Next.js App Router cannot re-declare <html>/<body>.
// Instead we inject a <style> tag and wrap children in a plain fragment.
// The root layout already provides the <html>/<body> shell.

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Garden Overlay",
};

export default function OverlayLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* Override root-layout body styles for this route only */}
            <style>{`
                body {
                    background: transparent !important;
                    overflow: hidden !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
            `}</style>
            {children}
        </>
    );
}