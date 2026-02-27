// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // refresh session — สำคัญมาก อย่าลบออกนะคะ
    const { data: { user } } = await supabase.auth.getUser();

    // ── Admin guard ───────────────────────────────────────────
    if (pathname.startsWith("/admin")) {
        // ยังไม่ login
        if (!user) {
            const url = new URL("/", request.url);
            url.searchParams.set("reason", "login_required");
            return NextResponse.redirect(url);
        }

        // login แล้ว ตรวจว่าเป็น admin ไหม
        const { data: adminRow } = await supabase
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!adminRow) {
            const url = new URL("/", request.url);
            url.searchParams.set("reason", "unauthorized");
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        // ทุก path ยกเว้น static files และ _next
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};