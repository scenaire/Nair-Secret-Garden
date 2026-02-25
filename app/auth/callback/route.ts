// app/auth/callback/route.ts
// Supabase จะ redirect กลับมาที่นี่หลัง login Twitch สำเร็จ

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/"; // redirect ไปหน้าไหนหลัง login

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // ถ้า error → redirect กลับหน้าแรกพร้อม error param
    return NextResponse.redirect(`${origin}/?error=auth`);
}