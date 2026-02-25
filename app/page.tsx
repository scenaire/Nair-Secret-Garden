"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PetalTransition } from "@/components/guestbook/PetalTransition";
import { Navbar } from "@/components/layout/GardenNavbar";
import { AmbientPetalLayer } from "@/components/landing/AmbientPetalLayer";
import { PolaroidHero } from "@/components/landing/PolaroidHero";
import { GardenMap } from "@/components/landing/GardenMap";
import { LoginCallout } from "@/components/landing/LoginCallout";
import { usePetalNavigation } from "@/hooks/usePetalNavigation";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { user, isLoggedIn, loginWithTwitch, logout } = useAuth();

  const {
    showTransition,
    beginNavigation,
    handleTransitionComplete,
  } = usePetalNavigation();

  return (
    <main
      className="min-h-screen relative overflow-x-hidden"
      style={{
        backgroundColor: "#FDFBF4",
        fontFamily: "'Noto Sans', sans-serif",
      }}
    >
      {/* Linen texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='4' fill='%23000'/%3E%3Crect y='0' width='4' height='1' fill='%23000'/%3E%3C/svg%3E\")",
          backgroundSize: "4px 4px",
        }}
      />

      {/* Checkerboard */}
      <div
        className="fixed inset-0 opacity-[0.07] pointer-events-none z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,#E6D7BD 25%,transparent 25%,transparent 75%,#E6D7BD 75%),repeating-linear-gradient(45deg,#E6D7BD 25%,transparent 25%,transparent 75%,#E6D7BD 75%)",
          backgroundPosition: "0 0,10px 10px",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Floating petals */}
      <AmbientPetalLayer />

      {/* Transition overlay */}
      {showTransition && (
        <PetalTransition
          onComplete={handleTransitionComplete}
          message="Entering the garden... 🌸"
          subMessage="Welcome~"
          petalCount={60}
        />
      )}

      {/* Global navbar */}
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={loginWithTwitch}
        onLogout={logout}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 gap-7">
        <PolaroidHero />

        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <LoginCallout onLogin={loginWithTwitch} />
          ) : (
            <motion.div
              key="garden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-2xl"
            >
              <GardenMap onNavigate={beginNavigation} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}