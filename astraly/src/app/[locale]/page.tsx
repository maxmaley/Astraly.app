import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StarField } from "@/components/landing/StarField";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Reviews } from "@/components/landing/Reviews";
import { Footer } from "@/components/landing/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing");
  return {
    title: "Astraly — твой AI астролог",
    description: t("heroSubtitle"),
  };
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fixed star field background */}
      <StarField />

      {/* Page content */}
      <div className="relative z-10">
        <Header />
        <Hero />
        <Features />
        <Pricing />
        <Reviews />
        <Footer />
      </div>
    </div>
  );
}
