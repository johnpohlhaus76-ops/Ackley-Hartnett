import Link from "next/link";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/marketing";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-tech text-slate-300">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="container-x relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-laser-400 to-brand-600 text-sm font-black text-ink">
                AH
              </span>
              <span className="text-lg font-bold tracking-tight text-white">Ackley Hartnett</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              The global standard in pharmaceutical tablet and capsule identification — edible-ink
              printing, laser marking, precision drilling and inline inspection, engineered for GMP.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-laser-300">Machines</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/machines?category=${c.slug}`} className="text-slate-400 transition hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-laser-300">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/technology" className="text-slate-400 transition hover:text-white">Technology</Link></li>
              <li><Link href="/quality" className="text-slate-400 transition hover:text-white">Quality &amp; GMP</Link></li>
              <li><Link href="/machines" className="text-slate-400 transition hover:text-white">All Machines</Link></li>
              <li><Link href="/contact" className="text-slate-400 transition hover:text-white">Request a Quote</Link></li>
              <li>
                <Link href="/portal" className="inline-flex items-center gap-1 text-slate-400 transition hover:text-white">
                  Sales Portal <ArrowUpRight size={13} />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-laser-300">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2.5 text-slate-400">
                <Phone size={15} className="text-laser-400" />
                <a href="tel:+12159699190" className="hover:text-white">215-969-9190</a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Mail size={15} className="text-laser-400" />
                <a href="mailto:info@ackleyhartnett.com" className="hover:text-white">info@ackleyhartnett.com</a>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400">
                <MapPin size={15} className="mt-0.5 shrink-0 text-laser-400" />
                <span>Langhorne &amp; Moorestown, USA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Ackley Hartnett. All rights reserved.</p>
          <p>Pharmaceutical · Confectionery · Battery &amp; Energy identification systems</p>
        </div>
      </div>
    </footer>
  );
}
