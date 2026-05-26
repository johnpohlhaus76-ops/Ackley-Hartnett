"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createRecord, updateRecord, type HubObjectType } from "@/lib/hubspot";

const EDITABLE: Record<HubObjectType, string[]> = {
  companies: ["name", "domain", "phone", "city", "state", "country", "industry", "website"],
  contacts: ["firstname", "lastname", "email", "phone", "jobtitle", "company", "city", "state", "country"],
  deals: ["dealname", "amount", "dealstage", "pipeline", "closedate"],
};

function isType(v: unknown): v is HubObjectType {
  return v === "companies" || v === "contacts" || v === "deals";
}

export async function saveRecordAction(formData: FormData) {
  const type = formData.get("_type");
  const id = formData.get("_id");
  if (!isType(type)) throw new Error("Unknown record type");

  const properties: Record<string, string> = {};
  for (const field of EDITABLE[type]) {
    const value = formData.get(field);
    if (typeof value === "string" && value.trim() !== "") {
      properties[field] = value.trim();
    }
  }

  const recordId = typeof id === "string" && id ? id : null;
  const saved = recordId
    ? await updateRecord(type, recordId, properties)
    : await createRecord(type, properties);

  revalidatePath(`/portal/crm/${type}`);
  revalidatePath(`/portal/crm/${type}/${saved.id}`);
  redirect(`/portal/crm/${type}/${saved.id}`);
}
