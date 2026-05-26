import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Download,
  CheckCircle2,
  Gauge,
  Layers,
  Repeat,
  Cpu,
} from "lucide-react";
import {
  PRODUCTS,
  getProduct,
  getCategory,
  productsByCategory,
} from "@/lib/marketing";
import { ProductCard } from "@/components/marketing/blocks";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Machine not found" };
  return {
    title: `${p.name} — ${p.tagline}`,
    description: p.blurb,
  };
}

export default async function MachineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const cat = getCategory(product.category);
  const related = productsByCategory(product.category).filter((p) => p.slug !== product.slug);

  const specs = [
    { icon: Gauge, label: "Throughput", value: product.throughput },
    { icon: Cpu, label: "Technology", value: product.technology },
    { icon: Repeat, label: "Sides", value: product.sides },
    { icon: Layers, label: "Feed system", value: product.feed },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-tech">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-laser-500/20 blur-3xl" />
        <div className="container-x relative pb-16 pt-28 sm:pt-32">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/machines" className="inline-flex items-center gap-1 hover:text-white">
              <ArrowLeft size={14} /> Machines
            </Link>
            <span>/</span>
            <Link href={`/machines?category=${cat?.slug}`} className="hover:text-white">
              {cat?.name}
            </Link>
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <span className="eyebrow-dark">{cat?.name}</span>
              <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 text-lg font-medium text-laser-300">{product.tagline}</p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {product.blurb}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/contact?machine=${product.slug}`} className="btn-laser">
                  Request a quote <ArrowRight size={16} />
                </Link>
                {product.datasheet && (
                  <a
                    href={product.datasheet}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline-light"
                  >
                    <Download size={16} /> Datasheet (PDF)
                  </a>
                )}
              </div>
            </div>

            {/* media */}
            <div className="glass overflow-hidden rounded-3xl p-2">
              {product.video ? (
                <div className="relative overflow-hidden rounded-2xl bg-black">
                  <video className="aspect-[4/3] w-full object-cover" autoPlay muted loop playsInline>
                    <source src={product.video} type="video/mp4" />
                  </video>
                  <div className="pointer-events-none absolute inset-3 rounded-xl border border-laser-400/30" />
                </div>
              ) : (
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-ink to-ink-soft">
                  <div className="bg-grid absolute inset-0 opacity-40" />
                  <div className="absolute left-0 top-0 h-16 w-full bg-gradient-to-b from-laser-400/30 to-transparent animate-scan" />
                  <div className="relative text-center">
                    <div className="text-6xl font-black tracking-tight text-white/90">
                      {product.throughput.split(" ")[0]}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-laser-300">
                      {product.throughput.includes("PPH") ? "pieces / hour" : "throughput"}
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-3 rounded-xl border border-laser-400/30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-x grid grid-cols-2 gap-px overflow-hidden lg:grid-cols-4">
          {specs.map((sp) => (
            <div key={sp.label} className="px-2 py-8 sm:px-4">
              <sp.icon size={20} className="text-laser-600" />
              <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {sp.label}
              </div>
              <div className="mt-1 text-base font-bold text-ink">{sp.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights + datasheet */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Highlights</h2>
            <ul className="mt-6 space-y-4">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-laser-600" />
                  <span className="text-slate-700">{h}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-bold text-ink">Built for GMP</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Like every Ackley Hartnett system, the {product.name} is available with IQ/OQ
                documentation, OPC-UA data integration and qualification services for 21 CFR Part 11
                environments.
              </p>
              <Link href="/quality" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-laser-700 hover:text-laser-800">
                Quality &amp; validation <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {product.datasheet ? (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-ink">Datasheet</h2>
                <a
                  href={product.datasheet}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-laser-700 hover:text-laser-800"
                >
                  <Download size={15} /> Download
                </a>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <object
                  data={`${product.datasheet}#view=FitH`}
                  type="application/pdf"
                  className="h-[560px] w-full"
                >
                  <div className="grid h-[560px] place-items-center p-8 text-center text-sm text-slate-500">
                    <span>
                      Your browser can&apos;t preview PDFs.{" "}
                      <a href={product.datasheet} className="font-semibold text-laser-700 underline">
                        Open the datasheet
                      </a>
                    </span>
                  </div>
                </object>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-8">
              <h2 className="text-2xl font-bold tracking-tight text-ink">Full specifications</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                A detailed datasheet for the {product.name} is available on request. Our engineers
                will share full specifications, footprint and validation documentation tailored to
                your dosage form and throughput target.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/contact?machine=${product.slug}`} className="btn-primary">
                  Request full spec <ArrowRight size={15} />
                </Link>
                <a href="mailto:info@ackleyhartnett.com" className="btn-ghost">
                  Email us
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-white py-16 sm:py-20">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                More {cat?.name.toLowerCase()} systems
              </h2>
              <Link href={`/machines?category=${cat?.slug}`} className="link-underline">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-br from-brand-700 to-laser-600 py-16">
        <div className="container-x flex flex-col items-center gap-5 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white">
            Interested in the {product.name}?
          </h2>
          <Link href={`/contact?machine=${product.slug}`} className="btn-lg bg-white text-brand-700 hover:bg-slate-100">
            Request a quote <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
