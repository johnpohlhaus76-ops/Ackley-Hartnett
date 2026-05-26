"""Parse the Ackley Hartnett 2025 price list into structured catalog.json."""
import json, openpyxl, re

SRC = "data/source/price_list_2025.xlsx"
OUT = "data/catalog.json"

wb = openpyxl.load_workbook(SRC, data_only=True)
ws = wb["Equipment Price List"]

def val(r, c):
    v = ws.cell(row=r, column=c).value
    if isinstance(v, str):
        v = v.strip()
        return v or None
    return v

def num(v):
    if isinstance(v, (int, float)):
        return round(float(v), 2)
    return None

def text(v):
    return None if v is None else str(v).strip()

# Rows that are column-label headers (skip)
LABELS = {
    "Base Machine Description:", "PART NUMBER", "BASE MACHINE NUMBER HARTNETT",
    "Color Option Inspection", "Price Option", "PART NUMBER 3D",
    "Maximum Hourly Throughput", "Base Machine Price", "Change Parts Pricing",
}
LABEL_CELLVALUES = {
    "2-Dim Round / LCT Products", "2-Dim Round Products", "3-Dim / SoftGel",
    "LCT Shaped Products", "Oval Shaped Products", "Hartnett SS", "Duplicate Set",
    "Part Number 2D", "Part Number Dup", "Machine Crating", "CP Crating",
}

# Section header text -> (slug, group)
def is_section_header(r):
    a = val(r, 1); b = val(r, 2)
    # populated columns among A,C,D,E,F must be empty; only B (and maybe H='Not Applicable')
    others = [val(r, c) for c in (1, 3, 4, 5, 6)]
    if b and all(o is None for o in others):
        # not a label
        if b in LABELS:
            return None
        return b
    return None

def is_label_row(r):
    b = val(r, 2); a = val(r, 1)
    if b in LABELS or a in LABELS:
        return True
    for c in range(1, 18):
        if val(r, c) in LABEL_CELLVALUES:
            return True
    if val(r, 5) == "Maximum Hourly Throughput" or val(r, 6) == "Base Machine Price":
        return True
    return False

MACHINE_SECTIONS = {
    "OFFSET ROTOGRAVURE PRINTING SYSTEMS - No Inspection",
    "OFFSET ROTOGRAVURE PRINTING SYSTEMS - with Vision Inspection",
    "LASER DRILLING SYSTEMS - 10.6 micron CO2 Laser",
    "LASER MARKING SYSTEMS - 9.3 micron CO2 Laser  /  355nm UV Laser",
}

DIMS = [("2-Dim Round / LCT", 7, 8), ("3-Dim / SoftGel", 9, 10),
        ("4-Dim / Oval / Vacuum", 11, 12), ("Duplicate Set", 13, 14)]

def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

categories = []
current = None
section_is_machine = False
DASHED = re.compile(r"\s{2,}|\n")

for r in range(1, ws.max_row + 1):
    title = val(r, 2)
    if title and "Master Price List" in str(title):
        continue  # workbook title
    header = is_section_header(r)
    if header:
        current = {"name": header, "slug": slugify(header), "items": []}
        categories.append(current)
        section_is_machine = header in MACHINE_SECTIONS
        continue
    if current is None or is_label_row(r):
        continue
    a = val(r, 1); b = val(r, 2); f = val(r, 6)
    if not b and not a:
        continue
    if not b:  # need a description
        continue
    # Build item
    parts = DASHED.split(str(b), 1)
    name = parts[0].strip()
    detail = parts[1].strip() if len(parts) > 1 else None
    item = {
        "partNumber": text(a),
        "name": name,
        "detail": detail,
        "throughput": text(val(r, 5)),
        "basePrice": num(f),
        "priceNote": text(f) if num(f) is None else None,
        "machineCrating": num(val(r, 15)),
        "cpCrating": text(val(r, 16)),
    }
    # inspection option (vision section cols C/D)
    insp_pn, insp_price = val(r, 3), val(r, 4)
    if insp_pn or num(insp_price) is not None:
        item["inspectionOption"] = {"partNumber": text(insp_pn), "price": num(insp_price)}
    # change parts
    cps = []
    for dim, pc, prc in DIMS:
        pn, price = val(r, pc), val(r, prc)
        if pn or num(price) is not None:
            cps.append({"dimension": dim, "partNumber": text(pn), "price": num(price)})
    if cps:
        item["changeParts"] = cps
    item["kind"] = "machine" if section_is_machine else "lineItem"
    current["items"].append(item)

# Drop empty categories
categories = [c for c in categories if c["items"]]
catalog = {
    "currency": "USD",
    "note": "2025 Master Price List - includes 10% rep commission. ExWorks Langhorne/Moorestown.",
    "categories": categories,
}
json.dump(catalog, open(OUT, "w"), indent=2)

total = sum(len(c["items"]) for c in categories)
machines = sum(1 for c in categories for i in c["items"] if i["kind"] == "machine")
print(f"Categories: {len(categories)} | Items: {total} | Machines: {machines}")
for c in categories:
    print(f"  - {c['name'][:55]:55} {len(c['items'])} items")
