import { FileText, Download, Play } from "lucide-react";
import { datasheets } from "@/lib/data";
import { PageHeader } from "@/components/ui";

export default function DatasheetsPage() {
  return (
    <div>
      <PageHeader
        title="Product Datasheets"
        subtitle="Ink printing, laser drilling, laser marking and inspection systems for pharmaceutical & confectionery products."
      />

      {/* Featured video + company overview */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <video controls poster="" className="aspect-video w-full bg-black" preload="metadata">
            <source src="/media/vip-printer.mp4" type="video/mp4" />
          </video>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-ink">VIP Printer — In Action</p>
              <p className="text-sm text-slate-500">Rotogravure ink printing, up to 60,000 pph</p>
            </div>
            <Play className="text-brand-500" size={20} />
          </div>
        </div>
        <a href="/datasheets/company-overview.pdf" target="_blank" rel="noreferrer" className="card flex flex-col justify-between p-5 transition hover:border-brand-300">
          <div>
            <span className="badge bg-brand-50 text-brand-700">Company</span>
            <h3 className="mt-2 text-lg font-bold text-ink">Ackley Hartnett Overview</h3>
            <p className="mt-1 text-sm text-slate-500">
              Ackley Machine + R.W. Hartnett — 200+ years of combined expertise in ink printing, laser drilling and marking.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
            <Download size={14} /> Open overview
          </span>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {datasheets.map((d) => (
          <a
            key={d.slug}
            href={d.file}
            target="_blank"
            rel="noreferrer"
            className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <FileText size={18} />
              </span>
              <Download size={16} className="text-slate-300" />
            </div>
            <h3 className="font-semibold text-ink">{d.name}</h3>
            <p className="mt-1 line-clamp-3 text-sm text-slate-500">{cleanHero(d.hero, d.name)}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

function cleanHero(hero: string, name: string) {
  // Strip the repeated product name / leading taxonomy words for a cleaner blurb.
  const tail = hero.split(name)[1] ?? hero;
  return tail.replace(/^[\s–-]+/, "").slice(0, 160) || hero.slice(0, 160);
}
