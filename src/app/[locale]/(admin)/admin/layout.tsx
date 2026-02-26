import { redirect }           from "next/navigation";
import { cookies }            from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link                   from "next/link";
import type { Database }      from "@/types/database";

// ── Active nav item (client island) ──────────────────────────────────────────
// We need a tiny client component to highlight the active link
import { AdminNav } from "./_nav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("users")
    .select("name, email, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect(`/${locale}/app/chart`);

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-52 flex-col border-r border-[var(--border)] bg-[var(--card)]">

        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
          <span className="text-cosmic-400">✦</span>
          <span className="text-sm font-bold tracking-wide text-[var(--foreground)]">
            Astraly Admin
          </span>
        </div>

        {/* Nav */}
        <AdminNav locale={locale} />

        {/* Footer */}
        <div className="border-t border-[var(--border)] px-4 py-4 space-y-2">
          <Link
            href={`/${locale}/app/chart`}
            className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            Back to app
          </Link>
          <p className="truncate text-[11px] text-[var(--muted-foreground)]">
            {profile.email}
          </p>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-52 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
