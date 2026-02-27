// components/wishing-well/SurpriseForm.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Gift, Paperclip, Loader2, CheckCircle2, X } from "lucide-react";
import { submitSurprise } from "@/lib/wishingWellSync";
import { useAuth } from "@/hooks/useAuth";

export function SurpriseForm() {
    const { isLoggedIn, rawUser, user } = useAuth();
    const [itemName, setItemName] = useState("");
    const [productLink, setProductLink] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [slipFile, setSlipFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const slipRef = useRef<HTMLInputElement>(null);

    const canSubmit = status === "idle" && !!itemName.trim() && !!slipFile;

    const handleSubmit = useCallback(async () => {
        if (!isLoggedIn || !rawUser || !slipFile) return;
        setStatus("submitting");
        setErrorMsg("");
        try {
            await submitSurprise({
                itemName: itemName.trim(),
                productLink: productLink.trim() || undefined,
                amount: amount ? parseFloat(amount) : undefined,
                message: message.trim() || undefined,
                slipFile,
                userId: rawUser.id,
                twitchName: user?.name ?? "anonymous",
                avatarUrl: user?.avatar,
            });
            setStatus("success");
            setTimeout(() => {
                setItemName(""); setProductLink(""); setAmount("");
                setMessage(""); setSlipFile(null); setStatus("idle");
            }, 3000);
        } catch (err) {
            console.error(err);
            setErrorMsg("Submission failed. Please try again.");
            setStatus("error");
        }
    }, [isLoggedIn, rawUser, user, itemName, productLink, amount, message, slipFile]);

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "9px 12px",
        border: "1px solid rgba(143,175,138,0.25)", borderRadius: 8,
        background: "rgba(255,255,255,0.7)", fontSize: 13, color: "#6B4C35",
        outline: "none", fontFamily: "var(--font-noto-sans-thai), sans-serif",
        transition: "border-color 0.2s",
    };

    return (
        <div style={{
            background: "linear-gradient(135deg, rgba(232,239,231,0.6), rgba(253,251,244,0.8))",
            border: "1px solid rgba(143,175,138,0.22)",
            borderRadius: 14, padding: "22px 24px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
        }}
            className="surprise-grid"
        >
            {/* left: description */}
            <div className="flex flex-col justify-center gap-3">
                <div className="flex items-center gap-2">
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(143,175,138,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Gift size={16} style={{ color: "#4A6B45" }} />
                    </div>
                    <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.5 }}>Something special</p>
                        <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 22, fontStyle: "italic", fontWeight: 300, color: "#6B4C35" }}>
                            Send a Surprise
                        </h2>
                    </div>
                </div>
                <p style={{ fontSize: 13, color: "#C9A98D", lineHeight: 1.65 }}>
                    Have something in mind that's not on the list? Send it anyway — the best gifts are always the unexpected ones.
                </p>
                {!isLoggedIn && (
                    <p style={{ fontSize: 12, color: "#4A6B45", opacity: 0.6, fontStyle: "italic", fontFamily: "var(--font-cormorant), serif" }}>
                        Login with Twitch to send a surprise ✦
                    </p>
                )}
            </div>

            {/* right: form */}
            <div className="flex flex-col gap-2.5">
                {/* row 1: name + price */}
                <div className="flex gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                        <label style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.6 }}>
                            Item name *
                        </label>
                        <input
                            type="text" value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="What are you gifting?"
                            style={inputStyle} disabled={!isLoggedIn}
                            onFocus={(e) => e.target.style.borderColor = "#8FAF8A"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(143,175,138,0.25)"}
                        />
                    </div>
                    <div className="flex flex-col gap-1" style={{ width: 88 }}>
                        <label style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.6 }}>
                            Price
                        </label>
                        <input
                            type="number" value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="฿"
                            style={inputStyle} disabled={!isLoggedIn}
                            onFocus={(e) => e.target.style.borderColor = "#8FAF8A"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(143,175,138,0.25)"}
                        />
                    </div>
                </div>

                {/* row 2: product link */}
                <div className="flex flex-col gap-1">
                    <label style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.6 }}>
                        Product link
                    </label>
                    <input
                        type="url" value={productLink}
                        onChange={(e) => setProductLink(e.target.value)}
                        placeholder="https://…"
                        style={inputStyle} disabled={!isLoggedIn}
                        onFocus={(e) => e.target.style.borderColor = "#8FAF8A"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(143,175,138,0.25)"}
                    />
                </div>

                {/* row 3: message */}
                <div className="flex flex-col gap-1">
                    <label style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.6 }}>
                        Message to Nair
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="A little note…"
                        rows={2}
                        style={{ ...inputStyle, resize: "none", lineHeight: 1.55 }}
                        disabled={!isLoggedIn}
                        onFocus={(e) => e.target.style.borderColor = "#8FAF8A"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(143,175,138,0.25)"}
                    />
                </div>

                {/* row 4: slip upload */}
                {/* ── QR + slip row ── */}
                <div className="flex gap-3 items-start">
                    {/* QR code */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.55 }}>
                            โอนตาม QR
                        </p>
                        <div style={{ background: "white", padding: 5, border: "1px solid rgba(143,175,138,0.25)", borderRadius: 7, opacity: !isLoggedIn ? 0.45 : 1 }}>
                            <img
                                src="/images/qr_code.png"
                                alt="QR Code โอนเงิน"
                                style={{ width: 72, height: 72, display: "block", imageRendering: "pixelated" }}
                            />
                        </div>
                    </div>

                    {/* slip + button */}
                    <div className="flex flex-col gap-2 flex-1">
                        <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.55 }}>
                            แนบสลิปยืนยัน *
                        </p>
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            style={{
                                padding: "9px 13px",
                                border: `1.5px dashed ${slipFile ? "rgba(143,175,138,0.6)" : "rgba(143,175,138,0.35)"}`,
                                borderRadius: 8,
                                background: slipFile ? "rgba(143,175,138,0.08)" : "rgba(200,222,197,0.05)",
                                opacity: !isLoggedIn ? 0.45 : 1,
                            }}
                            onClick={() => isLoggedIn && slipRef.current?.click()}
                        >
                            <Paperclip size={13} style={{ color: "#8FAF8A", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "#C9A98D", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {slipFile ? slipFile.name : "แนบสลิปที่นี่"}
                            </span>
                            <span style={{ fontSize: 10, color: "#C9A98D", opacity: 0.5 }}>PNG · JPG</span>
                            {slipFile && (
                                <button onClick={(e) => { e.stopPropagation(); setSlipFile(null); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                    <X size={12} style={{ color: "#C9A98D" }} />
                                </button>
                            )}
                            <input ref={slipRef} type="file" accept="image/*" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 5 * 1024 * 1024) { setSlipFile(f); setErrorMsg(""); } else if (f) { setErrorMsg("File must be under 5MB."); } }} />
                        </div>

                        {errorMsg && (
                            <p className="flex items-center gap-1" style={{ fontSize: 11, color: "#E87A9A" }}>
                                <X size={11} /> {errorMsg}
                            </p>
                        )}

                        <motion.button
                            onClick={handleSubmit}
                            disabled={!canSubmit || !isLoggedIn}
                            whileHover={canSubmit && isLoggedIn ? { opacity: 0.88, y: -1, boxShadow: "0 6px 18px rgba(74,107,69,0.28)" } : {}}
                            whileTap={canSubmit && isLoggedIn ? { scale: 0.97 } : {}}
                            className="flex items-center justify-center gap-2"
                            style={{
                                width: "100%", padding: "10px",
                                border: "none", borderRadius: 9,
                                background: canSubmit && isLoggedIn
                                    ? "linear-gradient(135deg, #4A6B45, #8FAF8A)"
                                    : "rgba(143,175,138,0.2)",
                                color: canSubmit && isLoggedIn ? "white" : "rgba(143,175,138,0.5)",
                                fontSize: 14, cursor: canSubmit && isLoggedIn ? "pointer" : "not-allowed",
                                fontWeight: 500,
                            }}
                        >
                            {status === "submitting" ? <><Loader2 size={14} className="animate-spin" /> กำลังส่ง…</> :
                                status === "success" ? <><CheckCircle2 size={14} /> ส่งแล้ว รอตรวจสอบนะคะ ✦</> :
                                    <><Gift size={14} /> ส่งของขวัญเซอร์ไพรส์</>}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* mobile stack override */}
            <style>{`@media(max-width:600px){.surprise-grid{grid-template-columns:1fr!important;}}`}</style>
        </div>
    );
}