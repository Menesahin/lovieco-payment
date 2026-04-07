import { ScrollFadeIn } from "./scroll-fade-in";

const features = [
  {
    title: "Send Request",
    description:
      "Create a payment request with just an email and amount. Share via a unique link — no app download needed.",
    gradient: "from-amber-50 to-orange-50/50",
    iconBg: "bg-amber-100 text-amber-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
    // Mini mockup: email input + amount
    mockup: (
      <div className="space-y-2">
        <div className="h-7 rounded-md border border-stone-200/60 bg-white px-2.5 flex items-center">
          <span className="text-[10px] text-stone-400">recipient@email.com</span>
        </div>
        <div className="h-7 rounded-md border border-stone-200/60 bg-white px-2.5 flex items-center gap-1">
          <span className="text-[10px] text-stone-300">$</span>
          <span className="text-[10px] font-mono font-semibold text-stone-700">25.00</span>
        </div>
        <div className="h-6 rounded-md bg-stone-900 flex items-center justify-center">
          <span className="text-[9px] font-medium text-white">Send Request</span>
        </div>
      </div>
    ),
  },
  {
    title: "Track Status",
    description:
      "See pending, paid, and expired requests in a unified activity feed. Filter by status, search by name.",
    gradient: "from-emerald-50 to-green-50/50",
    iconBg: "bg-emerald-100 text-emerald-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    mockup: (
      <div className="space-y-1.5">
        {[
          { name: "alice@..", amount: "$25", status: "bg-amber-400", label: "Pend" },
          { name: "bob@..", amount: "$50", status: "bg-emerald-400", label: "Paid" },
          { name: "carol@..", amount: "$15", status: "bg-red-400", label: "Decl" },
        ].map((r) => (
          <div key={r.name} className="flex items-center justify-between rounded-md border border-stone-200/60 bg-white px-2 py-1">
            <span className="text-[9px] text-stone-500 truncate">{r.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-semibold text-stone-700">{r.amount}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${r.status}`} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Pay Instantly",
    description:
      "Open a request and pay with a single confirmation. Funds transfer immediately — no waiting.",
    gradient: "from-blue-50 to-indigo-50/50",
    iconBg: "bg-blue-100 text-blue-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    mockup: (
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-bold font-mono text-stone-800">$25.00</p>
        <div className="h-6 w-full rounded-md bg-emerald-600 flex items-center justify-center">
          <span className="text-[9px] font-medium text-white">Confirm Payment</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[9px] text-emerald-600 font-medium">Instant</span>
        </div>
      </div>
    ),
  },
] as const;

export function FeatureShowcase() {
  return (
    <section id="features" className="px-6 lg:px-8 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <ScrollFadeIn>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to get paid
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Simple tools for managing payment requests
            </p>
          </div>
        </ScrollFadeIn>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <ScrollFadeIn key={f.title} delay={i * 120}>
              <div className="group rounded-2xl border border-stone-200/80 bg-white overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1 hover:border-stone-300/80">
                {/* Gradient visual area with mini mockup */}
                <div className={`relative bg-gradient-to-br ${f.gradient} p-6 pb-5`}>
                  <div className="mx-auto max-w-[180px] transition-transform duration-500 group-hover:scale-[1.03]">
                    {f.mockup}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.iconBg} transition-all duration-300`}>
                      {f.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{f.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
