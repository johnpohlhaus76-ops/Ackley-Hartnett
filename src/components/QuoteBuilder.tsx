"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Printer, FileText } from "lucide-react";
import type { Catalog, CatalogItem } from "@/lib/types";
import {
  machineToLines,
  quoteTotals,
  lineTotal,
  nextQuoteNumber,
  STANDARD_TERMS,
  REP_COMMISSION_RATE,
  DISTRIBUTOR_DISCOUNT,
  type QuoteLine,
} from "@/lib/quote";
import { cn, formatCurrency } from "@/lib/utils";

interface SlimAccount {
  id: string;
  name: string;
}

export function QuoteBuilder({
  catalog,
  accounts,
}: {
  catalog: Catalog;
  accounts: SlimAccount[];
}) {
  const params = useSearchParams();
  const machines = useMemo(
    () => catalog.categories.flatMap((c) => c.items).filter((i) => i.kind === "machine"),
    [catalog],
  );
  const allItems = useMemo(() => catalog.categories.flatMap((c) => c.items), [catalog]);

  const initialMachinePart = params.get("machine");
  const initialAccount = params.get("account");

  const [quoteNo] = useState(nextQuoteNumber);
  const [accountId, setAccountId] = useState(initialAccount ?? "");
  const [showDistributor, setShowDistributor] = useState(false);
  const [lines, setLines] = useState<QuoteLine[]>(() => {
    if (initialMachinePart) {
      const m = machines.find((mm) => mm.partNumber === initialMachinePart);
      if (m) return machineToLines(m, m.changeParts?.[0]?.dimension);
    }
    return [];
  });

  const [machineSel, setMachineSel] = useState("");
  const [dimSel, setDimSel] = useState("");
  const [itemSel, setItemSel] = useState("");

  const selectedMachine = machines.find((m) => m.partNumber === machineSel);
  const totals = quoteTotals(lines);
  const accountName = accounts.find((a) => a.id === accountId)?.name;

  function addMachine() {
    if (!selectedMachine) return;
    setLines((prev) => [...prev, ...machineToLines(selectedMachine, dimSel || selectedMachine.changeParts?.[0]?.dimension)]);
    setMachineSel("");
    setDimSel("");
  }

  function addItem() {
    const item = allItems.find((i) => i.partNumber === itemSel || i.name === itemSel);
    if (!item || item.basePrice == null) return;
    setLines((prev) => [
      ...prev,
      {
        partNumber: item.partNumber,
        description: item.name,
        qty: 1,
        unitPrice: item.basePrice!,
        kind: item.kind === "machine" ? "machine" : "option",
      },
    ]);
    setItemSel("");
  }

  function update(i: number, patch: Partial<QuoteLine>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function remove(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Builder controls */}
      <div className="space-y-4 lg:col-span-1 print:hidden">
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Customer</h2>
          <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="">— Select account —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Add Machine + Change Parts</h2>
          <select className="input mb-2" value={machineSel} onChange={(e) => { setMachineSel(e.target.value); setDimSel(""); }}>
            <option value="">— Select machine —</option>
            {machines.map((m, i) => (
              <option key={`${m.partNumber}-${i}`} value={m.partNumber ?? ""}>
                {m.name} {m.basePrice ? `(${formatCurrency(m.basePrice)})` : ""}
              </option>
            ))}
          </select>
          {selectedMachine?.changeParts?.length ? (
            <select className="input mb-2" value={dimSel} onChange={(e) => setDimSel(e.target.value)}>
              {selectedMachine.changeParts.map((cp) => (
                <option key={cp.dimension} value={cp.dimension}>
                  {cp.dimension} — {formatCurrency(cp.price)}
                </option>
              ))}
            </select>
          ) : null}
          <button onClick={addMachine} disabled={!selectedMachine} className="btn-primary w-full">
            <Plus size={15} /> Add to quote
          </button>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Add Option / Service / Consumable</h2>
          <select className="input mb-2" value={itemSel} onChange={(e) => setItemSel(e.target.value)}>
            <option value="">— Select item —</option>
            {allItems
              .filter((i) => i.kind !== "machine" && i.basePrice != null)
              .map((i, idx) => (
                <option key={`${i.partNumber}-${idx}`} value={i.partNumber ?? i.name}>
                  {i.name} ({formatCurrency(i.basePrice)})
                </option>
              ))}
          </select>
          <button onClick={addItem} disabled={!itemSel} className="btn-ghost w-full">
            <Plus size={15} /> Add line item
          </button>
        </div>

        <label className="flex items-center gap-2 px-1 text-sm text-slate-600">
          <input type="checkbox" checked={showDistributor} onChange={(e) => setShowDistributor(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          Show distributor pricing (−{Math.round(DISTRIBUTOR_DISCOUNT * 100)}%)
        </label>
      </div>

      {/* Quote document */}
      <div className="lg:col-span-2">
        <div className="card overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 p-5">
            <div>
              <p className="text-lg font-bold text-ink">Budgetary Quotation</p>
              <p className="text-sm text-slate-500">Quote {quoteNo} · {accountName ?? "—"}</p>
              <p className="text-xs text-slate-400">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-brand-700">Ackley Hartnett</p>
              <p className="text-xs text-slate-400">215-969-9190</p>
              <p className="text-xs text-slate-400">info@ackleyhartnett.com</p>
            </div>
          </div>

          <div className="p-5">
            {lines.length === 0 ? (
              <div className="grid place-items-center py-12 text-center text-sm text-slate-400">
                <FileText size={28} className="mb-2 text-slate-300" />
                Add a machine or line item to start building the quote.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 text-center font-medium">Qty</th>
                    <th className="pb-2 text-right font-medium">Unit</th>
                    <th className="pb-2 text-right font-medium">{showDistributor ? "Dist." : "Total"}</th>
                    <th className="pb-2 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td className="py-2">
                        <p className="font-medium text-ink">{l.description}</p>
                        <p className="text-xs text-slate-400">{l.partNumber ?? l.kind}</p>
                      </td>
                      <td className="py-2 text-center">
                        <input
                          type="number"
                          min={1}
                          value={l.qty}
                          onChange={(e) => update(i, { qty: Math.max(1, Number(e.target.value) || 1) })}
                          className="w-14 rounded border border-slate-200 px-2 py-1 text-center print:border-0"
                        />
                      </td>
                      <td className="py-2 text-right text-slate-500">{formatCurrency(l.unitPrice)}</td>
                      <td className="py-2 text-right font-medium text-ink">
                        {formatCurrency(lineTotal(l) * (showDistributor ? 1 - DISTRIBUTOR_DISCOUNT : 1))}
                      </td>
                      <td className="py-2 text-right print:hidden">
                        <button onClick={() => remove(i)} className="text-slate-300 hover:text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {lines.length > 0 && (
              <div className="mt-4 flex flex-col items-end gap-1 border-t border-slate-200 pt-4 text-sm">
                <Row label="Subtotal (list)" value={formatCurrency(totals.subtotal)} />
                {showDistributor && <Row label={`Distributor total (−${Math.round(DISTRIBUTOR_DISCOUNT * 100)}%)`} value={formatCurrency(totals.distributorTotal)} strong />}
                {!showDistributor && <Row label="Total" value={formatCurrency(totals.subtotal)} strong />}
                <Row label={`Rep commission (${Math.round(REP_COMMISSION_RATE * 100)}%)`} value={formatCurrency(totals.repCommission)} muted />
              </div>
            )}
          </div>

          {lines.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 p-5 text-xs text-slate-500">
              <Terms title="Payment Terms" items={STANDARD_TERMS.payment} />
              <Terms title="Customer Requirements" items={STANDARD_TERMS.requirements} />
              <div className="mt-3 grid gap-1">
                <p><strong>Lead time:</strong> {STANDARD_TERMS.leadTime}</p>
                <p><strong>Shipping:</strong> {STANDARD_TERMS.shipping}</p>
                <p><strong>Validity:</strong> {STANDARD_TERMS.validity}</p>
              </div>
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="mt-4 flex justify-end print:hidden">
            <button onClick={() => window.print()} className="btn-ghost">
              <Printer size={15} /> Print / Save PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex w-64 justify-between">
      <span className={cn(muted ? "text-slate-400" : "text-slate-500", strong && "font-semibold text-ink")}>{label}</span>
      <span className={cn(strong ? "text-base font-bold text-brand-700" : "font-medium text-ink", muted && "font-normal text-slate-400")}>{value}</span>
    </div>
  );
}

function Terms({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-3">
      <p className="mb-1 font-semibold text-slate-600">{title}</p>
      <ul className="list-inside list-disc space-y-0.5">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
