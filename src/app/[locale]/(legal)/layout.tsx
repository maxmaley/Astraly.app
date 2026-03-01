import { Link } from "@/navigation";
import { getLocale } from "next-intl/server";

export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] px-4 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link
            href="/"
            locale={locale}
            className="flex items-center text-lg font-bold tracking-tight"
          >
            <span className="font-display text-[var(--foreground)]">Astraly</span>
            <span className="font-display text-cosmic-400">.app</span>
          </Link>
          <Link
            href="/"
            locale={locale}
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            ← На главную
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 pb-24">
        {children}
      </main>
    </div>
  );
}
