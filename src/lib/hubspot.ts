import "server-only";

const BASE = "https://api.hubapi.com";

export function hubspotEnabled(): boolean {
  return Boolean(process.env.HUBSPOT_ACCESS_TOKEN);
}

export type HubObjectType = "companies" | "contacts" | "deals";

export interface HubRecord {
  id: string;
  properties: Record<string, string | null>;
  createdAt?: string;
  updatedAt?: string;
}

interface HubListResponse {
  results: HubRecord[];
  paging?: { next?: { after: string } };
}

export const PROPERTY_SETS: Record<HubObjectType, string[]> = {
  companies: [
    "name",
    "domain",
    "phone",
    "city",
    "state",
    "country",
    "industry",
    "lifecyclestage",
    "numberofemployees",
    "website",
  ],
  contacts: [
    "firstname",
    "lastname",
    "email",
    "phone",
    "jobtitle",
    "company",
    "lifecyclestage",
    "city",
    "state",
    "country",
  ],
  deals: ["dealname", "amount", "dealstage", "pipeline", "closedate"],
};

class HubSpotError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HubSpotError";
  }
}

async function hubFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) throw new HubSpotError(503, "HubSpot is not configured");

  const { json, ...rest } = init;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) detail = body.message;
    } catch {
      /* ignore */
    }
    throw new HubSpotError(res.status, detail);
  }
  return (await res.json()) as T;
}

export async function listRecords(
  type: HubObjectType,
  opts: { limit?: number; after?: string } = {},
): Promise<{ records: HubRecord[]; next: string | null }> {
  const params = new URLSearchParams({
    limit: String(opts.limit ?? 25),
    properties: PROPERTY_SETS[type].join(","),
  });
  if (opts.after) params.set("after", opts.after);
  const data = await hubFetch<HubListResponse>(`/crm/v3/objects/${type}?${params}`);
  return { records: data.results, next: data.paging?.next?.after ?? null };
}

export async function searchRecords(
  type: HubObjectType,
  query: string,
  limit = 25,
): Promise<HubRecord[]> {
  const data = await hubFetch<HubListResponse>(`/crm/v3/objects/${type}/search`, {
    method: "POST",
    json: {
      query,
      limit,
      properties: PROPERTY_SETS[type],
    },
  });
  return data.results;
}

export async function getRecord(
  type: HubObjectType,
  id: string,
  associations: HubObjectType[] = [],
): Promise<HubRecord & { associations?: Record<string, { results: { id: string }[] }> }> {
  const params = new URLSearchParams({ properties: PROPERTY_SETS[type].join(",") });
  if (associations.length) params.set("associations", associations.join(","));
  return hubFetch(`/crm/v3/objects/${type}/${id}?${params}`);
}

export async function getRecordsByIds(
  type: HubObjectType,
  ids: string[],
): Promise<HubRecord[]> {
  if (ids.length === 0) return [];
  const data = await hubFetch<{ results: HubRecord[] }>(
    `/crm/v3/objects/${type}/batch/read`,
    {
      method: "POST",
      json: {
        properties: PROPERTY_SETS[type],
        inputs: ids.slice(0, 100).map((id) => ({ id })),
      },
    },
  );
  return data.results;
}

export async function createRecord(
  type: HubObjectType,
  properties: Record<string, string>,
): Promise<HubRecord> {
  return hubFetch(`/crm/v3/objects/${type}`, {
    method: "POST",
    json: { properties },
  });
}

export async function updateRecord(
  type: HubObjectType,
  id: string,
  properties: Record<string, string>,
): Promise<HubRecord> {
  return hubFetch(`/crm/v3/objects/${type}/${id}`, {
    method: "PATCH",
    json: { properties },
  });
}

export async function getCounts(): Promise<Record<HubObjectType, number | null>> {
  const types: HubObjectType[] = ["companies", "contacts", "deals"];
  const entries = await Promise.all(
    types.map(async (t) => {
      try {
        const data = await hubFetch<{ total: number }>(`/crm/v3/objects/${t}/search`, {
          method: "POST",
          json: { limit: 1, properties: ["hs_object_id"] },
        });
        return [t, data.total] as const;
      } catch {
        return [t, null] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as Record<HubObjectType, number | null>;
}

export function displayName(type: HubObjectType, r: HubRecord): string {
  const p = r.properties;
  if (type === "companies") return p.name || p.domain || `Company ${r.id}`;
  if (type === "contacts")
    return [p.firstname, p.lastname].filter(Boolean).join(" ") || p.email || `Contact ${r.id}`;
  return p.dealname || `Deal ${r.id}`;
}
