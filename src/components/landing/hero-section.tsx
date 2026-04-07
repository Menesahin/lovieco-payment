"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
      {/* Decorative floating blurs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="animate-float-slow absolute -top-24 right-[15%] h-72 w-72 rounded-full bg-gradient-to-br from-amber-400/15 to-amber-600/5 blur-3xl" />
        <div className="animate-float-delayed absolute top-1/2 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-amber-300/10 to-transparent blur-3xl" />
        <div className="animate-float absolute bottom-10 right-[30%] h-40 w-40 rounded-full bg-gradient-to-bl from-stone-300/10 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — copy */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-4 py-1.5 text-xs font-medium text-amber-700 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              P2P Payment Requests
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.08]">
              Request money{" "}
              <br className="hidden sm:block" />
              from anyone,{" "}
              <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                hassle&#8209;free.
              </span>
            </h1>

            <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-md">
              Send payment requests via email and get paid faster. Simple, secure, and instant.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-neutral-900/15 transition-all duration-200 hover:bg-neutral-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-stone-300 px-8 py-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-stone-50 hover:border-stone-400 active:scale-[0.98]"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right — CSS product mockup */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="animate-float-slow relative w-full max-w-sm">
              {/* Glow behind the card */}
              <div className="absolute inset-0 -m-4 rounded-[2rem] bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent blur-2xl" />

              {/* Glass card */}
              <div className="relative rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl shadow-stone-900/10 backdrop-blur-xl">
                {/* Mini header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">L</span>
                    </div>
                    <span className="text-xs font-medium text-stone-400">Lovie.co</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Pending
                  </span>
                </div>

                {/* Amount */}
                <div className="mt-5 text-center">
                  <p className="text-3xl font-bold tracking-tight font-mono">$250.00</p>
                  <p className="mt-1 text-sm text-muted-foreground">from Alex Johnson</p>
                </div>

                {/* Divider */}
                <div className="my-5 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

                {/* Details */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note</span>
                    <span className="text-foreground font-medium">Dinner last Friday</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="text-foreground font-medium">5 days, 14h</span>
                  </div>
                </div>

                {/* Pay button */}
                <button className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98]">
                  Pay $250.00
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
