# 🎯 Ackley-Hartnett 10-Feature Implementation Roadmap
## START HERE — Complete Implementation Plan

**Last Updated**: August 4, 2026  
**Project**: Pharmaceutical Equipment Portal Enhancement  
**Status**: 📋 Planning Phase (Ready to implement)  
**Team**: Full-stack developers, data analysts, product managers

---

## 📚 Documentation Overview

You have **4 comprehensive guides** to implement 10 major features in 10 weeks:

| Document | Purpose | Read When |
|----------|---------|-----------|
| **00_START_HERE.md** (this file) | Executive summary & navigation | First — understand the plan |
| **IMPLEMENTATION_ROADMAP.md** | Complete feature roadmap with phases | Planning — understand what to build |
| **PHASE_1_TECHNICAL_SPEC.md** | Detailed code & implementation | Coding — copy-paste ready code |
| **PHASE_1_QUICK_START.md** | 3-day getting started guide | Building — step-by-step instructions |
| **ARCHITECTURE_GUIDE.md** | System design & data flows | Design — understand how it fits together |

---

## 🎬 The Big Picture (90 Seconds)

### What We're Building
A **data intelligence layer** for 222 machines sold across 50+ customer plants that powers:
- Smart customer health scoring
- Predictive maintenance alerts
- Sales pipeline dashboards
- Order tracking
- Custom reporting
- Auto-generated documents

### Why (Business Value)
- **Faster sales**: Pipeline visibility → better forecast
- **Less downtime**: Maintenance alerts → proactive service
- **Better margins**: Health scores → account strategy
- **Operational efficiency**: Spare parts tracking → no stockouts
- **Scalability**: Auto-generated docs → less manual work

### How (Technical Approach)
- **No expensive infrastructure** — JSON files + in-memory caching
- **No database migrations** — works with existing Next.js setup
- **Reuse existing patterns** — Tailwind, React hooks, API routes
- **Economical first** — jsPDF for PDFs, Recharts for charts, no external APIs

### Timeline
- **Phase 1** (Weeks 1-3): Foundation → Search, Health Scores, Spare Parts
- **Phase 2** (Weeks 4-7): Dashboards → 5 visual features
- **Phase 3** (Weeks 8-10): Outputs → Reports & Documents

---

## 📊 10 Features at a Glance

### Phase 1: Data Foundation (Weeks 1-3)
| # | Feature | What | Why First | LOC | Effort |
|---|---------|------|-----------|-----|--------|
| 1.1 | Advanced Search | Full-text across machines/customers/quotes/docs | Powers all queries | 400 | 3 days |
| 1.2 | Customer Health Scores | Auto-score 0-100 (at-risk → premium) | Needed by Phase 2 dashboards | 250 | 2 days |
| 1.3 | Spare Parts Tracker | Parts catalog + inventory by location | Needed by maintenance & orders | 300 | 2 days |

### Phase 2: Dashboards (Weeks 4-7)
| # | Feature | What | Why | LOC | Effort |
|---|---------|------|-----|-----|--------|
| 2.1 | Maintenance Alerts | Flag machines by age/service date | Reduce downtime | 280 | 1 day |
| 2.2 | Sales Pipeline | Kanban: quotes → orders, conversion rates | Revenue visibility | 600 | 5 days |
| 2.3 | Plant Performance | Compare utilization, revenue, orders by location | Operational insights | 500 | 4 days |
| 2.4 | Smart Alerts | Quote expiry, order shipped, inactive customers | Operational notifications | 200 | 2 days |
| 2.5 | Order/PO Status | Visual timeline: ordered → invoiced | Customer visibility | 350 | 3 days |

### Phase 3: Outputs (Weeks 8-10)
| # | Feature | What | Why | LOC | Effort |
|---|---------|------|-----|-----|--------|
| 3.1 | Custom Reporting | PDF reports: revenue by region, top customers, utilization | Executive insights | 700 | 5 days |
| 3.2 | Document Auto-Gen | Proposals, POs, invoices with pre-population | Faster execution | 800 | 6 days |

**Total**: 4,380 LOC | 32-35 days | ~7 weeks for full team

---

## 🚀 Quick Start (Next 30 Minutes)

### Step 1: Understand the Plan (5 min)
→ Read the **Feature Overview** section above

### Step 2: Pick Your First Task (5 min)
Choose based on your role:
- **Full-stack**: Start with Phase 1 → 1.1 Advanced Search
- **Backend only**: Start with Phase 1 → 1.2 Health Scores API
- **Frontend only**: Start with Phase 2 → 2.1 Maintenance Alerts UI
- **Product/Analyst**: Read IMPLEMENTATION_ROADMAP.md for full strategy

### Step 3: Get Coding (20 min)
- Open **PHASE_1_TECHNICAL_SPEC.md**
- Copy the code for your feature
- Follow the **PHASE_1_QUICK_START.md** day-by-day guide

---

## 📖 Reading Order

**For Developers**:
1. This file (00_START_HERE.md) ← You are here
2. PHASE_1_QUICK_START.md ← Pick your feature, start coding
3. PHASE_1_TECHNICAL_SPEC.md ← Reference while coding
4. ARCHITECTURE_GUIDE.md ← When designing features

**For Product/Leadership**:
1. This file (00_START_HERE.md)
2. IMPLEMENTATION_ROADMAP.md ← Full strategy
3. ARCHITECTURE_GUIDE.md ← Understand dependencies

**For DevOps/Infrastructure**:
1. ARCHITECTURE_GUIDE.md ← Data flows, caching strategy
2. IMPLEMENTATION_ROADMAP.md ← Infrastructure needs (none!)

---

## 🏗️ Architecture (30-Second Version)

```
┌─────────────────────────────────────────┐
│  React Pages (Dashboards)               │
├─────────────────────────────────────────┤
│  Next.js API Routes (Business Logic)    │
├─────────────────────────────────────────┤
│  TypeScript Lib Modules (Algorithms)    │
├─────────────────────────────────────────┤
│  JSON Data Files (Source of Truth)      │
├─────────────────────────────────────────┤
│  In-Memory Cache (1hr TTL)              │
└─────────────────────────────────────────┘
```

**No Database** — JSON files + caching is economical and fast enough for 222 machines.

---

## 📈 Dependencies & Execution Order

```
PHASE 1 (Foundation)
├─ 1.1 Search ─────────────┐
├─ 1.2 Health Scores ──────┼─→ Powers Phase 2
└─ 1.3 Spare Parts ────────┘

PHASE 2 (Dashboards)
├─ 2.1 Maintenance Alerts (depends on 1.2, 1.3)
├─ 2.2 Sales Pipeline (depends on 1.2)
├─ 2.3 Plant Performance (depends on 1.2)
├─ 2.4 Smart Alerts (depends on 1.1, 1.2, 1.3)
└─ 2.5 Order/PO Status (depends on 1.3)

PHASE 3 (Outputs)
├─ 3.1 Custom Reporting (depends on Phase 2)
└─ 3.2 Document Auto-Gen (depends on Phase 2)
```

**Key Insight**: Phase 1 is **blocking** — start there.

---

## 📋 Feature Details (By Phase)

### PHASE 1: FOUNDATION

#### 1.1 Advanced Full-Text Search
**What It Does**: Searches across machines, customers, quotes, datasheets  
**What It Returns**: Sorted results with score, grouped by type  
**How It Works**: In-memory index, simple string matching + scoring  
**Business Value**: Central lookup for all users, powers all other features  
**Complexity**: Medium | **Time**: 3 days  
**Files**: `search.ts`, `/api/search/route.ts`, `/portal/search/page.tsx`

**Sample Queries**:
- "Smith Kline" → finds 20+ machines for customer
- "402" → finds serial #402
- "USA" → finds all US machines
- astrazeneca → finds customer + 5 machines

---

#### 1.2 Customer Health Score Engine
**What It Does**: Scores customers 0-100 based on 4 metrics  
**What It Returns**: Score breakdown + risk level + recommendations  
**Algorithm**: 
```
Score = Machine Recency (40%) + Order Frequency (30%) + 
         Conversion Rate (20%) + Engagement (10%)
```
**Business Value**: Identifies at-risk accounts before they churn  
**Complexity**: Medium | **Time**: 2 days  
**Files**: `health-score.ts`, `/api/health-scores/route.ts`

**Example Output**:
```json
{
  "overallScore": 63,
  "riskLevel": "healthy",
  "recommendations": ["Increase order frequency", "Contact within 30 days"],
  "breakdown": {
    "machineRecency": 60,
    "orderFrequency": 75,
    "conversionRate": 45,
    "engagement": 80
  }
}
```

---

#### 1.3 Spare Parts Inventory Tracker
**What It Does**: Links parts to machine models, tracks stock by location  
**What It Returns**: Parts list, inventory status, low-stock alerts  
**What It Stores**: 20-30 sample parts (seals, belts, bearings, pumps, valves)  
**Business Value**: Prevents stockouts, enables faster service  
**Complexity**: Low | **Time**: 2 days  
**Files**: `/data/spare-parts-catalog.json`, `spare-parts.ts`, `/api/spare-parts/route.ts`

**Example Endpoints**:
```
GET /api/spare-parts?action=by-model&model=FB1
→ Returns 5 parts applicable to FB1 machines

GET /api/spare-parts?action=by-location&locationId=USA_NJ
→ Returns inventory at Newark warehouse

GET /api/spare-parts?action=low-stock-alerts
→ Returns 3 parts below min stock level
```

---

### PHASE 2: DASHBOARDS

#### 2.1 Predictive Maintenance Alerts ⭐ Quick Win
**What It Does**: Flags machines needing service based on age, last service date, parts availability  
**What It Returns**: List of machines with risk level (green/yellow/red)  
**Alert Rules**:
- Age > 15 years → "Service due"
- No service in 24+ months → "Urgent"
- Required parts low stock → "Parts shortage"

**Business Value**: Proactive service = customer retention  
**Complexity**: Low | **Time**: 1 day  
**Files**: `maintenance-logic.ts`, `/portal/maintenance-alerts/page.tsx`

**Sample Card**:
```
SN: 402 | AstraZeneca | USA | FB1 Tablet Marker
Age: 18 years | Last service: 26 months ago
Risk: 🔴 CRITICAL | Actions: Schedule service, Order spare parts
```

---

#### 2.2 Sales Pipeline Dashboard
**What It Does**: Visualizes quotes → orders flow as Kanban board  
**What It Returns**: Stages, conversion rates, time-in-stage, top salespeople  
**Stages**:
```
[DRAFT] → [SENT] → [ACCEPTED] → [CONVERTED to Order] → [REVENUE]
```
**Business Value**: Forecast accuracy, identify bottlenecks  
**Complexity**: High | **Time**: 5 days  
**Files**: `sales-pipeline.ts`, `/portal/sales-pipeline/page.tsx`, `SalesPipelineChart.tsx`

**Visualizations**:
- Kanban board (drag-drop ready, no external lib)
- Conversion funnel (Recharts)
- Time-in-stage metrics
- Rep performance table

---

#### 2.3 Plant Performance Metrics
**What It Does**: Compares locations by utilization, orders, revenue, machine age  
**What It Returns**: Sortable table with sparklines, heat map view  
**Metrics**:
- Machines count per plant
- Orders per year
- Revenue YTD
- Average machine age
- Days since last order
- Health score

**Business Value**: Identify high-performers, underperformers  
**Complexity**: High | **Time**: 4 days  
**Files**: `plant-performance.ts`, `/portal/plant-performance/page.tsx`

**Example Row**:
```
AstraZeneca US | 12 machines | 28 orders YTD | $1.2M revenue | 
Avg age: 8 yrs | Health: 78 (Premium) | Last order: 12 days ago
```

---

#### 2.4 Smart Alerts (Operational Notifications)
**What It Does**: Generates alerts for quote expiry, shipped orders, inactive customers, low inventory  
**What It Returns**: Alert center with dismiss/snooze actions  
**Alert Types**:
1. Quote expiring < 7 days
2. Order shipped (notify customer)
3. Customer inactive > 90 days
4. PO overdue
5. Spare parts low stock

**Business Value**: Don't miss opportunities, faster response  
**Complexity**: Low-Medium | **Time**: 2 days  
**Files**: `smart-alerts.ts`, `/portal/alerts/page.tsx`, `AlertCenter.tsx`

**Example Alert**:
```
🔴 Quote AH-2026-405 expires in 3 days
📌 AstraZeneca | $24,500 | Action: Follow up
[Dismiss] [Snooze 3 days] [Contact]
```

---

#### 2.5 Real-time Order/PO Status Tracker
**What It Does**: Shows order timeline with milestones (Ordered → Confirmed → Shipped → Received → Invoiced)  
**What It Returns**: Visual timeline per order, search by order #  
**Milestones**:
```
📌 Ordered (Jan 15)
→ Confirmed (Jan 16)
→ Shipped (Jan 25, Tracking: UPS123)
→ Delivered (Feb 1)
→ Invoiced (Feb 5, INV-2026-501)
```
**Business Value**: Customer visibility, faster issue resolution  
**Complexity**: Medium | **Time**: 3 days  
**Files**: `order-status.ts`, `/portal/order-tracking/page.tsx`, `OrderStatusTimeline.tsx`

---

### PHASE 3: OUTPUTS

#### 3.1 Custom Reporting Engine
**What It Does**: Generates downloadable PDF reports with charts  
**Report Types**:
1. Revenue by Region (bar chart + table)
2. Top 20 Customers (ranked by revenue + orders)
3. Machine Utilization Summary (age breakdown, service due)
4. Sales Pipeline Forecast (stage conversion projections)
5. Spare Parts Usage (top 20 parts)
6. Customer Health Scorecard (all customers ranked)

**Business Value**: Executive insights, investor presentations  
**Complexity**: High | **Time**: 5 days  
**Files**: `report-generator.ts`, `/portal/reports/page.tsx`, `ReportBuilder.tsx`

**Sample Report**:
```
ACKLEY-HARTNETT SALES REPORT
Period: Jan-Aug 2026
Generated: Aug 4, 2026

Revenue by Region:
├─ North America: $4.2M (52%)
├─ Europe: $2.8M (35%)
└─ APAC: $1.0M (13%)

Top 10 Customers (by revenue):
1. AstraZeneca: $850K, 28 orders, Health: 82 (Premium)
2. Eli Lilly: $620K, 19 orders, Health: 71 (Healthy)
...

Charts:
├─ Revenue trend (line)
├─ Regional breakdown (pie)
└─ Customer health distribution (histogram)
```

---

#### 3.2 Document Auto-Generation
**What It Does**: Pre-fills proposals, POs, invoices with customer + order data  
**Document Types**:
1. **Proposal**: Product list + terms + signature line
2. **Purchase Order**: Ship-to address, line items, delivery date
3. **Invoice**: Order reference, payment terms, bank details
4. **Service Request**: Machine S/N, service type, timeline

**Business Value**: Faster turnaround, fewer errors, professional look  
**Complexity**: High | **Time**: 6 days  
**Files**: `document-generator.ts`, `/portal/documents/page.tsx`, `DocumentEditor.tsx`, `/data/document-templates/`

**Pre-fill Data** (automatic):
```
Company: Ackley-Hartnett
Customer: AstraZeneca
Address: 4601 Highway 62, Mount Vernon, IN
Order #: AH-2026-405
Items: [FB1 Tablet Marker, 2x Seal Assembly, 1x Drive Belt]
Subtotal: $24,500
Tax: $1,960
Total: $26,460
Terms: Net 30
```

---

## ⏱️ Week-by-Week Breakdown

### Week 1: Foundation Kickoff
**Phase 1.1-1.3 (All in Parallel)**
- Mon-Tue: 1.1 Search (spec + API route)
- Wed-Thu: 1.2 Health Scores (algorithm + API)
- Fri: 1.3 Spare Parts (catalog + API)
- Daily: Test & integrate

**Deliverables**:
- ✅ Search API working (5+ test queries)
- ✅ Health scores returning 0-100 (bulk + single)
- ✅ Spare parts by model + location

---

### Week 2: Dashboard Foundation
**Phase 2.1 (Quick Win) + 2.2 Start**
- Mon-Tue: 2.1 Maintenance Alerts (complete)
- Wed-Thu: 2.2 Sales Pipeline (Kanban board)
- Fri: Testing & bug fixes

**Deliverables**:
- ✅ Maintenance alerts live at /portal/maintenance-alerts
- ✅ Sales pipeline Kanban board rendering
- ✅ Conversion metrics calculating

---

### Week 3: Dashboards Sprint
**Phase 2.2 Complete + 2.3-2.5 Start**
- Mon-Tue: 2.2 Sales Pipeline (complete with charts)
- Wed: 2.3 Plant Performance (metrics table)
- Thu: 2.4 Smart Alerts (alert center)
- Fri: 2.5 Order Status (timeline view)

**Deliverables**:
- ✅ 5 dashboards live
- ✅ All Phase 2 features tested
- ✅ Performance optimized (<2s load time)

---

### Week 4-5: Reporting & Docs
**Phase 3.1-3.2**
- Week 4: 3.1 Custom Reporting (PDF generation)
- Week 5: 3.2 Document Auto-Gen (templates + pre-fill)

**Deliverables**:
- ✅ PDF reports downloadable
- ✅ Documents auto-filled
- ✅ Full feature set live

---

## 🎯 Success Criteria

### Phase 1 Complete
- [ ] All 3 APIs working (test with curl)
- [ ] All 3 features accessible in portal
- [ ] Data loading correctly (no errors)
- [ ] Caching working (1-hour TTL)
- [ ] <200ms response time for cached queries

### Phase 2 Complete
- [ ] 5 dashboards live & interactive
- [ ] All visualizations rendering (Recharts)
- [ ] Filters & sorting working
- [ ] <1.5s page load time
- [ ] Alerts generating correctly

### Phase 3 Complete
- [ ] PDF reports generating in <3s
- [ ] Documents pre-filled correctly
- [ ] Email integration tested
- [ ] All 10 features documented
- [ ] User training completed

---

## 🚨 Key Constraints (Golden Rules)

1. **Economical Only** — No expensive infrastructure, no external APIs beyond existing
2. **No Database** — JSON + cache only (Prisma can come later)
3. **Reuse Patterns** — Use existing Tailwind, React hooks, API routes
4. **Fast Iteration** — Working features > perfect features
5. **Document as You Go** — Keep docs updated with code

---

## 📞 Questions & Help

**Architecture Questions** → Read ARCHITECTURE_GUIDE.md  
**Coding Questions** → Check PHASE_1_TECHNICAL_SPEC.md  
**Timeline Questions** → See IMPLEMENTATION_ROADMAP.md  
**Getting Started** → Follow PHASE_1_QUICK_START.md  

---

## 🎯 Ready to Start?

**Next Step**: Open **PHASE_1_QUICK_START.md** and start with Day 1 (Advanced Search)

You have everything you need. Ship it! 🚀

---

## 📎 Files in This Roadmap

```
📋 Project Root
├─ 00_START_HERE.md ..................... (this file)
├─ IMPLEMENTATION_ROADMAP.md ............ Full roadmap with all 10 features
├─ PHASE_1_TECHNICAL_SPEC.md ........... Code specs with copy-paste code
├─ PHASE_1_QUICK_START.md .............. 3-day getting started guide
└─ ARCHITECTURE_GUIDE.md ............... System design & data flows
```

---

**Version**: 1.0  
**Last Updated**: August 4, 2026  
**Status**: Ready to Build  
**Confidence Level**: High ✅
