import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Stamp, Zap, Crosshair, ScanLine, Wind, Database } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/marketing/blocks";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata: Metadata = {
  title: "Technology",
  description:
    "How Ackley Hartnett identifies pharmaceutical doses: rotogravure ink printing, CO2 and UV laser marking, precision laser drilling, and inline vision and depth inspection.",
};

const METHODS = [
  {
    icon: Stamp,
    name: "Rotogravure Ink Printing",
    text: "An engraved design roll picks up pharmaceutical-grade edible ink and transfers it to the dose as it passes on an oriented carrier. Precise doctoring and offset rolls produce crisp, repeatable logos and identifiers — one or two-sided.",
    points: ["Edible-ink transfer", "Quick-change design rolls", "One or two-sided"],
  },
  {
    icon: Zap,
    name: "CO2 Laser Marking",
    text: "A focused 10.6µm or 9.3µm CO2 beam ablates or transforms the surface coating to create a permanent, high-contrast mark. No ink, no solvents, no drying — and nothing to clean between products.",
    points: ["Permanent & tamper-evident", "Zero consumables", "High line speed"],
  },
  {
    icon: Zap,
    name: "355nm UV Laser Marking",
    text: "UV 'cold marking' creates high-contrast marks with minimal heat input — ideal for heat-sensitive coatings, delicate softgels and demanding contrast requirements.",
    points: ["Low thermal load", "High contrast", "Sensitive formulations"],
  },
  {
    icon: Crosshair,
    name: "Precision Laser Drilling",
    text: "For osmotic and controlled-release tablets, a CO2 laser drills delivery orifices to a precise diameter and depth — the geometry that governs the release profile — at production speed.",
    points: ["Controlled-orifice systems", "One or two-sided", "Servo-precise indexing"],
  },
  {
    icon: ScanLine,
    name: "Vision & Depth Inspection",
    text: "Inline machine vision verifies print quality and detects defects, while laser depth metrology (LDI) confirms drilled-hole geometry on every dose — turning identification into 100% quality verification.",
    points: ["Print-quality vision", "Hole-depth metrology", "Automatic rejection"],
  },
  {
    icon: Wind,
    name: "Automated Cleaning & Containment",
    text: "The ARC system automates design-roll cleaning with hazardous-fume control and safety interlocks, protecting operators and slashing changeover time between high-potency products.",
    points: ["Fume control", "Safety interlocks", "Fast changeover"],
  },
];

const FLOW = [
  { step: "01", title: "Feed & orient", text: "Carrier-link, pocket-drum or bulk feed presents each dose in a known position." },
  { step: "02", title: "Mark or drill", text: "Ink, CO2, UV or drilling applies the identifier or delivery orifice." },
  { step: "03", title: "Inspect", text: "Vision and depth metrology verify every dose against spec." },
  { step: "04", title: "Reject & record", text: "Out-of-spec doses are removed; results stream out over OPC-UA." },
];

export default function TechnologyPage() {
  return (
    <>
      <PageHero
        eyebrow="Technology"
        title={
          <>
            Four ways to mark a dose. <span className="gradient-text">One precision standard.</span>
          </>
        }
        subtitle="Ackley Hartnett engineers the full spectrum of tablet and capsule identification — and the inspection that proves it was done right."
      >
        <Link href="/machines" className="btn-laser">
          See the machines <ArrowRight size={16} />
        </Link>
      </PageHero>

      {/* Methods */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Core processes" title="The identification toolkit" />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {METHODS.map((m, i) => (
              <Reveal key={m.name} delay={(i % 3) * 80}>
                <div className="panel h-full p-7">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-laser-300">
                    <m.icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-ink">{m.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{m.text}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {m.points.map((p) => (
                      <span key={p} className="rounded-md bg-laser-50 px-2 py-1 text-[11px] font-medium text-laser-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process flow */}
      <section className="relative overflow-hidden bg-tech py-20 sm:py-28">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="container-x relative">
          <SectionHeading
            dark
            align="center"
            eyebrow="The line"
            title="From bulk dose to verified, identified product"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((f, i) => (
              <Reveal key={f.step} delay={i * 90}>
                <div className="glass relative h-full p-7">
                  <div className="text-sm font-black text-laser-400">{f.step}</div>
                  <h3 className="mt-3 text-lg font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Data band */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Connected manufacturing"
              title="Machine data your MES can actually use"
              subtitle="An OPC-UA gateway streams structured, documented data tags from every machine — counts, rejects, recipe and status — ready for your historian, MES and batch records."
            />
            <Link href="/quality" className="mt-8 inline-flex items-center gap-2 link-underline">
              Quality, data integrity &amp; validation <ArrowRight size={15} />
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 font-mono text-sm shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-slate-400">
              <Database size={15} className="text-laser-400" /> OPC-UA · ns=2;Ackley/Line1
            </div>
            <pre className="mt-4 overflow-x-auto text-slate-300">
{`Throughput.PPH       : 68,420
Reject.PrintDefect   : 12
Reject.HoleDepth     : 3
Recipe.Active        : "Logo_A_2side"
Laser.Power.kW       : 0.42
Status               : RUNNING`}
            </pre>
          </div>
        </div>
      </section>
    </>
  );
}
