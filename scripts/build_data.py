"""Unify HubSpot CRM (companies+contacts), installed-base asset registry, priority
list, and the price-list catalog into a single Account 360 dataset for the portal."""
import json, glob, re, openpyxl
from collections import defaultdict

TOOL_DIR = "/root/.claude/projects/-home-user-Ackley-Hartnett/dd4d3c65-1f8d-426f-88ff-2de4a255ad8f/tool-results"
ASSETS = "data/source/assets_2026.xlsx"
PRIORITY = "/root/.claude/uploads/dd4d3c65-1f8d-426f-88ff-2de4a255ad8f/71ec55ce-CRM_Priority_Contacts.xlsx"

# ---------- helpers ----------
SUFFIXES = r"\b(inc|incorporated|ltd|limited|llc|l\.l\.c|co|corp|corporation|company|plc|gmbh|sarl|ag|sa|s\.a|nv|n\.v|labs?|laboratories|pharmaceuticals?|pharma|intl|international|industries|group|the)\b"
def norm(name):
    if not name: return ""
    s = str(name).lower()
    s = re.sub(r"[.,/&'’\"-]", " ", s)
    s = re.sub(r",?\s*[a-z]{2}\s*$", "", s)  # trailing state code
    s = re.sub(SUFFIXES, " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def slug(s, n=60):
    return re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")[:n] or "unknown"

def clean_name(name):
    """Clip mashed-in email/website/address text from a company-name cell."""
    if name is None: return None
    s = re.split(r"www\.|https?:|\s{2,}|\n", str(name))[0]
    m = re.search(r"[A-Za-z0-9._%+\-]+@", s)        # glued email local-part
    if m:
        cut = s[:m.start()].strip(" ,.-")
        s = cut if len(cut) >= 3 else s[:m.start()]
    s = re.split(r"\bP\.?\s?O\.?\s?Box\b|\bAccounts Payable\b|Invoice|\bMailroom\b|\bSite ID\b|Kenvue", s, flags=re.I)[0]
    s = re.sub(r"\s+\d{2,}.*$", "", s)               # trailing street number + rest
    return s.strip(" ,.-") or None

STOP_TOKENS = {"the", "of", "and", "us", "usa", "na"}
def brand_key(n):
    toks = [t for t in n.split() if t not in STOP_TOKENS]
    return toks[0] if toks else (n or "")

CONF = ("candy","chocolate","mars","hershey","mondel","jelly belly","ferrara","tootsie",
        "see's","sees","spangler","just born","wrigley","mount franklin","ferrero","nestle",
        "confection","ferrara","perfetti")
ENERGY = ("battery","energy","power","duracell","energizer","quantumscape","solid power",
          "clarios","enersys","a123","farasis","boston-power","ultralife","enovix","navitas",
          "our next energy","sion power","panasonic","lg chem","catl")
PHARMA_HINT = ("pharma","pharmaceutical"," bio","biotech","therapeut","labs","laborator",
               "medic","health","caplabs","drug","caribe","formulations")
KNOWN_PHARMA = {"pfizer","merck","novartis","abbvie","teva","lonza","catalent","amneal","bayer",
    "johnson johnson","perrigo","mallinckrodt","supernus","aphena","patheon","recipharm",
    "sovereign","osmotica","upsher smith","lannett","aquestive","ascent","tulex","alcami",
    "avet","pillar5","duchesnay","timecaplabs","belmar","berlimed","best formulations","banner",
    "bestco","ohm","wyeth","mylan","abbott","bms","andrx","national vitamin","knoll","basf","lilly"}
DISTRIB = ("motion industries","applied","vallen","wesco","synovos","afc industries","dxp","grainger","rs group","distribution","supply")
SAMPLE = ("hubspot","docusign","pepperdine","department of transportation","robert peirce",
          "young america capital","soil carbon","geoweb","firstmovers","first movers","ivik","wholeplants")

def industry_of(name, domain, hs_industry):
    blob = f"{name or ''} {domain or ''}".lower()
    if any(k in blob for k in SAMPLE): return "Other"
    if any(k in blob for k in CONF): return "Confectionery"
    if any(k in blob for k in ENERGY): return "Battery & Energy"
    if any(k in blob for k in DISTRIB): return "Distribution / MRO"
    n = norm(name)
    PHARMA_BRANDS = {b.split()[0] for b in KNOWN_PHARMA}
    if n in KNOWN_PHARMA or (n.split() and n.split()[0] in PHARMA_BRANDS): return "Pharmaceutical"
    if any(k in blob for k in PHARMA_HINT): return "Pharmaceutical"
    if hs_industry == "PHARMACEUTICALS": return "Pharmaceutical"
    if hs_industry in ("FOOD_BEVERAGES",): return "Confectionery"
    return "Other"

# ---------- load CRM files ----------
companies = {}
contacts = {}
for f in glob.glob(f"{TOOL_DIR}/mcp-*search_crm_objects*.txt"):
    d = json.load(open(f))
    url = d.get("urlTemplate", "")
    is_company = "0-2/" in url
    is_contact = "0-1/" in url
    for r in d["results"]:
        p = r["properties"]
        if is_company:
            companies[r["id"]] = p
        elif is_contact:
            contacts[r["id"]] = p

# ---------- machine -> catalog mapping (for change-part suggestions) ----------
MACHINE_MAP = [
    ("aarp", "Adjustable Angle Ramp Printer"), ("adjustable angle", "Adjustable Angle Ramp Printer"),
    ("vip - laser", "VIP Laser Drill"), ("vip laser", "VIP Laser Drill"),
    ("vip 5s", "VIP Printer"), ("vip 4s", "VIP Printer"), ("vip-x", "VIP Printer"),
    ("vip ii", "VIP Printer"), ("vip iii", "VIP Printer"), ("vip", "VIP Printer"),
    ("servo ramp", "Servo Variable Ramp Printer"), ("servo v/r", "Servo Variable Ramp Printer"),
    ("v/r servo", "Servo Variable Ramp Printer"), ("variable ramp", "Servo Variable Ramp Printer"),
    ("servo ctlvr", "Servo Cantilever Ramp Printer"), ("cantilever", "Cantilever Printer"),
    ("servo drum", "Servo Drum Two-Side Printer"), ("3 drum", "Servo Drum Two-Side Printer"),
    ("drum", "Servo Drum Two-Side Printer"),
    ("laser drill", "Servo Drum Laser Drill"), ("delta", "Delta Printer"),
    ("ibm", "IBM Ink Printing Machine"), ("h track", "H Track Ink Printing Machine"),
]
def machine_family(desc):
    d = (desc or "").lower()
    for k, v in MACHINE_MAP:
        if k in d: return v
    return None

# ---------- load installed base ----------
wb = openpyxl.load_workbook(ASSETS, data_only=True)
ws = wb["Pharma Machines"]
installs_by_norm = defaultdict(list)
def cv(r, c):
    v = ws.cell(row=r, column=c).value
    if isinstance(v, str): v = v.strip()
    return v or None
for r in range(2, ws.max_row + 1):
    cust = cv(r, 2)
    if not cust and not cv(r, 1): continue
    inst = {
        "serial": str(cv(r,1)) if cv(r,1) is not None else None,
        "customer": cust, "address": cv(r,3), "soNumber": cv(r,4),
        "customerPO": cv(r,5), "machine": cv(r,6), "product": cv(r,7),
        "shipped": str(cv(r,8))[:10] if cv(r,8) else None,
        "country": cv(r,9), "family": machine_family(cv(r,6)),
    }
    installs_by_norm[norm(cust)].append(inst)

# ---------- load priority list ----------
pwb = openpyxl.load_workbook(PRIORITY, data_only=True)
pws = pwb["Sheet1"]
phead = [pws.cell(row=1, column=c).value for c in range(1, pws.max_column+1)]
pidx = {h: i for i, h in enumerate(phead)}
priority_by_norm = {}
priority_people = defaultdict(list)
for r in range(2, pws.max_row + 1):
    row = [pws.cell(row=r, column=c).value for c in range(1, pws.max_column+1)]
    # NOTE: columns are shifted - real company name is in the "Address" column,
    # "Company" holds a numeric external id.
    comp = clean_name(row[pidx["Address"]])
    if not comp: continue
    n = norm(comp)
    rec = {
        "companyName": comp, "externalId": row[pidx["Company"]],
        "level": row[pidx["Priority_Level"]], "score": row[pidx["Priority_Score"]],
        "customerType": row[pidx["Customer_Type"]], "region": row[pidx["Region"]],
        "industry": row[pidx["Industry"]], "activityCount": row[pidx["Activity_Count"]],
        "activityValue": row[pidx["Activity_Value"]],
        "lastActivity": str(row[pidx["Last_Activity_Date"]])[:10] if row[pidx["Last_Activity_Date"]] else None,
        "city": row[pidx["City"]], "state": row[pidx["State"]], "country": row[pidx["Country"]],
    }
    if n not in priority_by_norm or (rec["score"] or 0) > (priority_by_norm[n]["score"] or 0):
        priority_by_norm[n] = rec
    priority_people[n].append({"name": row[pidx["Contact"]], "phone": row[pidx["Phone"]],
                               "email": row[pidx["Email"]]})

# ---------- group contacts by company id ----------
contacts_by_company = defaultdict(list)
contacts_by_norm = defaultdict(list)
for cid, p in contacts.items():
    rec = {
        "id": cid,
        "firstName": p.get("firstname"), "lastName": p.get("lastname"),
        "name": (f"{p.get('firstname','')} {p.get('lastname','')}").strip() or p.get("email"),
        "email": p.get("email"), "phone": p.get("phone"),
        "jobTitle": p.get("jobtitle"), "company": p.get("company"),
        "leadStatus": p.get("hs_lead_status"), "country": p.get("country"),
        "state": p.get("state"), "city": p.get("city"),
    }
    acid = p.get("associatedcompanyid")
    if acid:
        contacts_by_company[str(acid)].append(rec)
    if p.get("company"):
        contacts_by_norm[norm(p.get("company"))].append(rec)

# ---------- build unified accounts ----------
accounts = {}          # norm -> account
brand_index = defaultdict(list)  # brand token -> [norm,...]

def ensure(n, display):
    if n not in accounts:
        accounts[n] = {"id": slug(display), "name": display, "norm": n,
            "domain": None, "industry": None, "country": None, "state": None,
            "city": None, "phone": None, "lifecycle": None, "crmId": None,
            "sources": [], "contacts": [], "installs": [], "priority": None}
        brand_index[brand_key(n)].append(n)
    return accounts[n]

def resolve(n):
    """Map an incoming normalized name to an existing account key when the brand
    matches and one name contains the other (or they share 2+ leading tokens)."""
    if n in accounts: return n
    bk = brand_key(n)
    cand = brand_index.get(bk, [])
    toks = n.split()
    best = None
    for cn in cand:
        ct = cn.split()
        if cn in n or n in cn or (len(toks) >= 2 and len(ct) >= 2 and toks[:2] == ct[:2]):
            # prefer the shortest (most brand-level) existing name
            if best is None or len(cn) < len(best):
                best = cn
    return best or n

# from CRM companies (build the brand-level accounts first)
for cid, p in sorted(companies.items(), key=lambda kv: len(norm(kv[1].get("name") or ""))):
    name = p.get("name") or (p.get("domain") or "Unknown")
    n = norm(name)
    a = ensure(n, name)
    a["domain"] = a["domain"] or p.get("domain")
    a["country"] = a["country"] or p.get("country")
    a["state"] = a["state"] or p.get("state")
    a["city"] = a["city"] or p.get("city")
    a["phone"] = a["phone"] or p.get("phone")
    a["lifecycle"] = p.get("lifecyclestage")
    a["crmId"] = str(cid)
    a["industry"] = industry_of(name, p.get("domain"), p.get("industry"))
    if "crm" not in a["sources"]: a["sources"].append("crm")
    for c in contacts_by_company.get(str(cid), []):
        a["contacts"].append(c)

# attach contacts that matched only by company name (not already added)
for n0, recs in contacts_by_norm.items():
    n = resolve(n0)
    if n in accounts:
        existing = {c["id"] for c in accounts[n]["contacts"]}
        for c in recs:
            if c["id"] not in existing:
                accounts[n]["contacts"].append(c)
                existing.add(c["id"])

# from installed base
for n0, insts in installs_by_norm.items():
    n = resolve(n0)
    display = insts[0]["customer"]
    a = ensure(n, display)
    a["installs"] = insts
    if not a["country"]:
        a["country"] = next((i["country"] for i in insts if i["country"]), None)
    if "installed-base" not in a["sources"]: a["sources"].append("installed-base")
    if not a["industry"]:
        a["industry"] = industry_of(display, None, None)

# attach priority
for n0, rec in priority_by_norm.items():
    n = resolve(n0)
    a = ensure(n, rec.get("companyName") or n0.title())
    a["priority"] = rec
    if not a["country"]: a["country"] = rec.get("country")
    if not a["state"]: a["state"] = rec.get("state")
    if not a["city"]: a["city"] = rec.get("city")
    if not a["industry"] or a["industry"] == "Other":
        if rec.get("industry"):
            a["industry"] = "Confectionery" if "food" in str(rec["industry"]).lower() else a["industry"]
    if "priority" not in a["sources"]: a["sources"].append("priority")

# ---------- geocoding (approximate centroids; precise geocode happens client-side
# via Google Maps when an API key is configured) ----------
COUNTRY = {
    "usa":(39.5,-98.35),"united states":(39.5,-98.35),"india":(22.0,79.0),"china":(35.0,103.0),
    "germany":(51.0,10.0),"france":(46.0,2.0),"taiwan":(23.7,121.0),"bangladesh":(23.7,90.4),
    "indonesia":(-2.5,118.0),"korea":(36.5,127.8),"south korea":(36.5,127.8),"australia":(-25.0,133.0),
    "canada":(56.1,-106.3),"italy":(42.8,12.8),"spain":(40.0,-4.0),"japan":(36.2,138.3),
    "puerto rico":(18.2,-66.5),"united kingdom":(54.0,-2.0),"uk":(54.0,-2.0),"ireland":(53.4,-8.2),
    "switzerland":(46.8,8.2),"brazil":(-14.2,-51.9),"mexico":(23.6,-102.5),"netherlands":(52.1,5.3),
    "belgium":(50.5,4.5),"poland":(52.0,19.0),"turkey":(39.0,35.0),"egypt":(26.8,30.8),
    "vietnam":(14.0,108.0),"thailand":(15.0,101.0),"malaysia":(4.2,101.9),"philippines":(12.9,121.8),
    "russia":(61.5,105.3),"israel":(31.0,35.0),"argentina":(-38.4,-63.6),"colombia":(4.6,-74.1),
}
US_STATE = {
    "al":(32.8,-86.8),"ak":(64.2,-149.5),"az":(34.0,-111.1),"ar":(34.8,-92.4),"ca":(36.8,-119.4),
    "co":(39.0,-105.5),"ct":(41.6,-72.7),"de":(39.0,-75.5),"fl":(27.8,-81.7),"ga":(32.2,-82.9),
    "hi":(19.9,-155.6),"id":(44.1,-114.7),"il":(40.0,-89.0),"in":(39.8,-86.3),"ia":(42.0,-93.5),
    "ks":(38.5,-98.4),"ky":(37.8,-84.3),"la":(31.0,-92.0),"me":(45.4,-69.2),"md":(39.0,-76.8),
    "ma":(42.4,-71.4),"mi":(44.3,-85.6),"mn":(46.3,-94.3),"ms":(32.7,-89.7),"mo":(38.5,-92.3),
    "mt":(46.9,-110.4),"ne":(41.5,-99.8),"nv":(38.8,-116.4),"nh":(43.4,-71.6),"nj":(40.1,-74.7),
    "nm":(34.5,-106.0),"ny":(42.9,-75.6),"nc":(35.6,-79.4),"nd":(47.5,-100.5),"oh":(40.4,-82.8),
    "ok":(35.6,-97.5),"or":(44.0,-120.5),"pa":(40.9,-77.8),"ri":(41.7,-71.5),"sc":(33.8,-80.9),
    "sd":(44.4,-100.2),"tn":(35.9,-86.4),"tx":(31.5,-99.3),"ut":(39.3,-111.7),"vt":(44.1,-72.7),
    "va":(37.5,-78.9),"wa":(47.4,-120.5),"wv":(38.6,-80.6),"wi":(44.6,-89.9),"wy":(43.0,-107.5),
}
import random
def geocode(a):
    st = (a.get("state") or "").strip().lower()
    if st in US_STATE: base = US_STATE[st]
    else:
        c = (a.get("country") or "").strip().lower()
        base = COUNTRY.get(c)
        if base is None and a.get("installs"):
            ic = (a["installs"][0].get("country") or "").lower()
            base = COUNTRY.get(ic)
    if base is None: return None
    # jitter so co-located pins are distinguishable
    rnd = random.Random(a["id"])
    return [round(base[0] + rnd.uniform(-1.2, 1.2), 4), round(base[1] + rnd.uniform(-1.2, 1.2), 4)]

# finalize
out = []
for n, a in accounts.items():
    a.pop("norm", None)
    a["coords"] = geocode(a)
    # logos = distinct products/designs printed on this account's installed machines
    a["logos"] = sorted({i["product"] for i in a["installs"] if i.get("product")})
    fams = sorted({i["family"] for i in a["installs"] if i["family"]})
    a["machineFamilies"] = fams
    a["installCount"] = len(a["installs"])
    a["contactCount"] = len(a["contacts"])
    a["industry"] = a["industry"] or "Other"
    out.append(a)

# de-dupe ids
seen = defaultdict(int)
for a in out:
    base = a["id"]; seen[base] += 1
    if seen[base] > 1: a["id"] = f"{base}-{seen[base]}"

out.sort(key=lambda a: (
    0 if a.get("priority") else 1,
    -(a["priority"]["score"] if a.get("priority") and a["priority"].get("score") else 0),
    -a["installCount"], -a["contactCount"], a["name"]))

data = {
    "totals": {
        "accounts": len(out),
        "withInstalls": sum(1 for a in out if a["installCount"]),
        "withContacts": sum(1 for a in out if a["contactCount"]),
        "withPriority": sum(1 for a in out if a.get("priority")),
        "totalContacts": sum(a["contactCount"] for a in out),
        "totalInstalls": sum(a["installCount"] for a in out),
    },
    "byIndustry": dict(sorted(
        {k: sum(1 for a in out if a["industry"] == k)
         for k in {x["industry"] for x in out}}.items(),
        key=lambda kv: -kv[1])),
    "accounts": out,
}
json.dump(data, open("data/accounts.json", "w"), indent=2)
print("Accounts:", data["totals"])
print("By industry:", data["byIndustry"])
print("\nTop 12 accounts:")
for a in out[:12]:
    pl = a["priority"]["level"] if a.get("priority") else "-"
    print(f"  {a['name'][:30]:30} ind={a['industry'][:14]:14} people={a['contactCount']:2} machines={a['installCount']:2} prio={pl}")
# sample merged account (one with both installs and contacts)
both = [a for a in out if a["installCount"] and a["contactCount"]]
print(f"\nAccounts with BOTH machines & people: {len(both)}")
for a in both[:6]:
    print(f"  {a['name']}: {a['contactCount']} people, {a['installCount']} machines, families={a['machineFamilies']}")
