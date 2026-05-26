import Link from "next/link";
import { ArrowRight, Play, CheckCircle2, FileText, Globe2 } from "lucide-react";
import { CATEGORIES, GMP_PILLARS, featuredProducts } from "@/lib/marketing";
import { portalStats } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { Icon } from "@/components/marketing/Icon";
import { Reveal } from "@/components/marketing/Reveal";
import { ProductCard, SectionHeading, StatBig } from "@/components/marketing/blocks";

const MARQUEE = [
  "10.6µm CO2 Laser",
  "355nm UV Laser",
  "Rotogravure Ink",
  "Two-Sided Printing",
  "Vision Inspection",
  "Hole-Depth Metrology",
  "OPC-UA Data",
  "IQ / OQ Validated",
  "Automated Roll Cleaning",
  "21 CFR Part 11",
];

export default function HomePage() {
  const s = portalStats();
  const featured = featuredProducts();

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-tech">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-laser-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />

        <div className="container-x relative grid gap-12 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28 lg:pt-36">
          <div>
            <span className="eyebrow-dark animate-fade-in">
              <span className="h-1.5 w-1.5 rounded-full bg-laser-400" />
              Pharmaceutical Identification Systems
            </span>
            <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl animate-fade-up">
              Every dose,{" "}
              <span className="gradient-text">perfectly marked.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300 animate-fade-up">
              Ackley Hartnett builds the world&apos;s most advanced tablet and capsule
              identification machines — edible-ink printing, CO2 &amp; UV laser marking, precision
              laser drilling and inline inspection. Engineered for safety, efficacy, cleanliness
              and GMP at up to <span className="font-semibold text-white">1.2&nbsp;million doses per hour</span>.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up">
              <Link href="/machines" className="btn-laser">
                Explore the machines <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn-outline-light">
                Request a quote
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
              {["Inkless laser processes", "Two-sided in one pass", "IQ/OQ validation included"].map(
                (f) => (
                  <span key={f} className="inline-flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-laser-400" /> {f}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Video device frame */}
          <div className="relative animate-fade-up">
            <div className="glass relative overflow-hidden rounded-3xl p-2 shadow-2xl">
              <div className="relative overflow-hidden rounded-2xl bg-black">
                <video
                  className="aspect-[4/3] w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster=""
                >
                  <source src="/media/vip-printer.mp4" type="video/mp4" />
                </video>
                {/* laser scan line */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute left-0 top-0 h-12 w-full bg-gradient-to-b from-laser-400/40 to-transparent animate-scan" />
                </div>
                {/* corner ticks */}
                <div className="pointer-events-none absolute inset-3 rounded-xl border border-laser-400/30" />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-laser-200 backdrop-blur">
                  <Play size={11} /> VIP Printer · live process
                </div>
              </div>
            </div>
            {/* floating chips */}
            <div className="absolute -left-4 top-8 hidden rounded-xl border border-white/10 bg-ink/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur-xl sm:block animate-float">
              <span className="text-laser-300">CO2 / UV</span> · inkless
            </div>
            <div
              className="absolute -right-3 bottom-10 hidden rounded-xl border border-white/10 bg-ink/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur-xl sm:block animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <span className="text-laser-300">70,000</span> doses/hr
            </div>
          </div>
        </div>

        {/* stat strip */}
        <div className="relative border-t border-white/10">
          <div className="container-x grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
            {[
              { v: formatNumber(s.installs), l: "Machines installed worldwide" },
              { v: `${s.countries}+`, l: "Countries on the installed base" },
              { v: "1.2M", l: "Max doses per hour" },
              { v: `${s.machineCatalog}`, l: "Production-ready models" },
            ].map((x) => (
              <div key={x.l}>
                <div className="text-2xl font-bold text-white sm:text-3xl">{x.v}</div>
                <div className="mt-1 text-xs text-slate-400">{x.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CAPABILITY MARQUEE ---------- */}
      <div className="border-b border-slate-200 bg-white py-5">
        <div className="relative flex overflow-hidden mask-fade-x">
          <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span
                key={i}
                className="whitespace-nowrap text-sm font-semibold uppercase tracking-wider text-slate-400"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- GMP PILLARS ---------- */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="Why it matters"
            title="Built around what pharmaceutical manufacturing demands"
            subtitle="Identification is a patient-safety function. Every machine we build is engineered around the four things that matter most on a GMP line."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GMP_PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <div className="panel h-full p-7">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-laser-400/20 to-brand-600/10 text-laser-700">
                    <Icon name={p.icon} size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Capabilities"
              title="One platform family. Every marking method."
              subtitle="From single-lane lab systems to million-per-hour confectionery lines."
            />
            <Link href="/machines" className="link-underline">
              Browse all machines <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.slug} delay={i * 70}>
                <Link
                  href={`/machines?category=${c.slug}`}
                  className="group relative block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-laser-300 hover:shadow-glow"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-laser-100 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-ink text-laser-300">
                    <Icon name={c.icon} size={22} />
                  </div>
                  <h3 className="relative mt-5 text-xl font-bold tracking-tight text-ink">{c.name}</h3>
                  <p className="relative mt-1 text-sm font-semibold text-laser-700">{c.tagline}</p>
                  <p className="relative mt-3 text-sm leading-relaxed text-slate-600">{c.description}</p>
                  <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-laser-700">
                    Explore <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURED MACHINES ---------- */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="Featured systems"
            title="Machines trusted on production lines worldwide"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WHY LASER (dark split) ---------- */}
      <section className="relative overflow-hidden bg-tech py-20 sm:py-28">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="container-x relative grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              dark
              eyebrow="The inkless advantage"
              title="Laser marking is the cleanest way to identify a dose"
              subtitle="No ink. No solvents. No drying. A focused beam permanently alters the surface to create a high-contrast, tamper-evident mark — eliminating consumables, cross-contamination risk and a whole class of cleaning validation."
            />
            <Link href="/technology" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-laser-300 hover:text-laser-200">
              How the technology works <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Reveal><div className="glass p-7"><StatBig dark value="0" label="Consumable inks or solvents required" /></div></Reveal>
            <Reveal delay={80}><div className="glass p-7"><StatBig dark value="2-side" label="Marking & drilling in a single pass" /></div></Reveal>
            <Reveal delay={160}><div className="glass p-7"><StatBig dark value="100%" label="Inline inspection of every dose" /></div></Reveal>
            <Reveal delay={240}><div className="glass p-7"><StatBig dark value="∞" label="Permanent, counterfeit-resistant marks" /></div></Reveal>
          </div>
        </div>
      </section>

      {/* ---------- VALIDATION BAND ---------- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1">
            {[
              { t: "IQ / OQ Documentation", d: "Installation & operational qualification packages for servo and PLC machines — standard." },
              { t: "Design Qualification", d: "DQ and functional specification documents to anchor your validation master plan." },
              { t: "OPC-UA Data Gateway", d: "Structured machine data with a documented tag list for MES and historian integration." },
              { t: "21 CFR Part 11 Ready", d: "Audit trails and electronic records architecture for regulated environments." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <CheckCircle2 size={20} className="text-laser-600" />
                <h4 className="mt-3 font-bold text-ink">{x.t}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Validation & compliance"
              title="Documented quality, from PO to production"
              subtitle="Regulatory readiness isn't an afterthought. Validation documentation, data integration and qualification services ship with the machine — so your line is audit-ready on day one."
            />
            <Link href="/quality" className="mt-8 inline-flex items-center gap-2 link-underline">
              Explore quality &amp; GMP <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- GLOBAL FOOTPRINT ---------- */}
      <section className="relative overflow-hidden bg-ink py-20">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="container-x relative flex flex-col items-center gap-3 text-center">
          <Globe2 size={32} className="text-laser-400" />
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A global installed base
          </h2>
          <p className="max-w-2xl text-slate-400">
            Ackley Hartnett machines run on pharmaceutical and confectionery lines across more than{" "}
            {s.countries} countries — supported by remote engineering and field service worldwide.
          </p>
          <div className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-8 sm:grid-cols-3">
            <StatBig dark value={formatNumber(s.installs)} label="Machines installed" />
            <StatBig dark value={`${s.countries}+`} label="Countries served" />
            <StatBig dark value={formatNumber(s.contacts)} label="Industry partners" />
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-laser-600 py-20 sm:py-24">
        <div className="container-x flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Bring world-class identification to your line
          </h2>
          <p className="max-w-xl text-lg text-white/80">
            Tell us about your dosage form and throughput target. Our engineers will recommend the
            right platform and prepare a quotation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="btn-lg bg-white text-brand-700 hover:bg-slate-100"
            >
              Request a quote <ArrowRight size={16} />
            </Link>
            <Link href="/machines" className="btn-lg border border-white/40 text-white hover:bg-white/10">
              <FileText size={16} /> Browse datasheets
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
