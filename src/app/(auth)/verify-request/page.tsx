export default function VerifyRequestPage() {
  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Check your email
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a sign-in link to your email address. Click the link to
        continue.
      </p>
      <div className="mt-6 rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder or try again in 60
          seconds.
        </p>
      </div>
    </div>
  );
}
