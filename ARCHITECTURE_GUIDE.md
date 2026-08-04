# Architecture Guide - 10-Feature System Design

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                     ACKLEY-HARTNETT PORTAL                         │
│                        (Next.js 15 App)                            │
└────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
    ┌────────────┐    ┌───────────────┐    ┌──────────────┐
    │  UI Pages  │    │ API Routes    │    │ Lib Modules  │
    │ (React)    │    │ (Next.js 15)  │    │ (Business    │
    │            │    │               │    │  Logic)      │
    │ /portal/*  │    │ /api/*        │    │              │
    └────────────┘    └───────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
   │ JSON Data   │    │ In-Memory    │    │ Cache Layer  │
   │ (Data)      │    │ Indexes      │    │ (1hr TTL)    │
   │             │    │              │    │              │
   │ machines-*  │    │ Search index │    │ Health scores│
   │ accounts    │    │ Health cache │    │ Bulk queries │
   │ quotes      │    │              │    │              │
   │ spare-parts │    │              │    │              │
   └─────────────┘    └──────────────┘    └──────────────┘
```

---

## Feature Dependency Graph

```
PHASE 1: FOUNDATION (No dependencies)
═══════════════════════════════════════════════════════════════════

    ┌─────────────────────┐
    │   Advanced Search   │  (1.1)
    │   - Machines        │
    │   - Customers       │  No dependencies
    │   - Quotes          │
    │   - Documents       │
    └────────────┬────────┘
                 │
                 │  Powers all Phase 2 queries


    ┌─────────────────────┐
    │ Customer Health     │  (1.2)
    │ Score Engine        │  No dependencies
    │ - Recency (40%)     │
    │ - Frequency (30%)   │
    │ - Conversion (20%)  │
    │ - Engagement (10%)  │
    └────────────┬────────┘
                 │
                 │  Required by Phase 2 dashboards
                 │  ├─→ Sales Pipeline
                 │  ├─→ Plant Performance
                 │  └─→ Smart Alerts


    ┌─────────────────────┐
    │ Spare Parts         │  (1.3)
    │ Inventory Model     │  No dependencies
    │ - Catalog           │
    │ - By-location stock │
    │ - Low-stock alerts  │
    └────────────┬────────┘
                 │
                 │  Required by Phase 2 dashboards
                 │  ├─→ Maintenance Alerts
                 │  └─→ Order Status Tracker


PHASE 2: DASHBOARDS (All depend on Phase 1)
═══════════════════════════════════════════════════════════════════

    ┌──────────────────────┐
    │ Maintenance Alerts   │  (2.1) — Quick Win
    │ - Machine age flags  │
    │ - Service due        │  Depends on: Spare Parts (1.3)
    │ - Parts shortage     │            Health Scores (1.2)
    └──────────────────────┘
             │
             └─→ Ready Week 2


    ┌──────────────────────┐
    │ Sales Pipeline       │  (2.2) — Core Feature
    │ - Quotes → Orders    │
    │ - Conversion rates   │  Depends on: Health Scores (1.2)
    │ - Stage timing       │            Search (1.1)
    └──────────────────────┘
             │
             └─→ Ready Week 3-4


    ┌──────────────────────┐
    │ Plant Performance    │  (2.3) — Core Feature
    │ - Compare metrics    │
    │ - Machine count      │  Depends on: Health Scores (1.2)
    │ - Order frequency    │            Search (1.1)
    │ - Revenue YTD        │
    └──────────────────────┘
             │
             └─→ Ready Week 3-4


    ┌──────────────────────┐
    │ Smart Alerts         │  (2.4) — Operational
    │ - Quote expiry       │
    │ - Order shipped      │  Depends on: (1.1, 1.2, 1.3)
    │ - Inactive customer  │
    │ - Low inventory      │
    └──────────────────────┘
             │
             └─→ Ready Week 3-4


    ┌──────────────────────┐
    │ Order/PO Status      │  (2.5) — Core Feature
    │ - Timeline view      │
    │ - Milestone tracking │  Depends on: Spare Parts (1.3)
    │ - Search by order #  │            Health Scores (1.2)
    └──────────────────────┘
             │
             └─→ Ready Week 3-4


PHASE 3: OUTPUTS (All depend on Phase 2 being complete)
═══════════════════════════════════════════════════════════════════

    ┌──────────────────────┐
    │ Custom Reporting     │  (3.1)
    │ - Revenue by region  │
    │ - PDF export         │  Depends on: All Phase 2 dashboards
    │ - Charts             │            Health Scores (1.2)
    │ - Filtering          │
    └──────────────────────┘
             │
             └─→ Ready Week 8-9


    ┌──────────────────────┐
    │ Document Auto-Gen    │  (3.2)
    │ - Proposals          │
    │ - Purchase Orders    │  Depends on: All Phase 2 dashboards
    │ - Invoices           │            Spare Parts (1.3)
    │ - Pre-population     │
    └──────────────────────┘
             │
             └─→ Ready Week 9-10
```

---

## Data Flow Architecture

### Search Data Flow (Feature 1.1)

```
User Query
    │
    ▼
┌─────────────────────────────────────┐
│  POST /api/search                   │
│  body: {q, types, filters, limit}   │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────────────┐
        │ Load Data Sources    │
        │ (from cache or disk) │
        └──────────┬───────────┘
                   │
                   ├─→ machines-sold.json
                   ├─→ accounts.json
                   ├─→ quotes-2025.json
                   └─→ datasheets.json
                   │
                   ▼
        ┌──────────────────────┐
        │ Score Matches        │
        │ (TF-IDF lite)        │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Apply Filters        │
        │ (country, type, etc) │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Sort by Score        │
        │ (descending)         │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Paginate Results     │
        │ (limit, offset)      │
        └──────────┬───────────┘
                   │
                   ▼
Response: SearchResult[]
```

### Health Score Data Flow (Feature 1.2)

```
Request: GET /api/health-scores?customerId=X
    │
    ▼
┌──────────────────────────────────────┐
│ Check Cache (1 hour TTL)             │
│ healthScoreCache[customerId]         │
└────────┬─────────────────────────────┘
         │
    ┌────┴────────┐
    │             │
    ▼ (Hit)       ▼ (Miss)
Return cached   Load Data:
score           ├─→ machines-sold.json
                ├─→ accounts.json
                └─→ quotes-2025.json
                │
                ▼
        ┌──────────────────────┐
        │ Calculate Component  │
        │ Scores               │
        └──────────┬───────────┘
        │
        ├─→ Machine Recency (40%)
        │   Age of oldest machine
        │
        ├─→ Order Frequency (30%)
        │   Orders in last 12m / benchmark
        │
        ├─→ Conversion Rate (20%)
        │   Accepted quotes / sent quotes
        │
        └─→ Engagement (10%)
            Days since last quote
                │
                ▼
        ┌──────────────────────┐
        │ Weighted Average     │
        │ (0-100 scale)        │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Classify Risk Level  │
        │ at-risk | healthy |  │
        │ premium              │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Generate             │
        │ Recommendations      │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Store in Cache       │
        │ (TTL 1 hour)         │
        └──────────┬───────────┘
                   │
                   ▼
Response: CustomerHealth
```

### Spare Parts Data Flow (Feature 1.3)

```
Request: GET /api/spare-parts?action=X&params=Y
    │
    ▼
Load Catalog: spare-parts-catalog.json
    │
    ├─→ Parts list (id, name, price, models)
    ├─→ Locations (address, capacity)
    └─→ Inventory (quantity by location)
    │
    ▼
┌────────────────────────────────────┐
│ Action Router                      │
└────────┬────────────────────────┬──┘
         │                        │
         │ by-model              │ by-location
         ▼                        ▼
    Match parts      Get inventory
    by machine       at location
    model            │
         │           ▼
         │      Filter by:
         │      - Stock level
         │      - Min required
         │      - Status
         │           │
         └───────────┼───────────┬─────────────────┐
                     │           │                 │
                     │  low-stock-alerts  check-availability
                     │  │                 │
                     │  ▼                 ▼
                     │  Find all      Check if qty
                     │  parts < min   available in
                     │  stock         any location
                     │  │             │
                     │  ▼             ▼
                     │  Generate      Calculate
                     │  alert list    lead time
                     │  │             │
                     └──┴─────────────┴─────┘
                               │
                               ▼
                   Response: Inventory | Alerts
```

---

## API Route Organization

```
/api/
├── search/
│   └── route.ts                    (1.1) Search across all data
│
├── health-scores/
│   └── route.ts                    (1.2) Customer health scoring
│
├── spare-parts/
│   └── route.ts                    (1.3) Inventory management
│
├── maintenance-alerts/
│   └── route.ts                    (2.1) Machine age & service flags
│
├── sales-pipeline/
│   └── route.ts                    (2.2) Quote → Order conversion
│
├── plant-metrics/
│   └── route.ts                    (2.3) Performance by location
│
├── alerts/
│   └── route.ts                    (2.4) Smart alerts (expiry, shipped, etc)
│
├── orders/
│   └── status/
│       └── route.ts                (2.5) Order/PO timeline tracking
│
├── reports/
│   └── generate/
│       └── route.ts                (3.1) PDF report generation
│
├── documents/
│   └── generate/
│       └── route.ts                (3.2) Auto-fill proposals/POs/invoices
│
└── [existing routes]
    ├── email/send/route.ts         (reused for notifications)
    ├── plants/operations/route.ts  (enhanced with new data)
    └── ...
```

---

## Library Module Organization

```
/src/lib/
├── search.ts                       (1.1) Full-text search engine
│   └── Exports: search(), buildSearchIndex(), useFacets()
│
├── health-score.ts                 (1.2) Health scoring algorithm
│   └── Exports: calculateHealthScore(), calculateBulkHealthScores(), getHealthScore()
│
├── spare-parts.ts                  (1.3) Inventory management
│   └── Exports: getPartsByModel(), getInventoryByLocation(), getLowStockAlerts()
│
├── maintenance-logic.ts            (2.1) Maintenance prediction
│   └── Exports: getMachineAlerts(), calculateMaintenanceRisk()
│
├── sales-pipeline.ts               (2.2) Sales funnel analysis
│   └── Exports: getPipelineStages(), calculateConversionRate(), getTimeInStage()
│
├── plant-performance.ts            (2.3) Plant metrics aggregation
│   └── Exports: getPlantMetrics(), rankPlants(), compareLocations()
│
├── smart-alerts.ts                 (2.4) Alert generation engine
│   └── Exports: generateAlerts(), dismissAlert(), snoozeAlert()
│
├── order-status.ts                 (2.5) Order tracking timeline
│   └── Exports: getOrderTimeline(), updateOrderStatus(), trackShipment()
│
├── report-generator.ts             (3.1) PDF report creation
│   └── Exports: generateReport(), getReportConfig(), listReports()
│
├── document-generator.ts           (3.2) Auto-fill documents
│   └── Exports: generateDocument(), populateTemplate(), getTemplates()
│
├── types.ts                        (CENTRAL) All TypeScript interfaces
│   └── All SearchResult, HealthScore, SparePart, etc types
│
├── plant-operations.ts             (ENHANCED) Existing operations module
│   └── Integrate all new data sources
│
└── [existing modules]
    ├── data.ts
    ├── email.ts
    ├── utils.ts
    └── ...
```

---

## Page Route Organization

```
/src/app/portal/
├── search/
│   └── page.tsx                    (1.1) Global search UI
│
├── maintenance-alerts/
│   └── page.tsx                    (2.1) Machine maintenance view
│
├── sales-pipeline/
│   └── page.tsx                    (2.2) Kanban dashboard
│
├── plant-performance/
│   └── page.tsx                    (2.3) Metrics comparison table
│
├── alerts/
│   └── page.tsx                    (2.4) Alert center
│
├── order-tracking/
│   └── page.tsx                    (2.5) Order timeline view
│
├── reports/
│   └── page.tsx                    (3.1) Report builder & history
│
├── documents/
│   └── page.tsx                    (3.2) Document generator & templates
│
└── [existing pages]
    ├── page.tsx (dashboard)
    ├── accounts/
    ├── crm/
    ├── map/
    └── ...
```

---

## Data Sources & Caching Strategy

### Data Sources (All JSON, in-memory loaded)

```
Data File               Size    Use                          Refresh
────────────────────────────────────────────────────────────────────
machines-sold.json     2-3MB   Search, health scores,       hourly
                               maintenance alerts

accounts.json          1-2MB   Search, health scores,       hourly
                               plant performance

quotes-2025.json       500KB   Search, sales pipeline,      daily
                               health scores, smart alerts

datasheets.json        100KB   Search, document auto-gen    weekly

spare-parts-catalog.json 200KB Spare parts, maintenance,    weekly
                               order status

Orders (simulated)     dynamic Sales pipeline, order        real-time*
                               status, smart alerts

*Orders can be generated on-demand or loaded from mock DB

### Cache Strategy

┌─────────────────────────────────────────────────────────────────┐
│ Cache Type        │ TTL   │ Size Limit │ Invalidation         │
├───────────────────┼───────┼────────────┼──────────────────────┤
│ Search Index      │ 1hr   │ 5MB        │ Auto-rebuild on TTL  │
│ Health Scores     │ 1hr   │ 2MB        │ Auto-recalc on TTL   │
│ Bulk Metrics      │ 1hr   │ 3MB        │ Auto-aggregate TTL   │
│ Inventory Snapshot│ 30min │ 1MB        │ Manual or TTL        │
│ Compiled Reports  │ 24hr  │ 10MB       │ Manual clear or TTL  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### Phase 1 (Foundation)

```
Portal Layout
│
├─ Sidebar (modified)
│  ├─ Search Link (NEW)
│  ├─ Existing Links
│  └─ Alert Badge (added in Phase 2)
│
└─ Pages
   ├─ /search
   │  └─ SearchUI Component
   │     ├─ Search Input
   │     ├─ Type Filters
   │     └─ Result Cards (Machine, Customer, Quote, Doc)
   │
   ├─ Dashboard (existing - enhanced)
   │  └─ Health Score Cards (added in Phase 2)
   │
   └─ Accounts (existing - enhanced)
      └─ Health Score Badge per account (Phase 2)
```

### Phase 2 (Dashboards)

```
Portal Layout
│
├─ Sidebar (modified with badges)
│  ├─ Search Link
│  ├─ Maintenance Alerts (NEW)
│  ├─ Sales Pipeline (NEW)
│  ├─ Plant Performance (NEW)
│  ├─ Alerts Center (NEW) ← Badge with unread count
│  ├─ Order Tracking (NEW)
│  └─ Existing Links
│
└─ Pages
   ├─ /search (Phase 1)
   │
   ├─ /maintenance-alerts (NEW)
   │  └─ MaintenanceAlertsList
   │     ├─ Filter Controls
   │     ├─ AlertCard[] (age, service, parts)
   │     └─ Bulk Actions
   │
   ├─ /sales-pipeline (NEW)
   │  └─ SalesPipelineBoard
   │     ├─ KanbanColumn[] (Draft, Sent, Accepted, Converted)
   │     ├─ ConversionChart
   │     └─ MetricsPanel
   │
   ├─ /plant-performance (NEW)
   │  └─ PlantMetricsView
   │     ├─ FilterBar
   │     ├─ MetricsTable (sortable)
   │     ├─ TrendSparklines
   │     └─ MapOverlay (optional)
   │
   ├─ /alerts (NEW)
   │  └─ AlertCenter
   │     ├─ AlertTabs (quote, order, inventory, customer)
   │     ├─ AlertList[] (dismiss, snooze)
   │     └─ BulkActions
   │
   ├─ /order-tracking (NEW)
   │  └─ OrderStatusView
   │     ├─ SearchByOrderId
   │     ├─ OrderTimeline (Ordered → Invoiced)
   │     └─ MilestoneDetails
   │
   └─ /dashboard (enhanced)
      └─ HealthScoreCards (4 cards showing top customers)
```

### Phase 3 (Outputs)

```
/reports (NEW)
├─ ReportBuilder
│  ├─ TypeSelector (revenue, top-customers, utilization, pipeline)
│  ├─ PeriodSelector (1m, 3m, 12m)
│  ├─ FilterPanel
│  └─ GenerateButton
│
└─ ReportViewer
   ├─ PDFPreview
   ├─ DownloadButton
   └─ RecentReports[]

/documents (NEW)
├─ DocumentEditor
│  ├─ TemplateSelector (proposal, PO, invoice)
│  ├─ DataPreFill (auto-populate from quote/order)
│  ├─ VariableEditor
│  └─ GenerateButton
│
└─ DocumentViewer
   ├─ PDFPreview
   ├─ SignatureField (optional)
   └─ SendButton (email integration)
```

---

## Technology Stack By Feature

| Feature | Language | Framework | Key Lib | Storage |
|---------|----------|-----------|---------|---------|
| 1.1 Search | TypeScript | Next.js | Lunr.js (optional) | JSON + memory |
| 1.2 Health Scores | TypeScript | Next.js | — | JSON + cache |
| 1.3 Spare Parts | TypeScript | Next.js | — | JSON + memory |
| 2.1 Maintenance | TypeScript | React | Tailwind | JSON + cache |
| 2.2 Sales Pipeline | TypeScript | React | Recharts | JSON + cache |
| 2.3 Plant Performance | TypeScript | React | Recharts | JSON + cache |
| 2.4 Smart Alerts | TypeScript | React | Tailwind | JSON + memory |
| 2.5 Order Status | TypeScript | React | Tailwind | JSON + cache |
| 3.1 Reporting | TypeScript | Next.js | jsPDF, Recharts | Cache → PDF |
| 3.2 Documents | TypeScript | Next.js | jsPDF | Template + PDF |

---

## Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| Search (< 2s) | <100ms for indexed queries | In-memory trie, TTL caching |
| Health Scores (bulk) | <200ms | Batch calculation, 1hr cache |
| Dashboard load | <1.5s | Parallel API calls, caching |
| PDF generation | <3s | Server-side jsPDF, no rendering |
| Search index rebuild | <500ms | Lazy rebuild on TTL |

---

## Deployment Checklist

### Phase 1 Go-Live
- [ ] All 3 APIs tested (search, health-scores, spare-parts)
- [ ] Search UI accessible at /portal/search
- [ ] Health scores returning valid 0-100 scores
- [ ] Spare parts catalog loaded
- [ ] 1-hour cache working
- [ ] Error handling for missing data
- [ ] Load testing: 100 concurrent searches

### Phase 2 Go-Live
- [ ] All 5 dashboards rendering
- [ ] Chart libraries (Recharts) bundled
- [ ] Kanban board interactive
- [ ] Alerts generating correctly
- [ ] Filter/sort working on all views
- [ ] Load testing: 50 concurrent users

### Phase 3 Go-Live
- [ ] PDF generation working
- [ ] Document templates populating
- [ ] Email integration tested
- [ ] Report exports verified
- [ ] All features documented
- [ ] User training complete

---

## Next Steps

1. **Start Phase 1** → Open PHASE_1_QUICK_START.md
2. **Reference Technical Spec** → See PHASE_1_TECHNICAL_SPEC.md for code
3. **Track Progress** → Check IMPLEMENTATION_ROADMAP.md for timeline
4. **Understand Architecture** → You are here (use for design questions)

Good luck! 🚀
