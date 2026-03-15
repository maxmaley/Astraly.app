import { AppShell } from "@/components/chat/AppShell";
import { PaddleProvider } from "@/components/shared/PaddleProvider";

export default function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <PaddleProvider>
      <AppShell locale={params.locale}>{children}</AppShell>
    </PaddleProvider>
  );
}
