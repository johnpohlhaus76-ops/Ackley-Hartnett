"use client";

import { AlertTriangle } from "lucide-react";

export default function CrmError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card mx-auto mt-12 max-w-lg p-8 text-center">
      <AlertTriangle className="mx-auto text-amber-500" size={32} />
      <h2 className="mt-4 text-lg font-semibold text-ink">CRM request failed</h2>
      <p className="mt-2 text-sm text-slate-500">
        {error.message || "Something went wrong talking to HubSpot."}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Check that <code className="rounded bg-slate-100 px-1">HUBSPOT_ACCESS_TOKEN</code> is set and
        has CRM scopes.
      </p>
      <button onClick={reset} className="btn-primary mt-5">
        Try again
      </button>
    </div>
  );
}
