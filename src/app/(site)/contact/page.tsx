import { Suspense } from "react";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, Headphones } from "lucide-react";
import { PageHero } from "@/components/marketing/blocks";
import { QuoteForm } from "@/components/marketing/QuoteForm";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Tell us about your dosage form and throughput target. Ackley Hartnett engineers will recommend the right pharmaceutical identification system and prepare a quotation.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Request a quote"
        title={
          <>
            Let&apos;s find the right machine for{" "}
            <span className="gradient-text">your line.</span>
          </>
        }
        subtitle="Share a few details and our engineers will recommend a platform, validation approach and prepare a quotation — usually within one business day."
      />

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <Suspense fallback={<div className="panel h-96 animate-pulse" />}>
            <QuoteForm />
          </Suspense>

          <aside className="space-y-6">
            <div className="panel p-7">
              <h3 className="font-bold text-ink">Talk to us directly</h3>
              <ul className="mt-5 space-y-4 text-sm">
                <ContactRow icon={Phone} label="Phone">
                  <a href="tel:+12159699190" className="font-semibold text-ink hover:text-laser-700">
                    215-969-9190
                  </a>
                </ContactRow>
                <ContactRow icon={Mail} label="Email">
                  <a
                    href="mailto:info@ackleyhartnett.com"
                    className="font-semibold text-ink hover:text-laser-700"
                  >
                    info@ackleyhartnett.com
                  </a>
                </ContactRow>
                <ContactRow icon={MapPin} label="Locations">
                  <span className="font-semibold text-ink">Langhorne &amp; Moorestown, USA</span>
                </ContactRow>
                <ContactRow icon={Clock} label="Response time">
                  <span className="font-semibold text-ink">Within one business day</span>
                </ContactRow>
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-tech p-7 text-white">
              <div className="bg-grid absolute inset-0 opacity-40" />
              <div className="relative">
                <Headphones size={24} className="text-laser-400" />
                <h3 className="mt-4 font-bold">Already a customer?</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Our team provides worldwide commissioning, field service and remote engineering
                  support to keep your validated lines running.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-laser-50 text-laser-700">
        <Icon size={17} />
      </span>
      <span className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
        {children}
      </span>
    </li>
  );
}
