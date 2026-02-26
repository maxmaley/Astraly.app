import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./routing";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Run next-intl routing first (locale prefix detection + redirects)
  const response = handleI18nRouting(request);

  // Attach Supabase — writes refreshed session cookies onto the i18n response
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: getUser() verifies JWT server-side (safer than getSession())
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Detect locale prefix (e.g. /ru, /uk, /en)
  const locale =
    routing.locales.find(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
    ) ?? routing.defaultLocale;

  // Path without locale prefix (e.g. /ru/app/chat → /app/chat)
  const pathWithoutLocale = pathname.slice(locale.length + 1) || "/";

  // Protect /admin/* — must be authenticated AND is_admin
  if (pathWithoutLocale.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL(`/${locale}/app/chart`, request.url));
    }
    return response;
  }

  // Protect /app/* — unauthenticated → redirect to login
  if (pathWithoutLocale.startsWith("/app") && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    // Forward session cookies so they aren't dropped
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  // Landing page or auth pages → redirect already-logged-in users to app
  if (
    (pathWithoutLocale === "/" || pathWithoutLocale === "/login" || pathWithoutLocale === "/register") &&
    user
  ) {
    return NextResponse.redirect(new URL(`/${locale}/app/chart`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude /api, /_next, /_vercel, static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
