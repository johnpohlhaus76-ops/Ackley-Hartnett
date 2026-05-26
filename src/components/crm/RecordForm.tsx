import Link from "next/link";
import { Save } from "lucide-react";
import { saveRecordAction } from "@/app/portal/crm/actions";
import type { HubObjectType, HubRecord } from "@/lib/hubspot";

interface Field {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  full?: boolean;
}

const FIELDS: Record<HubObjectType, Field[]> = {
  companies: [
    { name: "name", label: "Company name", required: true, full: true },
    { name: "domain", label: "Domain" },
    { name: "website", label: "Website" },
    { name: "phone", label: "Phone" },
    { name: "industry", label: "Industry" },
    { name: "city", label: "City" },
    { name: "state", label: "State / Region" },
    { name: "country", label: "Country" },
  ],
  contacts: [
    { name: "firstname", label: "First name" },
    { name: "lastname", label: "Last name" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "jobtitle", label: "Job title" },
    { name: "company", label: "Company" },
    { name: "city", label: "City" },
    { name: "state", label: "State / Region" },
    { name: "country", label: "Country" },
  ],
  deals: [],
};

export function RecordForm({
  type,
  record,
  cancelHref,
}: {
  type: HubObjectType;
  record?: HubRecord;
  cancelHref: string;
}) {
  const fields = FIELDS[type];
  return (
    <form action={saveRecordAction} className="card p-6">
      <input type="hidden" name="_type" value={type} />
      {record && <input type="hidden" name="_id" value={record.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.full ? "sm:col-span-2" : undefined}>
            <label htmlFor={f.name} className="mb-1.5 block text-sm font-medium text-ink">
              {f.label} {f.required && <span className="text-brand-600">*</span>}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type ?? "text"}
              required={f.required}
              defaultValue={record?.properties[f.name] ?? ""}
              className="input"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button type="submit" className="btn-primary">
          <Save size={15} /> {record ? "Save changes" : "Create"}
        </button>
        <Link href={cancelHref} className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
