import { CreateRequestForm } from "@/components/requests/create-request-form";
import { createRequest } from "@/lib/actions/payment-request";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Dashboard
      </Link>

      <div className="rounded-2xl border border-stone-200/80 bg-white p-8 shadow-sm">
        <div className="mb-7 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Payment Request</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Request money from someone by entering their email and amount.
            </p>
          </div>
        </div>
        <CreateRequestForm onSubmit={createRequest} />
      </div>
    </div>
  );
}
