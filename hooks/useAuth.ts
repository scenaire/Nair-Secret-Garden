// hooks/useAuth.ts

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // โหลด session ปัจจุบัน
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setIsLoggedIn(!!data.user);
            setIsLoading(false);
        });

        // subscribe การเปลี่ยนแปลง session (login / logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsLoggedIn(!!session?.user);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginWithTwitch = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "twitch",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        // browser จะ redirect ไป Twitch แล้วกลับมาที่ /auth/callback อัตโนมัติค่ะ
    };

    const logout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
    };

    // แปลง Supabase User → format ที่ Navbar และ component อื่นๆ ใช้
    const metadata = user?.user_metadata ?? {};

    const userForUI = user
        ? {
            name:
                metadata.name ??
                metadata.preferred_username ??
                metadata.login ??              // บาง provider ใช้ login
                metadata.nickname ??
                user.email?.split("@")[0] ??
                "Guest",
            avatar:
                metadata.avatar_url ??         // GitHub / บาง provider
                metadata.picture ??            // OIDC / Twitch บางเคส
                metadata.profile_image_url ??  // Twitch ส่วนใหญ่
                metadata.image_url ??          // กันเหนียว provider แปลก ๆ
                "",
        }
        : null;

    return { isLoggedIn, user: userForUI, rawUser: user, isLoading, loginWithTwitch, logout };
}