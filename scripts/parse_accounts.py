"""Parse the installed-base asset registry into accounts.json (companies + installs)."""
import json, openpyxl, re
from collections import defaultdict

SRC = "data/source/assets_2026.xlsx"
OUT = "data/accounts.json"

wb = openpyxl.load_workbook(SRC, data_only=True)
ws = wb["Pharma Machines"]

def cell(r, c):
    v = ws.cell(row=r, column=c).value
    if isinstance(v, str):
        v = v.strip()
        return v or None
    return v

# Industry inference from product/machine context (this is a pharma/confectionery business)
CONFECTIONERY = ("wrigley", "mars", "m&m", "candy", "confection", "chocolate", "hershey", "ferrero", "nestle")
def industry_for(customer, product):
    blob = f"{customer or ''} {product or ''}".lower()
    if any(k in blob for k in CONFECTIONERY):
        return "Confectionery"
    return "Pharmaceutical"

def clean_name(name):
    # Normalize "Pfizer, NY" style and trailing location codes for grouping
    return re.sub(r"\s+", " ", (name or "").strip())

installs = []
for r in range(2, ws.max_row + 1):
    serial = cell(r, 1)
    customer = clean_name(cell(r, 2))
    if not serial and not customer:
        continue
    shipped = cell(r, 8)
    shipped_str = None
    if shipped is not None:
        shipped_str = str(shipped)[:10]
    installs.append({
        "serial": str(serial) if serial is not None else None,
        "customer": customer,
        "address": cell(r, 3),
        "soNumber": cell(r, 4),
        "customerPO": cell(r, 5),
        "machine": cell(r, 6),
        "product": cell(r, 7),
        "shipped": shipped_str,
        "country": cell(r, 9),
        "industry": industry_for(customer, cell(r, 7)),
    })

# Group into accounts by base customer name (strip trailing ", XX" location qualifier)
def base_account(name):
    return re.sub(r",\s*[A-Za-z\. ]{1,20}$", "", name).strip() if name else name

acc_map = defaultdict(lambda: {"installs": [], "countries": set(), "machines": set()})
for it in installs:
    key = base_account(it["customer"]) or it["customer"]
    a = acc_map[key]
    a["name"] = key
    a["installs"].append(it)
    if it["country"]:
        a["countries"].add(it["country"])
    if it["machine"]:
        a["machines"].add(it["machine"])

accounts = []
for key, a in acc_map.items():
    inst = a["installs"]
    industries = {i["industry"] for i in inst}
    years = [int(i["shipped"][:4]) for i in inst if i["shipped"] and i["shipped"][:4].isdigit()]
    accounts.append({
        "id": re.sub(r"[^a-z0-9]+", "-", key.lower()).strip("-")[:60] or "unknown",
        "name": key,
        "primaryCountry": (sorted(a["countries"])[0] if a["countries"] else None),
        "countries": sorted(a["countries"]),
        "industry": ("Confectionery" if "Confectionery" in industries else "Pharmaceutical"),
        "installCount": len(inst),
        "machineTypes": sorted(a["machines"]),
        "firstShipYear": (min(years) if years else None),
        "lastShipYear": (max(years) if years else None),
        "address": next((i["address"] for i in inst if i["address"]), None),
        "installs": sorted(inst, key=lambda x: x["shipped"] or "", reverse=True),
    })

accounts.sort(key=lambda x: (-x["installCount"], x["name"]))

data = {
    "totalInstalls": len(installs),
    "totalAccounts": len(accounts),
    "accounts": accounts,
}
json.dump(data, open(OUT, "w"), indent=2)
print(f"Installs: {len(installs)} | Accounts: {len(accounts)}")
print("Top accounts by install count:")
for a in accounts[:8]:
    print(f"  {a['name'][:32]:32} {a['installCount']:2}  {a['primaryCountry']}  {a['industry']}")
