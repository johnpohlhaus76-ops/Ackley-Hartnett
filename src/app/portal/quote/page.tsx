import { Suspense } from "react";
import { catalog, accounts } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { QuoteBuilder } from "@/components/QuoteBuilder";

export default function QuotePage() {
  const slim = accounts
    .filter((a) => a.contactCount > 0 || a.installCount > 0 || a.priority)
    .map((a) => ({ id: a.id, name: a.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader
        title="Quote Builder"
        subtitle="Configure machines, change parts and services — auto-calculated with 10% rep commission and standard Ackley Hartnett terms."
      />
      <Suspense fallback={<div className="card p-10 text-center text-sm text-slate-400">Loading…</div>}>
        <QuoteBuilder catalog={catalog} accounts={slim} />
      </Suspense>
    </div>
  );
}
