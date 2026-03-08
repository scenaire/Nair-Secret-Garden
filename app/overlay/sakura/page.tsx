// app/overlay/sakura/page.tsx
// Sakura tree stream overlay — separate from TerrariumOverlay.
//
// OBS Browser Source: point to /overlay/sakura
// Recommended size: 480×480 (or scale in OBS as needed)
//
// To connect live counts, replace the static values below
// with a fetch from your Supabase API.

import { SakuraOverlay } from "@/components/overlay/SakuraOverlay";

export const metadata = {
    title: "Sakura Overlay",
};

// ── Static counts (swap for real data when ready) ─────────────────────────────
// Example with server fetch:
//
//   import { createClient } from "@/lib/supabase/server";
//   const supabase = createClient();
//   const [gb, fa, wi] = await Promise.all([
//     supabase.from("guestbook_entries").select("id", { count: "exact", head: true }),
//     supabase.from("gallery_submissions").select("id", { count: "exact", head: true }),
//     supabase.from("wishes").select("id", { count: "exact", head: true }),
//   ]);

const GUESTBOOK_COUNT = 13;
const FANART_COUNT = 3;
const WISH_COUNT = 3;

export default function SakuraOverlayPage() {
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
            <SakuraOverlay
                gb={GUESTBOOK_COUNT}
                fa={FANART_COUNT}
                wi={WISH_COUNT}
            />
        </div>
    );
}