// App layout with sidebar — will be built fully in Step 3
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder */}
      <aside className="w-64 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
