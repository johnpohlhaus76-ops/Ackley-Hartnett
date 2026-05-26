import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES, PRODUCTS } from "@/lib/marketing";
import { Icon } from "@/components/marketing/Icon";
import { PageHero, ProductCard } from "@/components/marketing/blocks";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Machines",
  description:
    "Explore Ackley Hartnett pharmaceutical identification machines: ink printing, laser marking, laser drilling, inspection and automated cleaning systems.",
};

export default async function MachinesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = CATEGORIES.find((c) => c.slug === category)?.slug ?? null;
  const shown = CATEGORIES.filter((c) => !active || c.slug === active);

  return (
    <>
      <PageHero
        eyebrow="The machine catalog"
        title={
          <>
            Every way to mark, drill and inspect{" "}
            <span className="gradient-text">a dose.</span>
          </>
        }
        subtitle="From single-lane lab systems to million-per-hour confectionery lines — explore the full Ackley Hartnett platform family by capability."
      />

      {/* Filter bar */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="container-x flex gap-2 overflow-x-auto py-3">
          <FilterPill href="/machines" label="All machines" active={!active} count={PRODUCTS.length} />
          {CATEGORIES.map((c) => (
            <FilterPill
              key={c.slug}
              href={`/machines?category=${c.slug}`}
              label={c.name}
              active={active === c.slug}
              count={PRODUCTS.filter((p) => p.category === c.slug).length}
            />
          ))}
        </div>
      </div>

      <div className="bg-slate-50">
        {shown.map((cat) => {
          const items = PRODUCTS.filter((p) => p.category === cat.slug);
          return (
            <section key={cat.slug} className="container-x py-16 sm:py-20">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink text-laser-300">
                  <Icon name={cat.icon} size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-ink">{cat.name}</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                    {cat.description}
                  </p>
                </div>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function FilterPill({
  href,
  label,
  active,
  count,
}: {
  href: string;
  label: string;
  active: boolean;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-laser-500 bg-laser-50 text-laser-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-ink",
      )}
    >
      {label}
      <span className={cn("text-xs", active ? "text-laser-500" : "text-slate-400")}>{count}</span>
    </Link>
  );
}
