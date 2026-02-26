/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link, usePathname, useRouter } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";

interface ChatSummary {
  id: string;
  chat_id: string;
  summary: string;
  messages_count: number;
  created_at: string;
}

interface Props {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

function groupChatsByDate(
  chats: ChatSummary[],
  labels: { today: string; yesterday: string; older: string }
) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const todayChats = chats.filter((c) => new Date(c.created_at) >= startOfToday);
  const yesterdayChats = chats.filter((c) => {
    const d = new Date(c.created_at);
    return d >= startOfYesterday && d < startOfToday;
  });
  const olderChats = chats.filter((c) => new Date(c.created_at) < startOfYesterday);

  const groups: { label: string; chats: ChatSummary[] }[] = [];
  if (todayChats.length) groups.push({ label: labels.today, chats: todayChats });
  if (yesterdayChats.length) groups.push({ label: labels.yesterday, chats: yesterdayChats });
  if (olderChats.length) groups.push({ label: labels.older, chats: olderChats });
  return groups;
}

export function AppSidebar({ isOpen, onClose }: Props) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const tChat = useTranslations("chat");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const loadChats = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) setUserEmail(user.email);

    const { data } = await (supabase as any)
      .from("chat_summaries")
      .select("id, chat_id, summary, messages_count, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    if (data) setChats(data);
  }, []);

  useEffect(() => {
    loadChats();

    // Refresh when a new chat is created or deleted
    const handler = () => loadChats();
    window.addEventListener("astraly:chat:refresh", handler);
    return () => window.removeEventListener("astraly:chat:refresh", handler);
  }, [loadChats]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  }

  async function handleDeleteChat(chatId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/chat?chat_id=${chatId}`, { method: "DELETE" });
    setChats((prev) => prev.filter((c) => c.chat_id !== chatId));
    if (pathname.includes(chatId)) {
      router.push("/app/chat", { locale });
    }
  }

  const groups = groupChatsByDate(chats, {
    today: tChat("today"),
    yesterday: tChat("yesterday"),
    older: tChat("older"),
  });

  const navItemCls = (active: boolean) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
      active
        ? "bg-[var(--muted)] text-[var(--foreground)] font-medium"
        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[260px] shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-4 py-4">
          <Link href="/app/chat" className="flex items-center text-xl font-bold tracking-tight">
            <span className="font-display text-[var(--foreground)]">Astraly</span>
            <span className="font-display text-cosmic-400">.app</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] lg:hidden"
            aria-label="Close menu"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Chat button */}
        <div className="shrink-0 px-3 pb-3">
          <Link
            href="/app/chat"
            className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-gradient-to-r from-cosmic-500/10 to-nebula-500/10 px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all hover:border-cosmic-400/40 hover:from-cosmic-500/20 hover:to-nebula-500/20"
            onClick={onClose}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {tNav("newChat")}
          </Link>
        </div>

        {/* Chat history */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-2 py-1">
          {groups.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-[var(--muted-foreground)]/60">
              {tChat("historyEmpty")}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]/50">
                  {group.label}
                </p>
                {group.chats.map((chat) => {
                  const isActive = pathname.includes(chat.chat_id);
                  return (
                    <div
                      key={chat.chat_id}
                      className="group relative"
                      onMouseEnter={() => setHoveredChatId(chat.chat_id)}
                      onMouseLeave={() => setHoveredChatId(null)}
                    >
                      <Link
                        href={`/app/chat/${chat.chat_id}`}
                        onClick={onClose}
                        className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-[var(--muted)] text-[var(--foreground)] font-medium"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <span className="line-clamp-1 flex-1 pr-5 text-[13px]">
                          {chat.summary || "..."}
                        </span>
                      </Link>

                      {/* Delete button on hover */}
                      <button
                        onClick={(e) => handleDeleteChat(chat.chat_id, e)}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--muted-foreground)] transition-all hover:text-red-400 ${
                          hoveredChatId === chat.chat_id ? "opacity-100" : "opacity-0"
                        }`}
                        title={tChat("deleteChat")}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M8 6V4h8v2" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Navigation */}
        <div className="shrink-0 border-t border-[var(--sidebar-border)] px-2 py-2">
          <Link
            href="/app/horoscope"
            onClick={onClose}
            className={navItemCls(pathname === "/app/horoscope")}
          >
            {/* Sun / horoscope icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            {tNav("horoscope")}
          </Link>
          <Link
            href="/app/calendar"
            onClick={onClose}
            className={navItemCls(pathname === "/app/calendar")}
          >
            {/* Calendar icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {tNav("calendar")}
          </Link>
          <Link
            href="/app/chart"
            onClick={onClose}
            className={navItemCls(pathname === "/app/chart")}
          >
            {/* Celestial / chart icon */}
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            {tNav("myChart")}
          </Link>
          <Link
            href="/app/settings"
            onClick={onClose}
            className={navItemCls(pathname === "/app/settings")}
          >
            {/* Settings icon */}
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {tNav("settings")}
          </Link>
        </div>

        {/* Footer: user row */}
        <div className="shrink-0 border-t border-[var(--sidebar-border)] px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Clicking avatar/email → Settings */}
            <Link
              href="/app/settings"
              onClick={onClose}
              className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-[var(--muted)]"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-[11px] font-bold text-white">
                {userEmail?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="truncate text-xs text-[var(--muted-foreground)]">
                {userEmail || "..."}
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              className="shrink-0 rounded-md p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              title={tCommon("logout")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
