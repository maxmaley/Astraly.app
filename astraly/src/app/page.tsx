import { redirect } from "next/navigation";

// Redirect root / to /ru (default locale)
export default function RootPage() {
  redirect("/ru");
}
