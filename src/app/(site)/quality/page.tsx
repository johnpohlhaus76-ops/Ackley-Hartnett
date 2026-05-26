import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Target,
  ClipboardCheck,
  Wind,
  Lock,
  Wrench,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/marketing/blocks";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata: Metadata = {
  title: "Quality & GMP",
  description:
    "How Ackley Hartnett machines deliver patient safety, efficacy, cleanliness and GMP compliance — IQ/OQ documentation, data integrity, validation services and operator safety.",
};

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Operator Safety",
    text: "Hazardous-fume extraction, safety-switch interlocks and containment-aware design protect operators handling potent compounds — engineered in, not bolted on.",
  },
  {
    icon: Target,
    title: "Efficacy Assurance",
    text: "Closed-loop laser drilling with hole-depth inspection guarantees the orifice geometry that controlled-release dosing depends on — verified on every single dose.",
  },
  {
    icon: Sparkles,
    title: "Cleanliness",
    text: "Inkless laser processes remove consumables and solvents entirely, while automated roll cleaning eliminates cross-contamination between products.",
  },
  {
    icon: FileCheck2,
    title: "GMP Compliance",
    text: "IQ/OQ documentation, design qualification, data integrity and Part 11 architecture come standard — so qualification is part of the machine, not a project.",
  },
];

const SERVICES = [
  { icon: ClipboardCheck, title: "IQ / OQ Documentation", text: "Installation and operational qualification packages for servo and PLC machines, plus ancillary equipment — standard on every quote." },
  { icon: FileCheck2, title: "Design Qualification & FS", text: "DQ and functional specification documents to anchor your validation master plan and accelerate review." },
  { icon: Lock, title: "21 CFR Part 11 & Data Integrity", text: "Electronic-records architecture, audit trails and OPC-UA data tags built for regulated environments." },
  { icon: Wind, title: "Containment & Fume Control", text: "The ARC roll-cleaning system and vacuum assemblies manage hazardous fumes and protect operators." },
  { icon: Wrench, title: "Commissioning & Field Service", text: "Worldwide commissioning, engineering support and remote sessions keep validated lines running." },
  { icon: ShieldCheck, title: "Laser Calibration Services", text: "Power-sensor recalibration with certificates and CO2 gas reconditioning maintain validated performance." },
];

export default function QualityPage() {
  return (
    <>
      <PageHero
        eyebrow="Quality & GMP"
        title={
          <>
            Identification is a <span className="gradient-text">patient-safety</span> function.
          </>
        }
        subtitle="We engineer machines around the four things a regulated line cannot compromise on — safety, efficacy, cleanliness and documented GMP compliance."
      >
        <Link href="/contact" className="btn-laser">
          Talk to our engineers <ArrowRight size={16} />
        </Link>
      </PageHero>

      {/* Pillars */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-2">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={(i % 2) * 90}>
                <div className="panel flex h-full gap-5 p-7">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-laser-400/20 to-brand-600/10 text-laser-700">
                    <p.icon size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-ink">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Validation services */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="What ships with the machine"
            title="Validation & compliance, included"
            subtitle="Regulatory readiness isn't a separate engagement. These services and documents are part of how we deliver a machine."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 80}>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
                  <s.icon size={22} className="text-laser-600" />
                  <h3 className="mt-4 font-bold text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-tech py-20">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="container-x relative flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A validation conversation, not a sales pitch
          </h2>
          <p className="max-w-xl text-slate-300">
            Tell us about your dosage form, potency and regulatory requirements. We&apos;ll map the
            right machine and qualification approach.
          </p>
          <Link href="/contact" className="btn-laser">
            Request a quote <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
