import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = request.cookies.get("astraly-locale")?.value ?? "ru";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to chart page — it will handle onboarding if chart doesn't exist yet
      return NextResponse.redirect(`${origin}/${locale}/app/chart`);
    }

    console.error("[auth/callback] exchangeCodeForSession error:", error);
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=auth_failed&reason=${encodeURIComponent(error.message)}`,
    );
  }

  console.error("[auth/callback] No code in request:", request.url);
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed&reason=no_code`);
}
