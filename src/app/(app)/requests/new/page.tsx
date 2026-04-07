import { CreateRequestForm } from "@/components/requests/create-request-form";
import { createRequest } from "@/lib/actions/payment-request";

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">
        New Payment Request
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Request money from someone by entering their email and amount.
      </p>
      <div className="mt-6">
        <CreateRequestForm onSubmit={createRequest} />
      </div>
    </div>
  );
}
