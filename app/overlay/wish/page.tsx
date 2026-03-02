// app/overlay/wish/page.tsx
// Standalone OBS Browser Source for Wishing Well notifications.
// Add as a SEPARATE source in OBS — position/resize independently from terrarium.
//
// OBS Browser Source settings:
//   URL    : https://your-domain.com/overlay/wish
//   Width  : 1920   Height: 1080  (or match stream resolution)
//   Custom CSS: body { background: transparent !important; }
//   Tick: Shutdown source when not visible

import { WishOverlay } from "@/components/overlay/WishOverlay";

export const metadata = { title: "Wish Overlay" };

export default function WishOverlayPage() {
    return <WishOverlay />;
}