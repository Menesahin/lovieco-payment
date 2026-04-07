"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { RequestDTO, DashboardStats } from "@/lib/dto/payment-request.dto";
import type { RequestStatus } from "@prisma/client";
import { StatusBadge } from "./status-badge";
import { useCallback, useState } from "react";

interface DashboardContentProps {
  tab: "incoming" | "outgoing";
  requests: RequestDTO[];
  stats: DashboardStats;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  currentStatus?: RequestStatus;
  currentQuery?: string;
}

export function DashboardContent({
  tab,
  requests,
  stats,
  total,
  page,
  pageSize,
  totalPages,
  currentStatus,
  currentQuery,
}: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentQuery ?? "");

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.delete("page");
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  const debounceSearch = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          updateParam("q", value.length >= 2 ? value : undefined);
        }, 300);
      };
    })(),
    [updateParam]
  );

  const statCards = [
    { label: "Pending", value: stats.pending, color: "bg-amber-50 border-amber-200 text-amber-700" },
    { label: "Paid", value: stats.paid, color: "bg-green-50 border-green-200 text-green-700" },
    { label: "Declined", value: stats.declined, color: "bg-red-50 border-red-200 text-red-700" },
    { label: "Total", value: stats.total, color: "bg-slate-50 border-slate-200 text-slate-700" },
  ];

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 ${stat.color}`}
          >
            <p className="text-xs font-medium uppercase tracking-wider opacity-70">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(["incoming", "outgoing"] as const).map((t) => (
          <button
            key={t}
            onClick={() => updateParam("tab", t === "incoming" ? undefined : t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "incoming" ? "Incoming" : "Outgoing"}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              debounceSearch(e.target.value);
            }}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); updateParam("q", undefined); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={currentStatus ?? ""}
          onChange={(e) => updateParam("status", e.target.value || undefined)}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="DECLINED">Declined</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Request List */}
      {requests.length === 0 ? (
        <EmptyState tab={tab} hasFilters={!!currentStatus || !!currentQuery} query={currentQuery} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {tab === "incoming" ? "From" : "To"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Note</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/requests/${req.id}`} className="hover:underline">
                        {tab === "incoming"
                          ? req.senderName ?? req.senderEmail
                          : req.recipientName ?? req.recipientEmail}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium">{req.amountFormatted}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {req.note ?? "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatRelativeDate(req.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 lg:hidden">
            {requests.map((req) => (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="block rounded-xl border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {tab === "incoming"
                      ? req.senderName ?? req.senderEmail
                      : req.recipientName ?? req.recipientEmail}
                  </span>
                  <span className="text-base font-semibold">{req.amountFormatted}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate max-w-[60%]">
                    {req.note ?? "No note"}
                  </span>
                  <StatusBadge status={req.status} />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {formatRelativeDate(req.createdAt)}
                </p>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {from}-{to} of {total} requests
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateParam("page", String(page - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => updateParam("page", String(page + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({
  tab,
  hasFilters,
  query,
}: {
  tab: "incoming" | "outgoing";
  hasFilters: boolean;
  query?: string;
}) {
  if (query) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          No requests found for &quot;{query}&quot;.
        </p>
      </div>
    );
  }
  if (hasFilters) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">No requests match your filters.</p>
      </div>
    );
  }
  if (tab === "outgoing") {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          You haven&apos;t sent any payment requests yet.
        </p>
        <Link
          href="/requests/new"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create your first request
        </Link>
      </div>
    );
  }
  return (
    <div className="py-16 text-center">
      <p className="text-muted-foreground">
        No payment requests yet. When someone requests money from you, it will
        appear here.
      </p>
    </div>
  );
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
