// app/overlay/page.tsx
import { TerrariumOverlay } from "@/components/overlay/TerrariumOverlay";

// Tell Next.js not to wrap this page in the root layout
export const metadata = {
    title: "Garden Overlay",
};

export default function OverlayPage() {
    return (
        <div
            style={{
                // Transparent background — OBS Browser Source will show stream behind this
                background: "transparent",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                // Position overlay in top-left corner (adjust in OBS if needed)
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                padding: "16px",
            }}
        >
            <TerrariumOverlay />
        </div>
    );
}