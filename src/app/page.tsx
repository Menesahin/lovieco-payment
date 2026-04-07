import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">LovePay</span>
        </div>
        <Link
          href="/sign-in"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Request money from anyone,{" "}
          <span className="text-primary">hassle-free.</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Send payment requests via email and get paid faster. Simple, secure,
          and instant.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
        >
          Get Started
        </Link>

        {/* Feature Cards */}
        <div className="mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
          {[
            { title: "Send Request", desc: "Create a payment request with just an email and amount." },
            { title: "Track Status", desc: "See pending, paid, and expired requests at a glance." },
            { title: "Pay Easily", desc: "Open the request and pay instantly with a single confirmation." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 text-left">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        LovePay &middot; Built with Next.js 16 &middot; 2026
      </footer>
    </div>
  );
}
