import Link from "next/link";
import { ScrollFadeIn } from "./scroll-fade-in";

export function CTASection() {
  return (
    <section className="relative px-6 lg:px-8 py-24 lg:py-32">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div className="h-96 w-96 rounded-full bg-gradient-radial from-amber-100/40 via-amber-50/20 to-transparent blur-3xl" />
      </div>

      <ScrollFadeIn>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start getting paid faster
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Create your first payment request in seconds.
          </p>
          <div className="mt-8">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-10 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-neutral-900/15 transition-all duration-200 hover:bg-neutral-800 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free to use. No credit card required.
          </p>
        </div>
      </ScrollFadeIn>
    </section>
  );
}
