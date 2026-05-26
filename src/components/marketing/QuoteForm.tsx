"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/lib/marketing";

const DOSAGE_FORMS = ["Tablet", "Capsule", "Softgel", "LCT", "Confectionery", "Other"];

export function QuoteForm() {
  const params = useSearchParams();
  const presetMachine = params.get("machine") ?? "";
  const [submitted, setSubmitted] = useState(false);

  const presetName = useMemo(
    () => PRODUCTS.find((p) => p.slug === presetMachine)?.name ?? "",
    [presetMachine],
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const body = [
      `Name: ${get("name")}`,
      `Company: ${get("company")}`,
      `Email: ${get("email")}`,
      `Phone: ${get("phone")}`,
      `Country: ${get("country")}`,
      `Application: ${get("application")}`,
      `Dosage form: ${get("dosage")}`,
      `Throughput target: ${get("throughput")}`,
      `Machine of interest: ${get("machine")}`,
      "",
      "Message:",
      get("message"),
    ].join("\n");

    const subject = `Quote request${get("machine") ? ` — ${get("machine")}` : ""}`;
    window.location.href = `mailto:info@ackleyhartnett.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="panel flex flex-col items-center gap-4 p-10 text-center">
        <CheckCircle2 size={44} className="text-laser-600" />
        <h3 className="text-xl font-bold text-ink">Your email is ready to send</h3>
        <p className="max-w-sm text-sm text-slate-600">
          We&apos;ve opened a pre-filled message in your mail app. If nothing happened, email us
          directly at{" "}
          <a href="mailto:info@ackleyhartnett.com" className="font-semibold text-laser-700">
            info@ackleyhartnett.com
          </a>
          .
        </p>
        <button onClick={() => setSubmitted(false)} className="btn-ghost mt-2">
          Edit the request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-5 p-7 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" required />
        <Field label="Company" name="company" required />
        <Field label="Work email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" />
        <Field label="Country" name="country" />
        <Field label="Throughput target (pieces/hr)" name="throughput" placeholder="e.g. 60,000" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Application" name="application">
          <option value="">Select a capability…</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select label="Dosage form" name="dosage">
          <option value="">Select a dosage form…</option>
          {DOSAGE_FORMS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>

      <Select label="Machine of interest" name="machine" defaultValue={presetName}>
        <option value="">No specific machine yet</option>
        {PRODUCTS.map((p) => (
          <option key={p.slug} value={p.name}>
            {p.name}
          </option>
        ))}
      </Select>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Tell us about your project
        </label>
        <textarea
          name="message"
          rows={4}
          className="input"
          placeholder="Product, regulatory requirements, timeline, and anything else that helps us recommend the right system."
        />
      </div>

      <button type="submit" className="btn-laser w-full sm:w-auto">
        <Send size={16} /> Send request
      </button>
      <p className="text-xs text-slate-400">
        This opens a pre-filled email to our team. We typically respond within one business day.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-laser-600">*</span>}
      </label>
      <input type={type} name={name} required={required} placeholder={placeholder} className="input" />
    </div>
  );
}

function Select({
  label,
  name,
  children,
  defaultValue,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <select name={name} defaultValue={defaultValue} className="input">
        {children}
      </select>
    </div>
  );
}
