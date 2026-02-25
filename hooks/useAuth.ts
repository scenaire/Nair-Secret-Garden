// hooks/useAuth.ts
// ใช้แทน mock useAuth ใน page ต่างๆ

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
    const userForUI = user ? {
        name: user.user_metadata?.name
            ?? user.user_metadata?.preferred_username
            ?? "Guest",
        avatar: user.user_metadata?.avatar_url
            ?? user.user_metadata?.picture
            ?? "",
    } : null;

    return { isLoggedIn, user: userForUI, rawUser: user, isLoading, loginWithTwitch, logout };
}