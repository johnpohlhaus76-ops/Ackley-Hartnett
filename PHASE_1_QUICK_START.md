# Phase 1 Quick Start - Get Started in 30 Minutes

## What We're Building (Week 1-3)

Three foundation features that unblock all other dashboards:

1. **Advanced Search** - Full-text search across all data (machines, customers, quotes, docs)
2. **Customer Health Scores** - Auto-score customers 0-100 (at-risk → healthy → premium)
3. **Spare Parts Tracker** - Parts catalog linked to machines by model

These three features are **dependencies for Phase 2 dashboards** (sales pipeline, maintenance alerts, plant performance).

---

## Day 1: Advanced Search Implementation (3 hours)

### Step 1: Copy the search library
```bash
# Create search lib file - copy from PHASE_1_TECHNICAL_SPEC.md
cp PHASE_1_TECHNICAL_SPEC.md src/lib/search.ts
# (Or manually create with code from spec)
```

### Step 2: Create the API route
```bash
# Create: src/app/api/search/route.ts
# Copy code from PHASE_1_TECHNICAL_SPEC.md "File: /src/app/api/search/route.ts"
```

### Step 3: Create the UI page
```bash
# Create: src/app/portal/search/page.tsx
# Copy code from PHASE_1_TECHNICAL_SPEC.md "File: /src/app/portal/search/page.tsx"
```

### Step 4: Update sidebar navigation
Edit `/src/components/Sidebar.tsx`:
```tsx
// Add this link in the sidebar menu
<Link href="/portal/search" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
  <Search size={20} />
  <span>Global Search</span>
</Link>
```

### Step 5: Test it
```bash
npm run dev
# Visit: http://localhost:3000/portal/search
# Try searching: "smith", "402", "USA", "astrazeneca"
```

**Expected Output**:
- Search results grouped by type (Machines, Customers, Quotes, Documents)
- Facet filters working (types)
- Results sorted by relevance score

---

## Day 2: Customer Health Scores (3 hours)

### Step 1: Create health score library
```bash
# Create: src/lib/health-score.ts
# Copy from PHASE_1_TECHNICAL_SPEC.md
```

### Step 2: Create the API route
```bash
# Create: src/app/api/health-scores/route.ts
# Copy from PHASE_1_TECHNICAL_SPEC.md
```

### Step 3: Test single customer score
```bash
# Get health score for a known customer
curl "http://localhost:3000/api/health-scores?customerId=405"

# Expected response:
{
  "score": {
    "machineRecency": 60,
    "orderFrequency": 75,
    "conversionRate": 45,
    "engagement": 80,
    "overallScore": 63,
    "riskLevel": "healthy",
    "recommendations": ["Increase order frequency"]
  }
}
```

### Step 4: Test bulk scores
```bash
curl "http://localhost:3000/api/health-scores?bulk=true"

# Returns all customers ranked by score (top 10 by default)
```

### Step 5: Update types
Edit `/src/lib/types.ts` and add at the bottom:
```typescript
export interface HealthScoreBreakdown {
  machineRecency: number;
  orderFrequency: number;
  conversionRate: number;
  engagement: number;
  overallScore: number;
  riskLevel: 'at-risk' | 'healthy' | 'premium';
  recommendations: string[];
}

export interface CustomerHealth {
  customerId: string;
  customerName: string;
  score: HealthScoreBreakdown;
  lastUpdated: string;
}
```

**Expected Output**:
- JSON API returning scores for single customer
- Bulk endpoint returning all customers sorted by health
- Caching working (same request returns instantly 2nd time)

---

## Day 3: Spare Parts Inventory (2 hours)

### Step 1: Create spare parts catalog data
```bash
# Create: data/spare-parts-catalog.json
# Copy JSON from PHASE_1_TECHNICAL_SPEC.md
```

### Step 2: Create spare parts library
```bash
# Create: src/lib/spare-parts.ts
# Copy from PHASE_1_TECHNICAL_SPEC.md
```

### Step 3: Create the API route
```bash
# Create: src/app/api/spare-parts/route.ts
# Copy from PHASE_1_TECHNICAL_SPEC.md
```

### Step 4: Test endpoints
```bash
# Get parts for a machine model
curl "http://localhost:3000/api/spare-parts?action=by-model&model=FB1"

# Get inventory at a location
curl "http://localhost:3000/api/spare-parts?action=by-location&locationId=location_USA_NJ"

# Get low stock alerts
curl "http://localhost:3000/api/spare-parts?action=low-stock-alerts"

# Check part availability
curl "http://localhost:3000/api/spare-parts?action=check-availability&partId=SP-001&quantity=5"
```

### Step 5: Update types
Edit `/src/lib/types.ts` and add:
```typescript
export interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  description: string;
  price: number;
  leadTime: string;
  applicableModels: string[];
  minStockLevel: number;
  reorderQuantity: number;
  weight: number;
  supplier: string;
}
```

**Expected Output**:
- Parts catalog loaded from JSON
- Inventory lookups by location working
- Low stock alerts generated
- Parts availability estimated with lead times

---

## Verification Checklist

After all 3 days, you should be able to:

### Search (Day 1)
- [ ] Navigate to `/portal/search`
- [ ] Search for "Smith" → returns ~20 machines
- [ ] Search for "405" → returns matching quote
- [ ] Filter by type (Machines only) → results update
- [ ] Clear search → back to empty state

### Health Scores (Day 2)
- [ ] Call `/api/health-scores?customerId=405` → returns score 30-100
- [ ] Call `/api/health-scores?bulk=true` → returns all customers
- [ ] Top customers have health score > 70
- [ ] At-risk customers have recommendations
- [ ] Scores consistent across requests (caching works)

### Spare Parts (Day 3)
- [ ] Call `/api/spare-parts?action=by-model&model=FB1` → returns 3-5 parts
- [ ] Call `/api/spare-parts?action=low-stock-alerts` → returns alert list
- [ ] Each alert shows location + part + shortage quantity
- [ ] Availability check returns lead time if not in stock

---

## Common Issues & Fixes

### Search returns no results
**Problem**: Machines data not loading
**Fix**: Check file path in `loadJSON()` - verify `data/machines-sold.json` exists
```bash
ls -la data/machines-sold.json
# Should exist
```

### Health scores all zero
**Problem**: Quote data not found
**Fix**: Verify quotes-2025.json exists and has "Quote Date" fields
```bash
head -20 data/quotes-2025.json | grep "Quote Date"
```

### Spare parts 404
**Problem**: spare-parts-catalog.json not created
**Fix**: Create the JSON file with sample data from spec
```bash
# Copy the entire JSON object from PHASE_1_TECHNICAL_SPEC.md
# into data/spare-parts-catalog.json
```

### TypeScript errors
**Problem**: Types not updated
**Fix**: Ensure all new interfaces added to `/src/lib/types.ts`:
```typescript
// These should exist:
export interface SearchResult { ... }
export interface HealthScoreBreakdown { ... }
export interface SparePart { ... }
```

---

## File Tree After Phase 1

```
src/
├── lib/
│   ├── search.ts (NEW)
│   ├── health-score.ts (NEW)
│   ├── spare-parts.ts (NEW)
│   └── types.ts (MODIFIED - 3 new interfaces)
│
├── app/
│   ├── api/
│   │   ├── search/route.ts (NEW)
│   │   ├── health-scores/route.ts (NEW)
│   │   └── spare-parts/route.ts (NEW)
│   │
│   └── portal/
│       └── search/page.tsx (NEW)
│
└── components/
    └── Sidebar.tsx (MODIFIED - add search link)

data/
├── machines-sold.json (existing)
├── accounts.json (existing)
├── quotes-2025.json (existing)
└── spare-parts-catalog.json (NEW)
```

---

## Reading the Technical Spec

If you get stuck, refer to **PHASE_1_TECHNICAL_SPEC.md**:

- **Search Issues** → See "1.1 ADVANCED FULL-TEXT SEARCH"
- **Health Score Questions** → See "1.2 CUSTOMER HEALTH SCORE ENGINE"
- **Spare Parts Problems** → See "1.3 SPARE PARTS INVENTORY DATA MODEL"
- **API Test Commands** → See "Testing Commands" section

Each section has:
1. **Algorithm breakdown** (how scoring works)
2. **Complete code** (copy-paste ready)
3. **Expected outputs** (what you should see)

---

## What Phase 1 Enables

Once complete, these three features power **Phase 2 dashboards**:

| Feature | Uses | Phase 2 Impact |
|---------|------|---|
| **Search** | Global lookup | All dashboards can filter/search data |
| **Health Scores** | Customer scoring | Sales Pipeline + Plant Performance need scores |
| **Spare Parts** | Inventory tracking | Maintenance Alerts + Order Tracking need parts |

### Next: Phase 2 (Dashboards)
Once Phase 1 is done, you'll be ready to build:
1. **Predictive Maintenance Alerts** (uses machine age + spare parts)
2. **Sales Pipeline Dashboard** (uses health scores + quotes → orders)
3. **Plant Performance Metrics** (uses health scores + order data)
4. **Smart Alerts** (quote expiry, inactive customers)
5. **Order/PO Status Tracker** (uses spare parts for status updates)

---

## Parallelization Tips

**For teams**: All 3 features are **independent**, so you can:
- Person A: Build Search (Day 1)
- Person B: Build Health Scores (Day 2 in parallel)
- Person C: Build Spare Parts (Day 3 in parallel)
- All three merge to main by end of Week 1

**No merge conflicts** because they:
- Use separate API routes (`/api/search`, `/api/health-scores`, `/api/spare-parts`)
- Create separate library files (`search.ts`, `health-score.ts`, `spare-parts.ts`)
- Only shared file modified: `types.ts` (add interfaces at end, no overwrites)

---

## Time Estimates by Role

| Role | Task | Time | Day |
|------|------|------|-----|
| **Full-Stack** | All 3 features | 8 hours | 1-3 |
| **Backend** | API routes + libs | 5 hours | 1-2 |
| **Frontend** | Search UI only | 1 hour | 1 |
| **DevOps** | Data files + caching | 1 hour | 1-3 |

---

## Go! 🚀

**Start with**: Copy `/src/lib/search.ts` code from PHASE_1_TECHNICAL_SPEC.md

**First test**: `curl "http://localhost:3000/api/search?q=smith"`

**Next doc**: Read IMPLEMENTATION_ROADMAP.md for Phase 2 planning

Good luck! 🎯
