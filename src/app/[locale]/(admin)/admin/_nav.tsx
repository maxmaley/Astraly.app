"use client";

import Link      from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", icon: "▦",  href: (l: string) => `/${l}/admin`        },
  { label: "Users",     icon: "👤", href: (l: string) => `/${l}/admin/users`   },
];

export function AdminNav({ locale }: { locale: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2 py-4 space-y-0.5">
      {NAV.map(({ label, icon, href }) => {
        const to      = href(locale);
        const isActive = label === "Dashboard"
          ? pathname === to
          : pathname.startsWith(to);

        return (
          <Link
            key={label}
            href={to}
            className={[
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-cosmic-500/15 text-cosmic-400 font-medium"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
