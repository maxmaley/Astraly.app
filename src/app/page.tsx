import { redirect } from "next/navigation";

// Redirect root / to default locale.
// In practice next-intl middleware handles this before the page renders,
// but this serves as a safety net.
export default function RootPage() {
  redirect("/en");
}
