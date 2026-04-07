import Link from "next/link";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm ring-1 ring-amber-500/20">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Lovie.co</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="#features"
            className="hidden sm:inline-flex rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-neutral-800 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Sections */}
      <main className="flex-1">
        <HeroSection />
        <FeatureShowcase />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
