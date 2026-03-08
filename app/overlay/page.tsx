// app/overlay/page.tsx
import { TerrariumOverlay } from "@/components/overlay/TerrariumOverlay";

export const metadata = {
    title: "Garden Overlay",
};

export default function OverlayPage() {
    return (
        <div
            style={{
                background: "transparent",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
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