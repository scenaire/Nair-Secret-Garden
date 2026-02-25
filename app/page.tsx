"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StampCard } from "@/components/ui/StampCard";
import { PetalTransition } from "@/components/guestbook/PetalTransition";
import { useRouter } from "next/navigation";

// ─── Ambient Petal ──────────────────────────────────────────────────────────
const PETAL_COLORS = ["#FFB7C5", "#FFCDD6", "#FFC8D8", "#FFD6E0", "#F9A8C9", "#FADADD", "#FFE4EC"];
const PETAL_PATH = "M10,0 C15,5 15,15 10,20 C5,15 5,5 10,0Z";

function AmbientPetal({ index }: { index: number }) {
  const x = (index * 17 + 5) % 100;
  const delay = (index * 1.1) % 7;
  const duration = 8 + (index % 6);
  const size = 9 + (index % 9);
  const color = PETAL_COLORS[index % PETAL_COLORS.length];

  return (
    <motion.div
      style={{ position: "fixed", left: `${x}%`, top: 0, width: size, height: size, pointerEvents: "none", zIndex: 1 }}
      animate={{ y: ["0vh", "110vh"], x: [0, 35, -25, 20, 0], rotate: [0, 200, 360] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 20 20" width={size} height={size} opacity={0.55}>
        <path d={PETAL_PATH} fill={color} />
      </svg>
    </motion.div>
  );
}

// ─── Countdown ──────────────────────────────────────────────────────────────
const BIRTHDAY = new Date("2025-02-27T00:00:00");

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const tick = () => setDiff(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    isPast: diff === 0,
  };
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <StampCard bgColor="#FFFDF9" teethRadius={5} teethDensity={1.0} borderColor="rgba(180,140,120,0.25)">
        <div className="px-3 py-1.5 min-w-[3rem] text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={value}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-semibold block"
              style={{ fontFamily: "'Noto Serif', serif", color: "#8B5E52" }}
            >
              {String(value).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </div>
      </StampCard>
      <span className="text-[9px] uppercase tracking-widest opacity-50"
        style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Guestbook 📖", href: "/guestbook" },
  { label: "Art Pavilion 🎨", href: "/gallery" },
  { label: "Picnic Canvas 🖌️", href: "/canvas" },
  { label: "Wishing Well ⛲", href: "/wishlist" },
  { label: "Announcements 📢", href: "/overlay" },
];

function Navbar({ isLoggedIn, user, onLogin }: {
  isLoggedIn: boolean;
  user?: { name: string; avatar: string } | null;
  onLogin: () => void;
}) {
  const router = useRouter();
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-2"
    >
      <div className="max-w-6xl mx-auto">
        <StampCard bgColor="rgba(255,253,249,0.95)" teethRadius={6} teethDensity={0.8} borderColor="rgba(180,140,120,0.2)">
          <div className="flex items-center justify-between px-5 py-2.5 gap-4">

            {/* Logo */}
            <button onClick={() => router.push("/")}
              className="text-sm font-medium whitespace-nowrap flex-shrink-0 hover:opacity-75 transition-opacity"
              style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
              🌸 Nair&apos;s Garden
            </button>

            {/* Nav tabs */}
            <AnimatePresence>
              {isLoggedIn && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="hidden md:flex items-center gap-1 flex-1 justify-center">
                  {NAV_ITEMS.map((item, i) => (
                    <motion.button key={item.href}
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => router.push(item.href)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 whitespace-nowrap"
                      style={{
                        fontFamily: "'Noto Sans', sans-serif",
                        color: "#8B5E52",
                        backgroundColor: "rgba(230,215,189,0.35)",
                      }}>
                      {item.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* User / Login */}
            <div className="flex-shrink-0">
              {isLoggedIn && user ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.name}
                    className="w-7 h-7 rounded-full border-2 border-[#E6D7BD]" />
                  <span className="text-xs hidden sm:block"
                    style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                    {user.name}
                  </span>
                </motion.div>
              ) : (
                <button onClick={onLogin}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 whitespace-nowrap"
                  style={{
                    fontFamily: "'Noto Sans', sans-serif",
                    backgroundColor: "#E6D7BD",
                    color: "#7A6147",
                  }}>
                  Login
                </button>
              )}
            </div>

          </div>
        </StampCard>
      </div>
    </motion.nav>
  );
}

// ─── Decorative sticker elements (sticky note, paperclip, ribbon) ──────────
function StickyNote() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -8, y: 20 }}
      animate={{ opacity: 1, rotate: -6, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute -left-8 top-8 w-36 p-3 shadow-md z-20"
      style={{ backgroundColor: "#FFF9C4", transform: "rotate(-6deg)" }}
    >
      <p className="text-[11px] leading-relaxed" style={{ fontFamily: "'Noto Serif', serif", color: "#7A6147" }}>
        I receive a letter.<br />
        Is it from you?<br />
        Look forward to<br />
        meeting you again!
      </p>
    </motion.div>
  );
}

function TagLabel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className="absolute -right-4 top-1/4 z-20 flex items-center"
      style={{ transform: "rotate(90deg) translateX(50%)" }}
    >
      <div className="w-3 h-3 rounded-full border-2 border-[#C4A882] bg-white mr-1" />
      <div className="px-3 py-1 border border-[#C4A882] bg-[#FDFBF4] shadow-sm"
        style={{ fontFamily: "'Noto Serif', serif", fontSize: "10px", color: "#8B5E52", letterSpacing: "0.1em" }}>
        27 Feb 2025
      </div>
    </motion.div>
  );
}

// ─── Big Polaroid ArchedFrame ───────────────────────────────────────────────
function PolaroidFrame({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, rotate: -3, y: 30 }}
      animate={{ opacity: 1, scale: 1, rotate: -1.5, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
      style={{ filter: "drop-shadow(0 8px 32px rgba(139,94,82,0.18))" }}
    >
      {/* Polaroid card */}
      <div className="relative bg-white p-3 pb-10"
        style={{ boxShadow: "0 4px 24px rgba(139,94,82,0.12), 0 1px 4px rgba(0,0,0,0.08)" }}>

        {/* Photo area — tall arch shape */}
        <div className="relative overflow-hidden"
          style={{
            width: "min(72vw, 320px)",
            height: "min(90vw, 400px)",
            borderRadius: "999px 999px 8px 8px",
            backgroundColor: "#F9F0E8",
          }}>
          {children}
        </div>

        {/* Caption */}
        <p className="text-center mt-3 text-xs italic opacity-60"
          style={{ fontFamily: "'Noto Serif', serif", color: "#8B5E52" }}>
          Nair&apos;s Secret Garden ✦
        </p>

      </div>

      {/* Decorative tape strip บนสุด */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 opacity-50 z-10"
        style={{ backgroundColor: "#FFE4B5", transform: "translateX(-50%) rotate(-2deg)" }} />

      {/* Sticky note */}
      <StickyNote />

      {/* Tag */}
      <TagLabel />
    </motion.div>
  );
}

// ─── Garden Map ──────────────────────────────────────────────────────────────
const GARDEN_FEATURES = [
  { href: "/guestbook", emoji: "📖", title: "The Guestbook", subtitle: "Leave a wish for Nair", span: "md:col-span-2", badge: "Sign the book" },
  { href: "/gallery", emoji: "🎨", title: "Art Pavilion", subtitle: "Fan art gallery", span: "", badge: "Submit art" },
  { href: "/canvas", emoji: "🖌️", title: "Picnic Canvas", subtitle: "Draw together, live", span: "", badge: "3 drawing now" },
  { href: "/wishlist", emoji: "⛲", title: "Wishing Well", subtitle: "Nair's wishlist", span: "md:col-span-2 max-w-sm mx-auto w-full", badge: "Make a wish" },
];

function GardenMap({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      {GARDEN_FEATURES.map((f, i) => (
        <motion.div key={f.href}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.1 }}
          whileHover={{ scale: 1.03, rotate: 0.4 }}
          className={f.span}>
          <StampCard bgColor="#FFFDF9" teethRadius={8} teethDensity={0.9} borderColor="rgba(180,140,120,0.2)">
            <button onClick={() => onNavigate(f.href)}
              className="w-full px-5 py-4 flex items-center gap-4 text-left">
              <span className="text-2xl flex-shrink-0">{f.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                  {f.title}
                </p>
                <p className="text-xs opacity-55 italic mt-0.5"
                  style={{ fontFamily: "'Noto Serif', serif", color: "#8B5E52" }}>
                  {f.subtitle}
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  fontFamily: "'Noto Sans', sans-serif",
                  backgroundColor: "rgba(230,215,189,0.5)",
                  color: "#7A6147",
                }}>
                {f.badge}
              </span>
            </button>
          </StampCard>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const countdown = useCountdown(BIRTHDAY);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);
  const [showPetals, setShowPetals] = useState(false);
  const [pendingHref, setPendingHref] = useState("");

  const handleLogin = () => {
    // TODO: เปลี่ยนเป็น Twitch OAuth จริง → window.location.href = "/api/auth/twitch"
    setUser({ name: "Guest", avatar: "https://placekitten.com/40/40" });
    setIsLoggedIn(true);
  };

  const handleNavigate = (href: string) => {
    setPendingHref(href);
    setShowPetals(true);
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: "#FDFBF4", fontFamily: "'Noto Sans', sans-serif" }}>

      {/* ── Linen texture overlay ── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='4' fill='%23000'/%3E%3Crect y='0' width='4' height='1' fill='%23000'/%3E%3C/svg%3E\")",
          backgroundSize: "4px 4px",
        }} />

      {/* ── Checkerboard ── */}
      <div className="fixed inset-0 opacity-[0.07] pointer-events-none z-0"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg,#E6D7BD 25%,transparent 25%,transparent 75%,#E6D7BD 75%),repeating-linear-gradient(45deg,#E6D7BD 25%,transparent 25%,transparent 75%,#E6D7BD 75%)",
          backgroundPosition: "0 0,10px 10px",
          backgroundSize: "20px 20px",
        }} />

      {/* ── Ambient petals ── */}
      {Array.from({ length: 14 }, (_, i) => <AmbientPetal key={i} index={i} />)}

      {/* ── Petal Transition ── */}
      {showPetals && (
        <PetalTransition onComplete={() => router.push(pendingHref)}
          message="Entering the garden... 🌸" subMessage="Welcome~" petalCount={60} />
      )}

      {/* ── Navbar ── */}
      <Navbar isLoggedIn={isLoggedIn} user={user} onLogin={handleLogin} />

      {/* ── Main content ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 gap-7">

        {/* Polaroid ArchedFrame */}
        <PolaroidFrame>
          <img
            src="/images/event-hero.png"
            alt="Nair's Secret Garden"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </PolaroidFrame>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-2xl sm:text-3xl font-medium text-center"
          style={{ fontFamily: "'Noto Serif', serif", color: "#8B5E52" }}>
          🌸 Nair&apos;s Secret Garden
        </motion.h1>

        {/* Date + Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-sm opacity-65"
            style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
            27 February 2025
          </span>
          <span className="opacity-25 text-lg" style={{ color: "#8B5E52" }}>│</span>
          {countdown.isPast ? (
            <span className="text-sm italic opacity-65"
              style={{ fontFamily: "'Noto Serif', serif", color: "#8B5E52" }}>
              The garden is open 🌸
            </span>
          ) : (
            <div className="flex items-end gap-2">
              <CountdownBox value={countdown.days} label="days" />
              <span className="text-lg pb-5 opacity-30" style={{ color: "#8B5E52" }}>:</span>
              <CountdownBox value={countdown.hours} label="hrs" />
              <span className="text-lg pb-5 opacity-30" style={{ color: "#8B5E52" }}>:</span>
              <CountdownBox value={countdown.minutes} label="min" />
              <span className="text-lg pb-5 opacity-30" style={{ color: "#8B5E52" }}>:</span>
              <CountdownBox value={countdown.seconds} label="sec" />
            </div>
          )}
        </motion.div>

        {/* Login / Garden Map */}
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div key="login"
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ delay: 0.7, duration: 0.5 }}>
              <StampCard bgColor="#E6D7BD" teethRadius={9} teethDensity={0.85} borderColor="rgba(180,140,120,0.3)">
                <motion.button onClick={handleLogin}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                  className="px-8 py-3 flex items-center gap-2.5"
                  style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: "14px", color: "#7A6147" }}>
                  {/* Twitch icon */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="#7A6147">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                  </svg>
                  Login with Twitch to Enter
                </motion.button>
              </StampCard>
            </motion.div>
          ) : (
            <motion.div key="garden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="w-full max-w-2xl">
              <GardenMap onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}