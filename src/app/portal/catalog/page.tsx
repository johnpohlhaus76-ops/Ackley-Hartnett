import { catalog } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { CatalogExplorer } from "@/components/CatalogExplorer";

export default function CatalogPage() {
  return (
    <div>
      <PageHeader
        title="Equipment Catalog"
        subtitle={catalog.note}
      />
      <CatalogExplorer catalog={catalog} />
    </div>
  );
}
