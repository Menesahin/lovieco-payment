import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-stone-200/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">LovePay</span>
        </div>
        <Link
          href="/sign-in"
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-neutral-800 transition-all duration-200 shadow-sm"
        >
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          P2P Payment Requests
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl leading-[1.1]">
          Request money from anyone,{" "}
          <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
            hassle-free.
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground leading-relaxed">
          Send payment requests via email and get paid faster.
          Simple, secure, and instant.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-neutral-800 transition-all duration-200 shadow-md shadow-neutral-900/10"
          >
            Get Started
          </Link>
          <Link
            href="#features"
            className="rounded-lg border border-stone-300 px-8 py-3 text-sm font-medium text-foreground hover:bg-stone-50 transition-all duration-200"
          >
            Learn More
          </Link>
        </div>

        {/* Features */}
        <div id="features" className="mt-24 grid max-w-4xl gap-6 sm:grid-cols-3 w-full">
          {[
            {
              title: "Send Request",
              desc: "Create a payment request with just an email and amount. Share via link.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              ),
            },
            {
              title: "Track Status",
              desc: "See pending, paid, and expired requests in a unified activity feed.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ),
            },
            {
              title: "Pay Instantly",
              desc: "Open a request and pay with a single confirmation. Funds transfer immediately.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              ),
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-stone-200 bg-white p-7 text-left hover:shadow-lg hover:shadow-stone-200/50 hover:border-stone-300 transition-all duration-300"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors duration-300">
                {f.icon}
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-24" />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8 text-center text-sm text-muted-foreground">
        <p>LovePay &middot; Built with Next.js 16 &middot; 2026</p>
      </footer>
    </div>
  );
}
