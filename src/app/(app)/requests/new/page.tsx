import { CreateRequestForm } from "@/components/requests/create-request-form";
import { createRequest } from "@/lib/actions/payment-request";
import Link from "next/link";

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </Link>

      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight">New Payment Request</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Request money from someone by entering their email and amount.
          </p>
        </div>
        <CreateRequestForm onSubmit={createRequest} />
      </div>
    </div>
  );
}
