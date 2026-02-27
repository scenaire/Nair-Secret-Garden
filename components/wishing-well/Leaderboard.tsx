// components/wishing-well/Leaderboard.tsx
"use client";

import { Star } from "lucide-react";
import { formatBaht, type LeaderboardEntry } from "@/lib/wishingWellSync";

interface LeaderboardProps {
    entries: LeaderboardEntry[];
}

const RANK_STYLES: Record<number, React.CSSProperties> = {
    1: { background: "linear-gradient(135deg, #4A6B45, #8FAF8A)", color: "white" },
    2: { background: "rgba(143,175,138,0.25)", color: "#4A6B45" },
    3: { background: "rgba(143,175,138,0.15)", color: "#4A6B45" },
};

export function Leaderboard({ entries }: LeaderboardProps) {
    if (entries.length === 0) return null;

    const top3 = entries.slice(0, 3);
    const rest = entries.slice(3, 8);

    return (
        <div style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(143,175,138,0.2)",
            borderRadius: 12, padding: "16px 18px",
            minWidth: 200, maxWidth: 230,
            backdropFilter: "blur(4px)",
            flexShrink: 0,
        }}>
            {/* title */}
            <div className="flex items-center gap-1.5" style={{ marginBottom: 12 }}>
                <Star size={10} style={{ color: "#4A6B45", opacity: 0.6 }} />
                <span style={{ fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.5 }}>
                    Top Gifters
                </span>
            </div>

            <div className="flex flex-col gap-2">
                {/* top 3 */}
                {top3.map((e, i) => (
                    <div key={e.user_id} className="flex items-center gap-2">
                        <div style={{
                            width: 18, height: 18, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 600, flexShrink: 0,
                            ...(RANK_STYLES[i + 1] ?? { background: "rgba(143,175,138,0.08)", color: "#C9A98D" }),
                        }}>
                            {i + 1}
                        </div>
                        {e.avatar_url ? (
                            <img src={e.avatar_url} alt={e.twitch_name}
                                style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: "2px solid white", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", flexShrink: 0 }} />
                        ) : (
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#E8EFE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#4A6B45", flexShrink: 0 }}>
                                {e.twitch_name[0]?.toUpperCase()}
                            </div>
                        )}
                        <span style={{ fontSize: 12, color: "#6B4C35", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {e.twitch_name}
                        </span>
                        <span style={{ fontSize: 12, color: "#4A6B45", fontWeight: 600, whiteSpace: "nowrap" }}>
                            {formatBaht(e.total_amount)}
                        </span>
                    </div>
                ))}

                {/* divider before 4-8 */}
                {rest.length > 0 && (
                    <div style={{ height: 1, background: "rgba(143,175,138,0.12)", margin: "2px 0" }} />
                )}

                {rest.map((e, i) => (
                    <div key={e.user_id} className="flex items-center gap-2">
                        <div style={{
                            width: 18, height: 18, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 600, flexShrink: 0,
                            background: "rgba(143,175,138,0.08)", color: "#C9A98D",
                        }}>
                            {i + 4}
                        </div>
                        {e.avatar_url ? (
                            <img src={e.avatar_url} alt={e.twitch_name}
                                style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: "2px solid white", flexShrink: 0 }} />
                        ) : (
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#E8EFE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#4A6B45", flexShrink: 0 }}>
                                {e.twitch_name[0]?.toUpperCase()}
                            </div>
                        )}
                        <span style={{ fontSize: 12, color: "#6B4C35", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {e.twitch_name}
                        </span>
                        <span style={{ fontSize: 12, color: "#4A6B45", fontWeight: 600, whiteSpace: "nowrap" }}>
                            {formatBaht(e.total_amount)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}