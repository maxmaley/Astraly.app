import { AppShell } from "@/components/chat/AppShell";

export default function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <AppShell locale={params.locale}>{children}</AppShell>;
}
